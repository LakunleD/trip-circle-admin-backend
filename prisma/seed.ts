import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.betaWave.upsert({
    where: { number: 1 },
    update: {},
    create: { number: 1, name: 'Wave 1', capacity: 50, status: 'open' },
  });
  await prisma.betaWave.upsert({
    where: { number: 2 },
    update: {},
    create: { number: 2, name: 'Wave 2', capacity: 200, status: 'locked' },
  });
  await prisma.betaWave.upsert({
    where: { number: 3 },
    update: {},
    create: { number: 3, name: 'Wave 3', capacity: 250, status: 'locked' },
  });

  // seed the first admin user so they can log in on first deploy
  const seedEmail = process.env.SEED_ADMIN_EMAIL;
  if (seedEmail) {
    await prisma.adminUser.upsert({
      where: { email: seedEmail },
      update: {},
      create: { email: seedEmail, name: 'Admin', role: 'admin' },
    });
    console.log(`Admin user seeded: ${seedEmail}`);
  }

  console.log('Seed complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
