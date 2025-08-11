import { z } from 'zod';
import { prisma } from '../db';

const logSchema = z.object({
  type: z.string().min(1),
  status: z.string().min(1),
  error: z.string().optional(),
});

export async function logIngestRun(type: string, status: string, error?: string) {
  const data = logSchema.parse({ type, status, error });
  return prisma.ingestRun.create({
    data: { ...data, finishedAt: new Date() },
  });
}

const limitSchema = z.number().int().min(1).max(100).default(20);

export async function listIngestRuns(limit = 20) {
  const take = limitSchema.parse(limit);
  return prisma.ingestRun.findMany({
    orderBy: { startedAt: 'desc' },
    take,
  });
}
