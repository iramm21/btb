import { updateOutcomeAction } from '../../app/my-bets/actions';

interface Props {
  betSlipId: number;
}

export default function OutcomeForm({ betSlipId }: Props) {
  return (
    <form action={updateOutcomeAction} className="flex gap-2">
      <input type="hidden" name="bet_slip_id" value={betSlipId} />
      <input
        type="number"
        name="stake"
        step="0.01"
        placeholder="Stake"
        className="border p-1 w-20"
        required
      />
      <input
        type="number"
        name="returned"
        step="0.01"
        placeholder="Returned"
        className="border p-1 w-20"
        required
      />
      <select name="status" className="border p-1" defaultValue="won">
        <option value="won">won</option>
        <option value="lost">lost</option>
        <option value="pending">pending</option>
      </select>
      <button type="submit" className="px-2 py-1 border rounded">
        Save
      </button>
    </form>
  );
}
