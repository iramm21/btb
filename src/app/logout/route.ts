import { NextResponse } from 'next/server';
import supabaseServer from '../../lib/auth/supabaseServer';

export async function POST() {
  const supabase = supabaseServer();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
