'use client';

import { Suspense, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ErrorBox, Field, OnboardingShell, fieldCls } from '@/components/OnboardingShell';

function JoinForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [f, setF] = useState({ code: (params.get('code') || '').toUpperCase(), firstName: '', lastName: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof f) => (e: any) => setF(p => ({ ...p, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api.joinClass(f);
      router.push('/student');
    } catch (err: any) {
      setError(err?.message || 'Could not join. Check the code and try again.');
    } finally { setBusy(false); }
  }

  return (
    <OnboardingShell title="Join your class" subtitle="Enter the code your teacher gave you and create your account.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Class code *"><input required maxLength={20} placeholder="XXXX-XXXX" className={fieldCls + ' font-mono tracking-widest uppercase'} value={f.code} onChange={set('code')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name *"><input required maxLength={60} className={fieldCls} value={f.firstName} onChange={set('firstName')} /></Field>
          <Field label="Last name *"><input required maxLength={60} className={fieldCls} value={f.lastName} onChange={set('lastName')} /></Field>
        </div>
        <Field label="Email *"><input required type="email" maxLength={160} className={fieldCls} value={f.email} onChange={set('email')} /></Field>
        <Field label="Password *" hint="At least 8 characters."><input required type="password" minLength={8} maxLength={72} className={fieldCls} value={f.password} onChange={set('password')} /></Field>
        <ErrorBox message={error} />
        <button disabled={busy} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2.5 text-sm disabled:opacity-50">
          {busy ? 'Joining…' : 'Join class'}
        </button>
      </form>
    </OnboardingShell>
  );
}

export default function JoinPage() {
  return <Suspense fallback={null}><JoinForm /></Suspense>;
}
