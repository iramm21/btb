export enum RiskBand {
  Safe = 'safe',
  Balanced = 'balanced',
  Spicy = 'spicy',
}

export enum Market {
  MatchLine = 'match_line',
  TotalPoints = 'total_points',
  AnytimeTryscorer = 'anytime_tryscorer',
  FirstHalfResult = 'first_half_result',
  AltTotalPoints = 'alt_total_points',
  FirstTryscorer = 'first_tryscorer',
}

export const PRICE_RANGES: Record<Market, { min: number; max: number }> = {
  [Market.MatchLine]: { min: 1.8, max: 2.1 },
  [Market.TotalPoints]: { min: 1.8, max: 2.1 },
  [Market.AnytimeTryscorer]: { min: 1.9, max: 4.5 },
  [Market.FirstHalfResult]: { min: 1.8, max: 2.5 },
  [Market.AltTotalPoints]: { min: 2.0, max: 3.0 },
  [Market.FirstTryscorer]: { min: 8.0, max: 18.0 },
};

export const CONFIDENCE_CLAMPS: Record<RiskBand, { min: number; max: number }> = {
  [RiskBand.Safe]: { min: 0.7, max: 0.92 },
  [RiskBand.Balanced]: { min: 0.6, max: 0.9 },
  [RiskBand.Spicy]: { min: 0.5, max: 0.85 },
};

export const RISK_RULES = {
  [RiskBand.Safe]: {
    targetLegs: 4,
    maxTryscorers: 1,
    tryscorerPriceCap: 2.5,
  },
  [RiskBand.Balanced]: {
    targetLegs: 6,
    maxTryscorers: 2,
    tryscorerPriceCap: 3.5,
  },
  [RiskBand.Spicy]: {
    targetLegs: 8,
    maxTryscorers: 4,
    tryscorerPriceCap: 4.5,
  },
} as const;

export function clampConfidence(value: number, risk: RiskBand): number {
  const { min, max } = CONFIDENCE_CLAMPS[risk];
  const v = Math.min(Math.max(value, min), max);
  return Math.round(v * 100) / 100;
}
