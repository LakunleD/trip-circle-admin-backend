import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiTriageService {
  private readonly logger = new Logger(AiTriageService.name);

  async run(bug: {
    id: string;
    title: string;
    description: string;
    stepsToReproduce?: string;
  }) {
    this.logger.log(`AI triage triggered for ${bug.id}`);

    // TODO Stage 1 — Duplicate detection
    // Embed bug.description with all-MiniLM (self-hosted, zero API cost).
    // Query all open bugs and compare with cosine similarity.
    // If similarity > 0.85, update the bug: { aiDuplicateOf: matchId, aiConfidence: score }

    // TODO Stage 2 — Auto-classification
    // Send bug.description to DeepSeek or Qwen3.5 via LiteLLM.
    // Parse response for priority (P0-P4) and module name.
    // Update the bug: { aiSuggestedPriority, aiSuggestedModule }

    // TODO Stage 3 — Step expansion
    // If bug.stepsToReproduce is missing or under 50 chars,
    // send title + description to DeepSeek via LiteLLM.
    // Parse into structured numbered steps.
    // Update the bug: { reproductionStepsAi }
  }
}