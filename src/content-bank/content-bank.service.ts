import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentBankDto } from './dto/create-content-bank.dto';

@Injectable()
export class ContentBankService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.contentBank.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(dto: CreateContentBankDto) {
    return this.prisma.contentBank.create({ data: dto });
  }
}