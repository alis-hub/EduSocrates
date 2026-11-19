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

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadBusy(true);
    setErr('');
    setMsg('');
    try {
      await api.hub.submitSchoolLead(leadForm);
      setMsg('Thank you! We have received your enquiry. You can also email us any time at info@gurumera.com.');
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
            <span className="font-bold text-[#249EA0]">Private workspace for every school</span>
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
            { k: 'wizard', label: 'Set up your school' },
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
          <div className="bg-white rounded-3xl border border-[#E7E3D8] shadow-sm p-8 text-center max-w-xl mx-auto">
            <h2 className="text-xl font-extrabold text-[#1E225B]">Set up your school in a minute</h2>
            <p className="text-sm text-slate-600 mt-2">
              Create your workspace with an administrator account. Then add teachers and classes, and share simple class codes with students.
              Independent tuition teachers can set up their own class too.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/start/school" className="bg-[#1E225B] hover:bg-[#141740] text-white font-bold px-6 py-3 rounded-xl text-sm">Set up my school</Link>
              <Link href="/start/teacher" className="border border-[#1E225B] text-[#1E225B] font-bold px-6 py-3 rounded-xl text-sm">I'm a tuition teacher</Link>
            </div>
          </div>
        )}
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
              <p className="text-xs text-slate-500 mt-1">
                Prefer email? Write to <a className="underline" href="mailto:info@gurumera.com">info@gurumera.com</a>.
              </p>
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
