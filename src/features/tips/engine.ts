import { getFixtureById } from '../../lib/repos/fixtures';
import { getLineupsByFixture } from '../../lib/repos/lineups';
import { getLatestOddsSnapshot } from '../../lib/repos/odds';
import { RiskBand, Market, RISK_RULES, PRICE_RANGES, clampConfidence } from './constants';
import { createRng } from './seededRng';

export interface TipLeg {
  market: Market;
  selection: string;
  price: number;
  confidence: number;
  rationale: string;
}

export interface BuildTipsArgs {
  fixtureId: number | string;
  risk: RiskBand;
  exclude?: Market[];
  seed?: string;
}

export interface TipsResult {
  fixture_id: string;
  risk: RiskBand;
  legs: TipLeg[];
}

type Weather = {
  condition: 'clear' | 'cloudy' | 'rain' | 'windy';
  temp_c: number;
  wind_kph: number;
  rain_chance: number;
};

function mockWeather(seed: string, fixtureId: number): Weather {
  const rng = createRng(`${seed}-${fixtureId}-weather`);
  const conditions: Weather['condition'][] = ['clear', 'cloudy', 'rain', 'windy'];
  const condition = conditions[Math.floor(rng() * conditions.length)];
  return {
    condition,
    temp_c: Math.round(10 + rng() * 20),
    wind_kph: Math.round(rng() * 40),
    rain_chance: Math.round(rng() * 100),
  };
}

function randomPrice(m: Market, rng: () => number): number {
  const band = PRICE_RANGES[m];
  const p = band.min + rng() * (band.max - band.min);
  return Math.round(p * 100) / 100;
}

function playerFormScore(p: any): number {
  const tries = p.stats?.tries ?? 0;
  if (tries) return Math.min(tries / 5, 1);
  const pos = String(p.position || '').toLowerCase();
  if (pos.includes('wing')) return 0.6;
  if (pos.includes('full')) return 0.55;
  if (pos.includes('centre')) return 0.5;
  if (pos.includes('half')) return 0.45;
  return 0.3;
}

function matchupScore(): number {
  return 0.1; // simple placeholder edge advantage
}

function weatherTryAdjust(w: Weather): number {
  return w.condition === 'rain' || w.condition === 'windy' ? -0.1 : 0;
}

function weatherTotalAdjust(w: Weather, pick: 'under' | 'over'): number {
  if (w.condition === 'rain' || w.condition === 'windy') {
    return pick === 'under' ? 0.05 : -0.05;
  }
  return 0;
}

