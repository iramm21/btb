import { z } from 'zod';

export const LegSchema = z.object({
  market: z.string(),
  selection: z.string(),
  price: z.number().optional(),
  confidence: z.number(),
  rationale: z.string(),
});

export const BetSlipInputSchema = z.object({
  fixtureId: z.string(),
  risk_band: z.enum(['safe', 'balanced', 'spicy']),
  legs: z.array(LegSchema),
  note: z.string().optional(),
});

export const OutcomeInputSchema = z.object({
  bet_slip_id: z.string(),
  stake: z.coerce.number(),
  returned: z.coerce.number(),
  status: z.enum(['won', 'lost', 'pending']),
});

export type Leg = z.infer<typeof LegSchema>;
export type BetSlipInput = z.infer<typeof BetSlipInputSchema>;
export type OutcomeInput = z.infer<typeof OutcomeInputSchema>;
