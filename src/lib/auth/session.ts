import supabaseServer from './supabaseServer';

interface SessionInfo {
  userId: string | null;
  email?: string;
}

export async function getSession(): Promise<SessionInfo> {
  if (process.env.NODE_ENV === 'test' || process.env.AUTH_MODE === 'mock') {
    return { userId: 'test-user', email: 'test@example.com' };
  }
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  return { userId: user?.id ?? null, email: user?.email ?? undefined };
}

export default getSession;
