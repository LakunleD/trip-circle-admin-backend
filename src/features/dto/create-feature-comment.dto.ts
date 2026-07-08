import { IsString, IsEmail } from 'class-validator';

export class CreateFeatureCommentDto {
  @IsEmail()
  authorEmail: string;

  @IsString()
  authorName: string;

  @IsString()
  content: string;
}
