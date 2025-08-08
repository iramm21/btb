import { z } from 'zod';
import { prisma } from '../db';

const roundSchema = z.number().int().min(1);
const idSchema = z.number().int().min(1);

export async function getFixturesByRound(round: number) {
  const r = roundSchema.parse(round);
  return prisma.fixture.findMany({
    where: { round: r },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { kickoffUtc: 'asc' },
  });
}

export async function getFixtureById(id: number) {
  const fixtureId = idSchema.parse(id);
  return prisma.fixture.findUnique({
    where: { id: fixtureId },
    include: { homeTeam: true, awayTeam: true },
  });
}
