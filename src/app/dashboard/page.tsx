import FixtureList from '../../components/fixtures/FixtureList';
import type { FixturesResponse } from '../../lib/schemas/api';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ round?: string }>;
}) {
  const params = await searchParams;
  const round = Number(params.round ?? 1);
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/fixtures?round=${round}`;
  let fixtures: FixturesResponse['fixtures'] = [];
  let error: string | null = null;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed');
    const data: FixturesResponse = await res.json();
    fixtures = data.fixtures;
  } catch {
    error = 'Failed to load fixtures.';
  }
  return (
    <div className="space-y-4">
      <form>
        <label htmlFor="round" className="mr-2">
          Round:
        </label>
        <select id="round" name="round" defaultValue={round} className="border p-1">
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button type="submit" className="ml-2 px-2 py-1 border rounded">
          Go
        </button>
      </form>
      {error ? <p>{error}</p> : <FixtureList fixtures={fixtures} />}
    </div>
  );
}
