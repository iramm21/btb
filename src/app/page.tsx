import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="space-y-4">
      <p>Beat the Bet helps NRL fans build smarter multis with live data and tips.</p>
      <nav className="space-x-4">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/legal/terms">Terms</Link>
        <Link href="/legal/privacy">Privacy</Link>
        <Link href="/legal/responsible-gambling">RG</Link>
      </nav>
    </section>
  );
}
