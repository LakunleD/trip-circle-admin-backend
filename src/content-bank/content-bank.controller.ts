import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContentBankService } from './content-bank.service';
import { CreateContentBankDto } from './dto/create-content-bank.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Content Bank')
@ApiBearerAuth()
@Controller('content-bank')
@UseGuards(JwtAuthGuard)
export class ContentBankController {
  constructor(private readonly service: ContentBankService) {}

  @ApiOperation({ summary: 'List all content bank entries' })
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Add a new quote to the content bank' })
  @Post()
  create(@Body() dto: CreateContentBankDto) {
    return this.service.create(dto);
  }
}