import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FeatureNotificationsService } from '../feature-notifications/feature-notifications.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { CreateFeatureCommentDto } from './dto/create-feature-comment.dto';
import { FeatureQueryDto } from './dto/feature-query.dto';

const ADMIN_STATUSES = ['backlog'];

@Injectable()
export class FeaturesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: FeatureNotificationsService,
  ) {}

  async findAll(query: FeatureQueryDto, isAdmin: boolean) {
    const where: any = { isArchived: false };

    // non-admins cannot see backlog; also prevent status filter bypassing this
    if (!isAdmin) {
      where.status = query.status && !ADMIN_STATUSES.includes(query.status)
        ? query.status
        : { notIn: ADMIN_STATUSES };
    } else if (query.status) {
      where.status = query.status;
    }

    if (query.priority) where.priority = query.priority;
    if (query.workType) where.workType = query.workType;
    if (query.tier) where.tier = query.tier;
    if (query.platform) where.platform = query.platform;
    if (query.assignee) where.assignee = query.assignee;
    if (query.category) where.category = query.category;
    if (query.phase) where.phase = query.phase;

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const sortBy = query.sortBy ?? 'updatedAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.feature.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.feature.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findKanban(isAdmin: boolean) {
    const where: any = { isArchived: false };
    if (!isAdmin) where.status = { notIn: ADMIN_STATUSES };

    const features = await this.prisma.feature.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    const columns = [
      'backlog', 'not_started', 'in_progress', 'blocked', 'built', 'paused', 'deprecated',
    ];

    const grouped: Record<string, typeof features> = {};
    for (const col of columns) {
      if (col === 'backlog' && !isAdmin) continue;
      grouped[col] = [];
    }
    for (const f of features) {
      if (grouped[f.status] !== undefined) grouped[f.status].push(f);
    }

    return grouped;
  }

  async getStats(isAdmin: boolean) {
    const where: any = { isArchived: false };
    if (!isAdmin) where.status = { notIn: ADMIN_STATUSES };

    const [total, byStatus] = await Promise.all([
      this.prisma.feature.count({ where }),
      this.prisma.feature.groupBy({ by: ['status'], where, _count: { id: true } }),
    ]);

    const counts = Object.fromEntries(byStatus.map((r) => [r.status, r._count.id]));

    return {
      total,
      inProgress: counts['in_progress'] ?? 0,
      blocked: counts['blocked'] ?? 0,
      built: counts['built'] ?? 0,
      notStarted: counts['not_started'] ?? 0,
      paused: counts['paused'] ?? 0,
      ...(isAdmin ? { backlog: counts['backlog'] ?? 0 } : {}),
    };
  }

  async getRecentActivity(isAdmin: boolean, limit = 10) {
    const where: any = {};
    if (!isAdmin) where.feature = { status: { notIn: ADMIN_STATUSES } };

    return this.prisma.featureHistory.findMany({
      where,
      include: { feature: { select: { id: true, title: true, status: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findOne(id: string) {
    const feature = await this.prisma.feature.findUnique({
      where: { id },
      include: {
        history: { orderBy: { createdAt: 'asc' } },
        comments: { orderBy: { createdAt: 'asc' } },
        aiDrafts: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!feature) throw new NotFoundException('Feature not found');
    return feature;
  }

  async create(dto: CreateFeatureDto, createdBy: string) {
    const feature = await this.prisma.feature.create({
      data: { ...dto, createdBy, links: (dto.links ?? []) as Prisma.InputJsonValue },
    });

    await this.prisma.featureHistory.create({
      data: {
        featureId: feature.id,
        fieldChanged: 'created',
        oldValue: null,
        newValue: feature.title,
        changedBy: createdBy,
      },
    });

    if (feature.assignee) {
      this.notifications
        .notifyAssigned(feature, feature.assignee, createdBy)
        .catch(() => {});
    }

    return feature;
  }

  async update(id: string, dto: UpdateFeatureDto, changedBy: string) {
    const current = await this.findOne(id);

    const { links, ...rest } = dto;
    const updated = await this.prisma.feature.update({
      where: { id },
      data: { ...rest, ...(links !== undefined ? { links: links as Prisma.InputJsonValue } : {}) },
    });

    const trackable: (keyof typeof dto)[] = [
      'title', 'description', 'category', 'status', 'priority',
      'originTag', 'phase', 'workType', 'assignee', 'specLink',
    ];

    const historyEntries = trackable
      .filter((f) => dto[f] !== undefined && String(dto[f]) !== String((current as any)[f]))
      .map((f) => ({
        featureId: id,
        fieldChanged: f,
        oldValue: (current as any)[f] != null ? String((current as any)[f]) : null,
        newValue: dto[f] != null ? String(dto[f]) : null,
        changedBy,
      }));

    if (historyEntries.length > 0) {
      await this.prisma.featureHistory.createMany({ data: historyEntries });
    }

    if (dto.status === 'blocked' && current.status !== 'blocked') {
      this.notifications.notifyBlocked(updated).catch(() => {});
    }
    if (dto.status === 'built' && current.status !== 'built') {
      this.notifications.notifyBuilt(updated).catch(() => {});
    }
    if (dto.assignee && dto.assignee !== current.assignee) {
      this.notifications.notifyAssigned(updated, dto.assignee, changedBy).catch(() => {});
    }

    return updated;
  }

  async archive(id: string) {
    await this.findOne(id);
    return this.prisma.feature.update({ where: { id }, data: { isArchived: true } });
  }

  async getComments(featureId: string) {
    await this.findOne(featureId);
    return this.prisma.featureComment.findMany({
      where: { featureId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addComment(featureId: string, dto: CreateFeatureCommentDto) {
    const feature = await this.findOne(featureId);

    const comment = await this.prisma.featureComment.create({
      data: { ...dto, featureId },
    });

    // extract @mentions — matches @word or @email patterns
    const mentions = [...dto.content.matchAll(/@([\w.+-]+@[\w.-]+|[\w]+)/g)].map((m) => m[1]);

    if (mentions.length > 0) {
      const members = await this.prisma.teamMember.findMany({
        where: {
          OR: mentions.map((m) => ({
            OR: [
              { email: { equals: m, mode: 'insensitive' as const } },
              { name: { contains: m, mode: 'insensitive' as const } },
            ],
          })),
        },
      });

      const unique = [...new Map(members.map((m) => [m.email, m])).values()];
      for (const member of unique) {
        if (member.email === dto.authorEmail) continue; // no self-notification
        this.notifications
          .notifyMentioned(feature, member.email, dto.content)
          .catch(() => {});
      }
    }

    return comment;
  }

  async updateComment(featureId: string, commentId: string, content: string) {
    const comment = await this.prisma.featureComment.findUnique({ where: { id: commentId } });
    if (!comment || comment.featureId !== featureId) throw new NotFoundException('Comment not found');
    return this.prisma.featureComment.update({ where: { id: commentId }, data: { content } });
  }

  async checkDuplicate(title: string): Promise<{ isDuplicate: boolean; existing?: { id: string; title: string } }> {
    const existing = await this.prisma.feature.findFirst({
      where: { title: { equals: title, mode: 'insensitive' }, isArchived: false },
      select: { id: true, title: true },
    });
    return { isDuplicate: !!existing, existing: existing ?? undefined };
  }
}
