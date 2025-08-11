import { RiskBand, Market } from './constants';
import type { TipLeg } from './engine';

export const MARKET_LABELS: Record<Market, string> = {
  [Market.MatchLine]: 'Line',
  [Market.TotalPoints]: 'Total Points',
  [Market.AnytimeTryscorer]: 'Anytime Tryscorer',
  [Market.FirstHalfResult]: 'First Half Result',
  [Market.AltTotalPoints]: 'Alt Total',
  [Market.FirstTryscorer]: 'First Tryscorer',
};

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface FormatArgs {
  fixtureId: string | number;
  risk: RiskBand;
  legs: TipLeg[];
}

export function formatSlip({ fixtureId, risk, legs }: FormatArgs): string {
  const lines = [
    `NRL — Fixture: ${fixtureId}`,
    `Risk: ${cap(risk)}`,
    `Legs (${legs.length}):`,
  ];
  legs.forEach((leg, i) => {
    const price = leg.price != null ? ` @ ${leg.price.toFixed(2)}` : '';
    const conf = ` (${Math.round(leg.confidence * 100)}%)`;
    lines.push(
      `${i + 1}) ${MARKET_LABELS[leg.market]} — ${leg.selection}${price}${conf} — ${leg.rationale}`,
    );
  });
  return lines.join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // ignore
  }
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.focus();
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  } catch {
    return false;
  }
}
