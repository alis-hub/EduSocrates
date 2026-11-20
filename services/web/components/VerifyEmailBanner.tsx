'use client';

import { useEffect, useState } from 'react';
import { api, getStoredUser } from '../lib/api';

/**
 * A slim, dismissible reminder for signed-in people whose email address is not confirmed yet.
 * It never blocks anything: unconfirmed accounts keep working, they just cannot reset a password by email.
 */
export default function VerifyEmailBanner() {
  const [email, setEmail] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    try {
      if (sessionStorage.getItem('gm_verify_banner_dismissed')) return;
      if (!getStoredUser()) return; // only people who signed in on this browser
    } catch { return; }
    let alive = true;
    api.me()
      .then((u) => { if (alive && !u.emailVerified) setEmail(u.email); })
      .catch(() => { /* not signed in (or session ended): show nothing */ });
    return () => { alive = false; };
  }, []);

  if (!email) return null;

  async function resend() {
    setState('sending');
    try { await api.resendVerification(); setState('sent'); } catch { setState('error'); }
  }
  function dismiss() {
    try { sessionStorage.setItem('gm_verify_banner_dismissed', '1'); } catch { /* ignore */ }
    setEmail(null);
  }

  return (
    <div role="status" className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs px-4 py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
      <span>
        Please confirm your email address (<strong>{email}</strong>) so you can reset your password later.
      </span>
      {state === 'sent' ? (
        <span className="font-semibold">Link sent. Check your inbox and spam folder.</span>
      ) : (
        <button type="button" onClick={resend} disabled={state === 'sending'} className="underline font-semibold disabled:opacity-60">
          {state === 'sending' ? 'Sending…' : state === 'error' ? 'Could not send, try again' : 'Send the link again'}
        </button>
      )}
      <button type="button" onClick={dismiss} aria-label="Dismiss" className="ml-1 text-amber-700 hover:text-amber-900">✕</button>
    </div>
  );
}