export async function buildTips({
  fixtureId,
  risk,
  exclude = [],
  seed = 'mvp',
}: BuildTipsArgs): Promise<TipsResult> {
  const id = typeof fixtureId === 'string' ? Number(fixtureId) : fixtureId;
  const rng = createRng(seed);
  const fixture = await getFixtureById(id);
  if (!fixture) {
    return { fixture_id: String(fixtureId), risk, legs: [] };
  }
  const lineups = await getLineupsByFixture(id);
  const odds = await getLatestOddsSnapshot(id); // optional, may be null
  const weather = mockWeather(seed, id);
  const confirmed = lineups.every((l) => l.confirmedAt);

  const rules = RISK_RULES[risk];
  const legs: TipLeg[] = [];

  // Match line
  if (!exclude.includes(Market.MatchLine)) {
    const line = odds?.line ?? 6.5;
    const sel = `${fixture.homeTeam.shortName ?? 'Home'} ${line >= 0 ? '-' : '+'}${Math.abs(line)}`;
    const conf = clampConfidence(0.75 + rng() * 0.05, risk);
    legs.push({
      market: Market.MatchLine,
      selection: sel,
      price: randomPrice(Market.MatchLine, rng),
      confidence: conf,
      rationale: 'Home form + travel disadvantage',
    });
  }

  // Total points
  if (!exclude.includes(Market.TotalPoints)) {
    const total = odds?.total ?? 42.5;
    const pick = weather.condition === 'rain' || weather.condition === 'windy' ? 'Under' : 'Over';
    const conf = clampConfidence(0.7 + weatherTotalAdjust(weather, pick.toLowerCase() as any), risk);
    legs.push({
      market: Market.TotalPoints,
      selection: `${pick} ${total}`,
      price: randomPrice(Market.TotalPoints, rng),
      confidence: conf,
      rationale: `${weather.condition} forecast favors ${pick.toLowerCase()}`,
    });
  }

  // Alt total for balanced/spicy
  if (risk !== RiskBand.Safe && !exclude.includes(Market.AltTotalPoints)) {
    const total = (odds?.total ?? 42.5) + (risk === RiskBand.Spicy ? 6 : 4);
    const pick = weather.condition === 'rain' || weather.condition === 'windy' ? 'Under' : 'Over';
    const conf = clampConfidence(0.62 + weatherTotalAdjust(weather, pick.toLowerCase() as any), risk);
    legs.push({
      market: Market.AltTotalPoints,
      selection: `${pick} ${total}`,
      price: randomPrice(Market.AltTotalPoints, rng),
      confidence: conf,
      rationale: `Alt total adjusted for ${weather.condition}`,
    });
  }

  // First half result
  if (!exclude.includes(Market.FirstHalfResult)) {
    const pick = rng() > 0.5 ? fixture.homeTeam.shortName ?? 'Home' : fixture.awayTeam.shortName ?? 'Away';
    const conf = clampConfidence(0.68 + rng() * 0.04, risk);
    legs.push({
      market: Market.FirstHalfResult,
      selection: `${pick} HT`,
      price: randomPrice(Market.FirstHalfResult, rng),
      confidence: conf,
      rationale: 'Momentum in opening stanza',
    });
  }

  // Any time tryscorers
  if (!exclude.includes(Market.AnytimeTryscorer)) {
    const starters = lineups.flatMap((l) => (Array.isArray(l.startersJson) ? l.startersJson : []));
    const outs = new Set(
      lineups.flatMap((l) => (Array.isArray(l.outsJson) ? l.outsJson : [])).map((p: any) => p.id),
    );
    const candidates = starters.filter((p: any) => !outs.has(p.id));
    // shuffle deterministically
    candidates.sort((a: any, b: any) => (createRng(`${seed}-${a.id}`)() - createRng(`${seed}-${b.id}`)()));
    let added = 0;
    for (const p of candidates) {
      if (added >= rules.maxTryscorers) break;
      if (!confirmed && risk !== RiskBand.Spicy) break;
      const form = playerFormScore(p);
      const base = 0.55 + form * 0.2 + matchupScore();
      const conf = clampConfidence(base + weatherTryAdjust(weather), risk);
      let price = randomPrice(Market.AnytimeTryscorer, rng);
      if (p.position && String(p.position).toLowerCase().includes('wing')) {
        price = Math.max(price - 0.5, PRICE_RANGES[Market.AnytimeTryscorer].min);
      }
      price = Math.min(price, rules.tryscorerPriceCap);
      legs.push({
        market: Market.AnytimeTryscorer,
        selection: p.name,
        price,
        confidence: conf,
        rationale: `Recent form + matchup edge`,
      });
      added += 1;
    }
  }

  // Ensure we have at least target legs by duplicating totals if needed
  if (legs.length < rules.targetLegs && !exclude.includes(Market.TotalPoints)) {
    while (legs.length < rules.targetLegs) {
      const total = (odds?.total ?? 42.5) + Math.round(rng() * 10 - 5);
      const pick = rng() > 0.5 ? 'Over' : 'Under';
      const conf = clampConfidence(0.6 + weatherTotalAdjust(weather, pick.toLowerCase() as any), risk);
      legs.push({
        market: Market.TotalPoints,
        selection: `${pick} ${total}`,
        price: randomPrice(Market.TotalPoints, rng),
        confidence: conf,
        rationale: 'Alt view on total',
      });
    }
  }

  legs.sort((a, b) => b.confidence - a.confidence);
  return { fixture_id: String(fixtureId), risk, legs };
}
