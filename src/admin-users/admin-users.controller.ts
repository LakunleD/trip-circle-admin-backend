import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminUsersService } from './admin-users.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth/users')
@UseGuards(JwtAuthGuard, AdminGuard, RolesGuard)
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @ApiOperation({ summary: 'List all team members with dashboard access — engineer and above' })
  @Roles('admin', 'engineer')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Grant dashboard access to a new team member — admin only' })
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateAdminUserDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Revoke dashboard access for a team member — admin only' })
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
