import { z } from 'zod';
import { prisma } from '../db';

const logSchema = z.object({
  userId: z.string().optional().nullable(),
  event: z.string().min(1),
  props: z.record(z.string(), z.unknown()).optional(),
});

const listSchema = z.object({
  userId: z.string().optional().nullable(),
  limit: z.number().int().min(1).max(100).default(50),
});

/**
 * Persist a simple analytics event.
 */
export async function logEvent({
  userId,
  event,
  props,
}: {
  userId?: string | null;
  event: string;
  props?: Record<string, unknown>;
}) {
  const data = logSchema.parse({ userId, event, props });
  await prisma.event.create({
    data: {
      userId: data.userId ?? null,
      event: data.event,
      propsJson: data.props ?? {},
    },
  });
}

/**
 * Fetch recent events optionally filtered by user.
 */
export async function getRecentEvents({
  userId,
  limit = 50,
}: {
  userId?: string | null;
  limit?: number;
} = {}) {
  const params = listSchema.parse({ userId, limit });
  return prisma.event.findMany({
    where: params.userId ? { userId: params.userId } : undefined,
    orderBy: { createdAt: 'desc' },
    take: params.limit,
  });
}

export default logEvent;
