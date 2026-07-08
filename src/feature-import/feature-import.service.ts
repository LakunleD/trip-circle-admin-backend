import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ImportFeaturesDto, ImportFeatureItemDto } from './dto/import-features.dto';

const BATCH_SIZE = 50;

@Injectable()
export class FeatureImportService {
  constructor(private readonly prisma: PrismaService) {}

  // Returns preview rows with defaults applied — no DB writes
  preview(items: ImportFeatureItemDto[]) {
    return items.map((item) => this.applyDefaults(item));
  }

  async import(dto: ImportFeaturesDto) {
    const normalised = dto.features.map((item) => this.applyDefaults(item));

    // fetch all existing titles once
    const existingTitles = new Set(
      (await this.prisma.feature.findMany({ select: { title: true } })).map((f) =>
        f.title.toLowerCase(),
      ),
    );

    const toInsert = normalised.filter(
      (item) => !existingTitles.has(item.title.toLowerCase()),
    );

    let imported = 0;

    // insert in batches of 50
    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const batch = toInsert.slice(i, i + BATCH_SIZE).map((item) => ({
        ...item,
        createdBy: dto.importedBy,
      }));

      const result = await this.prisma.feature.createMany({ data: batch, skipDuplicates: true });
      imported += result.count;
    }

    const skipped = dto.features.length - imported;

    return {
      submitted: dto.features.length,
      imported,
      skipped,
    };
  }

  private applyDefaults(item: ImportFeatureItemDto) {
    return {
      title: item.title,
      description: item.description ?? null,
      category: item.category ?? 'General',
      priority: item.priority ?? 'medium',
      phase: item.phase ?? null,
      originTag: item.originTag ?? null,
      workType: item.workType ?? 'App Feature',
      assignee: item.assignee ?? null,
      specLink: item.specLink ?? null,
      tier: item.tier ?? 'free',
      platform: item.platform ?? 'web',
      tags: item.tags ?? [],
      links: (item.links ?? []) as Prisma.InputJsonValue,
      status: 'backlog',
    };
  }
}
