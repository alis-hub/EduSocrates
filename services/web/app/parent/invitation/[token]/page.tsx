'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, setStoredAuth } from '@/lib/api';
import { BrandLogo } from '@/components/BrandLogo';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Heart,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';

export default function AcceptParentInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = (params?.token as string) || '';

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Missing invitation token.');
      setLoading(false);
      return;
    }

    api
      .validateParentInvitation(token)
      .then((res) => {
        if (!res.valid) {
          setError(res.error || 'This invitation is invalid or has expired.');
        } else {
          setInvitation(res);
          if (res.invitedParentName) {
            const parts = res.invitedParentName.split(' ');
            setFirstName(parts[0] || '');
            setLastName(parts.slice(1).join(' ') || '');
          }
        }
      })
      .catch((err) => {
        setError(err.message || 'Unable to validate invitation. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!invitation?.existingAccount) {
      if (password.length < 8) {
        setSubmitError('Password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setSubmitError('Passwords do not match.');
        return;
      }
      if (!agreeTerms) {
        setSubmitError('Please accept the Terms of Service & Privacy Policy.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const authRes = await api.acceptParentInvitation({
        token,
        password: password || undefined,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });

      if (authRes?.accessToken && authRes?.user) {
        setStoredAuth(authRes.accessToken, authRes.user);
        router.push('/parent');
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to complete invitation acceptance.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-between text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <BrandLogo variant="navbar" />
          <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-[#1E225B]">
            Parent Sign In →
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-md w-full mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3 shadow-xs">
            <div className="w-10 h-10 border-3 border-[#1E225B] border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-sm font-bold text-slate-700">Verifying secure invitation...</div>
            <p className="text-xs text-slate-400">Connecting with school authorization registry</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-rose-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Invitation Invalid or Expired</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
            <div className="pt-2 text-xs text-slate-500 border-t border-slate-100">
              Please contact your child’s school administration to issue a new invitation link.
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/parents"
                className="bg-[#1E225B] text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Back to Parents Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-5">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#249EA0] bg-[#249EA0]/10 px-3 py-0.5 rounded-full mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> School-Verified Invitation
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E225B]">
                Welcome to GuruMera
              </h1>
              <p className="text-xs text-slate-500">
                You were invited to connect with your child&apos;s educational progress.
              </p>
            </div>

            {/* School & Student Association Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Academy / School:</span>
                <span className="font-extrabold text-slate-900">{invitation.schoolName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-[#1E225B]">{invitation.studentName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Authorized Relationship:</span>
                <span className="font-semibold text-slate-700">{invitation.relationshipType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Invited Email:</span>
                <span className="font-mono text-slate-800">{invitation.invitedEmail}</span>
              </div>
            </div>

            {invitation.existingAccount ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 leading-relaxed">
                  <strong>Existing Parent Account Detected:</strong> An account already exists for{' '}
                  <span className="font-mono">{invitation.invitedEmail}</span>. Accepting will associate{' '}
                  <strong>{invitation.studentName}</strong> with your existing dashboard without creating duplicate
                  accounts.
                </div>

                <form onSubmit={handleAccept}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-3 rounded-xl text-xs shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{submitting ? 'Linking Student...' : 'Confirm & Link Student to Dashboard'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleAccept} className="space-y-3.5 text-xs">
                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">First Name</label>
                    <input
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#1E225B]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Last Name</label>
                    <input
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#1E225B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Verified Email Address</label>
                  <input
                    readOnly
                    disabled
                    value={invitation.invitedEmail}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 font-mono cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Email address is locked to the official school invitation.
                  </span>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Create Password (min 8 chars)</label>
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#1E225B]"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Confirm Password</label>
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#1E225B]"
                  />
                </div>

                <label className="flex items-start gap-2 pt-1 cursor-pointer text-slate-600 text-[11px]">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-[#1E225B]"
                  />
                  <span>
                    I confirm I am an authorized guardian of {invitation.studentName} and agree to GuruMera’s{' '}
                    <span className="font-bold underline text-[#1E225B]">Terms of Service</span> and{' '}
                    <span className="font-bold underline text-[#1E225B]">Privacy Policy</span>.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-3 rounded-xl text-xs shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  <span>{submitting ? 'Creating Parent Account...' : 'Activate Account & Access Dashboard'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200/80">
        GuruMera · Discover the Why! · School-Verified Guardian Portal
      </footer>
    </div>
  );
}
