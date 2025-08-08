import { z } from 'zod';
import { prisma } from '../db';

const oddsSchema = z.object({
  fixtureId: z.number().int().min(1),
  capturedAt: z.date(),
  homeWin: z.number().optional(),
  awayWin: z.number().optional(),
  line: z.number().optional(),
  total: z.number().optional(),
  anytimeTryscorerJson: z.any().optional(),
});

export async function upsertOddsSnapshot(snapshot: unknown) {
  const data = oddsSchema.parse(snapshot);
  const existing = await prisma.oddsSnapshot.findFirst({
    where: { fixtureId: data.fixtureId, capturedAt: data.capturedAt },
  });
  if (existing) {
    return prisma.oddsSnapshot.update({
      where: { id: existing.id },
      data,
    });
  }
  return prisma.oddsSnapshot.create({ data });
}

const fixtureIdSchema = z.number().int().min(1);

export async function getLatestOddsSnapshot(fixtureId: number) {
  const id = fixtureIdSchema.parse(fixtureId);
  return prisma.oddsSnapshot.findFirst({
    where: { fixtureId: id },
    orderBy: { capturedAt: 'desc' },
  });
}
