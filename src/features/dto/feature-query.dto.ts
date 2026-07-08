import { IsOptional, IsString, IsIn } from 'class-validator';

export class FeatureQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  workType?: string;

  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsString()
  phase?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'priority', 'title'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: string;
}
