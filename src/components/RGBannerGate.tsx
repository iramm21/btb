'use client';
import { usePathname } from 'next/navigation';
import RGBanner from './RGBanner';
import { shouldShowRGBanner } from '../lib/rg';

export default function RGBannerGate() {
  const pathname = usePathname();
  if (!shouldShowRGBanner(pathname)) return null;
  return <RGBanner />;
}
