import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamMembersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.teamMember.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async findOne(id: string) {
    const member = await this.prisma.teamMember.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Team member not found');
    return member;
  }

  async create(dto: CreateTeamMemberDto) {
    const existing = await this.prisma.teamMember.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A team member with this email already exists');
    return this.prisma.teamMember.create({ data: dto });
  }

  async update(id: string, dto: UpdateTeamMemberDto) {
    await this.findOne(id);
    return this.prisma.teamMember.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.teamMember.delete({ where: { id } });
  }

  // used by auth layer — checks if an email is in the team
  findByEmail(email: string) {
    return this.prisma.teamMember.findUnique({ where: { email } });
  }
}
