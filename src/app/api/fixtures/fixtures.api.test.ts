/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { handlerToServer } from '../../../../tests/apiTestUtils';
import { FixturesResponseSchema } from '../../../lib/schemas/api';
import { GET } from './route';

vi.mock('@prisma/client', () => import('../../../../tests/prismaMock'));

let prisma: any;
let seedTeams: () => Promise<void>;
let seedFixtures: () => Promise<void>;

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

describe('GET /api/fixtures', () => {
  it('returns fixtures for a round', async () => {
    const server = handlerToServer(GET);
    const res = await request(server).get('/api/fixtures?round=1');
    expect(res.status).toBe(200);
    const parsed = FixturesResponseSchema.parse(res.body);
    expect(parsed.fixtures.length).toBeGreaterThan(0);
    expect(parsed.fixtures[0].home_team.name).toBe('Brisbane Broncos');
  });

  it('returns 400 for invalid round', async () => {
    const server = handlerToServer(GET);
    const res = await request(server).get('/api/fixtures?round=0');
    expect(res.status).toBe(400);
  });
});
