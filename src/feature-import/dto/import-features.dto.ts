import { IsArray, IsString, IsOptional, ValidateNested, ArrayMinSize, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportFeatureItemDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  phase?: string;

  @IsOptional()
  @IsString()
  originTag?: string;

  @IsOptional()
  @IsString()
  workType?: string;

  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsString()
  specLink?: string;

  @IsOptional()
  @IsString()
  tier?: string;

  @IsOptional()
  @IsString()
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

export class ImportFeaturesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportFeatureItemDto)
  features: ImportFeatureItemDto[];
}
