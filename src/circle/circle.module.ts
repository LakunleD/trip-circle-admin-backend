import { Module } from '@nestjs/common';
import { CircleController } from './circle.controller';
import { CircleService } from './circle.service';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [AlertsModule],
  controllers: [CircleController],
  providers: [CircleService],
})
export class CircleModule {}
