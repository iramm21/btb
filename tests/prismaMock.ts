/* eslint-disable @typescript-eslint/no-explicit-any */
export const db = {
  teams: [] as any[],
  fixtures: [] as any[],
  lineups: [] as any[],
  oddsSnapshots: [] as any[],
  ingestRuns: [] as any[],
};

let oddsId = 1;
let ingestId = 1;

export class PrismaClient {
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
  $disconnect = async () => {};
}
