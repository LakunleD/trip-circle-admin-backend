import { IsString } from 'class-validator';

export class UpdateFeatureCommentDto {
  @IsString()
  content: string;
}
