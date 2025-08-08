import { LineupsQuerySchema, LineupsResponseSchema } from '../../../lib/schemas/api';
import { getLineupsByFixture } from '../../../lib/repos/lineups';
import { getFixtureById } from '../../../lib/repos/fixtures';

type Lineup = {
  fixtureId: number;
  teamId: number;
  confirmedAt: Date | null;
  startersJson: unknown[] | null;
  benchJson: unknown[] | null;
  outsJson: unknown[] | null;
};

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const parse = LineupsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parse.success) {
    return new Response('Invalid fixture_id', { status: 400 });
  }
  const fixtureIdStr = parse.data.fixture_id;
  const fixtureId = Number(fixtureIdStr);
  if (!Number.isInteger(fixtureId) || fixtureId < 1) {
    return new Response('Invalid fixture_id', { status: 400 });
  }
  const fixture = await getFixtureById(fixtureId);
  if (!fixture) {
    return new Response('Fixture not found', { status: 404 });
  }
  const lineups = (await getLineupsByFixture(fixtureId)) as Lineup[];
  const homeLineup = lineups.find((l) => l.teamId === fixture.homeTeamId);
  const awayLineup = lineups.find((l) => l.teamId === fixture.awayTeamId);
  const home = {
    team_id: String(fixture.homeTeamId),
    confirmed_at: homeLineup?.confirmedAt ? homeLineup.confirmedAt.toISOString() : null,
    starters: (homeLineup?.startersJson as unknown[]) ?? [],
    bench: (homeLineup?.benchJson as unknown[]) ?? [],
    outs: (homeLineup?.outsJson as unknown[]) ?? [],
  };
  const away = {
    team_id: String(fixture.awayTeamId),
    confirmed_at: awayLineup?.confirmedAt ? awayLineup.confirmedAt.toISOString() : null,
    starters: (awayLineup?.startersJson as unknown[]) ?? [],
    bench: (awayLineup?.benchJson as unknown[]) ?? [],
    outs: (awayLineup?.outsJson as unknown[]) ?? [],
  };
  const body = LineupsResponseSchema.parse({
    fixture_id: fixtureIdStr,
    confirmed: Boolean(home.confirmed_at && away.confirmed_at),
    home,
    away,
  });
  return Response.json(body);
}
