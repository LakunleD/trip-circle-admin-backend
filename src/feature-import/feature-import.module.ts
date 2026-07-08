import { Module } from '@nestjs/common';
import { FeatureImportController } from './feature-import.controller';
import { FeatureImportService } from './feature-import.service';

@Module({
  controllers: [FeatureImportController],
  providers: [FeatureImportService],
})
export class FeatureImportModule {}
