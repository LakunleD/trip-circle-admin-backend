import { PartialType } from '@nestjs/mapped-types';
import { CreateBetaTesterDto } from './create-beta-tester.dto';

export class UpdateBetaTesterDto extends PartialType(CreateBetaTesterDto) {}