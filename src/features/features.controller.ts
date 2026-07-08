import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FeaturesService } from './features.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { CreateFeatureCommentDto } from './dto/create-feature-comment.dto';
import { FeatureQueryDto } from './dto/feature-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { isAdminEmail } from '../auth/utils/is-admin.util';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Features')
@ApiBearerAuth()
@Controller('features')
@UseGuards(JwtAuthGuard)
export class FeaturesController {
  constructor(
    private readonly service: FeaturesService,
    private readonly prisma: PrismaService,
  ) {}

  // stats must come before :id
  @ApiOperation({ summary: 'Dashboard stat counts' })
  @Get('stats')
  async getStats(@Req() req: any) {
    return this.service.getStats(await isAdminEmail(req.user.email, this.prisma));
  }

  @ApiOperation({ summary: 'Recent activity feed for dashboard' })
  @Get('activity')
  async getActivity(@Req() req: any) {
    return this.service.getRecentActivity(await isAdminEmail(req.user.email, this.prisma));
  }

  @ApiOperation({ summary: 'Features grouped by status for kanban board' })
  @Get('kanban')
  async findKanban(@Req() req: any) {
    return this.service.findKanban(await isAdminEmail(req.user.email, this.prisma));
  }

  @ApiOperation({ summary: 'Check if a feature title already exists (duplicate detection)' })
  @ApiQuery({ name: 'title', required: true })
  @Get('duplicate-check')
  checkDuplicate(@Query('title') title: string) {
    return this.service.checkDuplicate(title);
  }

  @ApiOperation({ summary: 'List features with optional filters' })
  @Get()
  async findAll(@Query() query: FeatureQueryDto, @Req() req: any) {
    return this.service.findAll(query, await isAdminEmail(req.user.email, this.prisma));
  }

  @ApiOperation({ summary: 'Get a single feature with history and comments' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new feature' })
  @Post()
  create(@Body() dto: CreateFeatureDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Update a feature — logs changes and fires notifications' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFeatureDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Archive a feature (soft delete)' })
  @Delete(':id')
  archive(@Param('id') id: string) {
    return this.service.archive(id);
  }

  @ApiOperation({ summary: 'Add a comment — triggers @mention notifications' })
  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() dto: CreateFeatureCommentDto) {
    return this.service.addComment(id, dto);
  }
}
