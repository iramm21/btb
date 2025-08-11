import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { ReactNode } from 'react';
import { z } from 'zod';
import assertAdmin from '../../lib/auth/admin';
import uploadFromBuffer from '../../features/odds/uploadFromBuffer';
import { listIngestRuns } from '../../lib/repos/ingest';
import { listFlags, upsertFlag } from '../../lib/repos/flags';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await assertAdmin();
  const params = await searchParams;
  const tab = (typeof params.tab === 'string' ? params.tab : 'upload').toLowerCase();

  async function uploadOdds(formData: FormData) {
    'use server';
    await assertAdmin();
    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0 || file.size > 200_000) {
      redirect('/admin?tab=upload&error=Invalid+file');
    }
    try {
      const buf = Buffer.from(await file.arrayBuffer());
      const res = await uploadFromBuffer(buf);
      redirect(`/admin?tab=upload&inserted=${res.inserted}&updated=${res.updated}&rows=${res.rows}`);
    } catch (e: any) {
      redirect(`/admin?tab=upload&error=${encodeURIComponent(e.message)}`);
    }
  }

  async function refreshRuns() {
    'use server';
    await assertAdmin();
    revalidatePath('/admin');
  }

  const flagSchema = z.object({
    key: z.string().min(1),
    enabled: z.coerce.boolean(),
    payload: z
      .string()
      .optional()
      .transform((v, ctx) => {
        if (!v) return undefined;
        try {
          return JSON.parse(v);
        } catch {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid JSON' });
          return z.NEVER;
        }
      }),
  });

  async function saveFlag(formData: FormData) {
    'use server';
    await assertAdmin();
    const values = flagSchema.parse({
      key: formData.get('key'),
      enabled: formData.get('enabled'),
      payload: formData.get('payload'),
    });
    await upsertFlag({
      key: values.key,
      enabled: values.enabled,
      payload_json: values.payload,
    });
    revalidatePath('/admin');
  }

  let content: ReactNode = null;
  if (tab === 'ingest') {
    const runs = await listIngestRuns(50);
    content = (
      <div>
        <form action={refreshRuns}>
          <button type="submit" className="border px-2 py-1 mb-2">Refresh</button>
        </form>
        <table className="border-collapse border">
          <thead>
            <tr>
              <th className="border px-2">started_at</th>
              <th className="border px-2">finished_at</th>
              <th className="border px-2">type</th>
              <th className="border px-2">status</th>
              <th className="border px-2">error</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r: any) => (
              <tr key={r.id}>
                <td className="border px-2">{r.startedAt.toISOString()}</td>
                <td className="border px-2">{r.finishedAt ? r.finishedAt.toISOString() : '-'}</td>
                <td className="border px-2">{r.type}</td>
                <td className="border px-2">{r.status}</td>
                <td className="border px-2">{r.error ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } else if (tab === 'flags') {
    const flags = await listFlags();
    content = (
      <div className="space-y-4">
        {flags.map((f: any) => (
          <form key={f.key} action={saveFlag} className="border p-2">
            <input type="hidden" name="key" value={f.key} />
            <label className="block">
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={f.enabled}
                value="true"
              />{' '}
              {f.key}
            </label>
            <textarea
              name="payload"
              defaultValue={f.payloadJson ? JSON.stringify(f.payloadJson, null, 2) : ''}
              className="border w-full mt-1"
              rows={3}
            />
            <button type="submit" className="border px-2 py-1 mt-1">
              Save
            </button>
          </form>
        ))}
        <form action={saveFlag} className="border p-2">
          <input placeholder="key" name="key" className="border px-1" />
          <label className="block">
            <input type="checkbox" name="enabled" /> enabled
          </label>
          <textarea name="payload" className="border w-full mt-1" rows={3} />
          <button type="submit" className="border px-2 py-1 mt-1">
            Add
          </button>
        </form>
      </div>
    );
  } else {
    const inserted = params.inserted;
    const updated = params.updated;
    const rows = params.rows;
    const error = params.error;
    content = (
      <div>
        {error && <p className="text-red-600">{error}</p>}
        {inserted && (
          <p>
            Uploaded {rows} rows (inserted {inserted}, updated {updated}).
          </p>
        )}
        <form action={uploadOdds}>
          <input type="file" name="file" accept=".csv" className="block mb-2" />
          <button type="submit" className="border px-2 py-1">Upload</button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <nav className="space-x-4">
        <a href="/admin?tab=upload">Odds Upload</a>
        <a href="/admin?tab=ingest">Ingestion Runs</a>
        <a href="/admin?tab=flags">Feature Flags</a>
      </nav>
      {content}
    </div>
  );
}
