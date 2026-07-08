import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // set by JwtAuthGuard — must run after it

    if (!user?.email) throw new ForbiddenException('Admin access required');

    const admin = await this.prisma.adminUser.findUnique({
      where: { email: user.email },
    });

    if (!admin) throw new ForbiddenException('Admin access required');
    return true;
  }
}
