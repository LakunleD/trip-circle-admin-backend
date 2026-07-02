import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { BetaTestersService } from './beta-testers.service';
import { CreateBetaTesterDto } from './dto/create-beta-tester.dto';
import { UpdateBetaTesterDto } from './dto/update-beta-tester.dto';
import { ActivateTesterDto } from './dto/activate-tester.dto';
import { BulkCreateBetaTesterDto } from './dto/bulk-create-beta-tester.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ServiceTokenGuard } from '../auth/guards/service-token.guard';

@ApiTags('Beta Testers')
@Controller('beta/testers')
export class BetaTestersController {
  constructor(private readonly service: BetaTestersService) {}

  // ── Dashboard routes (JWT required) ──────────────────────────────────

  @ApiOperation({ summary: 'List all beta testers' })
  @ApiBearerAuth()
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.service.findAll();
  }

  // static routes must come before parameterised ones

  @ApiOperation({ summary: 'Check if an email has beta access — called by main TripCircle app' })
  @ApiSecurity('x-service-token')
  @ApiQuery({ name: 'email', required: true, example: 'amara@gmail.com' })
  @Get('access-check')
  @UseGuards(ServiceTokenGuard)
  accessCheck(@Query('email') email: string) {
    return this.service.accessCheck(email);
  }

  @ApiOperation({ summary: 'Get a single beta tester by ID' })
  @ApiBearerAuth()
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Add a new beta tester' })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateBetaTesterDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Bulk import beta testers — skips duplicates by email' })
  @ApiBearerAuth()
  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  bulkCreate(@Body() dto: BulkCreateBetaTesterDto) {
    return this.service.bulkCreate(dto);
  }

  // ── Machine-to-machine routes (service token required) ───────────────

  @ApiOperation({ summary: 'Check beta access and activate on first login — called by main TripCircle app' })
  @ApiSecurity('x-service-token')
  @Patch('activate')
  @UseGuards(ServiceTokenGuard)
  activate(@Body() dto: ActivateTesterDto) {
    return this.service.activate(dto);
  }

  // ── Dashboard routes (JWT required) continued ─────────────────────────

  @ApiOperation({ summary: 'Update tester details, wave, status, or notes' })
  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateBetaTesterDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Soft-delete a tester (sets status to removed)' })
  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @ApiOperation({ summary: 'Assign a tester to a wave' })
  @ApiBearerAuth()
  @Post(':id/assign-wave')
  @UseGuards(JwtAuthGuard)
  assignWave(@Param('id') id: string, @Body('wave') wave: number) {
    return this.service.assignWave(id, wave);
  }
}