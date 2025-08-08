/* eslint-disable @typescript-eslint/no-explicit-any */
import { execSync } from 'node:child_process';
import type { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';

vi.mock('@prisma/client', () => {
  const db = {
    teams: [] as any[],
    fixtures: [] as any[],
    lineups: [] as any[],
    oddsSnapshots: [] as any[],
    ingestRuns: [] as any[],
  };
  let oddsId = 1;
  let ingestId = 1;
  class PrismaClient {
    team = {
      upsert: async ({ where, create, update }: any) => {
        const existing = db.teams.find((t) => t.id === where.id);
        if (existing) {
          Object.assign(existing, update);
          return existing;
        }
        db.teams.push(create);
        return create;
      },
    };
    fixture = {
      upsert: async ({ where, create, update }: any) => {
        const existing = db.fixtures.find((f) => f.id === where.id);
        if (existing) {
          Object.assign(existing, update);
          return existing;
        }
        db.fixtures.push(create);
        return create;
      },
      findMany: async ({ where, include }: any) => {
        let res = db.fixtures.filter((f) => f.round === where.round);
        res = res.sort((a, b) => new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime());
        if (include?.homeTeam || include?.awayTeam) {
          res = res.map((f) => ({
            ...f,
            homeTeam: db.teams.find((t) => t.id === f.homeTeamId),
            awayTeam: db.teams.find((t) => t.id === f.awayTeamId),
          }));
        }
        return res;
      },
      findUnique: async ({ where, include }: any) => {
        const f = db.fixtures.find((fi) => fi.id === where.id);
        if (!f) return null;
        if (include?.homeTeam || include?.awayTeam) {
          return {
            ...f,
            homeTeam: db.teams.find((t) => t.id === f.homeTeamId),
            awayTeam: db.teams.find((t) => t.id === f.awayTeamId),
          };
        }
        return f;
      },
    };
    lineup = {
      findMany: async ({ where, include }: any) => {
        let res = db.lineups.filter((l) => l.fixtureId === where.fixtureId);
        if (include?.team) {
          res = res.map((l) => ({ ...l, team: db.teams.find((t) => t.id === l.teamId) }));
        }
        return res;
      },
    };
    oddsSnapshot = {
      findFirst: async ({ where }: any) => {
        const res = db.oddsSnapshots
          .filter((o) => o.fixtureId === where.fixtureId)
          .sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
        return res[0] ?? null;
      },
      update: async ({ where, data }: any) => {
        const o = db.oddsSnapshots.find((os) => os.id === where.id);
        if (!o) return null;
        Object.assign(o, data);
        return o;
      },
      create: async ({ data }: any) => {
        const obj = { ...data, id: oddsId++ };
        db.oddsSnapshots.push(obj);
        return obj;
      },
    };
    ingestRun = {
      create: async ({ data }: any) => {
        const run = { id: ingestId++, startedAt: new Date(), ...data };
        db.ingestRuns.push(run);
        return run;
      },
      findMany: async ({ take }: any) => {
        return db.ingestRuns
          .slice()
          .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
          .slice(0, take);
      },
    };
    $disconnect = async () => {};
  }
  return { PrismaClient };
});

const dbUrl = 'file:./test.db';
let prisma: PrismaClient;
let getFixturesByRound: (round: number) => Promise<unknown[]>;
let seedTeams: () => Promise<void>;
let seedFixtures: () => Promise<void>;

type FixtureWithTeams = {
  homeTeam: { name: string };
  awayTeam: { name: string };
};

beforeAll(async () => {
  process.env.DATABASE_URL = dbUrl;
  try {
    execSync('npx prisma db push', { env: { ...process.env, DATABASE_URL: dbUrl } });
  } catch {
    // ignore
  }
  ({ prisma } = await import('../src/lib/db'));
  ({ seedTeams } = await import('../scripts/seed/teams'));
  ({ seedFixtures } = await import('../scripts/seed/fixtures'));
  ({ getFixturesByRound } = await import('../src/lib/repos/fixtures'));
  await seedTeams();
  await seedFixtures();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('fixtures repo', () => {
  it('returns fixtures by round with team names', async () => {
    const fixtures = (await getFixturesByRound(1)) as FixtureWithTeams[];
    expect(fixtures.length).toBeGreaterThan(0);
    expect(fixtures[0].homeTeam.name).toBe('Brisbane Broncos');
    expect(fixtures[0].awayTeam.name).toBe('Melbourne Storm');
  });
});
