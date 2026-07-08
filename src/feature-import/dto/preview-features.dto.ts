import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ImportFeatureItemDto } from './import-features.dto';

export class PreviewFeaturesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportFeatureItemDto)
  features: ImportFeatureItemDto[];
}
