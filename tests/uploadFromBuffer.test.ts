import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { PrismaClient as MockClient } from './prismaMock';

vi.mock('@prisma/client', () => ({ PrismaClient: MockClient }));

let prisma: PrismaClient;
let uploadFromBuffer: (buf: Buffer) => Promise<{ inserted: number; updated: number; rows: number }>;

beforeAll(async () => {
  ({ prisma } = await import('../src/lib/db'));
  ({ uploadFromBuffer } = await import('../src/features/odds/uploadFromBuffer'));
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('uploadFromBuffer', () => {
  it('inserts and updates odds snapshots', async () => {
    const csv = 'fixture_id,captured_at,home_win,away_win\n1,2025-01-01T00:00:00Z,1.1,4.2';
    const res1 = await uploadFromBuffer(Buffer.from(csv));
    expect(res1).toEqual({ inserted: 1, updated: 0, rows: 1 });
    const res2 = await uploadFromBuffer(Buffer.from(csv));
    expect(res2.inserted).toBe(0);
    expect(res2.updated).toBe(1);
  });
});
