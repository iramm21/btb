import BetBuilderClient from './BetBuilderClient';

interface BuilderPageProps {
  params: { fixtureId: string };
}

export default function BuilderPage({ params }: BuilderPageProps) {
  return <BetBuilderClient fixtureId={params.fixtureId} />;
}
