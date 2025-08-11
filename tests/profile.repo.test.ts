import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { PrismaClient as MockClient } from './prismaMock';

vi.mock('@prisma/client', () => ({ PrismaClient: MockClient }));

let prisma: PrismaClient;
let seedTeams: () => Promise<void>;
let getProfile: (id: string) => Promise<unknown>;
let upsertProfile: (
  id: string,
  data: { nickname?: string; fav_team?: number; risk_profile: 'safe' | 'balanced' | 'spicy' },
) => Promise<unknown>;

type Profile = {
  nickname: string | null;
  favTeamId: number | null;
  riskProfile: string | null;
};

beforeAll(async () => {
  ({ prisma } = await import('../src/lib/db'));
  ({ seedTeams } = await import('../scripts/seed/teams'));
  ({ getProfile, upsertProfile } = await import('../src/lib/repos/profiles'));
  await seedTeams();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('profiles repo', () => {
  it('upserts and fetches profile', async () => {
    await upsertProfile('user1', { nickname: 'Bob', fav_team: 1, risk_profile: 'spicy' });
    const profile = (await getProfile('user1')) as Profile | null;
    expect(profile?.nickname).toBe('Bob');
    expect(profile?.favTeamId).toBe(1);
    expect(profile?.riskProfile).toBe('spicy');
  });
});
