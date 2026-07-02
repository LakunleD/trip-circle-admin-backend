import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { CreateBetaTesterDto } from './dto/create-beta-tester.dto';
import { UpdateBetaTesterDto } from './dto/update-beta-tester.dto';
import { ActivateTesterDto } from './dto/activate-tester.dto';
import { BulkCreateBetaTesterDto } from './dto/bulk-create-beta-tester.dto';

@Injectable()
export class BetaTestersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alerts: AlertsService,
  ) {}

  findAll() {
    return this.prisma.betaTester.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tester = await this.prisma.betaTester.findUnique({ where: { id } });
    if (!tester) throw new NotFoundException('Beta tester not found');
    return tester;
  }

  create(dto: CreateBetaTesterDto) {
    return this.prisma.betaTester.create({ data: dto });
  }

  async bulkCreate(dto: BulkCreateBetaTesterDto) {
    const result = await this.prisma.betaTester.createMany({
      data: dto.testers,
      skipDuplicates: true,
    });
    return { imported: result.count, submitted: dto.testers.length, skipped: dto.testers.length - result.count };
  }

  async update(id: string, dto: UpdateBetaTesterDto) {
    const current = await this.findOne(id);
    const updated = await this.prisma.betaTester.update({ where: { id }, data: dto });

    // fire invite email only when status manually flipped to "invited"
    if (dto.status === 'invited' && current.status !== 'invited') {
      this.alerts
        .sendInviteEmail({ name: updated.name, email: updated.email, wave: updated.wave ?? 1 })
        .catch(() => {});
    }

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.betaTester.update({
      where: { id },
      data: { status: 'removed', removedAt: new Date() },
    });
  }

  async assignWave(id: string, wave: number) {
    await this.findOne(id);
    return this.prisma.betaTester.update({ where: { id }, data: { wave } });
  }

  // called by the main TripCircle backend to check if an email has beta access
  async accessCheck(email: string) {
    const tester = await this.prisma.betaTester.findUnique({
      where: { email },
      select: { status: true, wave: true },
    });

    const hasAccess =
      tester?.status === 'invited' || tester?.status === 'active';

    return {
      hasAccess,
      status: tester?.status ?? null,
      wave: tester?.wave ?? null,
    };
  }

  // called by the main TripCircle backend when a tester logs in for the first time
  async activate(dto: ActivateTesterDto) {
    const tester = await this.prisma.betaTester.findUnique({
      where: { email: dto.email },
    });

    if (!tester) throw new NotFoundException('No beta tester found with this email');

    if (tester.status === 'waitlisted') {
      throw new ConflictException('This tester has not been invited yet');
    }

    if (tester.status === 'active') return tester;

    return this.prisma.betaTester.update({
      where: { email: dto.email },
      data: { status: 'active' },
    });
  }
}