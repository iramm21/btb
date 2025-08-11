import '../styles/globals.css';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '../components/ThemeProvider';
import Header from '../components/Header';
import RGBannerGate from '../components/RGBannerGate';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Beat the Bet'
};

function Footer() {
  return (
    <footer className="p-4 border-t text-sm text-center">
      <p>
        &copy; {new Date().getFullYear()} Beat the Bet ·{' '}
        <Link href="/legal/terms" className="underline">
          Terms
        </Link>{' '}·{' '}
        <Link href="/legal/privacy" className="underline">
          Privacy
        </Link>{' '}·{' '}
        <Link href="/legal/responsible-gambling" className="underline">
          Responsible Gambling
        </Link>
      </p>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body className={inter.className}>
        <ThemeProvider>
          <Header />
          <RGBannerGate />
          <main className="min-h-screen p-4">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
