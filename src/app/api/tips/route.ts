import { TipsQuerySchema, TipsResponseSchema } from '../../../lib/schemas/api';
import { buildTips } from '../../../features/tips/engine';
import { RiskBand, Market } from '../../../features/tips/constants';

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const parse = TipsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parse.success) {
    return new Response('Invalid params', { status: 400 });
  }
  const { fixture_id, risk = 'balanced', exclude, seed = 'mvp' } = parse.data;
  const excludeArr = exclude
    ? (exclude.split(',').filter(Boolean) as Market[])
    : [];
  const body = await buildTips({
    fixtureId: Number(fixture_id),
    risk: risk as RiskBand,
    exclude: excludeArr,
    seed,
  });
  const validated = TipsResponseSchema.parse(body);
  return Response.json(validated);
}
