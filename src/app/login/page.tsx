'use client';
import Link from 'next/link';
import supabaseClient from '../../lib/auth/supabaseClient';

export default function LoginPage() {
  const supabase = supabaseClient();
  const isMock = process.env.NEXT_PUBLIC_AUTH_MODE === 'mock';

  const signIn = async () => {
    const email = window.prompt('Email');
    if (!email) return;
    await supabase.auth.signInWithOtp({ email });
    alert('Check your email for the login link.');
  };

  const signOut = async () => {
    await fetch('/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <div className="space-y-4">
      {isMock && <div className="p-2 bg-yellow-200">Mock auth enabled</div>}
      <button className="px-4 py-2 border" onClick={signIn}>
        Sign in with email link
      </button>
      <button className="px-4 py-2 border" onClick={signOut}>
        Sign out
      </button>
      {isMock && (
        <div>
          <Link href="/dashboard">Continue</Link>
        </div>
      )}
    </div>
  );
}
