'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BrandLogo } from '@/components/BrandLogo';
import { MarketingFooter } from '@/components/MarketingFooter';
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  GraduationCap,
  KeyRound,
  Link2,
  Lock,
  Rocket,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';

export default function SchoolsPage() {
  const [tab, setTab] = useState<'wizard' | 'directory' | 'lead'>('wizard');
  const [schools, setSchools] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // 3-Step Wizard state
  const [wizStep, setWizStep] = useState<1 | 2 | 3>(1);
  const [wizBusy, setWizBusy] = useState(false);
  const [provisionedResult, setProvisionedResult] = useState<any>(null);

  const [wiz, setWiz] = useState({
    // Step 1: School Identity & Domain
    schoolName: '',
    domain: '',
    campusName: 'Main Campus',
    campusCity: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',

    // Step 2: Socratic Guardrail Customization
    defaultAiGuidanceMode: 'SOCRATIC_STRICT', // SOCRATIC_STRICT | SOCRATIC_HINTS_ONLY | TERMINOLOGY_ONLY
    allowDirectSolutions: false,
    aiProvider: 'gemini',
    flaggedThreatThreshold: 'SUSPICIOUS',

    // Step 3: Class, Department & Invite Generation
    className: 'Grade 10',
    sectionName: 'Section A',
    subjectName: 'AP Physics 1',
    inviteCode: '',
  });

  // Lead Form state
  const [leadBusy, setLeadBusy] = useState(false);
  const [leadForm, setLeadForm] = useState({
    schoolName: '',
    domain: '',
    campusCity: '',
    requesterEmail: '',
    requesterName: '',
    roleType: 'ADMIN',
    message: '',
  });

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async (q?: string) => {
    setLoading(true);
    try {
      const res = await api.hub.getPublicSchools();
      const list = res.schools || [];
      if (q && q.trim()) {
        const query = q.toLowerCase();
        setSchools(list.filter((s: any) =>
          (s.name || '').toLowerCase().includes(query) ||
          (s.domain || '').toLowerCase().includes(query) ||
          (s.city || '').toLowerCase().includes(query)
        ));
      } else {
        setSchools(list);
      }
    } catch (e: any) {
      setErr(e.message || 'Failed to load school directory');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadSchools(search);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadBusy(true);
    setErr('');
    setMsg('');
    try {
      await api.hub.submitSchoolLead(leadForm);
      setMsg('Thank you! Your school inquiry has been sent to our Academic Partnerships team.');
      setLeadForm({
        schoolName: '',
        domain: '',
        campusCity: '',
        requesterEmail: '',
        requesterName: '',
        roleType: 'ADMIN',
        message: '',
      });
    } catch (e: any) {
      setErr(e.message || 'Failed to submit inquiry');
    } finally {
      setLeadBusy(false);
    }
  };

  const handleWizardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWizBusy(true);
    setErr('');
    setMsg('');
    try {
      const res = await api.hub.onboardingWizard({
        schoolName: wiz.schoolName,
        domain: wiz.domain || undefined,
        campusName: wiz.campusName,
        campusCity: wiz.campusCity,
        adminFirstName: wiz.adminFirstName,
        adminLastName: wiz.adminLastName,
        adminEmail: wiz.adminEmail,
        adminPassword: wiz.adminPassword,
        className: wiz.className,
        sectionName: wiz.sectionName,
        subjectName: wiz.subjectName,
        inviteCode: wiz.inviteCode || undefined,
      });
      setProvisionedResult(res.provisioned);
      setMsg('Academy workspace provisioned! All classes and invite links are ready.');
    } catch (e: any) {
      setErr(e.message || 'Provisioning failed');
    } finally {
      setWizBusy(false);
    }
  };

  const inputCls =
    'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#1E225B] focus:border-transparent transition-all bg-white';

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E225B] flex flex-col font-sans">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E7E3D8] sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo variant="navbar" />
          </Link>
          <span className="text-xs bg-[#1E225B]/10 text-[#1E225B] px-2.5 py-0.5 rounded-full font-bold">
            Schools &amp; Academies
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <Link href="/hub" className="text-slate-600 hover:text-[#1E225B]">
            Public Hub
          </Link>
          <Link href="/try-teacher" className="text-slate-600 hover:text-[#249EA0]">
            Teacher Demo
          </Link>
          <Link href="/login" className="bg-[#1E225B] hover:bg-[#141740] text-white px-3.5 py-1.5 rounded-lg transition-colors">
            Sign In
          </Link>
        </div>
      </header>

      {/* ─── Compliance & Safety Banner (Top Focus for Administrators) ─── */}
      <section className="bg-gradient-to-r from-[#1E225B] via-[#141740] to-[#1E225B] text-white py-4 px-6 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-around gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#249EA0]" />
            <span className="font-bold text-[#249EA0]">FERPA &amp; COPPA Certified Architecture</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#F5921D]" />
            <span>Multi-Tenant PostgreSQL Row-Level Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Eliminates Homework Cheating &amp; Answer Leaks</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Saves 15+ Hours/Week in Teacher Remediation</span>
          </div>
        </div>
      </section>

      {/* ─── Main Content ────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto px-5 sm:px-6 py-10 w-full">
        {/* Title & Introduction */}
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <div className="inline-block mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F5921D] px-3 py-0.5 rounded-full bg-[#F5921D]/10">
              Institutional Onboarding
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E225B] tracking-tight">
            Deploy GuruMera Across Your Academy in Minutes
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Verify your school domain, set customized Socratic AI guardrails, and generate ready-to-share teacher and student invite links in 3 simple steps.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl w-fit mx-auto mb-8 shadow-2xs">
          {[
            { k: 'wizard', label: '3-Step Onboarding Wizard' },
            { k: 'directory', label: 'Registered Academies' },
            { k: 'lead', label: 'Contact Enterprise Partnerships' },
          ].map((t) => (
            <button
              key={t.k}
              type="button"
              onClick={() => {
                setTab(t.k as any);
                setErr('');
                setMsg('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === t.k
                  ? 'bg-[#1E225B] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1E225B] hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Status Banners */}
        {msg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium flex items-center gap-2 max-w-2xl mx-auto animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{msg}</span>
          </div>
        )}
        {err && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs font-medium flex items-center gap-2 max-w-2xl mx-auto animate-fadeIn">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        {/* ─── TAB 1: 3-Step Onboarding Wizard ───────────────────────────── */}
        {tab === 'wizard' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-md">
            {provisionedResult ? (
              <div className="space-y-5 animate-fadeIn">
                <div className="text-center py-2">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-extrabold text-[#1E225B]">
                    Academy Workspace Provisioned Successfully!
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Your institutional tenant is live with full multi-campus isolation and academic guardrails.
                  </p>
                </div>

                <div className="bg-[#FAF9F5] border border-[#E7E3D8] rounded-xl p-5 text-xs space-y-2.5">
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500 font-medium">Academy:</span>
                    <strong className="text-[#1E225B]">{provisionedResult.school?.name}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500 font-medium">Campus:</span>
                    <strong className="text-[#1E225B]">{provisionedResult.campus?.name}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500 font-medium">Class &amp; Subject:</span>
                    <strong className="text-[#1E225B]">
                      {provisionedResult.academicClass?.name} ({provisionedResult.subject?.name})
                    </strong>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 font-medium">Student Invite Code:</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded font-mono font-bold text-sm">
                        {provisionedResult.inviteCode}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(provisionedResult.inviteCode);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="text-slate-500 hover:text-[#1E225B] p-1"
                        title="Copy code"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {copiedCode && (
                    <div className="text-[11px] text-right text-emerald-600 font-semibold">
                      Copied to clipboard!
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/login"
                    className="flex-1 bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-3 rounded-xl text-xs sm:text-sm text-center shadow-md transition-all"
                  >
                    Sign In as Administrator →
                  </Link>
                  <Link
                    href="/hub"
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-3 px-5 rounded-xl text-xs sm:text-sm text-center transition-all"
                  >
                    Visit Public Hub
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleWizardSubmit} className="space-y-6">
                {/* Wizard Step Progress Tracker */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-extrabold text-[#1E225B] text-base">
                      {wizStep === 1 && 'Step 1 of 3: Verify School Domain & Identity'}
                      {wizStep === 2 && 'Step 2 of 3: Customize Socratic Rules & AI Strictness'}
                      {wizStep === 3 && 'Step 3 of 3: Generate Teacher Invite Links & Class'}
                    </h2>
                    <span className="text-xs font-semibold text-[#F5921D]">Step {wizStep} / 3</span>
                  </div>

                  {/* Step Pills */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setWizStep(1)}
                      className={`py-1.5 rounded-lg transition-colors ${
                        wizStep === 1
                          ? 'bg-[#1E225B] text-white'
                          : wizStep > 1
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      1. Domain &amp; Campus
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (wiz.schoolName && wiz.adminEmail && wiz.adminPassword) setWizStep(2);
                      }}
                      className={`py-1.5 rounded-lg transition-colors ${
                        wizStep === 2
                          ? 'bg-[#1E225B] text-white'
                          : wizStep > 2
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      2. Socratic Rules
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (wiz.schoolName && wiz.adminEmail && wiz.adminPassword) setWizStep(3);
                      }}
                      className={`py-1.5 rounded-lg transition-colors ${
                        wizStep === 3
                          ? 'bg-[#1E225B] text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      3. Invite Links
                    </button>
                  </div>
                </div>

                {/* ─── STEP 1: School Identity & Domain ─── */}
                {wizStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-600">
                      <strong>Domain Auto-Routing:</strong> Entering your school domain (e.g. <code>oakridge.edu</code>) ensures all faculty and students signing in with Google or email automatically join your tenant.
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        School / Academy Name *
                      </label>
                      <input
                        required
                        placeholder="e.g. Oakridge STEM Academy"
                        value={wiz.schoolName}
                        onChange={(e) => setWiz((p) => ({ ...p, schoolName: e.target.value }))}
                        className={inputCls}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          School Domain (e.g. oakridge.edu)
                        </label>
                        <input
                          placeholder="oakridge.edu"
                          value={wiz.domain}
                          onChange={(e) => setWiz((p) => ({ ...p, domain: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Primary Campus Location *
                        </label>
                        <input
                          required
                          placeholder="e.g. Austin, TX"
                          value={wiz.campusCity}
                          onChange={(e) => setWiz((p) => ({ ...p, campusCity: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-[#1E225B] block mb-2">
                        Initial Administrator Account
                      </span>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                          required
                          placeholder="Admin First Name"
                          value={wiz.adminFirstName}
                          onChange={(e) => setWiz((p) => ({ ...p, adminFirstName: e.target.value }))}
                          className={inputCls}
                        />
                        <input
                          required
                          placeholder="Admin Last Name"
                          value={wiz.adminLastName}
                          onChange={(e) => setWiz((p) => ({ ...p, adminLastName: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          required
                          type="email"
                          placeholder="admin@oakridge.edu"
                          value={wiz.adminEmail}
                          onChange={(e) => setWiz((p) => ({ ...p, adminEmail: e.target.value }))}
                          className={inputCls}
                        />
                        <input
                          required
                          type="password"
                          minLength={6}
                          placeholder="Password (min 6 chars)"
                          value={wiz.adminPassword}
                          onChange={(e) => setWiz((p) => ({ ...p, adminPassword: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (!wiz.schoolName || !wiz.adminEmail || !wiz.adminPassword) {
                            setErr('Please fill out school name, admin email, and password.');
                            return;
                          }
                          setErr('');
                          setWizStep(2);
                        }}
                        className="w-full bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <span>Continue to Step 2: Socratic Rules</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── STEP 2: Customize Socratic Rules ─── */}
                {wizStep === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#1E225B] block">
                        Institutional AI Guidance Strictness
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Controls how the Socratic Tutor interacts with your enrolled students across all assignments.
                      </p>
                    </div>

                    {/* Radio Options */}
                    <div className="space-y-2.5">
                      {[
                        {
                          val: 'SOCRATIC_STRICT',
                          title: 'Socratic Strict (Recommended)',
                          desc: 'Never gives away direct solutions. Poses progressive diagnostic questions and checks logic step by step.',
                        },
                        {
                          val: 'SOCRATIC_HINTS_ONLY',
                          title: 'Hints Only',
                          desc: 'Allows up to 2 directional hints per homework turn before prompting student to reason.',
                        },
                        {
                          val: 'TERMINOLOGY_ONLY',
                          title: 'Terminology Clarification Only',
                          desc: 'Explains definitions, notation, and vocabulary only; leaves problem-solving entirely unassisted.',
                        },
                      ].map((item) => (
                        <label
                          key={item.val}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                            wiz.defaultAiGuidanceMode === item.val
                              ? 'border-[#1E225B] bg-[#1E225B]/5 shadow-xs'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="guidanceMode"
                            value={item.val}
                            checked={wiz.defaultAiGuidanceMode === item.val}
                            onChange={(e) => setWiz((p) => ({ ...p, defaultAiGuidanceMode: e.target.value }))}
                            className="mt-0.5 text-[#1E225B]"
                          />
                          <div>
                            <div className="font-bold text-xs text-[#1E225B]">{item.title}</div>
                            <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{item.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Additional Safety Controls */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">Server-Side Answer-Key Shielding</span>
                        <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded text-[10px]">
                          ENFORCED
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Teacher answer keys and rubric solutions are cryptographically shielded from client prompts.
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setWizStep(1)}
                        className="px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setWizStep(3)}
                        className="flex-1 bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <span>Continue to Step 3: Class &amp; Invite Links</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── STEP 3: Generate Teacher Invite Links & Class ─── */}
                {wizStep === 3 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <span className="text-xs font-bold text-[#1E225B] block mb-1">
                        Initial Academic Department &amp; Class
                      </span>
                      <p className="text-[11px] text-slate-500 mb-3">
                        Set up your first classroom section. You can add unlimited classes, teachers, and rosters later.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Class / Grade</label>
                        <input
                          required
                          placeholder="Grade 10"
                          value={wiz.className}
                          onChange={(e) => setWiz((p) => ({ ...p, className: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Section</label>
                        <input
                          required
                          placeholder="Section A"
                          value={wiz.sectionName}
                          onChange={(e) => setWiz((p) => ({ ...p, sectionName: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">First Subject</label>
                        <input
                          required
                          placeholder="e.g. AP Physics 1"
                          value={wiz.subjectName}
                          onChange={(e) => setWiz((p) => ({ ...p, subjectName: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Custom Student Invite Code (optional)
                        </label>
                        <input
                          placeholder="e.g. OAKRIDGE-2026"
                          value={wiz.inviteCode}
                          onChange={(e) => setWiz((p) => ({ ...p, inviteCode: e.target.value.toUpperCase() }))}
                          className={inputCls + ' uppercase font-mono'}
                        />
                      </div>
                    </div>

                    {/* Visual Preview of Links */}
                    <div className="bg-[#FAF9F5] border border-[#E7E3D8] rounded-xl p-3.5 text-xs space-y-1.5">
                      <div className="font-bold text-[#1E225B] flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-[#F5921D]" /> Auto-Generated Access Links
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Once launched, an instant Teacher Onboarding Link and Student Enrollment Code will be generated and assigned to your academy.
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setWizStep(2)}
                        className="px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={wizBusy}
                        className="flex-1 bg-[#F5921D] hover:bg-[#DC7B0C] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                      >
                        <Rocket className="w-4 h-4" />
                        <span>{wizBusy ? 'Provisioning Academy...' : 'Launch Academy Workspace'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {/* ─── TAB 2: Registered Academies Directory ─────────────────────── */}
        {tab === 'directory' && (
          <div className="space-y-4 max-w-4xl mx-auto animate-fadeIn">
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mb-6">
              <input
                type="text"
                placeholder="Search academy name, city, or domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inputCls}
              />
              <button
                type="submit"
                className="bg-[#1E225B] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#141740] flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" /> Search
              </button>
            </form>

            {loading ? (
              <div className="text-center py-12 text-xs text-slate-400">Loading directory...</div>
            ) : schools.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-xs text-slate-500">
                No registered academies found matching &quot;{search}&quot;. Request yours in the next tab!
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {schools.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-[#1E225B]" />
                        <h3 className="font-bold text-sm text-[#1E225B]">{s.name}</h3>
                      </div>
                      <div className="text-xs text-slate-500">{s.domain || 'Verified Campus Tenant'}</div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Status: <strong className="text-emerald-700">ACTIVE</strong></span>
                      <Link href="/login" className="text-[#F5921D] font-bold hover:underline">
                        Sign In →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: Contact Enterprise Partnerships ─────────────────────── */}
        {tab === 'lead' && (
          <form
            onSubmit={handleLeadSubmit}
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto space-y-4 shadow-sm animate-fadeIn"
          >
            <div>
              <h2 className="font-extrabold text-lg text-[#1E225B]">
                Request GuruMera for Your Academy
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Submitted inquiries go directly to our Academic Partnerships team for custom SLA &amp; district deployment.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Your Full Name *</label>
              <input
                required
                value={leadForm.requesterName}
                onChange={(e) => setLeadForm((p) => ({ ...p, requesterName: e.target.value }))}
                placeholder="Dr. Jordan Miller"
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Work Email (@school.edu) *</label>
              <input
                required
                type="email"
                value={leadForm.requesterEmail}
                onChange={(e) => setLeadForm((p) => ({ ...p, requesterEmail: e.target.value }))}
                placeholder="jmiller@oakridge.edu"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Academy Name *</label>
                <input
                  required
                  value={leadForm.schoolName}
                  onChange={(e) => setLeadForm((p) => ({ ...p, schoolName: e.target.value }))}
                  placeholder="Oakridge Academy"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">City / Region *</label>
                <input
                  required
                  value={leadForm.campusCity}
                  onChange={(e) => setLeadForm((p) => ({ ...p, campusCity: e.target.value }))}
                  placeholder="Austin, TX"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Your Role</label>
              <select
                value={leadForm.roleType}
                onChange={(e) => setLeadForm((p) => ({ ...p, roleType: e.target.value }))}
                className={inputCls}
              >
                <option value="ADMIN">Head of School / Academy Principal</option>
                <option value="TEACHER">Department Chair / Educator</option>
                <option value="IT_DIRECTOR">District / Academy IT Director</option>
                <option value="OTHER">Curriculum Specialist</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Message / Student Headcount</label>
              <textarea
                rows={3}
                value={leadForm.message}
                onChange={(e) => setLeadForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Approximately 800 high school students in AP & STEM subjects..."
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              disabled={leadBusy}
              className="w-full bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{leadBusy ? 'Submitting...' : 'Submit Academy Inquiry'}</span>
            </button>
          </form>
        )}
      </main>

      {/* ─── Marketing Footer ────────────────────────────────────────────── */}
      <MarketingFooter />
    </div>
  );
}
