import { z } from 'zod';

// Query schemas
export const FixturesQuerySchema = z.object({
  round: z.coerce.number().int().min(1),
});

export const LineupsQuerySchema = z.object({
  fixture_id: z.string().min(1),
});

export const WeatherQuerySchema = z.object({
  fixture_id: z.string().min(1),
});

// Response schemas
export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  short_name: z.string(),
});

export const FixtureSchema = z.object({
  id: z.string(),
  season: z.string().nullable(),
  round: z.number(),
  kickoff_utc: z.string(),
  home_team: TeamSchema,
  away_team: TeamSchema,
  venue: z.string().nullable(),
  status: z.enum(['scheduled', 'live', 'finished']).nullable(),
});

export const FixturesResponseSchema = z.object({
  fixtures: z.array(FixtureSchema),
});

export const LineupTeamSchema = z.object({
  team_id: z.string(),
  confirmed_at: z.string().nullable(),
  starters: z.array(z.unknown()),
  bench: z.array(z.unknown()),
  outs: z.array(z.unknown()),
});

export const LineupsResponseSchema = z.object({
  fixture_id: z.string(),
  confirmed: z.boolean(),
  home: LineupTeamSchema,
  away: LineupTeamSchema,
});

export const WeatherResponseSchema = z.object({
  fixture_id: z.string(),
  venue: z.string().nullable(),
  kickoff_utc: z.string(),
  forecast: z.object({
    condition: z.enum(['clear', 'cloudy', 'rain', 'windy']),
    temp_c: z.number(),
    wind_kph: z.number(),
    rain_chance: z.number().min(0).max(100),
  }),
  source: z.literal('mock'),
});

export type FixturesResponse = z.infer<typeof FixturesResponseSchema>;
export type LineupsResponse = z.infer<typeof LineupsResponseSchema>;
export type WeatherResponse = z.infer<typeof WeatherResponseSchema>;
