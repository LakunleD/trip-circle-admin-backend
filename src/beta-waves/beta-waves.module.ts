import { Module } from '@nestjs/common';
import { BetaWavesController } from './beta-waves.controller';
import { BetaWavesService } from './beta-waves.service';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [AlertsModule],
  controllers: [BetaWavesController],
  providers: [BetaWavesService],
})
export class BetaWavesModule {}