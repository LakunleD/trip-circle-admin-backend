import { IsEmail } from 'class-validator';

export class ActivateTesterDto {
  @IsEmail()
  email: string;
}
