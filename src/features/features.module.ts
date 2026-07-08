import { Module } from '@nestjs/common';
import { FeaturesController } from './features.controller';
import { FeaturesService } from './features.service';
import { FeatureNotificationsModule } from '../feature-notifications/feature-notifications.module';

@Module({
  imports: [FeatureNotificationsModule],
  controllers: [FeaturesController],
  providers: [FeaturesService],
})
export class FeaturesModule {}
