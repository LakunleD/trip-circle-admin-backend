import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { UpdateWaveDto } from './dto/update-wave.dto';

@Injectable()
export class BetaWavesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alerts: AlertsService,
  ) {}

  async findAll() {
    const waves = await this.prisma.betaWave.findMany({
      orderBy: { number: 'asc' },
    });

    const result = await Promise.all(
      waves.map(async (wave) => {
        const testerCount = await this.prisma.betaTester.count({
          where: { wave: wave.number, status: { not: 'removed' } },
        });
        return { ...wave, testerCount };
      }),
    );

    return result;
  }

  async findOne(id: string) {
    const wave = await this.prisma.betaWave.findUnique({ where: { id } });
    if (!wave) throw new NotFoundException('Wave not found');
    return wave;
  }

  async update(id: string, dto: UpdateWaveDto) {
    const wave = await this.findOne(id);
    const data: any = { ...dto };

    if (dto.status === 'open') {
      data.openedAt = new Date();

      // find all waitlisted testers in this wave before updating
      const toInvite = await this.prisma.betaTester.findMany({
        where: { wave: wave.number, status: 'waitlisted' },
        select: { name: true, email: true, wave: true },
      });

      // flip them all to invited in one query
      await this.prisma.betaTester.updateMany({
        where: { wave: wave.number, status: 'waitlisted' },
        data: { status: 'invited' },
      });

      // fire invite emails — non-blocking, failures logged individually
      if (toInvite.length > 0) {
        Promise.allSettled(
          toInvite.map((t) =>
            this.alerts.sendInviteEmail({
              name: t.name,
              email: t.email,
              wave: t.wave ?? wave.number,
            }),
          ),
        ).catch(() => {});
      }

      const updatedWave = await this.prisma.betaWave.update({ where: { id }, data });
      return { ...updatedWave, invitedCount: toInvite.length };
    }

    if (dto.status === 'closed') data.closedAt = new Date();

    return this.prisma.betaWave.update({ where: { id }, data });
  }
}