import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { handlerToServer } from '../../../../tests/apiTestUtils';
import { TipsResponseSchema } from '../../../lib/schemas/api';
import { GET } from './route';
const fixture = {
  id: 1,
  homeTeam: { id: 1, name: 'Home', shortName: 'HOM' },
  awayTeam: { id: 2, name: 'Away', shortName: 'AWY' },
};

const lineups = [
  {
    fixtureId: 1,
    teamId: 1,
    confirmedAt: new Date(),
    startersJson: [
      { id: 1, name: 'P1', position: 'Wing', stats: { tries: 3 } },
      { id: 2, name: 'P2', position: 'Centre', stats: { tries: 2 } },
      { id: 3, name: 'P3', position: 'Halfback', stats: { tries: 1 } },
    ],
    benchJson: [],
    outsJson: [],
  },
  {
    fixtureId: 1,
    teamId: 2,
    confirmedAt: new Date(),
    startersJson: [
      { id: 4, name: 'P4', position: 'Wing', stats: { tries: 2 } },
      { id: 5, name: 'P5', position: 'Fullback', stats: { tries: 1 } },
      { id: 6, name: 'P6', position: 'Lock', stats: { tries: 0 } },
    ],
    benchJson: [],
    outsJson: [],
  },
];

vi.mock('../../../lib/repos/fixtures', () => ({
  getFixtureById: async () => fixture,
}));

vi.mock('../../../lib/repos/lineups', () => ({
  getLineupsByFixture: async () => lineups,
}));

vi.mock('../../../lib/repos/odds', () => ({
  getLatestOddsSnapshot: async () => null,
}));

describe('GET /api/tips', () => {
  it('400 on bad params', async () => {
    const server = handlerToServer(GET);
    const res = await request(server).get('/api/tips');
    expect(res.status).toBe(400);
  });

  it('returns >=6 legs for balanced default', async () => {
    const server = handlerToServer(GET);
    const res = await request(server).get('/api/tips?fixture_id=1');
    expect(res.status).toBe(200);
    const body = TipsResponseSchema.parse(res.body);
    expect(body.legs.length).toBeGreaterThanOrEqual(6);
  });

  it('spicy returns >=7 legs', async () => {
    const server = handlerToServer(GET);
    const res = await request(server).get('/api/tips?fixture_id=1&risk=spicy');
    expect(res.status).toBe(200);
    const body = TipsResponseSchema.parse(res.body);
    expect(body.legs.length).toBeGreaterThanOrEqual(7);
  });

  it('deterministic with seed', async () => {
    const server = handlerToServer(GET);
    const r1 = await request(server).get('/api/tips?fixture_id=1&seed=unit');
    const r2 = await request(server).get('/api/tips?fixture_id=1&seed=unit');
    expect(r1.body).toEqual(r2.body);
  });
});
