'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function RGBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="bg-[var(--color-warning)] text-black px-4 py-2 text-sm flex justify-between" role="region" aria-label="responsible gambling">
      <span>
        18+ only. Information only, no guarantees. Gamble responsibly.{` `}
        <Link href="/legal/responsible-gambling" className="underline">
          Learn more
        </Link>
        .
      </span>
      <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="ml-4">✕</button>
    </div>
  );
}
