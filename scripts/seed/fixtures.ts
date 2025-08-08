import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Placeholder seed script for fixtures.
 * Currently does nothing.
 */
export async function seedFixtures(): Promise<void> {
  // intentionally empty
}

if (require.main === module) {
  seedFixtures()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
