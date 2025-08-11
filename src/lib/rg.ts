export function shouldShowRGBanner(pathname: string): boolean {
  if (!pathname) return false;
  if (pathname.startsWith('/builder')) return true;
  if (pathname === '/my-bets') return true;
  if (pathname.startsWith('/match')) return true;
  return false;
}
