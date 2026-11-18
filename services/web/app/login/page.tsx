'use client';

import { useEffect, useRef, useState } from 'react';
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
  Eye,
  EyeOff,
  KeyRound,
  RotateCcw,
  Smartphone,
  Laptop,
  ArrowRight,
  Info,
  Check,
  AlertTriangle,
} from 'lucide-react';

// Demo logins and the demo reset exist only in demo builds (also requires ENABLE_DEMO_MODE on the API).
const DEMO_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEMO === 'true';
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

const DEMO_ACCOUNTS = [
  { role: 'Student (Alex)', email: 'alex.chen@horizon.edu', tenant: 'Horizon Academy', badge: 'Enrolled Class' },
  { role: 'Teacher (Marcus)', email: 'teacher.physics@horizon.edu', tenant: 'Horizon Academy', badge: 'Faculty Rubrics' },
  { role: 'School Admin', email: 'admin@horizon.edu', tenant: 'Horizon Academy', badge: 'MFA Protected' },
  { role: 'Independent Learner', email: 'learner@public.org', tenant: 'Universal Public Hub', badge: 'Free Commons' },
  { role: 'Parent (Eleanor)', email: 'parent@horizon.edu', tenant: 'Horizon Academy', badge: 'Read-Only Child' },
  { role: 'Super Admin (Sandbox)', email: 'superadmin@edusocrates.io', tenant: 'Fenced Simulator', badge: 'Mock Sandbox Only' },
];

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  checks: {
    length: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

function evaluatePasswordStrength(pass: string): PasswordStrength {
  const checks = {
    length: pass.length >= 8,
    hasUpper: /[A-Z]/.test(pass),
    hasLower: /[a-z]/.test(pass),
    hasNumber: /[0-9]/.test(pass),
    hasSpecial: /[^A-Za-z0-9]/.test(pass),
  };

  let score = 0;
  if (checks.length) score += 1;
  if (checks.hasUpper && checks.hasLower) score += 1;
  if (checks.hasNumber) score += 1;
  if (checks.hasSpecial && pass.length >= 10) score += 1;

  const scoreMap = [
    { label: 'Very Weak', color: 'bg-red-500' },
    { label: 'Weak', color: 'bg-orange-500' },
    { label: 'Fair', color: 'bg-amber-500' },
    { label: 'Good', color: 'bg-blue-500' },
    { label: 'Strong', color: 'bg-emerald-500' },
  ];

  return {
    score,
    label: scoreMap[score].label,
    color: scoreMap[score].color,
    checks,
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // SSO & Modals
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const [mfaSetup, setMfaSetup] = useState<{
    tempToken: string;
    email: string;
    secret?: string;
    otpauthUrl?: string;
  } | null>(null);
  const [activeLegalModal, setActiveLegalModal] = useState<ModalType>(null);
  const [recoveryModal, setRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // MFA Flow State
  const [mfaChallenge, setMfaChallenge] = useState<{
    tempToken: string;
    email: string;
    role: string;
  } | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  // Device & Session Management State
  const [sessionModal, setSessionModal] = useState(false);
  const [resettingDemo, setResettingDemo] = useState(false);

  // The same email can belong to more than one school; the person picks which workspace to open.
  const [accountChoices, setAccountChoices] = useState<
    { schoolId: string; schoolName: string; role: string; tenantType?: string }[] | null
  >(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('created') === 'school') {
      setEmail(q.get('email') || '');
      setInfoMsg('Your school is ready. Sign in with the email and password you just chose. You will set up an authenticator app on first sign-in.');
    }
  }, []);

  const pwdStrength = evaluatePasswordStrength(password);

  async function performLogin(targetEmail: string, targetPass: string, optionalMfa?: string, schoolId?: string) {
    setError('');
    setInfoMsg('');
    setSubmitting(true);

    try {
      const res = await api.login(targetEmail, targetPass, optionalMfa, schoolId);
      if (res?.requiresAccountChoice) {
        setAccountChoices(res.accounts || []);
        setInfoMsg('This email has more than one account. Choose where to sign in.');
        setSubmitting(false);
        return;
      }
      setAccountChoices(null);
      if (res?.requiresMfa) {
        setMfaChallenge({
          tempToken: res.tempToken,
          email: res.email,
          role: res.role,
        });
        setInfoMsg('Administrator account verified. Please enter your 6-digit MFA authenticator code.');
        setSubmitting(false);
        return;
      }
      if (res?.requiresMfaSetup) {
        const start = await api.mfaSetupStart(res.tempToken);
        setMfaSetup({ tempToken: res.tempToken, email: res.email, secret: start.secret, otpauthUrl: start.otpauthUrl });
        setInfoMsg('Administrator accounts need an authenticator app. Set it up below, then enter the 6-digit code.');
        setSubmitting(false);
        return;
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please verify your credentials.');
      setSubmitting(false);
    }
  }

  async function handleMfaVerify(e: FormEvent) {
    e.preventDefault();
    if (!mfaChallenge) return;
    setError('');
    setSubmitting(true);
    try {
      await api.verifyMfa(mfaChallenge.tempToken, mfaCode);
      setInfoMsg('MFA verification successful. Redirecting to your dashboard...');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Invalid MFA code. Please try again.');
      setSubmitting(false);
    }
  }

  async function handlePasswordRecovery(e: FormEvent) {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;
    setError('');
    try {
      await api.requestRecovery(recoveryEmail);
      setRecoverySent(true);
    } catch {
      setRecoverySent(true);
    }
  }

  async function handleResetDemoState() {
    setResettingDemo(true);
    setError('');
    setInfoMsg('');
    try {
      const res = await api.resetDemoState();
      setInfoMsg(`${res.message} Baseline synthetic state restored.`);
    } catch (err: any) {
      setError(err.message || 'Unable to reset demo sandbox state.');
    } finally {
      setResettingDemo(false);
    }
  }

  async function handleRevokeOtherSessions() {
    setError('');
    setInfoMsg('');
    try {
      const res = await api.revokeOtherSessions();
      setInfoMsg(res.message);
    } catch (err: any) {
      setError(err.message || 'Unable to invalidate sessions.');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    await performLogin(email, password);
  }

  async function handleMfaSetupConfirm(e: FormEvent) {
    e.preventDefault();
    if (!mfaSetup) return;
    setError('');
    setSubmitting(true);
    try {
      await api.mfaSetupConfirm(mfaSetup.tempToken, mfaCode);
      setInfoMsg('Authenticator app connected. Redirecting to your dashboard...');
      setTimeout(() => window.location.reload(), 700);
    } catch (err: any) {
      setError(err.message || 'That code was not accepted. Please try again.');
      setSubmitting(false);
    }
  }

  async function handleGoogleCredential(idToken: string) {
    setError('');
    setInfoMsg('');
    setSubmitting(true);
    try {
      await api.ssoLogin({ provider: 'google', idToken });
      setInfoMsg('Signed in with Google. Redirecting...');
      setTimeout(() => window.location.reload(), 500);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
      setSubmitting(false);
    }
  }

  // Google Identity Services: renders Google's own button; the server verifies the returned ID token.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || mfaChallenge || mfaSetup) return;
    const init = () => {
      const g = (window as any).google?.accounts?.id;
      if (!g || !googleBtnRef.current) return;
      g.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (r: { credential: string }) => handleGoogleCredential(r.credential),
      });
      g.renderButton(googleBtnRef.current, { theme: 'outline', size: 'large', width: 360, text: 'continue_with' });
    };
    if ((window as any).google?.accounts?.id) {
      init();
      return;
    }
    const existing = document.getElementById('gsi-client') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', init);
      return () => existing.removeEventListener('load', init);
    }
    const script = document.createElement('script');
    script.id = 'gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = init;
    document.head.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mfaChallenge, mfaSetup]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-800 flex flex-col justify-between font-sans">
      {/* ─── Top Brand Header ────────────────────────────────────────────── */}
      <header className="border-b border-[#E7E3D8] bg-white/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            <BrandLogo variant="navbar" />
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 hidden sm:inline">New to GuruMera?</span>
            <Link
              href="/signup"
              className="bg-[#F5921D] hover:bg-[#DC7B0C] text-white px-4 py-2 rounded-xl font-bold shadow-xs transition-colors"
            >
              Sign Up / Register
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Auth Card ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E225B]">
              {mfaChallenge ? 'Two-Factor Authentication' : 'Welcome Back'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {mfaChallenge
                ? 'Enter the 6-digit verification code from your authenticator app'
                : 'Sign in to access your Socratic tutor, decks, and classrooms'}
            </p>
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
          {accountChoices && accountChoices.length > 0 && (
            <div className="mb-4 space-y-2">
              {accountChoices.map(a => (
                <button
                  key={a.schoolId}
                  type="button"
                  disabled={submitting}
                  onClick={() => performLogin(email, password, undefined, a.schoolId)}
                  className="w-full text-left rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm hover:border-blue-400 disabled:opacity-50"
                >
                  <span className="font-semibold text-slate-900">{a.schoolName}</span>
                  <span className="ml-2 text-xs text-slate-500">{a.role.replace('_', ' ').toLowerCase()}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Authenticator setup (administrators, first sign-in) ──────────── */}
          {mfaSetup ? (
            <form onSubmit={handleMfaSetupConfirm} className="space-y-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-slate-700 space-y-2">
                <div className="font-bold text-[#1E225B]">Set up your authenticator app</div>
                <ol className="list-decimal ml-4 space-y-1 text-[11px] text-slate-600">
                  <li>Open Google Authenticator, Microsoft Authenticator or similar.</li>
                  <li>Add an account and enter this key (or tap the link on your phone).</li>
                  <li>Enter the 6-digit code the app shows.</li>
                </ol>
                <div className="font-mono text-sm break-all bg-white border border-amber-200 rounded-lg p-2 select-all">
                  {mfaSetup.secret}
                </div>
                {mfaSetup.otpauthUrl && (
                  <a href={mfaSetup.otpauthUrl} className="text-[11px] font-semibold text-[#F5921D] hover:underline">
                    Open in authenticator app
                  </a>
                )}
              </div>
              <input
                type="text"
                required
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-full text-center tracking-widest font-mono text-lg rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1E225B]"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setMfaSetup(null); setMfaCode(''); setInfoMsg(''); }}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || mfaCode.length !== 6}
                  className="w-2/3 bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md disabled:opacity-60"
                >
                  {submitting ? 'Verifying...' : 'Confirm and sign in'}
                </button>
              </div>
            </form>
          ) : mfaChallenge ? (
            <form onSubmit={handleMfaVerify} className="space-y-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-slate-700 flex items-start gap-2.5">
                <Smartphone className="w-5 h-5 text-[#F5921D] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#1E225B]">Administrator Security Verification</div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Account: <strong>{mfaChallenge.email}</strong> ({mfaChallenge.role})
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="w-full text-center tracking-widest font-mono text-lg rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1E225B]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMfaChallenge(null)}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || mfaCode.length !== 6}
                  className="w-2/3 bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all disabled:opacity-60"
                >
                  {submitting ? 'Verifying...' : 'Verify MFA Code'}
                </button>
              </div>
            </form>
          ) : (
            /* ── Normal Login Mode ─────────────────────────────────────────── */
            <>
              {/* Google sign-in (only when a client ID is configured) */}
              {GOOGLE_CLIENT_ID && (
                <div className="mb-5 flex justify-center">
                  <div ref={googleBtnRef} />
                </div>
              )}

              {/* Divider */}
              {GOOGLE_CLIENT_ID && (
              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  — OR WITH PASSWORD —
                </span>
              </div>
              )}

              {/* Standard Email / Password Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@horizon.edu or learner@gmail.com"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#1E225B]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Password (Min. 8 characters)</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#1E225B]"
                  />

                  {/* Password strength preview */}
                  {password.length > 0 && (
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-600">Password Strength:</span>
                        <span className={`font-bold ${pwdStrength.score >= 3 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {pwdStrength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${pwdStrength.color} transition-all duration-300`}
                          style={{ width: `${Math.max(10, (pwdStrength.score / 4) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryEmail(email);
                        setRecoverySent(false);
                        setRecoveryModal(true);
                      }}
                      className="text-[11px] font-semibold text-[#1E225B] hover:underline"
                    >
                      Forgot password?
                    </button>
                    <button
                      type="button"
                      onClick={() => setSessionModal(true)}
                      className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      <Laptop className="w-3 h-3" />
                      <span>Security &amp; Sessions</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all disabled:opacity-60 mt-2"
                >
                  {submitting ? 'Authenticating...' : 'Sign In to GuruMera'}
                </button>
              </form>
            </>
          )}

          {/* ── Demo accounts (demo builds only) ───────────────────────────── */}
          {DEMO_ENABLED && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <details className="text-xs text-slate-500 group">
              <summary className="cursor-pointer font-semibold text-[#1E225B] hover:underline flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>One-Click Demo Sandbox (Isolated)</span>
                </span>
                <span className="text-[10px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>

              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-start gap-2 text-[11px] text-slate-600">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1E225B]">Security &amp; Tenant Isolation Notice:</span>
                    <p className="mt-0.5 leading-relaxed">
                      All demo data is strictly <strong>synthetic</strong>. Super Admin demo runs in a fenced simulator with no access to production infrastructure or real student records. PostgreSQL Row-Level Security ensures complete isolation.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => {
                        setEmail(acc.email);
                        setPassword('Password123!');
                        performLogin(acc.email, 'Password123!');
                      }}
                      className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-left transition-colors"
                    >
                      <div className="font-bold text-[#1E225B] truncate text-xs">{acc.role}</div>
                      <div className="text-[10px] text-slate-500 truncate">{acc.tenant}</div>
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono mt-0.5 inline-block">
                        {acc.badge}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Reset Sandbox State Action */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Need a clean slate?</span>
                  <button
                    type="button"
                    onClick={handleResetDemoState}
                    disabled={resettingDemo}
                    className="text-[#1E225B] font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3 h-3 ${resettingDemo ? 'animate-spin' : ''}`} />
                    <span>{resettingDemo ? 'Resetting...' : 'Reset Demo Sandbox'}</span>
                  </button>
                </div>
              </div>
            </details>
          </div>

          )}

          {/* Registration Journey Callout */}
          <div className="mt-4 p-3 rounded-xl bg-[#FAF9F5] border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <span className="font-bold text-[#1E225B]">Don&apos;t have an account yet?</span>
              <p className="text-[11px] text-slate-500">Choose your path: Student, Teacher, School, or Parent.</p>
            </div>
            <Link
              href="/signup"
              className="font-bold text-[#F5921D] hover:underline flex items-center gap-1 shrink-0 ml-2"
            >
              <span>Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* ─── Password Recovery Modal (Anti-Enumeration) ─────────────────── */}
      {recoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-800">
            <div className="text-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#1E225B]/10 text-[#1E225B] flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#1E225B]">Secure Account Recovery</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your account email to receive a time-limited 15-minute recovery token.
              </p>
            </div>

            {recoverySent ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Instructions Dispatched</span>
                    <p className="mt-0.5">
                      If an active account exists for {recoveryEmail}, secure password reset instructions have been dispatched.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRecoveryModal(false)}
                  className="w-full bg-[#1E225B] text-white font-bold py-2 rounded-xl text-xs"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordRecovery} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="you@horizon.edu"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#1E225B]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRecoveryModal(false)}
                    className="w-1/3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-[#1E225B] text-white font-bold py-2 rounded-xl text-xs shadow-sm hover:bg-[#141740]"
                  >
                    Send Recovery Email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── Device & Session Security Modal ────────────────────────────── */}
      {sessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-[#1E225B]">Device &amp; Session Management</h3>
              </div>
              <button
                type="button"
                onClick={() => setSessionModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-[#1E225B]" />
                  <div>
                    <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
                      <span>Current Browser Session</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        Active Now
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">Chrome on Windows &bull; IP: 127.0.0.1 (Localhost)</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="font-bold text-xs text-slate-800">Safari on iPhone 15</div>
                    <div className="text-[10px] text-slate-500">Last active 2 days ago &bull; California, US</div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">Remembered</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleRevokeOtherSessions}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Revoke All Other Sessions
              </button>
              <button
                type="button"
                onClick={() => setSessionModal(false)}
                className="bg-[#1E225B] text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Focused Mini-Footer ────────────────────────────────────────── */}
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
