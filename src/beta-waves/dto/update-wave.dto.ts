import { IsIn, IsOptional } from 'class-validator';

export class UpdateWaveDto {
  @IsOptional()
  @IsIn(['locked', 'open', 'closed'])
  status?: string;
}