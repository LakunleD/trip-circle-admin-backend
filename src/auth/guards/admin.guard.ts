import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // set by JwtAuthGuard — must run after it

    if (!user?.email) throw new ForbiddenException('Admin access required');

    const adminUser = await this.prisma.adminUser.findFirst({
      where: { email: { equals: user.email, mode: 'insensitive' } },
    });

    if (!adminUser) throw new ForbiddenException('Admin access required');

    // attach to request so RolesGuard can read it without a second DB query
    request.adminUser = adminUser;
    return true;
  }
}
