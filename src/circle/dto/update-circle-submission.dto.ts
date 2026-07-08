import { IsString, IsOptional, IsIn, IsBoolean } from 'class-validator';

export class UpdateCircleSubmissionDto {
  @IsOptional()
  @IsIn(['new', 'read', 'replied', 'actioned', 'converted'])
  status?: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsBoolean()
  followUpInvited?: boolean;

  @IsOptional()
  @IsBoolean()
  replySent?: boolean;
}
