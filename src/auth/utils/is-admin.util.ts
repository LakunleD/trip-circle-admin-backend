import { PrismaService } from '../../prisma/prisma.service';

export async function isAdminEmail(email: string, prisma: PrismaService): Promise<boolean> {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  return !!admin;
}
