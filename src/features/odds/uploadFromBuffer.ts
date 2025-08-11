import { parseCsv } from '../../lib/csv';
import { prisma } from '../../lib/db';
import { zOddsRow, type OddsRow } from '../../lib/schemas/odds';

/**
 * Parse an odds CSV buffer and upsert snapshots.
 * Returns counts of inserted and updated rows.
 */
export async function uploadFromBuffer(buf: Buffer) {
  const text = buf.toString('utf8');
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
    throw new Error(msg);
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
  return { inserted, updated, rows: valid.length };
}

export default uploadFromBuffer;
