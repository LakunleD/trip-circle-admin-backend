import { PartialType } from '@nestjs/mapped-types';
import { CreateBugDto } from './create-bug.dto';
import { IsOptional, IsIn } from 'class-validator';

export class UpdateBugDto extends PartialType(CreateBugDto) {
  @IsOptional()
  @IsIn(['open', 'in_progress', 'resolved', 'closed'])
  status?: string;
}