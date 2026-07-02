import { Type } from 'class-transformer';
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { CreateBetaTesterDto } from './create-beta-tester.dto';

export class BulkCreateBetaTesterDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBetaTesterDto)
  testers: CreateBetaTesterDto[];
}
