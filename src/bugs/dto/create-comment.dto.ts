import { IsString, IsIn } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  authorName: string;

  @IsIn(['engineer', 'founder', 'tester'])
  authorType: string;

  @IsString()
  content: string;
}