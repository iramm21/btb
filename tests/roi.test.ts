import { describe, expect, it, vi } from 'vitest';
import { PrismaClient as MockClient } from './prismaMock';

vi.mock('@prisma/client', () => ({ PrismaClient: MockClient }));
import { calcRoi } from '../src/lib/repos/bets';

describe('roi math', () => {
  it('computes roi ignoring pending', () => {
    const { roiPct, stakeSum, returnSum } = calcRoi([
      { stake: 10, returned: 25, status: 'won' },
      { stake: 10, returned: 0, status: 'lost' },
      { stake: 10, returned: 0, status: 'pending' },
    ]);
    expect(stakeSum).toBe(20);
    expect(returnSum).toBe(25);
    expect(roiPct).toBe(0.25);
  });
});
