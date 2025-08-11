import FixtureCard, { Fixture } from './FixtureCard';

export default function FixtureList({ fixtures }: { fixtures: Fixture[] }) {
  if (!fixtures.length) {
    return <p>No fixtures found for this round.</p>;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fixtures.map((f) => (
        <FixtureCard key={f.id} fixture={f} />
      ))}
    </div>
  );
}
