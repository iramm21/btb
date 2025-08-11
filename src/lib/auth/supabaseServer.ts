import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';

export function supabaseServer(): SupabaseClient {
  return createServerComponentClient({ cookies });
}

export default supabaseServer;
