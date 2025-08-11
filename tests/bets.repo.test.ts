import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { PrismaClient as MockClient } from './prismaMock';

vi.mock('@prisma/client', () => ({ PrismaClient: MockClient }));

let prisma: PrismaClient;
let seedTeams: () => Promise<void>;
let seedFixtures: () => Promise<void>;
let createBetSlip: any;
let listBetSlipsByUser: any;
let updateBetOutcome: any;
let getRoiSummary: any;

beforeAll(async () => {
  ({ prisma } = await import('../src/lib/db'));
  ({ seedTeams } = await import('../scripts/seed/teams'));
  ({ seedFixtures } = await import('../scripts/seed/fixtures'));
  ({
    createBetSlip,
    listBetSlipsByUser,
    updateBetOutcome,
    getRoiSummary,
  } = await import('../src/lib/repos/bets'));
  await seedTeams();
  await seedFixtures();
  await prisma.user.upsert({ where: { id: 'u1' }, update: {}, create: { id: 'u1' } });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('bets repo', () => {
  it('lists slips and computes roi', async () => {
    const slip1 = await createBetSlip({
      userId: 'u1',
      fixtureId: 1,
      risk_band: 'safe',
      legs_json: [],
    });
    await createBetSlip({
      userId: 'u1',
      fixtureId: 2,
      risk_band: 'balanced',
      legs_json: [],
    });
    await updateBetOutcome({
      bet_slip_id: slip1.id,
      stake: 10,
      returned: 20,
      status: 'won',
    });
    const slips = await listBetSlipsByUser('u1');
    expect(slips.length).toBe(2);
    const summary = await getRoiSummary('u1');
    expect(summary.totalBets).toBe(2);
    expect(summary.settledBets).toBe(1);
    expect(summary.stakeSum).toBe(10);
    expect(summary.returnSum).toBe(20);
    expect(summary.roiPct).toBe(1);
  });
});
