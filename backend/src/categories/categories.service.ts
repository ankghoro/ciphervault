import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, includeDeleted = false) {
    return this.prisma.category.findMany({
      where: {
        userId,
        purgedAt: null,
        deletedAt: includeDeleted ? { not: null } : null,
      },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { credentials: { where: { deletedAt: null } } } },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const cat = await this.prisma.category.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        _count: { select: { credentials: { where: { deletedAt: null } } } },
      },
    });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color || '#6366f1',
        userId,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    await this.findOne(userId, id);
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
    });
  }

  async softDelete(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(userId: string, id: string) {
    const cat = await this.prisma.category.findFirst({
      where: { id, userId, deletedAt: { not: null } },
    });
    if (!cat) throw new NotFoundException('Deleted category not found');
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async purge(userId: string, id: string) {
    const cat = await this.prisma.category.findFirst({
      where: { id, userId, deletedAt: { not: null }, purgedAt: null },
    });
    if (!cat) throw new NotFoundException('Deleted category not found');
    const updated = await this.prisma.category.update({
      where: { id },
      data: { purgedAt: new Date() },
    });
    return {
      id: updated.id,
      deletedAt: updated.deletedAt,
      purgedAt: updated.purgedAt,
      message: 'Category permanently removed (soft purged, data kept in DB)',
    };
  }
}
