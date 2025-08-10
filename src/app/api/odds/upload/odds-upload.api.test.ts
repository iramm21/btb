/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { handlerToServer } from '../../../../../tests/apiTestUtils';
import { POST } from './route';

vi.mock('@prisma/client', () => import('../../../../../tests/prismaMock'));

let prisma: any;
let seedTeams: () => Promise<void>;
let seedFixtures: () => Promise<void>;

beforeAll(async () => {
  ({ prisma } = await import('../../../../lib/db'));
  ({ seedTeams } = await import('../../../../../scripts/seed/teams'));
  ({ seedFixtures } = await import('../../../../../scripts/seed/fixtures'));
  await seedTeams();
  await seedFixtures();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/odds/upload', () => {
  const csv = [
    'fixture_id,captured_at,home_win,away_win,line,total,anytime_tryscorer_json',
    '1,2024-03-01T09:00:00Z,1.5,2.5,-3.5,40.5,"[{""player_id"":""sr:player:1"",""price"":2.2}]"',
    '1,2024-03-01T10:00:00Z,1.6,2.4,-4.5,41,"[{""player_id"":""sr:player:2"",""price"":3.5}]"',
  ].join('\n');

  it('requires auth header', async () => {
    const server = handlerToServer(POST);
    const res = await request(server)
      .post('/api/odds/upload')
      .attach('file', Buffer.from(csv), 'odds.csv');
    expect(res.status).toBe(401);
  });

  it('returns 400 when file missing', async () => {
    const server = handlerToServer(POST);
    const res = await request(server)
      .post('/api/odds/upload')
      .set('x-demo-admin', '1')
      .field('foo', 'bar');
    expect(res.status).toBe(400);
  });

  it('returns 400 on invalid row', async () => {
    const server = handlerToServer(POST);
    const badCsv = 'fixture_id,captured_at\n1,not-a-date';
    const res = await request(server)
      .post('/api/odds/upload')
      .set('x-demo-admin', '1')
      .attach('file', Buffer.from(badCsv), 'odds.csv');
    expect(res.status).toBe(400);
    expect(res.text).toContain('Row 2');
  });

  it('inserts and updates rows', async () => {
    const server = handlerToServer(POST);
    let res = await request(server)
      .post('/api/odds/upload')
      .set('x-demo-admin', '1')
      .attach('file', Buffer.from(csv), 'odds.csv');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ inserted: 2, updated: 0, rows: 2 });
    res = await request(server)
      .post('/api/odds/upload')
      .set('x-demo-admin', '1')
      .attach('file', Buffer.from(csv), 'odds.csv');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ inserted: 0, updated: 2, rows: 2 });
  });
});
