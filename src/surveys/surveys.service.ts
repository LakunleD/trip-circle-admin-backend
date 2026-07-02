import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSurveyDto } from './dto/create-survey.dto';

@Injectable()
export class SurveysService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSurveyDto) {
    return this.prisma.surveyResponse.create({ data: dto });
  }

  findAll() {
    return this.prisma.surveyResponse.findMany({ orderBy: { createdAt: 'desc' } });
  }
}