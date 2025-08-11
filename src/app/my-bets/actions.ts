'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '../../lib/auth/session';
import { createBetSlip, updateBetOutcome } from '../../lib/repos/bets';
import {
  BetSlipInputSchema,
  OutcomeInputSchema,
} from '../../lib/schemas/bets';

export async function saveSlipAction(formData: FormData) {
  const { userId } = await getSession();
  if (!userId) return;
  const values = BetSlipInputSchema.parse({
    fixtureId: formData.get('fixtureId'),
    risk_band: formData.get('risk_band'),
    legs: JSON.parse(formData.get('legs')?.toString() || '[]'),
    note: formData.get('note')?.toString(),
  });
  await createBetSlip({
    userId,
    fixtureId: Number(values.fixtureId),
    risk_band: values.risk_band,
    legs_json: values.legs,
    note: values.note,
  });
}

export async function updateOutcomeAction(formData: FormData) {
  const { userId } = await getSession();
  if (!userId) return;
  const values = OutcomeInputSchema.parse({
    bet_slip_id: formData.get('bet_slip_id'),
    stake: formData.get('stake'),
    returned: formData.get('returned'),
    status: formData.get('status'),
  });
  await updateBetOutcome({
    bet_slip_id: Number(values.bet_slip_id),
    stake: values.stake,
    returned: values.returned,
    status: values.status,
  });
  revalidatePath('/my-bets');
}
