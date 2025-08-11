interface Props {
  summary: {
    totalBets: number;
    settledBets: number;
    stakeSum: number;
    returnSum: number;
    roiPct: number;
  };
}

export default function RoiCard({ summary }: Props) {
  const { totalBets, settledBets, stakeSum, returnSum, roiPct } = summary;
  return (
    <div className="border p-4 rounded">
      <h3 className="font-bold mb-2">ROI summary</h3>
      <p>Total bets: {totalBets}</p>
      <p>Settled bets: {settledBets}</p>
      <p>Stake: {stakeSum.toFixed(2)}</p>
      <p>Return: {returnSum.toFixed(2)}</p>
      <p>ROI: {(roiPct * 100).toFixed(2)}%</p>
    </div>
  );
}
