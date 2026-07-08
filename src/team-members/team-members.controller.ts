import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TeamMembersService } from './team-members.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Team Members')
@ApiBearerAuth()
@Controller('team-members')
@UseGuards(JwtAuthGuard)
export class TeamMembersController {
  constructor(private readonly service: TeamMembersService) {}

  @ApiOperation({ summary: 'List all team members' })
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Get a single team member' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Add a team member — admin only' })
  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateTeamMemberDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Update a team member — admin only' })
  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateTeamMemberDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Remove a team member — admin only' })
  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
