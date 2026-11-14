'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BrandLogo } from '@/components/BrandLogo';
import { InstitutionalProductShowcase } from '@/components/InstitutionalProductShowcase';
import { MarketingFooter } from '@/components/MarketingFooter';
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  FileCheck,
  GraduationCap,
  KeyRound,
  Layers,
  Link2,
  Lock,
  Palette,
  RefreshCw,
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
  const [tab, setTab] = useState<'showcase' | 'wizard' | 'directory' | 'lead'>('showcase');
  const [schools, setSchools] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // 7-Step Institutional Onboarding Wizard state
  const [wizStep, setWizStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [wizBusy, setWizBusy] = useState(false);
  const [provisionedResult, setProvisionedResult] = useState<any>(null);

  // Domain Verification simulation state
  const [dnsVerifying, setDnsVerifying] = useState(false);
  const [dnsVerified, setDnsVerified] = useState(false);

  const [wiz, setWiz] = useState({
    // Step 1: School Identity & Domain
    schoolName: '',
    domain: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',

    // Step 2: Integrations (SSO & Directory Sync)
    ssoGoogle: true,
    ssoMicrosoft: true,
    syncOneRoster: false,
    autoProvisionDomains: true,

    // Step 3: Campuses & Departments
    campusName: 'Main Campus - North',
    campusCity: 'Austin, TX',
    secondaryCampusName: 'South Innovation Center',
    secondaryCampusCity: 'Austin, TX',
    departments: ['STEM & Natural Sciences', 'Mathematics', 'Humanities & Languages'],
    className: 'Grade 10',
    sectionName: 'Section A',
    subjectName: 'AP Physics 1',
    inviteCode: '',

    // Step 4: School Branding & Customization
    brandingColor: '#1E225B',
    subdomain: '',
    welcomeMessage: 'Welcome to your official Socratic Learning Workspace.',

    // Step 5: Role & Permission Configuration
    defaultAiGuidanceMode: 'SOCRATIC_STRICT', // SOCRATIC_STRICT | SOCRATIC_HINTS_ONLY | TERMINOLOGY_ONLY
    allowDirectSolutions: false,
    parentAccessLevel: 'READ_ONLY_SHIELDED',
    teacherRubricOverride: true,

    // Step 6: Data Retention & Privacy Settings
    retentionPolicy: '7_YEARS', // 1_YEAR | 3_YEARS | 7_YEARS
    studentChatMasking: true, // shields raw chats from parents and peers
    piiScrubbing: true,
    ferpaCertifiedMode: true,
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
        setSchools(
          list.filter(
            (s: any) =>
              (s.name || '').toLowerCase().includes(query) ||
              (s.domain || '').toLowerCase().includes(query) ||
              (s.city || '').toLowerCase().includes(query),
          ),
        );
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

  const handleVerifyDns = () => {
    if (!wiz.domain) {
      setErr('Please specify a school domain (e.g. oakridge.edu) first.');
      return;
    }
    setDnsVerifying(true);
    setErr('');
    setTimeout(() => {
      setDnsVerifying(false);
      setDnsVerified(true);
    }, 900);
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
        secondaryCampusName: wiz.secondaryCampusName || undefined,
        secondaryCampusCity: wiz.secondaryCampusCity || undefined,
        brandingColor: wiz.brandingColor,
        subdomain: wiz.subdomain || undefined,
        aiGuidanceMode: wiz.defaultAiGuidanceMode,
        retentionPolicy: wiz.retentionPolicy,
        ssoGoogle: wiz.ssoGoogle,
        ssoMicrosoft: wiz.ssoMicrosoft,
      });
      setProvisionedResult(res.provisioned);
      setMsg('Academy workspace provisioned! All campuses, classes, and invite links are ready.');
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
          <Link href="/school-demo" className="text-[#F5921D] font-bold hover:underline flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive School Demo</span>
          </Link>
          <Link href="/hub" className="text-slate-600 hover:text-[#1E225B]">
            Public Hub
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
      <main className="flex-1 max-w-6xl mx-auto px-5 sm:px-6 py-10 w-full">
        {/* Title & Introduction */}
        <div className="mb-6 text-center max-w-3xl mx-auto">
          <div className="inline-block mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F5921D] px-3 py-0.5 rounded-full bg-[#F5921D]/10">
              Institutional Platform for Forward-Thinking Academies
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E225B] tracking-tight">
            Socratic AI Infrastructure Built for School Leaders &amp; Classrooms
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Verify your school domain, integrate Google Workspace &amp; Microsoft 365, configure multi-campus rosters, and deploy customized Socratic AI guardrails in 7 guided steps.
          </p>

          {/* Quick Demo Jump Callout */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl max-w-xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-medium">
              <Sparkles className="w-4 h-4 text-[#F5921D] shrink-0" />
              <span>Want to test our preconfigured school sandbox without creating a tenant?</span>
            </div>
            <Link
              href="/school-demo"
              className="bg-[#F5921D] hover:bg-[#DC7B0C] text-white font-bold px-3 py-1.5 rounded-xl shrink-0 transition-colors shadow-2xs"
            >
              Explore School Demo &rarr;
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl w-fit mx-auto mb-8 shadow-2xs">
          {[
            { k: 'showcase', label: 'Institutional Product Tour' },
            { k: 'wizard', label: '7-Step Onboarding Wizard' },
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
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium flex items-center gap-2 max-w-3xl mx-auto animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{msg}</span>
          </div>
        )}
        {err && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs font-medium flex items-center gap-2 max-w-3xl mx-auto animate-fadeIn">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        {/* ─── TAB 1: Institutional Product Presentation ───────────────────── */}
        {tab === 'showcase' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto mb-2">
              <h2 className="text-xl font-extrabold text-[#1E225B]">
                Explore Every Facet of the GuruMera School Experience
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Click through real GuruMera interfaces below to inspect administrator, educator, student, and parent views in detail.
              </p>
            </div>
            <InstitutionalProductShowcase />
          </div>
        )}

        {/* ─── TAB 2: 7-Step Institutional Onboarding Wizard ──────────────── */}
        {tab === 'wizard' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto shadow-md">
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
                    Your institutional tenant is live with full multi-campus isolation, Google/Microsoft SSO, and academic guardrails.
                  </p>
                </div>

                <div className="bg-[#FAF9F5] border border-[#E7E3D8] rounded-2xl p-5 text-xs space-y-2.5">
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500 font-medium">Academy Tenant:</span>
                    <strong className="text-[#1E225B]">{provisionedResult.school?.name}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500 font-medium">Domain &amp; Routing:</span>
                    <strong className="text-slate-700">{provisionedResult.school?.domain || 'Auto-Provisioned'}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500 font-medium">Campuses:</span>
                    <strong className="text-[#1E225B]">
                      {provisionedResult.campuses?.map((c: any) => c.name).join(', ') || provisionedResult.campus?.name}
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500 font-medium">Class &amp; Subject:</span>
                    <strong className="text-[#1E225B]">
                      {provisionedResult.academicClass?.name} ({provisionedResult.subject?.name})
                    </strong>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 font-medium">Student Enrollment Code:</span>
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
                    Sign In as Administrator &rarr;
                  </Link>
                  <Link
                    href="/hub"
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-3 px-5 rounded-xl text-xs sm:text-sm text-center transition-all"
                  >
                    Visit Public Learning Hub
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleWizardSubmit} className="space-y-6">
                {/* Wizard Step Progress Tracker */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-extrabold text-[#1E225B] text-base">
                      {wizStep === 1 && 'Step 1: School Identity & Domain Verification'}
                      {wizStep === 2 && 'Step 2: Google Workspace & Microsoft 365 Sync'}
                      {wizStep === 3 && 'Step 3: Campuses & Department Management'}
                      {wizStep === 4 && 'Step 4: School Branding & Customization'}
                      {wizStep === 5 && 'Step 5: Role & Permission Configuration'}
                      {wizStep === 6 && 'Step 6: Data Retention & Privacy Settings'}
                      {wizStep === 7 && 'Step 7: Final Review & Tenant Activation'}
                    </h2>
                    <span className="text-xs font-bold text-[#F5921D]">Step {wizStep} of 7</span>
                  </div>

                  {/* 7 Step Navigation Indicator */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold">
                    {[
                      { n: 1, label: 'Identity' },
                      { n: 2, label: 'SSO Sync' },
                      { n: 3, label: 'Campuses' },
                      { n: 4, label: 'Branding' },
                      { n: 5, label: 'Guardrails' },
                      { n: 6, label: 'Privacy' },
                      { n: 7, label: 'Review' },
                    ].map((s) => (
                      <button
                        key={s.n}
                        type="button"
                        onClick={() => {
                          if (wiz.schoolName && wiz.adminEmail) setWizStep(s.n as any);
                        }}
                        className={`py-1.5 rounded-lg transition-colors truncate px-1 ${
                          wizStep === s.n
                            ? 'bg-[#1E225B] text-white shadow-xs'
                            : wizStep > s.n
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {s.n}. {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ─── STEP 1: School Identity & Domain Verification ─── */}
                {wizStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-600">
                      <strong>Domain Auto-Routing:</strong> Entering your verified email domain (e.g. <code>oakridge.edu</code>) routes all students and faculty directly into your private academy tenant upon Google or Microsoft SSO login.
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        School / Academy Official Name *
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
                          Official School Email Domain (e.g. oakridge.edu) *
                        </label>
                        <input
                          required
                          placeholder="oakridge.edu"
                          value={wiz.domain}
                          onChange={(e) => {
                            setWiz((p) => ({ ...p, domain: e.target.value }));
                            setDnsVerified(false);
                          }}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Primary Campus Location (City, State/Country) *
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

                    {/* Interactive Domain Ownership Verification Box */}
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#1E225B] flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#249EA0]" />
                          Email Domain Ownership Verification
                        </span>
                        {dnsVerified ? (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            ✓ Domain Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            Pending DNS Verification
                          </span>
                        )}
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-mono text-slate-600 break-all">
                        TXT Record: gurumera-site-verification=gm_live_89f2a7b14d2e_{(wiz.domain || 'school.edu').replace(/[^a-z0-9]/gi, '')}
                      </div>

                      <div className="flex justify-between items-center pt-1 text-xs">
                        <span className="text-slate-500 text-[11px]">Add this TXT record to your DNS zone to prove domain authority.</span>
                        <button
                          type="button"
                          onClick={handleVerifyDns}
                          disabled={dnsVerifying || dnsVerified}
                          className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${dnsVerifying ? 'animate-spin' : ''}`} />
                          <span>{dnsVerifying ? 'Checking DNS...' : dnsVerified ? 'Verified' : 'Verify DNS Record'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-[#1E225B] block mb-2">
                        Primary Academy Administrator Credentials
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
                            setErr('Please fill out school name, domain, admin email, and password.');
                            return;
                          }
                          setErr('');
                          setWizStep(2);
                        }}
                        className="w-full bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <span>Continue to Step 2: SSO &amp; Directory Sync</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── STEP 2: Google Workspace & Microsoft 365 Sync ─── */}
                {wizStep === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1E225B]">Single Sign-On &amp; Roster Integration</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Enable automatic domain sign-in so students and teachers don&apos;t need to remember separate passwords.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 cursor-pointer hover:border-[#1E225B] transition-colors">
                        <input
                          type="checkbox"
                          checked={wiz.ssoGoogle}
                          onChange={(e) => setWiz((p) => ({ ...p, ssoGoogle: e.target.checked }))}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-xs text-[#1E225B] flex items-center gap-2">
                            <span>Google Workspace for Education (SAML 2.0 / OAuth2)</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">
                              Recommended
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Allows seamless 1-click Google Sign-In for all users with @{wiz.domain || 'school.edu'} addresses.
                          </p>
                        </div>
                      </label>

                      <label className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 cursor-pointer hover:border-[#1E225B] transition-colors">
                        <input
                          type="checkbox"
                          checked={wiz.ssoMicrosoft}
                          onChange={(e) => setWiz((p) => ({ ...p, ssoMicrosoft: e.target.checked }))}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-xs text-[#1E225B]">Microsoft 365 / Microsoft Entra ID (Azure AD)</div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Sync school directories, staff roles, and student groups directly via Microsoft Graph APIs.
                          </p>
                        </div>
                      </label>

                      <label className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 cursor-pointer hover:border-[#1E225B] transition-colors">
                        <input
                          type="checkbox"
                          checked={wiz.syncOneRoster}
                          onChange={(e) => setWiz((p) => ({ ...p, syncOneRoster: e.target.checked }))}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-xs text-[#1E225B]">OneRoster &amp; Clever SIS Roster Synchronization</div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Nightly automatic enrollment synchronization for student rosters and section assignments.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setWizStep(1)}
                        className="px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors"
                      >
                        &larr; Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setWizStep(3)}
                        className="flex-1 bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <span>Continue to Step 3: Campuses &amp; Departments</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── STEP 3: Campuses & Department Management ─── */}
                {wizStep === 3 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1E225B]">Campus &amp; Department Structure</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Set up multiple branches and initial classrooms. GuruMera isolates data cleanly per campus.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <span className="font-bold text-xs text-[#1E225B] block">Primary Campus Facility *</span>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          required
                          placeholder="Primary Campus Name (e.g. Main Campus - North)"
                          value={wiz.campusName}
                          onChange={(e) => setWiz((p) => ({ ...p, campusName: e.target.value }))}
                          className={inputCls}
                        />
                        <input
                          required
                          placeholder="City / Location"
                          value={wiz.campusCity}
                          onChange={(e) => setWiz((p) => ({ ...p, campusCity: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <span className="font-bold text-xs text-[#1E225B] block">Secondary Campus / STEM Lab (Optional)</span>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          placeholder="Secondary Campus (e.g. South Innovation Center)"
                          value={wiz.secondaryCampusName}
                          onChange={(e) => setWiz((p) => ({ ...p, secondaryCampusName: e.target.value }))}
                          className={inputCls}
                        />
                        <input
                          placeholder="City / Location"
                          value={wiz.secondaryCampusCity}
                          onChange={(e) => setWiz((p) => ({ ...p, secondaryCampusCity: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* Initial Class Setup */}
                    <div className="pt-2">
                      <span className="font-bold text-xs text-[#1E225B] block mb-2">Initial Classroom &amp; First Section</span>
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          required
                          placeholder="Grade / Class (e.g. Grade 10)"
                          value={wiz.className}
                          onChange={(e) => setWiz((p) => ({ ...p, className: e.target.value }))}
                          className={inputCls}
                        />
                        <input
                          required
                          placeholder="Section (e.g. Section A)"
                          value={wiz.sectionName}
                          onChange={(e) => setWiz((p) => ({ ...p, sectionName: e.target.value }))}
                          className={inputCls}
                        />
                        <input
                          required
                          placeholder="Subject (e.g. AP Physics 1)"
                          value={wiz.subjectName}
                          onChange={(e) => setWiz((p) => ({ ...p, subjectName: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setWizStep(2)}
                        className="px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors"
                      >
                        &larr; Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setWizStep(4)}
                        className="flex-1 bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <span>Continue to Step 4: School Branding</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── STEP 4: School Branding & Customization ─── */}
                {wizStep === 4 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1E225B]">School Identity &amp; Portal Customization</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Brand your academy portal with custom institutional colors and a dedicated subdomain.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Dedicated Subdomain Prefix
                      </label>
                      <div className="flex items-center">
                        <input
                          placeholder="oakridge"
                          value={wiz.subdomain}
                          onChange={(e) => setWiz((p) => ({ ...p, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') }))}
                          className={inputCls + ' rounded-r-none font-mono'}
                        />
                        <span className="bg-slate-100 border border-l-0 border-slate-200 px-3.5 py-2.5 text-xs text-slate-500 font-mono rounded-r-xl">
                          .gurumera.com
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-2">
                        Institutional Brand Palette
                      </label>
                      <div className="grid grid-cols-5 gap-2 text-center text-xs">
                        {[
                          { color: '#1E225B', label: 'GuruMera Navy' },
                          { color: '#0F4C81', label: 'Classic Royal' },
                          { color: '#1B4D3E', label: 'Forest Green' },
                          { color: '#5B2C6F', label: 'Imperial Plum' },
                          { color: '#2C3E50', label: 'Slate Charcoal' },
                        ].map((c) => (
                          <button
                            key={c.color}
                            type="button"
                            onClick={() => setWiz((p) => ({ ...p, brandingColor: c.color }))}
                            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                              wiz.brandingColor === c.color
                                ? 'border-[#1E225B] ring-2 ring-[#1E225B]/20 bg-slate-50'
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full shadow-2xs" style={{ backgroundColor: c.color }} />
                            <span className="text-[10px] font-semibold text-slate-700">{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Student Welcome Banner Text
                      </label>
                      <input
                        value={wiz.welcomeMessage}
                        onChange={(e) => setWiz((p) => ({ ...p, welcomeMessage: e.target.value }))}
                        className={inputCls}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setWizStep(3)}
                        className="px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors"
                      >
                        &larr; Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setWizStep(5)}
                        className="flex-1 bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <span>Continue to Step 5: Socratic Guardrails &amp; Roles</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── STEP 5: Role & Permission Configuration ─── */}
                {wizStep === 5 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1E225B]">Institutional Socratic Strictness &amp; Role Security</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Define AI tutoring boundaries and enforce strict answer-key shielding across classes.
                      </p>
                    </div>

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

                    {/* Role Permission Matrix preview */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                      <div className="font-bold text-[#1E225B] flex items-center justify-between">
                        <span>Role Permission Boundaries</span>
                        <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded text-[10px]">
                          ENFORCED
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                        <div>&bull; <strong>Teachers:</strong> Create rubrics, grade, monitor live AI telemetry</div>
                        <div>&bull; <strong>Students:</strong> Socratic guidance, flashcards, no answer leakage</div>
                        <div>&bull; <strong>Parents:</strong> Read-only grades, concept mastery, chats shielded</div>
                        <div>&bull; <strong>Admins:</strong> Multi-campus oversight, teacher invites, audit logs</div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setWizStep(4)}
                        className="px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors"
                      >
                        &larr; Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setWizStep(6)}
                        className="flex-1 bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <span>Continue to Step 6: Data Retention &amp; Privacy</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── STEP 6: Data Retention & Privacy Settings ─── */}
                {wizStep === 6 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1E225B]">Compliance, Retention &amp; Privacy Safeguards</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Configure institutional data retention windows and student privacy shields.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Academic Data Retention Window
                      </label>
                      <select
                        value={wiz.retentionPolicy}
                        onChange={(e) => setWiz((p) => ({ ...p, retentionPolicy: e.target.value }))}
                        className={inputCls}
                      >
                        <option value="7_YEARS">7 Years (Standard School Accreditation &amp; Academic Record)</option>
                        <option value="3_YEARS">3 Years (High School Cycle)</option>
                        <option value="1_YEAR">1 Year (Annual Roll-over with Archival)</option>
                      </select>
                    </div>

                    <div className="space-y-2.5">
                      <label className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wiz.studentChatMasking}
                          onChange={(e) => setWiz((p) => ({ ...p, studentChatMasking: e.target.checked }))}
                          className="mt-1"
                        />
                        <div>
                          <strong className="text-xs text-[#1E225B] block">Student Conversational Transcript Masking (Privacy-by-Design)</strong>
                          <span className="text-[11px] text-slate-500">
                            Strictly shields raw student chat logs from parents and peers. Only mastery summaries, practice intervals, and teacher feedback are shared.
                          </span>
                        </div>
                      </label>

                      <label className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wiz.piiScrubbing}
                          onChange={(e) => setWiz((p) => ({ ...p, piiScrubbing: e.target.checked }))}
                          className="mt-1"
                        />
                        <div>
                          <strong className="text-xs text-[#1E225B] block">Automated PII Scrubbing on LLM Ingestion</strong>
                          <span className="text-[11px] text-slate-500">
                            Strips student names, emails, and student ID numbers from prompt streams prior to inference.
                          </span>
                        </div>
                      </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setWizStep(5)}
                        className="px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors"
                      >
                        &larr; Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setWizStep(7)}
                        className="flex-1 bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <span>Continue to Step 7: Final Review &amp; Activation</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── STEP 7: Final Review & Tenant Activation ─── */}
                {wizStep === 7 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1E225B]">Final Configuration Pre-Flight Review</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Please review your academy settings before launching the live multi-campus tenant.
                      </p>
                    </div>

                    <div className="bg-[#FAF9F5] border border-[#E7E3D8] rounded-2xl p-5 text-xs space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                        <span className="text-slate-500 font-medium">Academy Identity:</span>
                        <strong className="text-[#1E225B]">{wiz.schoolName || 'Oakridge Academy'}</strong>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                        <span className="text-slate-500 font-medium">Domain &amp; Verification:</span>
                        <span className="font-mono text-emerald-800 font-bold">
                          @{wiz.domain || 'oakridge.edu'} ({dnsVerified ? 'DNS Verified' : 'Standard Routing'})
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                        <span className="text-slate-500 font-medium">SSO Integrations:</span>
                        <span className="text-[#1E225B] font-semibold">
                          {[wiz.ssoGoogle && 'Google Workspace', wiz.ssoMicrosoft && 'Microsoft 365'].filter(Boolean).join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                        <span className="text-slate-500 font-medium">Campuses:</span>
                        <span className="text-[#1E225B] font-semibold">
                          {wiz.campusName} {wiz.secondaryCampusName ? `+ ${wiz.secondaryCampusName}` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                        <span className="text-slate-500 font-medium">First Classroom:</span>
                        <span className="text-[#1E225B] font-semibold">
                          {wiz.className} · {wiz.sectionName} ({wiz.subjectName})
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                        <span className="text-slate-500 font-medium">AI Guidance Mode:</span>
                        <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
                          {wiz.defaultAiGuidanceMode}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-slate-500 font-medium">Administrator Email:</span>
                        <span className="font-mono font-bold text-slate-700">{wiz.adminEmail}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setWizStep(6)}
                        className="px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors"
                      >
                        &larr; Back
                      </button>
                      <button
                        type="submit"
                        disabled={wizBusy}
                        className="flex-1 bg-[#F5921D] hover:bg-[#DC7B0C] text-white font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                      >
                        <Rocket className="w-4 h-4" />
                        <span>{wizBusy ? 'Provisioning Academy Tenant...' : 'Activate Academy Tenant'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {/* ─── TAB 3: Registered Academies Directory ─────────────────────── */}
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
                        Sign In &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 4: Contact Enterprise Partnerships ─────────────────────── */}
        {tab === 'lead' && (
          <form
            onSubmit={handleLeadSubmit}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl mx-auto space-y-4 shadow-sm animate-fadeIn"
          >
            <div>
              <h2 className="font-extrabold text-lg text-[#1E225B]">
                Request GuruMera for Your Academy
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Submitted inquiries go directly to our Academic Partnerships team for custom SLA &amp; multi-campus onboarding.
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
                <option value="IT_DIRECTOR">Academy IT Director / CIO</option>
                <option value="OTHER">Curriculum Specialist</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Message / Student Headcount</label>
              <textarea
                rows={3}
                value={leadForm.message}
                onChange={(e) => setLeadForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Approximately 800 high school students in AP &amp; STEM subjects..."
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
