'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { OnboardingShell } from '@/components/OnboardingShell';

function Verify() {
  const token = useSearchParams().get('token') || '';
  const [state, setState] = useState<'working' | 'ok' | 'failed'>('working');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setState('failed'); setMessage('This confirmation link is incomplete.'); return; }
    api.verifyEmail(token)
      .then(() => setState('ok'))
      .catch((e: any) => { setState('failed'); setMessage(e?.message || 'This link is invalid or has expired.'); });
  }, [token]);

  return (
    <OnboardingShell
      title={state === 'ok' ? 'Email confirmed' : state === 'failed' ? 'Could not confirm' : 'Confirming…'}
      subtitle={state === 'ok' ? 'Thank you. Your email address is now confirmed.' : state === 'failed' ? message : 'One moment.'}
    >
      <Link href="/login" className="text-blue-600 text-sm hover:underline">Continue to GuruMera</Link>
    </OnboardingShell>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={null}><Verify /></Suspense>;
}
