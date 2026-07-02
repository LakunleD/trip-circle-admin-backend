import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateContentBankDto {
  @IsString()
  quote: string;

  @IsString()
  sourceName: string;

  @IsOptional()
  @IsString()
  sourceCity?: string;

  @IsOptional()
  @IsBoolean()
  consent?: boolean;

  @IsIn(['testimonial', 'interview', 'dm'])
  contentType: string;
}