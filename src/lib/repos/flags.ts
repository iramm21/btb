import { z } from 'zod';
import { prisma } from '../db';

export async function listFlags() {
  return prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
}

const upsertSchema = z.object({
  key: z.string().min(1),
  enabled: z.boolean(),
  payload_json: z.any().optional(),
});

export async function upsertFlag(input: unknown) {
  const data = upsertSchema.parse(input);
  return prisma.featureFlag.upsert({
    where: { key: data.key },
    update: { enabled: data.enabled, payloadJson: data.payload_json },
    create: { key: data.key, enabled: data.enabled, payloadJson: data.payload_json },
  });
}
