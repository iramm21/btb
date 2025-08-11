import { describe, it, expect } from 'vitest';
import { formatSlip } from '../format';
import { Market, RiskBand } from '../constants';
import type { TipLeg } from '../engine';

describe('formatSlip', () => {
  it('formats a plain text slip', () => {
    const legs: TipLeg[] = [
      {
        market: Market.AnytimeTryscorer,
        selection: 'Player A',
        price: 2.45,
        confidence: 0.78,
        rationale: 'Recent form + weak right edge',
      },
      {
        market: Market.MatchLine,
        selection: 'Home -6.5',
        price: 1.9,
        confidence: 0.74,
        rationale: 'Home form + travel disadvantage',
      },
    ];
    const text = formatSlip({ fixtureId: 123, risk: RiskBand.Balanced, legs });
    expect(text).toBe(
      [
        'NRL — Fixture: 123',
        'Risk: Balanced',
        'Legs (2):',
        '1) Anytime Tryscorer — Player A @ 2.45 (78%) — Recent form + weak right edge',
        '2) Line — Home -6.5 @ 1.90 (74%) — Home form + travel disadvantage',
      ].join('\n'),
    );
  });
});
