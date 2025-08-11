'use client';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export default function Header() {
  const { toggle } = useTheme();
  return (
    <header className="flex justify-between items-center p-4 border-b">
      <Link href="/">Beat the Bet</Link>
      <button onClick={toggle} className="text-sm">Toggle theme</button>
    </header>
  );
}
