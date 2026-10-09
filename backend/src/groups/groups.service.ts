import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

export interface GroupTreeNode {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  children: GroupTreeNode[];
  _count?: { credentials: number };
}

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, includeDeleted = false) {
    return this.prisma.group.findMany({
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

  /** Build hierarchical tree for sidebar menu/submenu */
  async findTree(userId: string): Promise<GroupTreeNode[]> {
    const groups = await this.prisma.group.findMany({
      where: { userId, deletedAt: null, purgedAt: null },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { credentials: { where: { deletedAt: null } } } },
      },
    });

    const map = new Map<string, GroupTreeNode>();
    const roots: GroupTreeNode[] = [];

    for (const g of groups) {
      map.set(g.id, {
        id: g.id,
        name: g.name,
        description: g.description,
        parentId: g.parentId,
        children: [],
        _count: g._count,
      });
    }

    for (const node of map.values()) {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async findOne(userId: string, id: string) {
    const group = await this.prisma.group.findFirst({
      where: { id, userId, deletedAt: null, purgedAt: null },
      include: {
        _count: { select: { credentials: { where: { deletedAt: null, purgedAt: null } } } },
        children: { where: { deletedAt: null, purgedAt: null } },
      },
    });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async create(userId: string, dto: CreateGroupDto) {
    if (dto.parentId) {
      const parent = await this.prisma.group.findFirst({
        where: { id: dto.parentId, userId, deletedAt: null },
      });
      if (!parent) throw new BadRequestException('Parent group not found');
    }

    return this.prisma.group.create({
      data: {
        name: dto.name,
        description: dto.description,
        parentId: dto.parentId || null,
        userId,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateGroupDto) {
    await this.findOne(userId, id);

    if (dto.parentId !== undefined && dto.parentId !== null) {
      if (dto.parentId === id) {
        throw new BadRequestException('Group cannot be its own parent');
      }
      const parent = await this.prisma.group.findFirst({
        where: { id: dto.parentId, userId, deletedAt: null },
      });
      if (!parent) throw new BadRequestException('Parent group not found');
    }

    return this.prisma.group.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
      },
    });
  }

  async softDelete(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.group.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(userId: string, id: string) {
    const group = await this.prisma.group.findFirst({
      where: { id, userId, deletedAt: { not: null } },
    });
    if (!group) throw new NotFoundException('Deleted group not found');
    return this.prisma.group.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async purge(userId: string, id: string) {
    const group = await this.prisma.group.findFirst({
      where: { id, userId, deletedAt: { not: null }, purgedAt: null },
    });
    if (!group) throw new NotFoundException('Deleted group not found');
    const updated = await this.prisma.group.update({
      where: { id },
      data: { purgedAt: new Date() },
    });
    return {
      id: updated.id,
      deletedAt: updated.deletedAt,
      purgedAt: updated.purgedAt,
      message: 'Group permanently removed (soft purged, data kept in DB)',
    };
  }
}
