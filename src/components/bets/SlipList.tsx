import OutcomeForm from './OutcomeForm';

interface Slip {
  id: number;
  createdAt: Date;
  fixtureId: number;
  riskBand: string | null;
  legsJson: unknown;
  outcomes: { status: string | null }[];
}

interface Props {
  slips: Slip[];
}

export default function SlipList({ slips }: Props) {
  if (!slips.length) return <p>No slips yet.</p>;

  return (
    <table className="w-full border mt-4 text-sm">
      <thead>
        <tr>
          <th className="border p-1">Created</th>
          <th className="border p-1">Fixture</th>
          <th className="border p-1">Risk</th>
          <th className="border p-1">Legs</th>
          <th className="border p-1">Status</th>
          <th className="border p-1">Result</th>
        </tr>
      </thead>
      <tbody>
        {slips.map((s) => {
          const outcome = s.outcomes[0];
          const status = outcome?.status ?? 'pending';
          const legCount = Array.isArray(s.legsJson) ? s.legsJson.length : 0;
          return (
            <tr key={s.id}>
              <td className="border p-1">{new Date(s.createdAt).toLocaleDateString()}</td>
              <td className="border p-1">{s.fixtureId}</td>
              <td className="border p-1">{s.riskBand}</td>
              <td className="border p-1">{legCount}</td>
              <td className="border p-1">{status}</td>
              <td className="border p-1">
                {!outcome || status === 'pending' ? <OutcomeForm betSlipId={s.id} /> : null}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
