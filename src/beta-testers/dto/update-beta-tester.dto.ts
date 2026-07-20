import { PartialType } from '@nestjs/swagger';
import { CreateBetaTesterDto } from './create-beta-tester.dto';

export class UpdateBetaTesterDto extends PartialType(CreateBetaTesterDto) {}