import { IsString, IsOptional, IsInt, IsIn, IsEmail, IsUrl } from 'class-validator';

export class CreateBugDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsIn(['P0', 'P1', 'P2', 'P3', 'P4'])
  priority: string;

  @IsString()
  module: string;

  @IsIn(['tester', 'engineer', 'founder'])
  reporterType: string;

  @IsOptional()
  @IsString()
  reporterName?: string;

  @IsOptional()
  @IsEmail()
  reporterEmail?: string;

  @IsOptional()
  @IsString()
  stepsToReproduce?: string;

  @IsOptional()
  @IsString()
  screenshotUrl?: string;

  @IsOptional()
  @IsInt()
  wave?: number;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}