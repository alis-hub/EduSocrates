'use client';

import { Suspense, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ErrorBox, Field, OnboardingShell, fieldCls } from '@/components/OnboardingShell';

function ResetForm() {
  const token = useSearchParams().get('token') || '';
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password !== again) { setError('The two passwords do not match.'); return; }
    setBusy(true); setError('');
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Could not reset your password.');
    } finally { setBusy(false); }
  }

  if (!token) {
    return (
      <OnboardingShell title="Reset link missing" subtitle="Open the link from your email, or request a new one from the sign-in page.">
        <Link href="/login" className="text-blue-600 text-sm hover:underline">Go to sign in</Link>
      </OnboardingShell>
    );
  }
  if (done) {
    return (
      <OnboardingShell title="Password changed" subtitle="You can now sign in with your new password. Other devices have been signed out.">
        <Link href="/login" className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2.5 text-sm">Sign in</Link>
      </OnboardingShell>
    );
  }
  return (
    <OnboardingShell title="Choose a new password" subtitle="Use at least 8 characters.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="New password"><input required type="password" minLength={8} maxLength={72} autoComplete="new-password" className={fieldCls} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <Field label="Repeat new password"><input required type="password" minLength={8} maxLength={72} autoComplete="new-password" className={fieldCls} value={again} onChange={(e) => setAgain(e.target.value)} /></Field>
        <ErrorBox message={error} />
        <button disabled={busy} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2.5 text-sm disabled:opacity-50">
          {busy ? 'Saving…' : 'Change password'}
        </button>
      </form>
    </OnboardingShell>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetForm /></Suspense>;
}
