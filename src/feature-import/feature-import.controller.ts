import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeatureImportService } from './feature-import.service';
import { ImportFeaturesDto } from './dto/import-features.dto';
import { PreviewFeaturesDto } from './dto/preview-features.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Feature Import')
@ApiBearerAuth()
@Controller('feature-import')
@UseGuards(JwtAuthGuard, AdminGuard)
export class FeatureImportController {
  constructor(private readonly service: FeatureImportService) {}

  @ApiOperation({ summary: 'Preview import — applies defaults, no DB writes — admin only' })
  @Post('preview')
  preview(@Body() dto: PreviewFeaturesDto) {
    return this.service.preview(dto.features);
  }

  @ApiOperation({ summary: 'Bulk import features, skips duplicates by title — admin only' })
  @Post('import')
  import(@Body() dto: ImportFeaturesDto) {
    return this.service.import(dto);
  }
}
