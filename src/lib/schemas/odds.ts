import { z } from 'zod';

const AnytimeTryscorerSchema = z.array(
  z.object({ player_id: z.string(), price: z.number() })
);

/**
 * Parses the anytime_tryscorer_json field into a typed array.
 */
export function parseAnytimeTryscorerJson(
  value: string | undefined,
  ctx?: z.RefinementCtx
) {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    return AnytimeTryscorerSchema.parse(parsed);
  } catch {
    if (ctx) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid anytime_tryscorer_json',
      });
      return z.NEVER;
    }
    throw new Error('Invalid anytime_tryscorer_json');
  }
}

export const zOddsRow = z
  .object({
    fixture_id: z.string().min(1),
    captured_at: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid captured_at')
      .transform((v) => new Date(v)),
    home_win: z.coerce.number().optional(),
    away_win: z.coerce.number().optional(),
    line: z.coerce.number().optional(),
    total: z.coerce.number().optional(),
    anytime_tryscorer_json: z
      .string()
      .optional()
      .transform((v, ctx) => parseAnytimeTryscorerJson(v, ctx)),
  })
  .passthrough()
  .transform((row) => ({
    fixtureId: parseInt(row.fixture_id, 10),
    capturedAt: row.captured_at,
    homeWin: row.home_win,
    awayWin: row.away_win,
    line: row.line,
    total: row.total,
    anytimeTryscorerJson: row.anytime_tryscorer_json,
  }));

export type OddsRow = z.infer<typeof zOddsRow>;
