import { PrismaClient } from '@prisma/client';

const fixtures = [
  {
    id: 1,
    season: 2024,
    round: 1,
    kickoffUtc: new Date('2024-03-01T08:00:00Z'),
    homeTeamId: 1,
    awayTeamId: 2,
    venue: 'Suncorp Stadium',
    status: 'scheduled',
  },
  {
    id: 2,
    season: 2024,
    round: 1,
    kickoffUtc: new Date('2024-03-02T08:00:00Z'),
    homeTeamId: 3,
    awayTeamId: 1,
    venue: 'Allianz Stadium',
    status: 'scheduled',
  },
];

export async function seedFixtures(): Promise<void> {
  const prisma = new PrismaClient();
  for (const fixture of fixtures) {
    await prisma.fixture.upsert({
      where: { id: fixture.id },
      update: fixture,
      create: fixture,
    });
  }
  await prisma.$disconnect();
}

if (require.main === module) {
  seedFixtures().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
