import { Module } from '@nestjs/common';
import { BugsController } from './bugs.controller';
import { BugsService } from './bugs.service';
import { AiTriageModule } from '../ai/ai-triage.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [AlertsModule, AiTriageModule],
  controllers: [BugsController],
  providers: [BugsService],
})
export class BugsModule {}
