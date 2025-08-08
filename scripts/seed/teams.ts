import { PrismaClient } from '@prisma/client';

const teams = [
  {
    id: 1,
    name: 'Brisbane Broncos',
    shortName: 'BRI',
    colors: JSON.stringify({ primary: '#6B1E1F', secondary: '#FFCC00' }),
    logoUrl: 'https://example.com/broncos.png',
  },
  {
    id: 2,
    name: 'Melbourne Storm',
    shortName: 'MEL',
    colors: JSON.stringify({ primary: '#4B0082', secondary: '#FFFFFF' }),
    logoUrl: 'https://example.com/storm.png',
  },
  {
    id: 3,
    name: 'Sydney Roosters',
    shortName: 'SYD',
    colors: JSON.stringify({ primary: '#000080', secondary: '#FF0000' }),
    logoUrl: 'https://example.com/roosters.png',
  },
];

export async function seedTeams(): Promise<void> {
  const prisma = new PrismaClient();
  for (const team of teams) {
    await prisma.team.upsert({
      where: { id: team.id },
      update: team,
      create: team,
    });
  }
  await prisma.$disconnect();
}

if (require.main === module) {
  seedTeams().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
