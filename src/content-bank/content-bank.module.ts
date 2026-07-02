import { Module } from '@nestjs/common';
import { ContentBankController } from './content-bank.controller';
import { ContentBankService } from './content-bank.service';

@Module({
  controllers: [ContentBankController],
  providers: [ContentBankService],
})
export class ContentBankModule {}