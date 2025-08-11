import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSession } from '../../lib/auth/session';
import { getProfile, upsertProfile } from '../../lib/repos/profiles';
import { prisma } from '../../lib/db';

const formSchema = z.object({
  nickname: z.string().optional(),
  fav_team: z.string().optional(),
  risk_profile: z.enum(['safe', 'balanced', 'spicy']),
});

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const { userId } = await getSession();
  if (!userId) {
    redirect('/login');
  }
  const profile = await getProfile(userId);
  const teams = (await prisma.team.findMany({ orderBy: { name: 'asc' } })) as { id: number; name: string }[];

  async function save(formData: FormData) {
    'use server';
    const { userId } = await getSession();
    if (!userId) return;
    const values = formSchema.parse({
      nickname: formData.get('nickname')?.toString() || undefined,
      fav_team: formData.get('fav_team')?.toString() || undefined,
      risk_profile: formData.get('risk_profile')?.toString(),
    });
    await upsertProfile(userId, {
      nickname: values.nickname,
      fav_team: values.fav_team ? Number(values.fav_team) : undefined,
      risk_profile: values.risk_profile,
    });
    revalidatePath('/settings');
    redirect('/settings?saved=1');
  }

  return (
    <form action={save} className="space-y-4">
      {params.saved && <p>Profile saved.</p>}
      <div>
        <label htmlFor="nickname" className="block">
          Nickname
        </label>
        <input
          id="nickname"
          name="nickname"
          defaultValue={profile?.nickname ?? ''}
          className="border p-1"
        />
      </div>
      <div>
        <label htmlFor="fav_team" className="block">
          Favourite Team
        </label>
        <select
          id="fav_team"
          name="fav_team"
          defaultValue={profile?.favTeamId ?? ''}
          className="border p-1"
        >
          <option value="">--</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="risk_profile" className="block">
          Risk Profile
        </label>
        <select
          id="risk_profile"
          name="risk_profile"
          defaultValue={profile?.riskProfile ?? 'balanced'}
          className="border p-1"
        >
          <option value="safe">safe</option>
          <option value="balanced">balanced</option>
          <option value="spicy">spicy</option>
        </select>
      </div>
      <button type="submit" className="px-4 py-2 border rounded">
        Save
      </button>
    </form>
  );
}
