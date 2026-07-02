import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BugsService } from './bugs.service';
import { CreateBugDto } from './dto/create-bug.dto';
import { UpdateBugDto } from './dto/update-bug.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Bugs')
@Controller('bugs')
export class BugsController {
  constructor(private readonly service: BugsService) {}

  // stats must be registered before :id to avoid route conflict
  @ApiOperation({ summary: 'Bug counts grouped by priority, status, and module' })
  @ApiBearerAuth()
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats() {
    return this.service.getStats();
  }

  @ApiOperation({ summary: 'List all bugs with optional filters' })
  @ApiBearerAuth()
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('module') module?: string,
    @Query('wave') wave?: string,
    @Query('assigned_to') assigned_to?: string,
  ) {
    return this.service.findAll({ status, priority, module, wave, assigned_to });
  }

  @ApiOperation({ summary: 'Get a single bug with comments and status history' })
  @ApiBearerAuth()
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // public — tester widget and internal form both use this
  @ApiOperation({ summary: 'Submit a bug report — public, no auth required' })
  @Post()
  create(@Body() dto: CreateBugDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Update any bug field' })
  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateBugDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Add a comment to a bug thread' })
  @ApiBearerAuth()
  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  addComment(@Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.service.addComment(id, dto);
  }

  @ApiOperation({ summary: 'Change bug status and write to audit trail' })
  @ApiBearerAuth()
  @Post(':id/status')
  @UseGuards(JwtAuthGuard)
  changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
    return this.service.changeStatus(id, dto);
  }
}