import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Surveys')
@Controller('survey')
export class SurveysController {
  constructor(private readonly service: SurveysService) {}

  // public — submitted by testers from within the main app
  @ApiOperation({ summary: 'Submit a survey response — public, no auth required' })
  @Post()
  create(@Body() dto: CreateSurveyDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'List all survey responses' })
  @ApiBearerAuth()
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.service.findAll();
  }
}