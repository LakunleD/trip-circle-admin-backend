import { IsOptional, IsIn, IsString, IsNumberString } from 'class-validator';

export class CircleQueryDto {
  @IsOptional()
  @IsIn(['new', 'read', 'replied', 'actioned', 'converted'])
  status?: string;

  @IsOptional()
  @IsIn(['idea', 'improvement', 'love_it', 'question', 'other'])
  submissionType?: string;

  @IsOptional()
  @IsIn(['chat', 'payments', 'planning', 'groups', 'ai', 'general'])
  productArea?: string;

  @IsOptional()
  @IsIn(['widget', 'post_flow', 'bug_deflect', 'manual'])
  source?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
