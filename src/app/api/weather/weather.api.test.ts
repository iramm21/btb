/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { handlerToServer } from '../../../../tests/apiTestUtils';
import { WeatherResponseSchema } from '../../../lib/schemas/api';
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

describe('GET /api/weather', () => {
  it('returns mocked weather for fixture', async () => {
    const server = handlerToServer(GET);
    const res = await request(server).get('/api/weather?fixture_id=1');
    expect(res.status).toBe(200);
    const parsed = WeatherResponseSchema.parse(res.body);
    expect(parsed.source).toBe('mock');
    expect(parsed.forecast.rain_chance).toBeGreaterThanOrEqual(0);
    expect(parsed.forecast.rain_chance).toBeLessThanOrEqual(100);
  });

  it('returns 400 for missing fixture_id', async () => {
    const server = handlerToServer(GET);
    const res = await request(server).get('/api/weather');
    expect(res.status).toBe(400);
  });
});
