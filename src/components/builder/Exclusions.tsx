'use client';

import { Market } from '../../features/tips/constants';
import { MARKET_LABELS } from '../../features/tips/format';

const ALL_MARKETS: Market[] = [
  Market.AnytimeTryscorer,
  Market.FirstHalfResult,
  Market.MatchLine,
  Market.TotalPoints,
  Market.AltTotalPoints,
  Market.FirstTryscorer,
];

interface Props {
  selected: Set<Market>;
  onChange: (s: Set<Market>) => void;
}

export default function Exclusions({ selected, onChange }: Props) {
  const toggle = (m: Market) => {
    const next = new Set(selected);
    if (next.has(m)) next.delete(m);
    else next.add(m);
    onChange(next);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_MARKETS.map((m) => (
        <label
          key={m}
          className={`px-2 py-1 border rounded text-sm cursor-pointer ${
            selected.has(m) ? 'bg-gray-200' : ''
          }`}
        >
          <input
            type="checkbox"
            className="hidden"
            checked={selected.has(m)}
            onChange={() => toggle(m)}
          />
          {MARKET_LABELS[m]}
        </label>
      ))}
    </div>
  );
}
