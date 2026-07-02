import { IsString, IsInt, Min, Max, IsOptional, IsIn } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  triggerEvent: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  response?: string;

  @IsOptional()
  @IsIn(['A', 'B', 'C', 'D'])
  flow?: string;

  @IsOptional()
  @IsString()
  testerId?: string;
}