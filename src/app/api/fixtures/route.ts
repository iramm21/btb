import { FixturesQuerySchema, FixturesResponseSchema } from '../../../lib/schemas/api';
import { getFixturesByRound } from '../../../lib/repos/fixtures';

type FixtureWithTeams = {
  id: number;
  season: number | null;
  round: number | null;
  kickoffUtc: Date;
  homeTeam: { id: number; name: string; shortName: string };
  awayTeam: { id: number; name: string; shortName: string };
  venue: string | null;
  status: string | null;
};

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const parse = FixturesQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parse.success) {
    return new Response('Invalid round', { status: 400 });
  }
  const { round } = parse.data;
  const fixtures = (await getFixturesByRound(round)) as FixtureWithTeams[];
  const body = FixturesResponseSchema.parse({
    fixtures: fixtures.map((f) => ({
      id: String(f.id),
      season: f.season != null ? String(f.season) : null,
      round: f.round ?? round,
      kickoff_utc: f.kickoffUtc.toISOString(),
      home_team: {
        id: String(f.homeTeam.id),
        name: f.homeTeam.name,
        short_name: f.homeTeam.shortName,
      },
      away_team: {
        id: String(f.awayTeam.id),
        name: f.awayTeam.name,
        short_name: f.awayTeam.shortName,
      },
      venue: f.venue ?? null,
      status: (f.status as 'scheduled' | 'live' | 'finished' | null) ?? null,
    })),
  });
  return Response.json(body);
}
