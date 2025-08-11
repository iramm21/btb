import Link from 'next/link';
import OddsWidget from '../../../components/match/OddsWidget';
import LineupsWidget from '../../../components/match/LineupsWidget';
import WeatherWidget from '../../../components/match/WeatherWidget';
import { getFixtureById } from '../../../lib/repos/fixtures';
import { getLatestOddsSnapshot } from '../../../lib/repos/odds';
import type { LineupsResponse, WeatherResponse } from '../../../lib/schemas/api';

export default async function MatchPage({
  params,
}: {
  params: Promise<{ fixtureId: string }>;
}) {
  const { fixtureId: fixtureIdStr } = await params;
  const fixtureId = Number(fixtureIdStr);
  const fixture = await getFixtureById(fixtureId);
  if (!fixture) return <div>Fixture not found.</div>;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  let lineups: LineupsResponse | null = null;
  let lineupsError: string | null = null;
  let weather: WeatherResponse | null = null;
  let weatherError: string | null = null;
  let odds: Awaited<ReturnType<typeof getLatestOddsSnapshot>> | null = null;
  let oddsError: string | null = null;

  try {
    const res = await fetch(`${baseUrl}/api/lineups?fixture_id=${fixtureId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('fail');
    lineups = (await res.json()) as LineupsResponse;
  } catch {
    lineupsError = 'Unable to load lineups.';
  }

  try {
    const res = await fetch(`${baseUrl}/api/weather?fixture_id=${fixtureId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('fail');
    weather = (await res.json()) as WeatherResponse;
  } catch {
    weatherError = 'Unable to load weather.';
  }

  try {
    odds = await getLatestOddsSnapshot(fixtureId);
  } catch {
    oddsError = 'Unable to load odds.';
  }

  const insights: string[] = [];
  if (odds && odds.homeWin != null && odds.awayWin != null) {
    insights.push(odds.homeWin < odds.awayWin ? 'Home favourite' : 'Away favourite');
  }
  if (weather && weather.forecast.rain_chance > 50) insights.push('Rain likely');
  if (weather && weather.forecast.wind_kph > 25) insights.push('Windy');
  if (insights.length < 2) insights.push('Standard prep');
  if (insights.length < 2) insights.push('No major factors');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">
          {fixture.homeTeam.shortName} vs {fixture.awayTeam.shortName}
        </h2>
        <p className="text-sm text-gray-600">
          {new Date(fixture.kickoffUtc).toLocaleString()} · {fixture.venue || 'TBD'}
        </p>
      </div>

      <section>
        <h3 className="font-medium mb-2">Odds snapshot</h3>
        <OddsWidget odds={odds} error={oddsError} />
      </section>

      <section>
        <h3 className="font-medium mb-2">Lineups</h3>
        <LineupsWidget data={lineups} error={lineupsError} />
      </section>

      <section>
        <h3 className="font-medium mb-2">Weather</h3>
        <WeatherWidget data={weather} error={weatherError} />
      </section>

      <section>
        <h3 className="font-medium mb-2">Quick insights</h3>
        {insights.length ? (
          <div className="flex flex-wrap gap-2">
            {insights.map((i) => (
              <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {i}
              </span>
            ))}
          </div>
        ) : (
          <p>No insights.</p>
        )}
      </section>

      <div>
        <Link
          href={`/builder/${fixtureId}`}
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Build My Bet
        </Link>
      </div>
    </div>
  );
}
