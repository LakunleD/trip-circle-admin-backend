import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsInt,
  IsIn,
} from 'class-validator';

export class CreateBetaTesterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsInt()
  wave?: number;

  @IsOptional()
  @IsIn(['waitlisted', 'invited', 'active', 'removed'])
  status?: string;

  @IsOptional()
  @IsInt()
  engagementScore?: number;

  @IsOptional()
  @IsString()
  geography?: string;

  @IsOptional()
  @IsBoolean()
  isPlanner?: boolean;

  @IsOptional()
  @IsBoolean()
  hasRealTrip?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}