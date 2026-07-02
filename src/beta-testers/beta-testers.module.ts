import { Module } from '@nestjs/common';
import { BetaTestersController } from './beta-testers.controller';
import { BetaTestersService } from './beta-testers.service';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [AlertsModule],
  controllers: [BetaTestersController],
  providers: [BetaTestersService],
})
export class BetaTestersModule {}