import { Module } from '@nestjs/common';
import { AiTriageService } from './ai-triage.service';

@Module({
  providers: [AiTriageService],
  exports: [AiTriageService],
})
export class AiTriageModule {}
