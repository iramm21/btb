import { describe, it, expect, vi } from 'vitest';
import { buildTips } from '../engine';
import { Market, RiskBand, CONFIDENCE_CLAMPS } from '../constants';

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

describe('tip engine', () => {
  it('is deterministic given seed', async () => {
    const a = await buildTips({ fixtureId: 1, risk: RiskBand.Balanced, seed: 'unit' });
    const b = await buildTips({ fixtureId: 1, risk: RiskBand.Balanced, seed: 'unit' });
    expect(a).toEqual(b);
  });

  it('weather rain reduces tryscorer confidence and boosts unders', async () => {
    const dry = await buildTips({ fixtureId: 1, risk: RiskBand.Balanced, seed: 'clear' });
    const wet = await buildTips({ fixtureId: 1, risk: RiskBand.Balanced, seed: 'rain' });
    const dryTry = dry.legs.find((l) => l.market === Market.AnytimeTryscorer)!;
    const wetTry = wet.legs.find((l) => l.market === Market.AnytimeTryscorer)!;
    expect(wetTry.confidence).toBeLessThan(dryTry.confidence);
    const wetTotal = wet.legs.find((l) => l.market === Market.TotalPoints)!;
    expect(wetTotal.selection.startsWith('Under')).toBe(true);
  });

  it('respects exclude parameter', async () => {
    const res = await buildTips({
      fixtureId: 1,
      risk: RiskBand.Balanced,
      seed: 'unit',
      exclude: [Market.AnytimeTryscorer],
    });
    expect(res.legs.some((l) => l.market === Market.AnytimeTryscorer)).toBe(false);
  });

  it('clamps confidence per risk band', async () => {
    for (const risk of [RiskBand.Safe, RiskBand.Balanced, RiskBand.Spicy] as const) {
      const res = await buildTips({ fixtureId: 1, risk, seed: 'bounds' });
      const { min, max } = CONFIDENCE_CLAMPS[risk];
      res.legs.forEach((l) => {
        expect(l.confidence).toBeGreaterThanOrEqual(min);
        expect(l.confidence).toBeLessThanOrEqual(max);
      });
    }
  });
});
