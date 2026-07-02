import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BetaWavesService } from './beta-waves.service';
import { UpdateWaveDto } from './dto/update-wave.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Beta Waves')
@ApiBearerAuth()
@Controller('beta/waves')
@UseGuards(JwtAuthGuard)
export class BetaWavesController {
  constructor(private readonly service: BetaWavesService) {}

  @ApiOperation({ summary: 'List all waves with live tester counts' })
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Update wave status (locked / open / closed)' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWaveDto) {
    return this.service.update(id, dto);
  }
}