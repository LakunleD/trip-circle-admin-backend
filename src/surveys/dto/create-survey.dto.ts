import { IsString, IsIn, IsOptional, IsInt, IsBoolean, Min, Max } from 'class-validator';

export class CreateSurveyDto {
  @IsIn(['onboarding', 'mid_beta', 'closing'])
  surveyType: string;

  responses: Record<string, any>;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  npsScore?: number;

  @IsOptional()
  @IsBoolean()
  quoteConsent?: boolean;

  @IsOptional()
  @IsString()
  quoteText?: string;

  @IsOptional()
  @IsString()
  testerId?: string;
}