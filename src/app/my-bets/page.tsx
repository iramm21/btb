import { redirect } from 'next/navigation';
import { getSession } from '../../lib/auth/session';
import { listBetSlipsByUser, getRoiSummary } from '../../lib/repos/bets';
import RoiCard from '../../components/bets/RoiCard';
import SlipList from '../../components/bets/SlipList';

export default async function MyBetsPage() {
  const { userId } = await getSession();
  if (!userId) {
    redirect('/login');
  }
  const slips = await listBetSlipsByUser(userId);
  const summary = await getRoiSummary(userId);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">My Bets</h2>
      <RoiCard summary={summary} />
      <SlipList slips={slips} />
    </div>
  );
}
