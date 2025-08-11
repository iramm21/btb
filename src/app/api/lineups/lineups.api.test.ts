/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { handlerToServer } from '../../../../tests/apiTestUtils';
import { LineupsResponseSchema } from '../../../lib/schemas/api';
import { GET } from './route';

vi.mock('@prisma/client', () => import('../../../../tests/prismaMock'));

let prisma: any;
let seedTeams: () => Promise<void>;
let seedFixtures: () => Promise<void>;

async function seedLineups(homeConfirmed: boolean, awayConfirmed: boolean) {
  const { PrismaClient } = await import('@prisma/client');
  const p = new PrismaClient();
  const homeData = {
    fixtureId: 1,
    teamId: 1,
    confirmedAt: homeConfirmed ? new Date('2024-03-01T06:00:00Z') : null,
    startersJson: ['A'],
    benchJson: [],
    outsJson: [],
  } as any;
  const awayData = {
    fixtureId: 1,
    teamId: 2,
    confirmedAt: awayConfirmed ? new Date('2024-03-01T06:00:00Z') : null,
    startersJson: ['B'],
    benchJson: [],
    outsJson: [],
  } as any;
  await p.lineup.upsert({
    where: { fixtureId_teamId: { fixtureId: homeData.fixtureId, teamId: homeData.teamId } },
    update: homeData,
    create: homeData,
  });
  await p.lineup.upsert({
    where: { fixtureId_teamId: { fixtureId: awayData.fixtureId, teamId: awayData.teamId } },
    update: awayData,
    create: awayData,
  });
  await p.$disconnect();
}

beforeAll(async () => {
  ({ prisma } = await import('../../../lib/db'));
  ({ seedTeams } = await import('../../../../scripts/seed/teams'));
  ({ seedFixtures } = await import('../../../../scripts/seed/fixtures'));
  await seedTeams();
  await seedFixtures();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/lineups', () => {
  it('reports confirmed false if only one lineup confirmed', async () => {
    await seedLineups(true, false);
    const server = handlerToServer(GET);
    const res = await request(server).get('/api/lineups?fixture_id=1');
    expect(res.status).toBe(200);
    const parsed = LineupsResponseSchema.parse(res.body);
    expect(parsed.confirmed).toBe(false);
  });

  it('reports confirmed true when both lineups confirmed', async () => {
    await seedLineups(true, true);
    const server = handlerToServer(GET);
    const res = await request(server).get('/api/lineups?fixture_id=1');
    expect(res.status).toBe(200);
    const parsed = LineupsResponseSchema.parse(res.body);
    expect(parsed.confirmed).toBe(true);
  });

  it('returns 400 for missing fixture_id', async () => {
    const server = handlerToServer(GET);
    const res = await request(server).get('/api/lineups');
    expect(res.status).toBe(400);
  });
});
