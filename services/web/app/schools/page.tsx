'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  BookOpen,
  Building2,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Rocket,
  Send,
} from 'lucide-react';

export default function SchoolsPortalPage() {
  const [tab, setTab] = useState<'directory' | 'lead' | 'wizard'>('directory');
  const [schools, setSchools] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Lead Form
  const [leadForm, setLeadForm] = useState({
    requesterEmail: '',
    schoolName: '',
    campusCity: '',
    roleType: 'TEACHER',
  });
  const [leadBusy, setLeadBusy] = useState(false);

  // 6-Step Onboarding Wizard Form
  const [wizStep, setWizStep] = useState(1);
  const [wizBusy, setWizBusy] = useState(false);
  const [provisionedResult, setProvisionedResult] = useState<any>(null);
  const [wiz, setWiz] = useState({
    schoolName: '',
    domain: '',
    campusName: 'Main Campus',
    campusCity: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
    className: 'Grade 10 STEM',
    academicYear: '2026-2027',
    sectionName: 'Section A',
    subjectName: 'AP Physics 1',
    inviteCode: '',
  });

  useEffect(() => {
    api.hub
      .getPublicSchools()
      .then((res) => setSchools(res.schools || []))
      .catch(() => setSchools([]));
  }, []);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadBusy(true);
    setErr('');
    setMsg('');
    try {
      const res: any = await api.hub.submitSchoolLead(leadForm);
      setMsg(res.message || 'School interest inquiry recorded!');
      setLeadForm({ requesterEmail: '', schoolName: '', campusCity: '', roleType: 'TEACHER' });
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
    try {
      const res = await api.hub.onboardingWizard(wiz);
      setProvisionedResult(res.provisioned);
      setMsg('Institution provisioned! Redirecting to School Admin Portal...');
    } catch (e: any) {
      setErr(e.message || 'Provisioning failed');
    } finally {
      setWizBusy(false);
    }
  };

  const inputCls =
    'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/hub" className="flex items-center gap-2 font-bold text-slate-900">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            EduSocrates
          </Link>
          <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-semibold">
            Schools &amp; Onboarding
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium">
          <Link href="/hub" className="text-slate-600 hover:text-indigo-600">
            Public Hub
          </Link>
          <Link href="/try-teacher" className="text-slate-600 hover:text-emerald-600">
            Try as Teacher
          </Link>
          <Link href="/login" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg">
            Sign In
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Institutional Directory &amp; Self-Serve Onboarding
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Check whether your school already runs EduSocrates, request an invitation, or launch a live school tenant in 6 guided steps.
          </p>
        </div>

        <div className="flex gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl w-fit mb-6">
          {[
            { k: 'directory', label: 'Registered Schools' },
            { k: 'lead', label: 'Request / Suggest Your School' },
            { k: 'wizard', label: 'Self-Serve Onboarding Wizard' },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => {
                setTab(t.k as any);
                setErr('');
                setMsg('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                tab === t.k ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {msg && (
          <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {msg}
          </div>
        )}
        {err && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {err}
          </div>
        )}

        {/* Directory */}
        {tab === 'directory' && (
          <div className="grid md:grid-cols-2 gap-4">
            {schools.map((s) => (
              <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-600" /> {s.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{s.domain || s.slug}</p>
                  </div>
                  <span className="text-[11px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                    Active
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  {(Array.isArray(s.campuses) ? s.campuses : []).map((c: any) => (
                    <div key={c.id} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {c.name}
                      {c.address ? ` — ${c.address}` : ''}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Have an invite code?</span>
                  <Link href="/hub" className="text-indigo-600 font-semibold hover:underline">
                    Redeem in Hub →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lead Form */}
        {tab === 'lead' && (
          <form
            onSubmit={handleLeadSubmit}
            className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl space-y-4 shadow-sm"
          >
            <h2 className="font-bold text-lg text-slate-900">Request EduSocrates for Your School</h2>
            <p className="text-xs text-slate-600">
              Submitted inquiries go directly to the Platform Super Admin Lead Queue.
            </p>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Your Work or Student Email *</label>
              <input
                required
                type="email"
                value={leadForm.requesterEmail}
                onChange={(e) => setLeadForm((p) => ({ ...p, requesterEmail: e.target.value }))}
                placeholder="principal@oakridge.edu"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">School / Institution Name *</label>
              <input
                required
                value={leadForm.schoolName}
                onChange={(e) => setLeadForm((p) => ({ ...p, schoolName: e.target.value }))}
                placeholder="Oakridge High School"
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">City / Region *</label>
                <input
                  required
                  value={leadForm.campusCity}
                  onChange={(e) => setLeadForm((p) => ({ ...p, campusCity: e.target.value }))}
                  placeholder="Austin, TX"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Your Role</label>
                <select
                  value={leadForm.roleType}
                  onChange={(e) => setLeadForm((p) => ({ ...p, roleType: e.target.value }))}
                  className={inputCls + ' bg-white'}
                >
                  <option value="ADMIN">School Administrator</option>
                  <option value="TEACHER">Teacher / Department Head</option>
                  <option value="STUDENT">Student</option>
                  <option value="PARENT">Parent</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={leadBusy}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {leadBusy ? 'Submitting...' : 'Submit School Inquiry'}
            </button>
          </form>
        )}

        {/* 6-Step Self-Serve Onboarding Wizard */}
        {tab === 'wizard' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-2xl shadow-sm">
            {provisionedResult ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg">
                  <GraduationCap className="w-6 h-6" /> School Workspace Provisioned!
                </div>
                <p className="text-sm text-slate-600">
                  Your multi-tenant school, campus, admin account, initial section, and student invite code are ready.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm space-y-1.5">
                  <div><span className="font-semibold">School:</span> {provisionedResult.school?.name}</div>
                  <div><span className="font-semibold">Campus:</span> {provisionedResult.campus?.name}</div>
                  <div><span className="font-semibold">Class &amp; Section:</span> {provisionedResult.academicClass?.name} / {provisionedResult.section?.name}</div>
                  <div><span className="font-semibold">Subject:</span> {provisionedResult.subject?.name}</div>
                  <div>
                    <span className="font-semibold">Student Invite Code:</span>{' '}
                    <code className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                      {provisionedResult.inviteCode}
                    </code>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/admin';
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm"
                >
                  Open School Admin Dashboard →
                </button>
              </div>
            ) : (
              <form onSubmit={handleWizardSubmit} className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="font-bold text-slate-900">6-Step School Provisioning Wizard</h2>
                    <p className="text-xs text-slate-500">Step {wizStep} of 3 (Atomic PostgreSQL Provisioning)</p>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setWizStep(s)}
                        className={`w-7 h-7 rounded-full text-xs font-bold ${
                          wizStep === s ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {wizStep === 1 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-purple-800">Step 1–2: School Identity &amp; Campus</h3>
                    <input
                      required
                      placeholder="School Name (e.g. Oakridge STEM Academy)"
                      value={wiz.schoolName}
                      onChange={(e) => setWiz((p) => ({ ...p, schoolName: e.target.value }))}
                      className={inputCls}
                    />
                    <input
                      placeholder="Domain (optional, e.g. oakridge.edu)"
                      value={wiz.domain}
                      onChange={(e) => setWiz((p) => ({ ...p, domain: e.target.value }))}
                      className={inputCls}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        required
                        placeholder="Primary Campus Name"
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
                    <button
                      type="button"
                      onClick={() => setWizStep(2)}
                      className="bg-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                    >
                      Next: Admin Account →
                    </button>
                  </div>
                )}

                {wizStep === 2 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-purple-800">Step 3: School Administrator Account</h3>
                    <div className="grid grid-cols-2 gap-3">
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
                    <input
                      required
                      type="email"
                      placeholder="Admin Email"
                      value={wiz.adminEmail}
                      onChange={(e) => setWiz((p) => ({ ...p, adminEmail: e.target.value }))}
                      className={inputCls}
                    />
                    <input
                      required
                      type="password"
                      minLength={6}
                      placeholder="Admin Password (min 6 chars)"
                      value={wiz.adminPassword}
                      onChange={(e) => setWiz((p) => ({ ...p, adminPassword: e.target.value }))}
                      className={inputCls}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setWizStep(1)}
                        className="border border-slate-200 text-xs px-4 py-2 rounded-lg"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setWizStep(3)}
                        className="bg-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                      >
                        Next: First Class, Subject &amp; Invite Code →
                      </button>
                    </div>
                  </div>
                )}

                {wizStep === 3 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-purple-800">
                      Step 4–6: Academic Hierarchy &amp; Invite Code
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        required
                        placeholder="Class Name (e.g. Grade 10)"
                        value={wiz.className}
                        onChange={(e) => setWiz((p) => ({ ...p, className: e.target.value }))}
                        className={inputCls}
                      />
                      <input
                        required
                        placeholder="Section Name (e.g. Section A)"
                        value={wiz.sectionName}
                        onChange={(e) => setWiz((p) => ({ ...p, sectionName: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        required
                        placeholder="First Subject (e.g. AP Physics 1)"
                        value={wiz.subjectName}
                        onChange={(e) => setWiz((p) => ({ ...p, subjectName: e.target.value }))}
                        className={inputCls}
                      />
                      <input
                        placeholder="Custom Invite Code (optional)"
                        value={wiz.inviteCode}
                        onChange={(e) => setWiz((p) => ({ ...p, inviteCode: e.target.value }))}
                        className={inputCls + ' uppercase font-mono'}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setWizStep(2)}
                        className="border border-slate-200 text-xs px-4 py-2 rounded-lg"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={wizBusy}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
                      >
                        <Rocket className="w-4 h-4" />
                        {wizBusy ? 'Provisioning School...' : 'Launch School Atomically'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
