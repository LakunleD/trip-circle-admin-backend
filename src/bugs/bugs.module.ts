import { Module } from '@nestjs/common';
import { BugsController } from './bugs.controller';
import { BugsService } from './bugs.service';
import { AiTriageService } from '../ai/ai-triage.service';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [AlertsModule],
  controllers: [BugsController],
  providers: [BugsService, AiTriageService],
})
export class BugsModule {}