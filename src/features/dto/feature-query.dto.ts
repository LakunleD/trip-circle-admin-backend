import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import {
  FEATURE_STATUSES,
  FEATURE_PRIORITIES,
  FEATURE_WORK_TYPES,
  FEATURE_TIERS,
  FEATURE_PLATFORMS,
  FEATURE_SORT_FIELDS,
  SORT_ORDERS,
} from '../constants/feature.enums';

export class FeatureQueryDto {
  @IsOptional()
  @IsIn([...FEATURE_STATUSES])
  status?: string;

  @IsOptional()
  @IsIn([...FEATURE_PRIORITIES])
  priority?: string;

  @IsOptional()
  @IsIn([...FEATURE_WORK_TYPES])
  workType?: string;

  @IsOptional()
  @IsIn([...FEATURE_TIERS])
  tier?: string;

  @IsOptional()
  @IsIn([...FEATURE_PLATFORMS])
  platform?: string;

  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  phase?: string;

  // searches title and description
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn([...FEATURE_SORT_FIELDS])
  sortBy?: string;

  @IsOptional()
  @IsIn([...SORT_ORDERS])
  sortOrder?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
