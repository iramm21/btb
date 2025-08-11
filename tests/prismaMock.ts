/* eslint-disable @typescript-eslint/no-explicit-any */
export const db = {
  teams: [] as any[],
  fixtures: [] as any[],
  lineups: [] as any[],
  oddsSnapshots: [] as any[],
  ingestRuns: [] as any[],
  featureFlags: [] as any[],
  users: [] as any[],
  profiles: [] as any[],
  betSlips: [] as any[],
  betOutcomes: [] as any[],
  events: [] as any[],
};

let oddsId = 1;
let ingestId = 1;

export class PrismaClient {
  user = {
    upsert: async ({ where, create }: any) => {
      const existing = db.users.find((u) => u.id === where.id);
      if (existing) return existing;
      db.users.push(create);
      return create;
    },
  };
  profile = {
    findUnique: async ({ where, include }: any) => {
      const p = db.profiles.find((pr) => pr.id === where.id);
      if (!p) return null;
      if (include?.favTeam) {
        return { ...p, favTeam: db.teams.find((t) => t.id === p.favTeamId) };
      }
      return p;
    },
    upsert: async ({ where, create, update, include }: any) => {
      let p = db.profiles.find((pr) => pr.id === where.id);
      if (p) {
        Object.assign(p, update);
      } else {
        p = create;
        db.profiles.push(p);
      }
      if (include?.favTeam) {
        return { ...p, favTeam: db.teams.find((t) => t.id === p.favTeamId) };
      }
      return p;
    },
  };
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
    upsert: async ({ where, create, update }: any) => {
      const { fixtureId, teamId } = where.fixtureId_teamId;
      const existing = db.lineups.find((l) => l.fixtureId === fixtureId && l.teamId === teamId);
      if (existing) {
        Object.assign(existing, update);
        return existing;
      }
      db.lineups.push(create);
      return create;
    },
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
      let res = db.oddsSnapshots.filter((o) => o.fixtureId === where.fixtureId);
      if (where.capturedAt) {
        const t = new Date(where.capturedAt).getTime();
        res = res.filter((o) => new Date(o.capturedAt).getTime() === t);
      }
      res = res.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
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
  featureFlag = {
    findMany: async () => db.featureFlags.slice(),
    upsert: async ({ where, update, create }: any) => {
      let f = db.featureFlags.find((fl) => fl.key === where.key);
      if (f) {
        Object.assign(f, update);
      } else {
        f = { id: db.featureFlags.length + 1, ...create };
        db.featureFlags.push(f);
      }
      return f;
    },
  };
  betSlip = {
    create: async ({ data }: any) => {
      const obj = { id: db.betSlips.length + 1, createdAt: new Date(), ...data };
      db.betSlips.push(obj);
      return obj;
    },
    findMany: async ({ where, include, orderBy, take }: any) => {
      let res = db.betSlips.filter((s) => s.userId === where.userId);
      if (orderBy?.createdAt === 'desc') {
        res = res.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      if (take) res = res.slice(0, take);
      return res.map((s) => {
        const slip: any = { ...s };
        if (include?.outcomes) {
          slip.outcomes = db.betOutcomes.filter((o) => o.betSlipId === s.id);
        }
        if (include?.fixture) {
          const f = db.fixtures.find((f) => f.id === s.fixtureId);
          if (f) {
            const fixture: any = { ...f };
            if (include.fixture.include?.homeTeam) {
              fixture.homeTeam = db.teams.find((t) => t.id === f.homeTeamId);
            }
            if (include.fixture.include?.awayTeam) {
              fixture.awayTeam = db.teams.find((t) => t.id === f.awayTeamId);
            }
            slip.fixture = fixture;
          }
        }
        return slip;
      });
    },
  };
  betOutcome = {
    findFirst: async ({ where }: any) => {
      return db.betOutcomes.find((o) => o.betSlipId === where.betSlipId) ?? null;
    },
    create: async ({ data }: any) => {
      const obj = { id: db.betOutcomes.length + 1, ...data };
      db.betOutcomes.push(obj);
      return obj;
    },
    update: async ({ where, data }: any) => {
      const o = db.betOutcomes.find((oc) => oc.id === where.id);
      if (!o) return null;
      Object.assign(o, data);
      return o;
    },
  };
  event = {
    create: async ({ data }: any) => {
      const obj = { id: String(db.events.length + 1), createdAt: new Date(), ...data };
      db.events.push(obj);
      return obj;
    },
    findMany: async ({ where, orderBy, take }: any) => {
      let res = db.events.slice();
      if (where?.userId) {
        res = res.filter((e) => e.userId === where.userId);
      }
      if (orderBy?.createdAt === 'desc') {
        res = res.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      if (take) res = res.slice(0, take);
      return res;
    },
  };
  $disconnect = async () => {};
}
