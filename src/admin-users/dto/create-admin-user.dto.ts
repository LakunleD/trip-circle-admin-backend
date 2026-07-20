import { IsEmail, IsOptional, IsIn, IsString } from 'class-validator';

export class CreateAdminUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsIn(['admin', 'engineer', 'viewer'])
  role?: string;
}
