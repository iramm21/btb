import Link from 'next/link';
import Badge from '../ui/Badge';
import { FixturesResponse } from '../../lib/schemas/api';

export type Fixture = FixturesResponse['fixtures'][number];

export default function FixtureCard({ fixture }: { fixture: Fixture }) {
  const kickoff = new Date(fixture.kickoff_utc).toLocaleString();
  return (
    <Link
      href={`/match/${fixture.id}`}
      className="block border rounded p-4 hover:bg-gray-50"
    >
      <div className="font-medium">
        {fixture.home_team.short_name} vs {fixture.away_team.short_name}
      </div>
      <div className="text-sm text-gray-600">{kickoff}</div>
      <div className="text-sm text-gray-600">{fixture.venue || 'TBD'}</div>
      {fixture.status && (
        <div className="mt-2">
          <Badge variant={fixture.status === 'scheduled' ? 'neutral' : 'success'}>
            {fixture.status.toUpperCase()}
          </Badge>
        </div>
      )}
    </Link>
  );
}
