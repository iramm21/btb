import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  if (process.env.NODE_ENV === 'test' || process.env.AUTH_MODE === 'mock') {
    const res = NextResponse.next();
    res.headers.set('x-user-id', 'test-user');
    return res;
  }
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/match/:path*', '/builder/:path*', '/my-bets', '/admin/:path*'],
};
