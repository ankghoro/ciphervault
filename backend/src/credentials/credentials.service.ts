import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { QueryCredentialsDto } from './dto/query-credentials.dto';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  private mask(cred: {
    id: string;
    title: string;
    username: string | null;
    encryptedPassword: string;
    url: string | null;
    notes: string | null;
    categoryId: string | null;
    groupId: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    category?: { id: string; name: string; color: string } | null;
    group?: { id: string; name: string } | null;
  }) {
    return {
      id: cred.id,
      title: cred.title,
      username: cred.username,
      // Never return plaintext or encrypted blob in list views
      passwordMasked: '••••••••',
      url: cred.url,
      notes: cred.notes,
      categoryId: cred.categoryId,
      groupId: cred.groupId,
      category: cred.category ?? null,
      group: cred.group ?? null,
      createdAt: cred.createdAt,
      updatedAt: cred.updatedAt,
      deletedAt: cred.deletedAt,
    };
  }

  async findAll(userId: string, query: QueryCredentialsDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const isDeleted = query.isDeleted === 'true';

    const where: Prisma.CredentialWhereInput = {
      userId,
      // Never show permanently purged rows in list or trash
      purgedAt: null,
      deletedAt: isDeleted ? { not: null } : null,
      ...(query.categoryId && query.categoryId !== 'all'
        ? { categoryId: query.categoryId }
        : {}),
      ...(query.groupId ? { groupId: query.groupId } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { username: { contains: query.search, mode: 'insensitive' } },
              { url: { contains: query.search, mode: 'insensitive' } },
              { notes: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const allowedSort = ['createdAt', 'updatedAt', 'title', 'username'];
    const sortBy = allowedSort.includes(query.sortBy || '')
      ? query.sortBy!
      : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, rows] = await Promise.all([
      this.prisma.credential.count({ where }),
      this.prisma.credential.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: { select: { id: true, name: true, color: true } },
          group: { select: { id: true, name: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: rows.map((r) => this.mask(r)),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(userId: string, id: string) {
    const cred = await this.prisma.credential.findFirst({
      where: { id, userId, deletedAt: null, purgedAt: null },
      include: {
        category: { select: { id: true, name: true, color: true } },
        group: { select: { id: true, name: true } },
      },
    });
    if (!cred) throw new NotFoundException('Credential not found');
    return this.mask(cred);
  }

  /** Decrypt password on demand — only called explicitly */
  async revealPassword(userId: string, id: string) {
    const cred = await this.prisma.credential.findFirst({
      where: { id, userId, deletedAt: null, purgedAt: null },
    });
    if (!cred) throw new NotFoundException('Credential not found');
    const password = this.encryption.decrypt(cred.encryptedPassword);
    return { password };
  }

  async create(userId: string, dto: CreateCredentialDto) {
    const encryptedPassword = this.encryption.encrypt(dto.password);
    const cred = await this.prisma.credential.create({
      data: {
        title: dto.title,
        username: dto.username,
        encryptedPassword,
        url: dto.url,
        notes: dto.notes,
        categoryId: dto.categoryId || null,
        groupId: dto.groupId || null,
        userId,
      },
      include: {
        category: { select: { id: true, name: true, color: true } },
        group: { select: { id: true, name: true } },
      },
    });
    return this.mask(cred);
  }

  async update(userId: string, id: string, dto: UpdateCredentialDto) {
    await this.findOne(userId, id);

    const data: Prisma.CredentialUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.username !== undefined) data.username = dto.username;
    if (dto.url !== undefined) data.url = dto.url;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.categoryId !== undefined) {
      data.category = dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : { disconnect: true };
    }
    if (dto.groupId !== undefined) {
      data.group = dto.groupId
        ? { connect: { id: dto.groupId } }
        : { disconnect: true };
    }
    if (dto.password) {
      data.encryptedPassword = this.encryption.encrypt(dto.password);
    }

    const cred = await this.prisma.credential.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true, color: true } },
        group: { select: { id: true, name: true } },
      },
    });
    return this.mask(cred);
  }

  async softDelete(userId: string, id: string) {
    await this.findOne(userId, id);
    // Soft delete only: keep the row, set deletedAt timestamp
    const updated = await this.prisma.credential.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return {
      id: updated.id,
      deletedAt: updated.deletedAt,
      message: 'Credential moved to trash (soft deleted)',
    };
  }

  async restore(userId: string, id: string) {
    const cred = await this.prisma.credential.findFirst({
      where: { id, userId, deletedAt: { not: null }, purgedAt: null },
    });
    if (!cred) throw new NotFoundException('Deleted credential not found');
    return this.prisma.credential.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async purge(userId: string, id: string) {
    // Soft purge only: row stays in DB, marked with purgedAt (hidden from trash too)
    const cred = await this.prisma.credential.findFirst({
      where: { id, userId, deletedAt: { not: null }, purgedAt: null },
    });
    if (!cred) throw new NotFoundException('Deleted credential not found');
    const updated = await this.prisma.credential.update({
      where: { id },
      data: { purgedAt: new Date() },
    });
    return {
      id: updated.id,
      deletedAt: updated.deletedAt,
      purgedAt: updated.purgedAt,
      message: 'Credential permanently removed from trash (soft purged, data kept in DB)',
    };
  }

  async metrics(userId: string) {
    const [activeCredentials, trashCount, groupsCount, categoriesCount] =
      await Promise.all([
        this.prisma.credential.count({
          where: { userId, deletedAt: null, purgedAt: null },
        }),
        this.prisma.credential.count({
          where: { userId, deletedAt: { not: null }, purgedAt: null },
        }),
        this.prisma.group.count({
          where: { userId, deletedAt: null, purgedAt: null },
        }),
        this.prisma.category.count({
          where: { userId, deletedAt: null, purgedAt: null },
        }),
      ]);

    return {
      activeCredentials,
      trashCount,
      groupsCount,
      categoriesCount,
      encryptionAlgorithm: 'AES-256-GCM',
    };
  }
}
