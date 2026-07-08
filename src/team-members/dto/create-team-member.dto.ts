import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateTeamMemberDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
