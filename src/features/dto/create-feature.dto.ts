import { IsString, IsOptional, IsIn, IsArray, IsObject } from 'class-validator';
import {
  FEATURE_STATUSES,
  FEATURE_PRIORITIES,
  FEATURE_WORK_TYPES,
  FEATURE_TIERS,
  FEATURE_PLATFORMS,
} from '../constants/feature.enums';

export class CreateFeatureDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsIn([...FEATURE_STATUSES])
  status?: string;

  @IsOptional()
  @IsIn([...FEATURE_PRIORITIES])
  priority?: string;

  @IsOptional()
  @IsString()
  originTag?: string;

  @IsOptional()
  @IsString()
  phase?: string;

  @IsOptional()
  @IsIn([...FEATURE_WORK_TYPES])
  workType?: string;

  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsString()
  specLink?: string;

  @IsOptional()
  @IsIn([...FEATURE_TIERS])
  tier?: string;

  @IsOptional()
  @IsIn([...FEATURE_PLATFORMS])
  platform?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  links?: Record<string, unknown>[];
}
