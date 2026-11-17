'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ErrorBox, Field, GRADES, OnboardingShell, fieldCls } from '@/components/OnboardingShell';

export default function StartTeacherPage() {
  const [f, setF] = useState({
    firstName: '', lastName: '', email: '', password: '',
    academyName: '', className: '', gradeLevel: '9', subjectName: '',
    sectionName: '', campusName: '', city: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ code: string; className: string } | null>(null);
  const set = (k: keyof typeof f) => (e: any) => setF(p => ({ ...p, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const res = await api.createTutor({
        ...f,
        gradeLevel: Number(f.gradeLevel),
        sectionName: f.sectionName.trim() || undefined,
        campusName: f.campusName.trim() || undefined,
        city: f.city.trim() || undefined,
      });
      setDone({ code: res.provisioned?.joinCode?.code || '', className: f.className });
    } catch (err: any) {
      setError(err?.message || 'Could not create your account. Please try again.');
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <OnboardingShell title="You're set up" subtitle={`Share this code with the students of ${done.className}.`}>
        <div className="text-center bg-blue-50 border border-blue-100 rounded-xl py-6 mb-4">
          <div className="text-3xl font-mono font-bold tracking-widest text-blue-700">{done.code}</div>
          <button type="button" onClick={() => navigator.clipboard?.writeText(done.code)} className="text-xs text-blue-600 mt-2 hover:underline">Copy code</button>
        </div>
        <p className="text-sm text-gray-500 mb-5">Students enter it at <span className="font-medium">/join</span> to create their account and land in your class. You can find or change the code any time under My classes.</p>
        <Link href="/teacher" className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2.5 text-sm">Go to my dashboard</Link>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell title="Teach with GuruMera" subtitle="For tuition teachers and academies. Set up your first class and get a code for your students.">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name *"><input required maxLength={60} className={fieldCls} value={f.firstName} onChange={set('firstName')} /></Field>
          <Field label="Last name *"><input required maxLength={60} className={fieldCls} value={f.lastName} onChange={set('lastName')} /></Field>
        </div>
        <Field label="Email *"><input required type="email" maxLength={160} className={fieldCls} value={f.email} onChange={set('email')} /></Field>
        <Field label="Password *"><input required type="password" minLength={8} maxLength={72} className={fieldCls} value={f.password} onChange={set('password')} /></Field>
        <hr className="border-gray-100" />
        <Field label="School / academy name *"><input required maxLength={120} className={fieldCls} value={f.academyName} onChange={set('academyName')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Class *"><input required maxLength={60} placeholder="e.g. Class 9" className={fieldCls} value={f.className} onChange={set('className')} /></Field>
          <Field label="Grade *">
            <select required className={fieldCls} value={f.gradeLevel} onChange={set('gradeLevel')}>
              {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Subject *"><input required maxLength={60} placeholder="e.g. Physics" className={fieldCls} value={f.subjectName} onChange={set('subjectName')} /></Field>
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-500">Optional: section, campus, city</summary>
          <div className="space-y-3 mt-3">
            <Field label="Section"><input maxLength={60} className={fieldCls} value={f.sectionName} onChange={set('sectionName')} /></Field>
            <Field label="Campus"><input maxLength={80} className={fieldCls} value={f.campusName} onChange={set('campusName')} /></Field>
            <Field label="City"><input maxLength={80} className={fieldCls} value={f.city} onChange={set('city')} /></Field>
          </div>
        </details>
        <ErrorBox message={error} />
        <button disabled={busy} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2.5 text-sm disabled:opacity-50">
          {busy ? 'Creating…' : 'Create my class'}
        </button>
      </form>
    </OnboardingShell>
  );
}
