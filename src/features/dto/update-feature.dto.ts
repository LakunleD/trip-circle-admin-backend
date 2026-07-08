import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateFeatureDto } from './create-feature.dto';

export class UpdateFeatureDto extends PartialType(OmitType(CreateFeatureDto, ['createdBy'] as const)) {
  changedBy: string;
}
