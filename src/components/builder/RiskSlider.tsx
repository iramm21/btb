'use client';

import { RiskBand } from '../../features/tips/constants';

interface Props {
  value: RiskBand;
  onChange: (r: RiskBand) => void;
}

const risks: RiskBand[] = [RiskBand.Safe, RiskBand.Balanced, RiskBand.Spicy];

export default function RiskSlider({ value, onChange }: Props) {
  const index = risks.indexOf(value);
  return (
    <div>
      <input
        type="range"
        min={0}
        max={2}
        step={1}
        value={index}
        onChange={(e) => onChange(risks[Number(e.target.value)] as RiskBand)}
        className="w-full"
      />
      <div className="flex justify-between text-xs mt-1">
        <span>Safe</span>
        <span>Balanced</span>
        <span>Spicy</span>
      </div>
    </div>
  );
}
