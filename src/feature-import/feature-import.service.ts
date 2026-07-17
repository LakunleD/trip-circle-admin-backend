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
    const raw = item as any;

    // accept both camelCase and snake_case field names
    const originTag = item.originTag ?? raw.origin_tag ?? null;
    const workType = item.workType ?? raw.work_type ?? 'App Feature';
    const specLink = item.specLink ?? raw.spec_link ?? null;

    // map p0/p1/p2/p3 priority labels to standard values
    const PRIORITY_MAP: Record<string, string> = {
      p0: 'critical',
      p1: 'high',
      p2: 'medium',
      p3: 'low',
    };
    const rawPriority = item.priority ?? 'medium';
    const priority = PRIORITY_MAP[rawPriority.toLowerCase()] ?? rawPriority;

    // map status — "done" → "built", preserve other valid values
    const STATUS_MAP: Record<string, string> = {
      done: 'built',
    };
    const rawStatus = raw.status ?? 'not_started';
    const status = STATUS_MAP[rawStatus.toLowerCase()] ?? rawStatus;

    return {
      title: item.title,
      description: item.description ?? null,
      category: item.category ?? 'General',
      priority,
      status,
      phase: item.phase ?? null,
      originTag,
      workType,
      assignee: item.assignee ?? null,
      specLink,
      tier: item.tier ?? 'free',
      platform: item.platform ?? 'web',
      tags: item.tags ?? [],
      links: (item.links ?? []) as Prisma.InputJsonValue,
    };
  }
}
