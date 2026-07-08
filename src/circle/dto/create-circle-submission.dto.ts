import { IsString, IsEmail, IsOptional, IsIn, IsInt, Min, Max, MinLength } from 'class-validator';

export class CreateCircleSubmissionDto {
  @IsEmail()
  submitterEmail: string;

  @IsOptional()
  @IsString()
  submitterName?: string;

  @IsIn(['idea', 'improvement', 'love_it', 'question', 'other'])
  submissionType: string;

  @IsString()
  @MinLength(10)
  message: string;

  @IsOptional()
  @IsIn(['chat', 'payments', 'planning', 'groups', 'ai', 'general'])
  productArea?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsIn(['widget', 'post_flow', 'bug_deflect', 'manual'])
  source?: string;

  @IsOptional()
  @IsString()
  flowContext?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
