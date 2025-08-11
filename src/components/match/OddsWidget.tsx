interface OddsSnapshot {
  capturedAt: Date;
  homeWin?: number | null;
  awayWin?: number | null;
  line?: number | null;
  total?: number | null;
}

export default function OddsWidget({ odds, error }: { odds: OddsSnapshot | null; error?: string | null }) {
  if (error) return <p>{error}</p>;
  if (!odds) return <p>No odds available.</p>;
  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">
        As of {odds.capturedAt.toISOString()}
      </p>
      <div className="flex flex-wrap gap-2">
        {odds.homeWin != null && <span className="px-2 py-1 border rounded">Home {odds.homeWin}</span>}
        {odds.awayWin != null && <span className="px-2 py-1 border rounded">Away {odds.awayWin}</span>}
        {odds.line != null && <span className="px-2 py-1 border rounded">Line {odds.line}</span>}
        {odds.total != null && <span className="px-2 py-1 border rounded">Total {odds.total}</span>}
      </div>
    </div>
  );
}
