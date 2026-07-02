import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiTriageService } from '../ai/ai-triage.service';
import { AlertsService } from '../alerts/alerts.service';
import { CreateBugDto } from './dto/create-bug.dto';
import { UpdateBugDto } from './dto/update-bug.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ChangeStatusDto } from './dto/change-status.dto';

@Injectable()
export class BugsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiTriage: AiTriageService,
    private readonly alerts: AlertsService,
  ) {}

  findAll(filters: {
    status?: string;
    priority?: string;
    module?: string;
    wave?: string;
    assigned_to?: string;
  }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.module) where.module = filters.module;
    if (filters.wave) where.wave = Number(filters.wave);
    if (filters.assigned_to) where.assignedTo = filters.assigned_to;

    return this.prisma.bug.findMany({
      where,
      include: {
        comments: { orderBy: { createdAt: 'asc' } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const [byPriority, byStatus, byModule] = await Promise.all([
      this.prisma.bug.groupBy({ by: ['priority'], _count: { id: true } }),
      this.prisma.bug.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.bug.groupBy({ by: ['module'], _count: { id: true } }),
    ]);

    return {
      byPriority: Object.fromEntries(byPriority.map((r) => [r.priority, r._count.id])),
      byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r._count.id])),
      byModule: Object.fromEntries(byModule.map((r) => [r.module, r._count.id])),
    };
  }

  async findOne(id: string) {
    const bug = await this.prisma.bug.findUnique({
      where: { id },
      include: {
        comments: { orderBy: { createdAt: 'asc' } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!bug) throw new NotFoundException('Bug not found');
    return bug;
  }

  async create(dto: CreateBugDto) {
    const ticketNumber = await this.generateTicketNumber();
    const bug = await this.prisma.bug.create({
      data: { ...dto, ticketNumber },
    });

    // fire-and-forget — do not block the HTTP response
    this.aiTriage.run(bug).catch(() => {});

    if (bug.priority === 'P0' || bug.priority === 'P1') {
      this.alerts.firePriorityAlert(bug).catch(() => {});
    }

    return bug;
  }

  async update(id: string, dto: UpdateBugDto) {
    await this.findOne(id);
    return this.prisma.bug.update({ where: { id }, data: dto });
  }

  async addComment(bugId: string, dto: CreateCommentDto) {
    await this.findOne(bugId);
    return this.prisma.bugComment.create({ data: { ...dto, bugId } });
  }

  async changeStatus(bugId: string, dto: ChangeStatusDto) {
    const bug = await this.findOne(bugId);

    await this.prisma.bugStatusHistory.create({
      data: {
        bugId,
        fromStatus: bug.status,
        toStatus: dto.toStatus,
        changedBy: dto.changedBy,
        note: dto.note,
      },
    });

    return this.prisma.bug.update({
      where: { id: bugId },
      data: { status: dto.toStatus },
    });
  }

  private async generateTicketNumber(): Promise<string> {
    const count = await this.prisma.bug.count();
    return `TC-${String(count + 1).padStart(4, '0')}`;
  }
}