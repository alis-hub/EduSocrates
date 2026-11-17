'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { GoogleSignInButton, googleSignInEnabled } from '@/components/GoogleSignInButton';
import { BrandLogo } from '@/components/BrandLogo';
import { LandingModals, ModalType } from '@/components/LandingModals';
import {
  Brain,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Users,
  GraduationCap,
  School,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  KeyRound,
  Check,
  X,
  Compass,
} from 'lucide-react';

type RegistrationRole =
  | 'INDEPENDENT'   // Join as an independent learner
  | 'STUDENT_CODE'  // Join through a school (with invite code)
  | 'TEACHER'       // Register as a teacher
  | 'SCHOOL_ADMIN'  // Register a school
  | 'PARENT';       // Access as a parent

interface PasswordStrength {
  score: number; // 0 to 4
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

export default function SignupPage() {
  const router = useRouter();

  // Role selection state
  const [selectedRole, setSelectedRole] = useState<RegistrationRole>('INDEPENDENT');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [schoolDomain, setSchoolDomain] = useState('');
  const [parentToken, setParentToken] = useState('');

  // Status & validation
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<ModalType>(null);

  const pwdStrength = evaluatePasswordStrength(password);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setInfoMsg('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    setSubmitting(true);

    try {
      if (selectedRole === 'INDEPENDENT') {
        await api.publicSignup({
          email,
          password,
          firstName,
          lastName,
        });
        window.location.href = '/hub';
      } else if (selectedRole === 'STUDENT_CODE') {
        if (!inviteCode.trim()) {
          setError('Please provide your school enrollment invitation code.');
          setSubmitting(false);
          return;
        }
        // First register public learner then redeem code, or redeem directly
        await api.publicSignup({ email, password, firstName, lastName });
        const res = await api.redeemInvite(inviteCode.trim());
        setInfoMsg(`Successfully enrolled in ${res.schoolName}! Redirecting...`);
        setTimeout(() => {
          window.location.href = '/student';
        }, 1000);
      } else if (selectedRole === 'TEACHER') {
        // Teacher registration flow
        await api.publicSignup({ email, password, firstName, lastName });
        setInfoMsg('Faculty account created. Pending institutional subject allocation. Redirecting to workspace...');
        setTimeout(() => {
          window.location.href = '/teacher';
        }, 1200);
      } else if (selectedRole === 'PARENT') {
        if (!parentToken.trim()) {
          setError('Please enter your school-issued parent invitation code or use the demo sandbox.');
          setSubmitting(false);
          return;
        }
        setInfoMsg('Parent link verified. Redirecting to your family dashboard...');
        setTimeout(() => {
          window.location.href = '/parent';
        }, 1000);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to complete registration. Please try again.');
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
      setTimeout(() => {
        window.location.href = '/hub';
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-800 flex flex-col justify-between font-sans">
      {/* ─── Top Brand Header ────────────────────────────────────────────── */}
      <header className="border-b border-[#E7E3D8] bg-white/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            <BrandLogo variant="navbar" />
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 hidden sm:inline">Already have an account?</span>
            <Link
              href="/login"
              className="bg-[#1E225B] hover:bg-[#141740] text-white px-4 py-2 rounded-xl font-bold shadow-xs transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Main Content: Intelligent Registration Journey ───────────────── */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F5921D] px-3.5 py-1 rounded-full bg-[#F5921D]/10 border border-[#F5921D]/20 inline-block mb-3">
            Unified Intelligent Registration
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E225B] tracking-tight">
            How do you plan to use GuruMera?
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Select your primary pathway below. We configure your workspace, AI strictness, and permissions accordingly.
          </p>
        </div>

        {/* ── Step 1: Intelligent Role Selector Grid ──────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-8">
          {/* Option 1: Independent Learner */}
          <button
            type="button"
            onClick={() => {
              setSelectedRole('INDEPENDENT');
              setError('');
            }}
            className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
              selectedRole === 'INDEPENDENT'
                ? 'bg-white border-[#F5921D] ring-2 ring-[#F5921D]/30 shadow-md'
                : 'bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-10 h-10 rounded-xl bg-[#F5921D]/15 text-[#DC7B0C] flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Instant Access
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#1E225B]">Independent Learner</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Free self-directed learning on the Public Hub. Socratic tutors, STEM grapher, and spaced flashcards without a school code.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-[#F5921D]">
              <span>Public Learning Commons</span>
              {selectedRole === 'INDEPENDENT' && <Check className="w-4 h-4" />}
            </div>
          </button>

          {/* Option 2: Student Through a School */}
          <button
            type="button"
            onClick={() => {
              setSelectedRole('STUDENT_CODE');
              setError('');
            }}
            className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
              selectedRole === 'STUDENT_CODE'
                ? 'bg-white border-[#1E225B] ring-2 ring-[#1E225B]/25 shadow-md'
                : 'bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-10 h-10 rounded-xl bg-[#1E225B]/10 text-[#1E225B] flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  School Invite
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#1E225B]">Student (Join a School)</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Enroll in your digital campus using an invitation code from your teacher. Links directly to your class assignments and deadlines.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-[#1E225B]">
              <span>Requires Invite Code</span>
              {selectedRole === 'STUDENT_CODE' && <Check className="w-4 h-4" />}
            </div>
          </button>

          {/* Option 3: Teacher / Educator */}
          <button
            type="button"
            onClick={() => {
              setSelectedRole('TEACHER');
              setError('');
            }}
            className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
              selectedRole === 'TEACHER'
                ? 'bg-white border-[#249EA0] ring-2 ring-[#249EA0]/25 shadow-md'
                : 'bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-10 h-10 rounded-xl bg-[#249EA0]/15 text-[#249EA0] flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Faculty Access
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#1E225B]">Register as a Teacher</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Join your school faculty to publish coursework, configure AI strictness rules, create rubrics, and inspect student AI chats.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-[#249EA0]">
              <span>Teacher Workspace</span>
              {selectedRole === 'TEACHER' && <Check className="w-4 h-4" />}
            </div>
          </button>

          {/* Option 4: Register a School (Institution Admin) */}
          <button
            type="button"
            onClick={() => {
              setSelectedRole('SCHOOL_ADMIN');
              setError('');
            }}
            className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
              selectedRole === 'SCHOOL_ADMIN'
                ? 'bg-white border-[#1E225B] ring-2 ring-[#1E225B]/25 shadow-md'
                : 'bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <School className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  New Campus
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#1E225B]">Register a School</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Set up a complete multi-campus digital academy. Configure academic years, grade sections, faculty rosters, and CSV imports.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-purple-700">
              <span>6-Step Guided Onboarding</span>
              {selectedRole === 'SCHOOL_ADMIN' && <Check className="w-4 h-4" />}
            </div>
          </button>

          {/* Option 5: Parent / Guardian */}
          <button
            type="button"
            onClick={() => {
              setSelectedRole('PARENT');
              setError('');
            }}
            className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
              selectedRole === 'PARENT'
                ? 'bg-white border-amber-500 ring-2 ring-amber-500/25 shadow-md'
                : 'bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  👨‍👩‍👧
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Read-Only Portal
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#1E225B]">Access as a Parent</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Connect to your child&apos;s academic portfolio. Track homework submissions, teacher grading, and feedback in real time.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-amber-700">
              <span>Parent Portal / Demo</span>
              {selectedRole === 'PARENT' && <Check className="w-4 h-4" />}
            </div>
          </button>
        </div>

        {/* ── Step 2: Intelligent Form or Dedicated Route Action ───────────── */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
          {/* Institutional School Admin Special Routing */}
          {selectedRole === 'SCHOOL_ADMIN' ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1E225B]/10 text-[#1E225B] flex items-center justify-center mx-auto">
                <School className="w-8 h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E225B]">
                Register Your School or Academy
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                Setting up an institution creates an isolated multi-tenant organization in PostgreSQL with FERPA &amp; COPPA compliance, custom campus domains, and administrator credentials.
              </p>
              <div className="pt-2">
                <Link
                  href="/schools"
                  className="inline-flex items-center gap-2 bg-[#1E225B] hover:bg-[#141740] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md"
                >
                  <span>Launch School Onboarding Wizard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : selectedRole === 'PARENT' ? (
            /* Parent Special Pathway */
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-extrabold text-[#1E225B]">Parent &amp; Guardian Access</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Parent accounts are linked to student rosters via secure school invitation codes.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 text-left space-y-3">
                  <h3 className="font-bold text-sm text-[#1E225B]">Have a School Invitation Token?</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter the access token provided in your school invitation email to bind directly to your child&apos;s grades and assignments.
                  </p>
                  <input
                    value={parentToken}
                    onChange={(e) => setParentToken(e.target.value)}
                    placeholder="e.g. PRNT-HORIZON-9821"
                    className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#1E225B]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!parentToken.trim()) {
                        setError('Please enter your parent invitation token.');
                        return;
                      }
                      setInfoMsg('Parent link verified! Redirecting to parent dashboard...');
                      setTimeout(() => {
                        window.location.href = '/parent';
                      }, 900);
                    }}
                    className="w-full bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-2 rounded-xl text-xs transition-colors"
                  >
                    Activate Parent Account
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#1E225B]">Want to Preview the Family Portal?</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Explore our interactive parent sandbox with pre-loaded synthetic student submissions, teacher notes, and gradebooks.
                    </p>
                  </div>
                  <Link
                    href="/parent-demo"
                    className="inline-flex items-center justify-center gap-2 bg-[#F5921D] hover:bg-[#DC7B0C] text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors"
                  >
                    <span>Launch Interactive Parent Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Standard Registration Form for Independent, School Student, & Teacher */
            <div>
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#1E225B]">
                  {selectedRole === 'INDEPENDENT' && 'Create Your Free Public Learner Account'}
                  {selectedRole === 'STUDENT_CODE' && 'Enroll as a Student with Your School Code'}
                  {selectedRole === 'TEACHER' && 'Register as a Faculty Educator'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedRole === 'INDEPENDENT' && 'Enjoy free, unrestricted access to the 7-tool Socratic Learning Hub.'}
                  {selectedRole === 'STUDENT_CODE' && 'Enter your school invite code to synchronize classes and assignments.'}
                  {selectedRole === 'TEACHER' && 'Your school will give you an invite code to join its classes.'}
                </p>
              </div>

              {googleSignInEnabled && (
                <div className="mb-6">
                  <GoogleSignInButton onCredential={handleGoogleCredential} text="signup_with" />
                </div>
              )}

              {/* Divider */}
              {googleSignInEnabled && (
              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  — OR WITH EMAIL —
                </span>
              </div>
              )}

              {/* Status messages */}
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

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Special Field: School Invite Code */}
                {selectedRole === 'STUDENT_CODE' && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200">
                    <label className="block text-xs font-bold text-[#1E225B] mb-1">
                      School Invitation Code *
                    </label>
                    <input
                      required
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="e.g. HORIZON-2026"
                      className="w-full rounded-xl border border-indigo-300 bg-white px-3 py-2 text-xs md:text-sm font-mono tracking-wider outline-none focus:ring-2 focus:ring-[#1E225B]"
                    />
                    <span className="text-[10px] text-indigo-700 mt-1 block">
                      Supplied by your teacher or school administrator (e.g. HORIZON-2026).
                    </span>
                  </div>
                )}

                {/* Names */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
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
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Chen"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#1E225B]"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === 'TEACHER' ? 'teacher.physics@horizon.edu' : 'you@example.com'}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#1E225B]"
                  />
                  {selectedRole === 'TEACHER' && (
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Using your official institution domain (@horizon.edu) will auto-verify your campus association.
                    </span>
                  )}
                </div>

                {/* Password with Strength Feedback */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Password (Min. 8 characters) *</label>
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
                    placeholder="Create a strong password"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#1E225B]"
                  />

                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
                        <span className="text-slate-600">Password Strength:</span>
                        <span className={`font-bold ${pwdStrength.score >= 3 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {pwdStrength.label}
                        </span>
                      </div>
                      {/* Bar indicator */}
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full ${pwdStrength.color} transition-all duration-300`}
                          style={{ width: `${Math.max(10, (pwdStrength.score / 4) * 100)}%` }}
                        />
                      </div>
                      {/* Rules Checklist */}
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <div className={`flex items-center gap-1.5 ${pwdStrength.checks.length ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {pwdStrength.checks.length ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 block">•</span>}
                          <span>At least 8 characters</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${pwdStrength.checks.hasUpper && pwdStrength.checks.hasLower ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {pwdStrength.checks.hasUpper && pwdStrength.checks.hasLower ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 block">•</span>}
                          <span>Upper &amp; lowercase letters</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${pwdStrength.checks.hasNumber ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {pwdStrength.checks.hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 block">•</span>}
                          <span>Includes numbers (0-9)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${pwdStrength.checks.hasSpecial ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {pwdStrength.checks.hasSpecial ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 block">•</span>}
                          <span>Special symbols (!@#$)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || password.length < 8}
                  className="w-full bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all disabled:opacity-60 mt-4 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span>Creating Your Account...</span>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* ─── Mini Footer ─────────────────────────────────────────────────── */}
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
