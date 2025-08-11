import { z } from 'zod';
import { prisma } from '../db';

const createSlipSchema = z.object({
  userId: z.string().min(1),
  fixtureId: z.number().int(),
  risk_band: z.enum(['safe', 'balanced', 'spicy']),
  legs_json: z.unknown(),
  note: z.string().optional(),
});

const listSchema = z.object({
  userId: z.string().min(1),
  limit: z.number().int().min(1).max(100),
});

const outcomeSchema = z.object({
  bet_slip_id: z.number().int(),
  stake: z.number(),
  returned: z.number(),
  status: z.enum(['won', 'lost', 'pending']),
});

interface RoiInput {
  stake: number;
  returned: number;
  status: 'won' | 'lost' | 'pending';
}

/**
 * Calculate ROI metrics from a list of outcomes.
 */
export function calcRoi(outcomes: RoiInput[]) {
  const settled = outcomes.filter((o) => o.status !== 'pending');
  const stakeSum = settled.reduce((sum, o) => sum + o.stake, 0);
  const returnSum = settled.reduce((sum, o) => sum + o.returned, 0);
  const roiPct = stakeSum
    ? Number(((returnSum - stakeSum) / stakeSum).toFixed(2))
    : 0;
  return { settledBets: settled.length, stakeSum, returnSum, roiPct };
}

/**
 * Create a bet slip for the given user and fixture.
 */
export async function createBetSlip({
  userId,
  fixtureId,
  risk_band,
  legs_json,
  note,
}: {
  userId: string;
  fixtureId: number;
  risk_band: 'safe' | 'balanced' | 'spicy';
  legs_json: unknown;
  note?: string;
}) {
  const data = createSlipSchema.parse({
    userId,
    fixtureId,
    risk_band,
    legs_json,
    note,
  });
  return prisma.betSlip.create({
    data: {
      userId: data.userId,
      fixtureId: data.fixtureId,
      riskBand: data.risk_band,
      legsJson: data.legs_json,
      note: data.note,
    },
  });
}

/**
 * List bet slips for a user ordered by creation date.
 */
export async function listBetSlipsByUser(
  userId: string,
  { limit = 50 }: { limit?: number } = {},
) {
  const { userId: uid, limit: lim } = listSchema.parse({ userId, limit });
  return prisma.betSlip.findMany({
    where: { userId: uid },
    include: {
      outcomes: true,
      fixture: { include: { homeTeam: true, awayTeam: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: lim,
  });
}

/**
 * Update or create the outcome for a bet slip.
 */
export async function updateBetOutcome({
  bet_slip_id,
  stake,
  returned,
  status,
}: {
  bet_slip_id: number;
  stake: number;
  returned: number;
  status: 'won' | 'lost' | 'pending';
}) {
  const data = outcomeSchema.parse({ bet_slip_id, stake, returned, status });
  const existing = await prisma.betOutcome.findFirst({
    where: { betSlipId: data.bet_slip_id },
  });
  if (existing) {
    return prisma.betOutcome.update({
      where: { id: existing.id },
      data: {
        stake: data.stake,
        returned: data.returned,
        status: data.status,
        settledAt: data.status === 'pending' ? null : new Date(),
      },
    });
  }
  return prisma.betOutcome.create({
    data: {
      betSlipId: data.bet_slip_id,
      stake: data.stake,
      returned: data.returned,
      status: data.status,
      settledAt: data.status === 'pending' ? null : new Date(),
    },
  });
}

/**
 * Fetch ROI summary for a user.
 */
export async function getRoiSummary(userId: string) {
  const uid = z.string().min(1).parse(userId);
  const slips = (await prisma.betSlip.findMany({
    where: { userId: uid },
    include: { outcomes: true },
  })) as {
    outcomes: { stake: number; returned: number | null; status: string | null }[];
  }[];
  const { settledBets, stakeSum, returnSum, roiPct } = calcRoi(
    slips
      .map((s) => s.outcomes[0])
      .filter((o): o is { stake: number; returned: number | null; status: string | null } => Boolean(o))
      .map((o) => ({
        stake: o.stake,
        returned: o.returned ?? 0,
        status: (o.status as RoiInput['status']) ?? 'pending',
      })),
  );
  return {
    totalBets: slips.length,
    settledBets,
    stakeSum,
    returnSum,
    roiPct,
  };
}
