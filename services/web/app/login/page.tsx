'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BrandLogo } from '@/components/BrandLogo';

const DEMO_ACCOUNTS = [
  { role: 'Public Learner', email: 'learner@public.org', label: 'Independent Learner (Samira)' },
  { role: 'School Admin', email: 'admin@horizon.edu', label: 'Admin (Horizon Academy)' },
  { role: 'Teacher', email: 'teacher.physics@horizon.edu', label: 'Teacher (Marcus Vance)' },
  { role: 'Student', email: 'alex.chen@horizon.edu', label: 'Student (Alex Chen)' },
  { role: 'Parent', email: 'parent@horizon.edu', label: 'Parent (Eleanor Chen)' },
  { role: 'Super Admin', email: 'superadmin@edusocrates.io', label: 'Super Admin (Platform)' },
];

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function performLogin(targetEmail: string, targetPass: string) {
    setError('');
    setSubmitting(true);

    try {
      await api.login(targetEmail, targetPass);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === 'login') {
      await performLogin(email, password);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.publicSignup({ email, password, firstName, lastName });
      window.location.href = '/hub';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
      setSubmitting(false);
    }
  }

  function handleDemoSelect(demoEmail: string) {
    setMode('login');
    setEmail(demoEmail);
    setPassword('Password123!');
    performLogin(demoEmail, 'Password123!');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
      <div className="w-full max-w-md space-y-5">
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-[#E7E3D8]">
          <div className="mb-5 text-center">
            <BrandLogo variant="vertical" className="h-32 w-auto mx-auto mb-2" />
            <p className="mt-1 text-xs text-slate-600">
              Multi-Tenant Academic Platform &amp; Public Socratic Learning Hub · v3.0
            </p>
          </div>

          <div className="grid grid-cols-2 bg-slate-100 rounded-lg p-1 mb-5 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`py-1.5 rounded-md transition-colors ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`py-1.5 rounded-md transition-colors ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Free Learner Account
            </button>
          </div>

          {/* Demo Account Quick Switcher */}
          {mode === 'login' && (
            <div className="mb-5 rounded-lg bg-blue-50/60 p-3 border border-blue-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-900 mb-2">
                Quick Demo Login (One Click)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleDemoSelect(acc.email)}
                    disabled={submitting}
                    className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-blue-700 shadow-sm border border-blue-200 hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    {acc.role}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">First Name</label>
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Samira"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Last Name</label>
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Khan"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. admin@horizon.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Password123!"
              />
            </div>

            {error && (
              <div role="alert" className="rounded-md bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 transition-colors"
            >
              {submitting
                ? mode === 'login'
                  ? 'Signing in...'
                  : 'Creating free account...'
                : mode === 'login'
                  ? 'Sign In'
                  : 'Create Free Learner Account'}
            </button>
          </form>
        </div>

        {/* Public Hub & Onboarding Entry Links */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <Link
            href="/hub"
            className="rounded-lg bg-white border border-slate-200 p-3 hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors font-medium text-indigo-700"
          >
            Public Learning Hub
          </Link>
          <Link
            href="/try-teacher"
            className="rounded-lg bg-white border border-slate-200 p-3 hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors font-medium text-emerald-700"
          >
            Try as a Teacher
          </Link>
          <Link
            href="/schools"
            className="rounded-lg bg-white border border-slate-200 p-3 hover:border-purple-400 hover:bg-purple-50/40 transition-colors font-medium text-purple-700"
          >
            Onboard School
          </Link>
        </div>
      </div>
    </main>
  );
}
