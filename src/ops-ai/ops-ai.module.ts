import { Module } from '@nestjs/common';
import { OpsAiController } from './ops-ai.controller';
import { OpsAiService } from './ops-ai.service';

@Module({
  controllers: [OpsAiController],
  providers: [OpsAiService],
})
export class OpsAiModule {}
