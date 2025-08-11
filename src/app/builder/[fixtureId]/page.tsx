import BetBuilderClient from './BetBuilderClient';

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ fixtureId: string }>;
}) {
  const { fixtureId } = await params;
  return <BetBuilderClient fixtureId={fixtureId} />;
}
