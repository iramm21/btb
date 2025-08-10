import { parseCsv } from '../../../../lib/csv';
import { prisma } from '../../../../lib/db';
import { zOddsRow, type OddsRow } from '../../../../lib/schemas/odds';

export async function POST(req: Request): Promise<Response> {
  if (req.headers.get('x-demo-admin') !== '1') {
    return new Response('Unauthorized', { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return new Response('Invalid multipart', { status: 400 });
  }
  const file = form.get('file');
  if (!(file instanceof File)) {
    return new Response('Missing file', { status: 400 });
  }
  const text = await file.text();
  const records = parseCsv(text);
  const valid: OddsRow[] = [];
  const errors: { row: number; message: string }[] = [];
  records.forEach((record, idx) => {
    const res = zOddsRow.safeParse(record);
    if (res.success) {
      valid.push(res.data);
    } else {
      errors.push({ row: idx + 2, message: res.error.issues[0].message });
    }
  });
  if (errors.length) {
    const msg = errors
      .slice(0, 3)
      .map((e) => `Row ${e.row}: ${e.message}`)
      .join('; ');
    return new Response(msg, { status: 400 });
  }
  let inserted = 0;
  let updated = 0;
  for (const row of valid) {
    const existing = await prisma.oddsSnapshot.findFirst({
      where: { fixtureId: row.fixtureId, capturedAt: row.capturedAt },
    });
    if (existing) {
      await prisma.oddsSnapshot.update({
        where: { id: existing.id },
        data: row,
      });
      updated += 1;
    } else {
      await prisma.oddsSnapshot.create({ data: row });
      inserted += 1;
    }
  }
  return Response.json({ inserted, updated, rows: valid.length });
}
