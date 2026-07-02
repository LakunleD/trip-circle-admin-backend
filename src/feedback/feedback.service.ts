import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateFeedbackDto) {
    return this.prisma.feedback.create({ data: dto });
  }

  findAll() {
    return this.prisma.feedback.findMany({ orderBy: { createdAt: 'desc' } });
  }
}