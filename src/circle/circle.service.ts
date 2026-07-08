import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { CreateCircleSubmissionDto } from './dto/create-circle-submission.dto';
import { UpdateCircleSubmissionDto } from './dto/update-circle-submission.dto';
import { CircleQueryDto } from './dto/circle-query.dto';

@Injectable()
export class CircleService {
  private readonly logger = new Logger(CircleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly alerts: AlertsService,
  ) {}

  async create(dto: CreateCircleSubmissionDto) {
    const ticketNumber = await this.generateTicketNumber();

    const submission = await this.prisma.circleSubmission.create({
      data: {
        ticketNumber,
        submitterEmail: dto.submitterEmail,
        submitterName: dto.submitterName,
        submissionType: dto.submissionType,
        message: dto.message,
        productArea: dto.productArea,
        rating: dto.rating,
        source: dto.source ?? 'widget',
        flowContext: dto.flowContext,
        sessionId: dto.sessionId,
      },
    });

    this.alerts
      .sendCircleAutoReply({
        submitterEmail: submission.submitterEmail,
        submitterName: submission.submitterName ?? undefined,
        submissionType: submission.submissionType,
        ticketNumber: submission.ticketNumber,
      })
      .then(() =>
        this.prisma.circleSubmission.update({
          where: { id: submission.id },
          data: { replySent: true, replySentAt: new Date() },
        }),
      )
      .catch(() => {});

    return submission;
  }

  async findAll(query: CircleQueryDto) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.submissionType) where.submissionType = query.submissionType;
    if (query.productArea) where.productArea = query.productArea;
    if (query.source) where.source = query.source;
    if (query.search) {
      where.OR = [
        { message: { contains: query.search, mode: 'insensitive' } },
        { submitterEmail: { contains: query.search, mode: 'insensitive' } },
        { submitterName: { contains: query.search, mode: 'insensitive' } },
        { ticketNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.circleSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.circleSubmission.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats() {
    const [total, byStatus, byType, byProductArea, replySentCount] =
      await Promise.all([
        this.prisma.circleSubmission.count(),
        this.prisma.circleSubmission.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        this.prisma.circleSubmission.groupBy({
          by: ['submissionType'],
          _count: { _all: true },
        }),
        this.prisma.circleSubmission.groupBy({
          by: ['productArea'],
          _count: { _all: true },
        }),
        this.prisma.circleSubmission.count({ where: { replySent: true } }),
      ]);

    return {
      total,
      replySent: replySentCount,
      byStatus: Object.fromEntries(
        byStatus.map((r) => [r.status, r._count._all]),
      ),
      byType: Object.fromEntries(
        byType.map((r) => [r.submissionType, r._count._all]),
      ),
      byProductArea: Object.fromEntries(
        byProductArea
          .filter((r) => r.productArea)
          .map((r) => [r.productArea!, r._count._all]),
      ),
    };
  }

  async findOne(id: string) {
    const submission = await this.prisma.circleSubmission.findUnique({
      where: { id },
    });
    if (!submission) throw new NotFoundException(`Submission ${id} not found`);
    return submission;
  }

  async update(id: string, dto: UpdateCircleSubmissionDto) {
    await this.findOne(id);
    return this.prisma.circleSubmission.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.replySent ? { replySentAt: new Date() } : {}),
      },
    });
  }

  private async generateTicketNumber(): Promise<string> {
    const count = await this.prisma.circleSubmission.count();
    const seq = (count + 1).toString().padStart(4, '0');
    return `CIR-${seq}`;
  }
}
