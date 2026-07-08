import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CircleService } from './circle.service';
import { CreateCircleSubmissionDto } from './dto/create-circle-submission.dto';
import { UpdateCircleSubmissionDto } from './dto/update-circle-submission.dto';
import { CircleQueryDto } from './dto/circle-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('The Circle')
@Controller('circle')
export class CircleController {
  constructor(private readonly service: CircleService) {}

  @ApiOperation({ summary: 'Submit feedback from the widget — public' })
  @Post()
  create(@Body() dto: CreateCircleSubmissionDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'List all submissions with filters — admin only' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll(@Query() query: CircleQueryDto) {
    return this.service.findAll(query);
  }

  @ApiOperation({ summary: 'Aggregate submission stats — admin only' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  @ApiOperation({ summary: 'Get one submission by id — admin only' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Update submission status or notes — admin only' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCircleSubmissionDto) {
    return this.service.update(id, dto);
  }
}
