'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '@/lib/api';

const DEMO_ACCOUNTS = [
  { role: 'School Admin', email: 'admin@horizon.edu', label: 'Admin (Horizon Academy)' },
  { role: 'Teacher', email: 'teacher.physics@horizon.edu', label: 'Teacher (Marcus Vance)' },
  { role: 'Student', email: 'alex.chen@horizon.edu', label: 'Student (Alex Chen)' },
  { role: 'Parent', email: 'parent@horizon.edu', label: 'Parent (Eleanor Chen)' },
  { role: 'Super Admin', email: 'superadmin@edusocrates.io', label: 'Super Admin (Platform)' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function performLogin(targetEmail: string, targetPass: string) {
    setError('');
    setSubmitting(true);

    try {
      await api.login(targetEmail, targetPass);
      // Reload so middleware can route the authenticated user by role.
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await performLogin(email, password);
  }

  function handleDemoSelect(demoEmail: string) {
    setEmail(demoEmail);
    setPassword('Password123!');
    performLogin(demoEmail, 'Password123!');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">EduSocrates</h1>
          <p className="mt-1 text-sm text-slate-600">Multi-Tenant Academic Platform with Socratic AI Guidance</p>
        </div>

        {/* Demo Account Quick Switcher */}
        <div className="mb-6 rounded-lg bg-blue-50/60 p-3 border border-blue-100">
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="current-password"
              required
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
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}
