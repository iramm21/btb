'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import RiskSlider from '../../../components/builder/RiskSlider';
import Exclusions from '../../../components/builder/Exclusions';
import LegCard from '../../../components/builder/LegCard';
import { Market, RiskBand } from '../../../features/tips/constants';
import type { TipLeg } from '../../../features/tips/engine';
import { formatSlip, copyToClipboard } from '../../../features/tips/format';
import type { TipsResponse } from '../../../lib/schemas/api';
import { saveSlipAction } from '../../my-bets/actions';
import { logEvent } from '../../../lib/clientAnalytics';
import Link from 'next/link';

interface Props {
  fixtureId: string;
}

export default function BetBuilderClient({ fixtureId }: Props) {
  const [risk, setRisk] = useState<RiskBand>(RiskBand.Balanced);
  const [exclusions, setExclusions] = useState<Set<Market>>(new Set());
  const [legs, setLegs] = useState<TipLeg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadTips = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      fixture_id: fixtureId,
      risk,
    });
    if (exclusions.size) {
      params.set('exclude', Array.from(exclusions).join(','));
    }
    try {
      const res = await fetch(`/api/tips?${params.toString()}`);
      if (!res.ok) throw new Error('fail');
      const data: TipsResponse = await res.json();
      const typed = data.legs.map((l) => ({ ...l, market: l.market as Market })) as TipLeg[];
      setLegs(typed);
    } catch {
      setError('Unable to load suggestions.');
    } finally {
      setLoading(false);
    }
  }, [fixtureId, risk, exclusions]);

  useEffect(() => {
    loadTips();
  }, [loadTips]);

  useEffect(() => {
    logEvent('builder_open', { fixtureId, risk });
  }, [fixtureId]);

  const handleCopy = async () => {
    const text = formatSlip({ fixtureId, risk, legs });
    const ok = await copyToClipboard(text);
    setCopied(ok);
    if (ok) logEvent('copy_slip', { fixtureId, risk, legsCount: legs.length });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append('fixtureId', fixtureId);
    formData.append('risk_band', risk);
    formData.append('legs', JSON.stringify(legs));
    startTransition(async () => {
      try {
        await saveSlipAction(formData);
        setSaved(true);
        logEvent('save_slip', { fixtureId, risk, legsCount: legs.length });
      } catch {
        setError('Unable to save slip.');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-2">Bet Builder</h2>
        <RiskSlider value={risk} onChange={setRisk} />
      </div>

      <section>
        <h3 className="font-medium mb-2">Exclude markets</h3>
        <Exclusions selected={exclusions} onChange={setExclusions} />
      </section>

      <section>
        <h3 className="font-medium mb-2">Suggestions</h3>
        {loading && <p>Loading...</p>}
        {error && (
          <div>
            <p>{error}</p>
            <button className="mt-2 px-2 py-1 border rounded" onClick={loadTips}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && (
          <div className="space-y-2">
            {legs.map((leg, i) => (
              <LegCard key={i} leg={leg} />
            ))}
          </div>
        )}
      </section>

      <div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleCopy}
          disabled={!legs.length}
        >
          Copy Slip
        </button>
        {copied && <span className="ml-2 text-sm">Copied!</span>}
        <button
          className="ml-2 px-4 py-2 border rounded"
          onClick={handleSave}
          disabled={!legs.length || isPending}
        >
          Save Slip
        </button>
        {saved && (
          <span className="ml-2 text-sm">
            Saved! <Link href="/my-bets" className="underline">My Bets</Link>
          </span>
        )}
      </div>
    </div>
  );
}
