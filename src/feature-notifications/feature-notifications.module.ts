import { Module } from '@nestjs/common';
import { FeatureNotificationsService } from './feature-notifications.service';

@Module({
  providers: [FeatureNotificationsService],
  exports: [FeatureNotificationsService],
})
export class FeatureNotificationsModule {}
