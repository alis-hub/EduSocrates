'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BrandLogo } from '@/components/BrandLogo';
import { LandingModals, ModalType } from '@/components/LandingModals';
import {
  CheckCircle2,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'Student (Alex)', email: 'alex.chen@horizon.edu', tenant: 'Horizon Academy', domain: 'horizon.edu' },
  { role: 'Teacher (Marcus)', email: 'teacher.physics@horizon.edu', tenant: 'Horizon Academy', domain: 'horizon.edu' },
  { role: 'School Admin', email: 'admin@horizon.edu', tenant: 'Horizon Academy', domain: 'horizon.edu' },
  { role: 'Independent Learner', email: 'learner@public.org', tenant: 'Public Hub', domain: 'public.org' },
  { role: 'Parent (Eleanor)', email: 'parent@horizon.edu', tenant: 'Horizon Academy', domain: 'horizon.edu' },
  { role: 'Super Admin', email: 'superadmin@edusocrates.io', tenant: 'Platform Super Admin', domain: 'edusocrates.io' },
];

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ssoModal, setSsoModal] = useState<'google' | 'linkedin' | null>(null);
  const [activeLegalModal, setActiveLegalModal] = useState<ModalType>(null);

  async function performLogin(targetEmail: string, targetPass: string) {
    setError('');
    setInfoMsg('');
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

  async function handleSsoAction(provider: 'google' | 'linkedin', ssoEmail: string, ssoName?: string) {
    setError('');
    setInfoMsg('');
    setSubmitting(true);
    try {
      const parts = (ssoName || '').split(' ');
      const res = await api.ssoLogin({
        provider,
        email: ssoEmail,
        firstName: parts[0] || 'User',
        lastName: parts.slice(1).join(' ') || (provider === 'linkedin' ? 'Educator' : 'Learner'),
      });
      setSsoModal(null);
      if (res.tenantRouted) {
        setInfoMsg(`Mapped domain @${ssoEmail.split('@')[1]} to your verified Academy tenant. Redirecting...`);
      } else {
        setInfoMsg('Connected to Universal Public Learning Hub. Redirecting...');
      }
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'SSO authentication failed');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-800 flex flex-col justify-between font-sans">
      {/* ─── Focused Minimal Header (Brand Only) ────────────────────────── */}
      <div className="py-6 px-6 text-center">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <BrandLogo variant="navbar" />
        </Link>
      </div>

      {/* ─── Focused Auth Card ─────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-4 sm:py-8">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E225B]">
              {mode === 'login' ? 'Welcome Back' : 'Create Your Free Account'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'login'
                ? 'Sign in to access your Socratic tutor, decks, and classrooms'
                : 'Join the Public Learning Hub or link to your academy'}
            </p>
          </div>

          {/* Tab Switcher: Sign In vs. Free Sign Up */}
          <div className="grid grid-cols-2 bg-slate-100 rounded-xl p-1 mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setInfoMsg('');
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#1E225B] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
                setInfoMsg('');
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#1E225B] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* ─── Top: Single Sign-On (Google & LinkedIn) ────────────────── */}
          <div className="space-y-2.5 mb-5">
            {/* Google SSO Button */}
            <button
              type="button"
              onClick={() => setSsoModal('google')}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl border border-slate-300 shadow-2xs transition-all text-xs sm:text-sm disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* LinkedIn SSO Button */}
            <button
              type="button"
              onClick={() => setSsoModal('linkedin')}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold py-2.5 px-4 rounded-xl shadow-2xs transition-all text-xs sm:text-sm disabled:opacity-60"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 1 0 0-3.06 1.53 1.53 0 0 0 0 3.06m1.39 9.74v-8.37H5.07v8.37h2.78z"/>
              </svg>
              <span>Continue with LinkedIn</span>
            </button>
          </div>

          {/* ─── Subtle Divider: — OR — ─────────────────────────────────── */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              — OR —
            </span>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}
          {infoMsg && (
            <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* ─── Standard Email / Password Form ─────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#1E225B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Chen"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#1E225B]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@horizon.edu or name@gmail.com"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#1E225B]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                School domains (@horizon.edu) automatically route to your academy workspace.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#1E225B]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all disabled:opacity-60 mt-2"
            >
              {submitting ? 'Authenticating...' : mode === 'login' ? 'Sign In to GuruMera' : 'Create Free Learner Account'}
            </button>
          </form>

          {/* Quick Demo Switcher (Collapsible for Developer & Review Testing) */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <details className="text-xs text-slate-500">
              <summary className="cursor-pointer font-semibold text-[#1E225B] hover:underline flex items-center justify-between">
                <span>Quick Demo Accounts (Instant 1-Click)</span>
                <span className="text-[10px] text-slate-400">Click to expand</span>
              </summary>
              <div className="grid grid-cols-2 gap-1.5 pt-3">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword('Password123!');
                      performLogin(acc.email, 'Password123!');
                    }}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
                  >
                    <div className="font-bold text-[#1E225B] truncate">{acc.role}</div>
                    <div className="text-[10px] text-slate-500 truncate">{acc.tenant}</div>
                  </button>
                ))}
              </div>
            </details>
          </div>
        </div>
      </main>

      {/* ─── Interactive SSO Account Selector Modal ────────────────────── */}
      {ssoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-800">
            <div className="text-center mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                {ssoModal === 'google' ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 fill-[#0A66C2]" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 1 0 0-3.06 1.53 1.53 0 0 0 0 3.06m1.39 9.74v-8.37H5.07v8.37h2.78z"/>
                  </svg>
                )}
              </div>
              <h3 className="font-bold text-sm text-[#1E225B]">
                Sign in with {ssoModal === 'google' ? 'Google' : 'LinkedIn'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Choose an account to continue to GuruMera.
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <button
                type="button"
                onClick={() => handleSsoAction(ssoModal, 'alex.chen@horizon.edu', 'Alex Chen')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-800">Alex Chen (Student)</div>
                  <div className="text-[10px] text-slate-500">alex.chen@horizon.edu</div>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded">
                  Horizon Academy
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSsoAction(ssoModal, 'teacher.physics@horizon.edu', 'Marcus Vance')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-800">Marcus Vance (Teacher)</div>
                  <div className="text-[10px] text-slate-500">teacher.physics@horizon.edu</div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded">
                  Faculty
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSsoAction(ssoModal, 'samira.learner@gmail.com', 'Samira Learner')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-800">Samira (Independent)</div>
                  <div className="text-[10px] text-slate-500">samira.learner@gmail.com</div>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded">
                  Public Hub
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSsoModal(null)}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ─── Focused Mini-Footer (Legal Links Only) ─────────────────────── */}
      <footer className="py-6 px-6 text-center text-xs text-slate-500 border-t border-[#E7E3D8]">
        <div className="flex items-center justify-center gap-4 mb-1">
          <button
            type="button"
            onClick={() => setActiveLegalModal('privacy')}
            className="hover:text-[#1E225B] transition-colors"
          >
            Privacy Policy
          </button>
          <span>&bull;</span>
          <button
            type="button"
            onClick={() => setActiveLegalModal('terms')}
            className="hover:text-[#1E225B] transition-colors"
          >
            Terms of Service
          </button>
          <span>&bull;</span>
          <Link href="/" className="hover:text-[#1E225B] transition-colors">
            Back to Home
          </Link>
        </div>
        <p className="text-[11px] text-slate-400">
          Copyright &copy; 2026 GuruMera. All rights reserved.
        </p>
      </footer>

      {/* Legal Modals */}
      <LandingModals
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />
    </div>
  );
}
