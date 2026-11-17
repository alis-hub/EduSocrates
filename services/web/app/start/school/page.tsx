'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ErrorBox, Field, OnboardingShell, fieldCls } from '@/components/OnboardingShell';

export default function StartSchoolPage() {
  const router = useRouter();
  const [f, setF] = useState({ schoolName: '', city: '', adminFirstName: '', adminLastName: '', adminEmail: '', adminPassword: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof f) => (e: any) => setF(p => ({ ...p, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api.createSchool({ ...f, city: f.city.trim() || undefined });
      // Administrators finish by setting up an authenticator app, which the sign-in page walks through.
      router.push('/login?created=school&email=' + encodeURIComponent(f.adminEmail));
    } catch (err: any) {
      setError(err?.message || 'Could not create the school. Please try again.');
    } finally { setBusy(false); }
  }

  return (
    <OnboardingShell title="Set up your school" subtitle="Takes about a minute. You can add teachers, classes and students afterwards.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="School name *"><input required maxLength={120} className={fieldCls} value={f.schoolName} onChange={set('schoolName')} /></Field>
        <Field label="City"><input maxLength={80} className={fieldCls} value={f.city} onChange={set('city')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Your first name *"><input required maxLength={60} className={fieldCls} value={f.adminFirstName} onChange={set('adminFirstName')} /></Field>
          <Field label="Last name *"><input required maxLength={60} className={fieldCls} value={f.adminLastName} onChange={set('adminLastName')} /></Field>
        </div>
        <Field label="Email *"><input required type="email" maxLength={160} className={fieldCls} value={f.adminEmail} onChange={set('adminEmail')} /></Field>
        <Field label="Password *" hint="At least 8 characters. Administrators also use an authenticator app at sign-in.">
          <input required type="password" minLength={8} maxLength={72} className={fieldCls} value={f.adminPassword} onChange={set('adminPassword')} />
        </Field>
        <ErrorBox message={error} />
        <button disabled={busy} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2.5 text-sm disabled:opacity-50">
          {busy ? 'Creating…' : 'Create school'}
        </button>
      </form>
    </OnboardingShell>
  );
}
