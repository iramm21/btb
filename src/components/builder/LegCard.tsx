'use client';

import Badge from '../ui/Badge';
import { MARKET_LABELS } from '../../features/tips/format';
import type { TipLeg } from '../../features/tips/engine';

export default function LegCard({ leg }: { leg: TipLeg }) {
  const pct = Math.round(leg.confidence * 100);
  return (
    <div className="border rounded p-3 space-y-2">
      <div className="flex items-center justify-between">
        <Badge>{MARKET_LABELS[leg.market]}</Badge>
        {leg.price != null && <span className="text-sm">@ {leg.price.toFixed(2)}</span>}
      </div>
      <div className="font-medium">{leg.selection}</div>
      <div className="h-2 bg-gray-200 rounded">
        <div className="h-2 bg-blue-500 rounded" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-gray-600">{pct}%</div>
      <div>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{leg.rationale}</span>
      </div>
    </div>
  );
}
