import { WeatherQuerySchema, WeatherResponseSchema } from '../../../lib/schemas/api';
import { getFixtureById } from '../../../lib/repos/fixtures';

function mockForecast() {
  const conditions = ['clear', 'cloudy', 'rain', 'windy'] as const;
  return {
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    temp_c: Math.round(10 + Math.random() * 20),
    wind_kph: Math.round(Math.random() * 40),
    rain_chance: Math.round(Math.random() * 100),
  };
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const parse = WeatherQuerySchema.safeParse(Object.fromEntries(url.searchParams));
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
  const body = WeatherResponseSchema.parse({
    fixture_id: fixtureIdStr,
    venue: fixture.venue ?? null,
    kickoff_utc: fixture.kickoffUtc.toISOString(),
    forecast: mockForecast(),
    source: 'mock' as const,
  });
  return Response.json(body);
}
