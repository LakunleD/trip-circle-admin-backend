import { IsString, IsIn, IsOptional } from 'class-validator';

export class ChangeStatusDto {
  @IsIn(['open', 'in_progress', 'resolved', 'closed'])
  toStatus: string;

  @IsString()
  changedBy: string;

  @IsOptional()
  @IsString()
  note?: string;
}