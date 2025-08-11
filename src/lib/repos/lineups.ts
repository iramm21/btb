import { z } from 'zod';
import { prisma } from '../db';

const fixtureIdSchema = z.number().int().min(1);

export async function getLineupsByFixture(fixtureId: number) {
  const id = fixtureIdSchema.parse(fixtureId);
  return prisma.lineup.findMany({
    where: { fixtureId: id },
    include: { team: true },
  });
}
