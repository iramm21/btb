import Badge from '../ui/Badge';
import type { LineupsResponse } from '../../lib/schemas/api';

export default function LineupsWidget({ data, error }: { data: LineupsResponse | null; error?: string | null }) {
  if (error) return <p>{error}</p>;
  if (!data) return <p>No lineups yet.</p>;
  const confirmed = data.confirmed;
  const renderNames = (names: unknown[]) =>
    names.map((n, i) => <li key={i}>{typeof n === 'string' ? n : (n as any)?.name ?? 'TBD'}</li>);
  return (
    <div>
      <div className="mb-2">
        <Badge variant={confirmed ? 'success' : 'neutral'}>
          {confirmed ? 'CONFIRMED' : 'UNCONFIRMED'}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-medium mb-1">Home</h4>
          <ul className="list-disc pl-4">{renderNames(data.home.starters)}</ul>
        </div>
        <div>
          <h4 className="font-medium mb-1">Away</h4>
          <ul className="list-disc pl-4">{renderNames(data.away.starters)}</ul>
        </div>
      </div>
    </div>
  );
}
