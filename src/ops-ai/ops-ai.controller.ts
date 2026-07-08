import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OpsAiService } from './ops-ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Ops AI')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class OpsAiController {
  constructor(private readonly service: OpsAiService) {}

  @ApiOperation({ summary: 'Draft a spec for a feature (mock fallback)' })
  @Post('spec-draft/:featureId')
  draftSpec(@Param('featureId') featureId: string) {
    return this.service.draftSpec(featureId);
  }

  @ApiOperation({ summary: 'Find potentially duplicate features by title similarity (mock fallback)' })
  @ApiQuery({ name: 'title', required: true })
  @Get('duplicate-check')
  checkDuplicate(@Query('title') title: string) {
    return this.service.checkDuplicate(title);
  }

  @ApiOperation({ summary: 'Generate weekly digest of feature activity (mock fallback)' })
  @Get('weekly-digest')
  weeklyDigest() {
    return this.service.weeklyDigest();
  }
}
