import { IsString, IsOptional, IsIn, IsArray, IsObject } from 'class-validator';

export class CreateFeatureDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsIn(['backlog', 'not_started', 'in_progress', 'blocked', 'built', 'paused', 'deprecated'])
  status?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'critical'])
  priority?: string;

  @IsOptional()
  @IsString()
  originTag?: string;

  @IsOptional()
  @IsString()
  phase?: string;

  @IsOptional()
  @IsIn(['App Feature', 'AI Agent', 'Internal Tool', 'Setup Task', 'B2B Portal'])
  workType?: string;

  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsString()
  specLink?: string;

  @IsOptional()
  @IsIn(['free', 'tripcircle_plus'])
  tier?: string;

  @IsOptional()
  @IsIn(['web', 'mobile_only', 'web_and_mobile'])
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
