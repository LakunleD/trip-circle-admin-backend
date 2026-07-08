import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OpsAiService {
  constructor(private readonly prisma: PrismaService) {}

  async draftSpec(featureId: string) {
    const feature = await this.prisma.feature.findUnique({ where: { id: featureId } });
    if (!feature) return { content: null, mock: true };

    // TODO: replace with real LiteLLM call when AI is configured
    const content =
      `## ${feature.title}\n\n` +
      `**Category:** ${feature.category}\n` +
      `**Priority:** ${feature.priority}\n` +
      `**Phase:** ${feature.phase ?? 'TBD'}\n` +
      `**Work Type:** ${feature.workType}\n\n` +
      `### Problem\n[Describe the problem this feature solves]\n\n` +
      `### Solution\n[Describe the proposed solution]\n\n` +
      `### Acceptance Criteria\n- [ ] Criterion 1\n- [ ] Criterion 2\n\n` +
      `### Out of Scope\n[What this feature does NOT cover]\n\n` +
      `_This spec was auto-generated as a starting point. Fill in the details._`;

    // persist so the frontend can display it
    const draft = await this.prisma.aiSpecDraft.create({
      data: { featureId, content },
    });

    return { ...draft, mock: true };
  }

  async checkDuplicate(title: string) {
    // TODO: replace with real semantic similarity check via LiteLLM
    const features = await this.prisma.feature.findMany({
      where: { isArchived: false },
      select: { id: true, title: true },
    });

    // simple word-overlap heuristic until real AI is wired
    const titleWords = new Set(title.toLowerCase().split(/\s+/));
    const candidates = features
      .map((f) => {
        const fWords = f.title.toLowerCase().split(/\s+/);
        const overlap = fWords.filter((w) => titleWords.has(w)).length;
        const score = overlap / Math.max(titleWords.size, fWords.length);
        return { ...f, score };
      })
      .filter((f) => f.score >= 0.5 && f.title.toLowerCase() !== title.toLowerCase())
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return { mock: true, candidates };
  }

  async weeklyDigest() {
    // TODO: replace with real LiteLLM summarisation
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [recentHistory, statusCounts] = await Promise.all([
      this.prisma.featureHistory.findMany({
        where: { createdAt: { gte: since } },
        include: { feature: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.feature.groupBy({
        by: ['status'],
        where: { isArchived: false },
        _count: { id: true },
      }),
    ]);

    const counts = Object.fromEntries(statusCounts.map((r) => [r.status, r._count.id]));

    // mock digest prose
    const built = recentHistory.filter((h) => h.newValue === 'built');
    const blocked = recentHistory.filter((h) => h.newValue === 'blocked');

    const summary =
      `**Weekly Digest (last 7 days)**\n\n` +
      `${recentHistory.length} changes recorded across the feature board.\n\n` +
      (built.length > 0
        ? `✅ ${built.length} feature(s) marked built: ${built.map((h) => h.feature.title).join(', ')}\n\n`
        : '') +
      (blocked.length > 0
        ? `🚧 ${blocked.length} feature(s) blocked: ${blocked.map((h) => h.feature.title).join(', ')}\n\n`
        : '') +
      `**Current board:** In Progress: ${counts['in_progress'] ?? 0} · Blocked: ${counts['blocked'] ?? 0} · Built: ${counts['built'] ?? 0}\n\n` +
      `_AI-generated digest. Wire LiteLLM for richer summaries._`;

    return { mock: true, summary, counts };
  }
}
