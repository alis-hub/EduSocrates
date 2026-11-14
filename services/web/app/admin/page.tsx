'use client';
import { useEffect, useState } from 'react';
import { api, getStoredUser, logout } from '@/lib/api';
import { BrandLogo } from '@/components/BrandLogo';
import {
  BookOpen, Users, Building2, Grid3X3, LogOut, BarChart3,
  BookMarked, GraduationCap, Plus, X, Trash2, CheckCircle2,
  ChevronRight, UserPlus, Calendar, Link2, KeyRound,
} from 'lucide-react';

type Tab = 'overview' | 'campuses' | 'classes' | 'sections' | 'subjects' | 'users' | 'academic-years' | 'enrollments' | 'allocations' | 'parent-associations' | 'invites' | 'bulk-csv';


function FormPanel({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-blue-900 text-sm">{title}</h3>
        <button onClick={onClose} className="text-blue-400 hover:text-blue-700"><X className="w-4 h-4" /></button>
      </div>
      {children}
    </div>
  );
}

function StatusMsg({ msg }: { msg: string }) {
  if (!msg) return null;
  const isErr = msg.startsWith('Error');
  return (
    <div className={`rounded-lg p-3 mb-3 text-sm flex items-center gap-2 ${isErr ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
      {!isErr && <CheckCircle2 className="w-4 h-4" />}
      {msg}
    </div>
  );
}

export default function AdminDashboard() {
  const user = getStoredUser();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [parentAssociations, setParentAssociations] = useState<any[]>([]);
  const [parentInvitations, setParentInvitations] = useState<any[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [lastGeneratedInvite, setLastGeneratedInvite] = useState<any | null>(null);
  const [invites, setInvites] = useState<any[]>([]);
  const [inviteForm, setInviteForm] = useState({ inviteCode: '', sectionId: '', targetRole: 'STUDENT', maxUses: '100' });

  // Form states
  const [campusForm, setCampusForm] = useState({ name: '', address: '' });
  const [classForm, setClassForm] = useState({ campusId: '', name: '', code: '' });
  const [sectionForm, setSectionForm] = useState({ classId: '', name: '', capacity: '35' });
  const [subjectForm, setSubjectForm] = useState({ classId: '', name: '', code: '' });
  const [userForm, setUserForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'STUDENT', campusId: '' });
  const [yearForm, setYearForm] = useState({ name: '', startDate: '', endDate: '' });
  const [enrollForm, setEnrollForm] = useState({ studentId: '', sectionId: '', academicYearId: '' });
  const [allocForm, setAllocForm] = useState({ teacherId: '', subjectId: '', sectionId: '' });

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const loadAll = async () => {
    setLoading(true);
    const [s, c, cl, sec, sub, u, ay, en, al, pa, inv, pinv] = await Promise.all([
      api.getAdminStats().catch(() => null),
      api.getCampuses().catch(() => []),
      api.getClasses().catch(() => []),
      api.getSections().catch(() => []),
      api.getSubjects().catch(() => []),
      api.getUsers().catch(() => []),
      api.getAcademicYears().catch(() => []),
      api.getEnrollments().catch(() => []),
      api.getAllocations().catch(() => []),
      api.getParentAssociations().catch(() => []),
      api.getAdminInvites().catch(() => ({ invites: [] })),
      api.getParentInvitations().catch(() => []),
    ]);
    setStats(s); setCampuses(c); setClasses(cl); setSections(sec);
    setSubjects(sub); setUsers(u); setAcademicYears(ay);
    setEnrollments(en); setAllocations(al); setParentAssociations(pa);
    setInvites(inv?.invites || []);
    setParentInvitations(pinv || []);
    setLoading(false);
  };


  useEffect(() => { loadAll(); }, []);
  const switchTab = (t: Tab) => { setActiveTab(t); setShowForm(false); setMsg(''); };

  // ── Handlers ─────────────────────────────────────────────────────────── //
  const handleCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.createCampus(campusForm); flash('Campus created!'); setCampusForm({ name: '', address: '' }); setShowForm(false); await loadAll(); }
    catch (err: any) { flash('Error: ' + err.message); }
  };

  const handleClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.createClass(classForm); flash('Class created!'); setClassForm({ campusId: '', name: '', code: '' }); setShowForm(false); await loadAll(); }
    catch (err: any) { flash('Error: ' + err.message); }
  };

  const handleSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.createSection({ ...sectionForm, capacity: parseInt(sectionForm.capacity) }); flash('Section created!'); setSectionForm({ classId: '', name: '', capacity: '35' }); setShowForm(false); await loadAll(); }
    catch (err: any) { flash('Error: ' + err.message); }
  };

  const handleSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.createSubject(subjectForm); flash('Subject created!'); setSubjectForm({ classId: '', name: '', code: '' }); setShowForm(false); await loadAll(); }
    catch (err: any) { flash('Error: ' + err.message); }
  };

  const handleUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.createUser(userForm); flash('User created!'); setUserForm({ email: '', password: '', firstName: '', lastName: '', role: 'STUDENT', campusId: '' }); setShowForm(false); await loadAll(); }
    catch (err: any) { flash('Error: ' + err.message); }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this user?')) return;
    try { await api.deactivateUser(id); flash('User deactivated.'); await loadAll(); }
    catch (err: any) { flash('Error: ' + err.message); }
  };

  const handleYear = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.createAcademicYear(yearForm); flash('Academic year created!'); setYearForm({ name: '', startDate: '', endDate: '' }); setShowForm(false); await loadAll(); }
    catch (err: any) { flash('Error: ' + err.message); }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.createEnrollment(enrollForm); flash('Student enrolled!'); setEnrollForm({ studentId: '', sectionId: '', academicYearId: '' }); setShowForm(false); await loadAll(); }
    catch (err: any) { flash('Error: ' + err.message); }
  };

  const handleUnenroll = async (id: string) => {
    if (!confirm('Remove this enrollment?')) return;
    try { await api.deleteEnrollment(id); flash('Enrollment removed.'); await loadAll(); }
    catch (err: any) { flash('Error: ' + err.message); }
  };

  const handleAlloc = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.createAllocation(allocForm); flash('Teacher assigned!'); setAllocForm({ teacherId: '', subjectId: '', sectionId: '' }); setShowForm(false); await loadAll(); }
    catch (err: any) { flash('Error: ' + err.message); }
  };

  const handleDeallocate = async (id: string) => {
    if (!confirm('Remove this allocation?')) return;
    try { await api.deleteAllocation(id); flash('Allocation removed.'); await loadAll(); }
    catch (err: any) { flash('Error: ' + err.message); }
  };

  const handleDeleteParentAssociation = async (id: string) => {
    if (!confirm('Remove this parent-student link?')) return;
    try { await api.deleteParentAssociation(id); flash('Parent link removed.'); await loadAll(); }
    catch (err: any) { flash('Error: ' + err.message); }
  };


  const teachers = users.filter(u => u.role === 'TEACHER');
  const students = users.filter(u => u.role === 'STUDENT');
  const parents = users.filter(u => u.role === 'PARENT');

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'campuses', label: 'Campuses', icon: Building2 },
    { key: 'classes', label: 'Classes', icon: Grid3X3 },
    { key: 'sections', label: 'Sections', icon: BookMarked },
    { key: 'subjects', label: 'Subjects', icon: BookOpen },
    { key: 'academic-years', label: 'Academic Years', icon: Calendar },
    { key: 'enrollments', label: 'Enrollments', icon: GraduationCap },
    { key: 'allocations', label: 'Allocations', icon: Link2 },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'parent-associations', label: 'Parents & Guardians', icon: UserPlus },
    { key: 'invites', label: 'Invite Codes', icon: KeyRound },
    { key: 'bulk-csv', label: 'Bulk Import', icon: ChevronRight },
  ];


  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400';
  const btnPrimary = 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors';
  const btnDanger = 'text-red-400 hover:text-red-600 transition-colors';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <BrandLogo variant="navbar" />
          <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.firstName} {user?.lastName}</span>
          <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors"><LogOut className="w-4 h-4" /></button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">School Administration</h1>
        <p className="text-gray-500 mb-6">Manage your institution structure, users, and academic hierarchy</p>

        {/* Tab nav — scrollable on small screens */}
        <div className="flex gap-1 overflow-x-auto bg-gray-100 rounded-xl p-1 mb-8 w-fit max-w-full">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => switchTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === key ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : (
          <>
            <StatusMsg msg={msg} />

            {/* ── Overview ───────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Campuses', value: campuses.length, icon: Building2, color: 'blue' },
                  { label: 'Classes', value: classes.length, icon: Grid3X3, color: 'indigo' },
                  { label: 'Students', value: stats?.users?.find((u: any) => u.role === 'STUDENT')?.count ?? 0, icon: GraduationCap, color: 'emerald' },
                  { label: 'Teachers', value: stats?.users?.find((u: any) => u.role === 'TEACHER')?.count ?? 0, icon: Users, color: 'violet' },
                  { label: 'Sections', value: sections.length, icon: BookMarked, color: 'amber' },
                  { label: 'Subjects', value: subjects.length, icon: BookOpen, color: 'rose' },
                  { label: 'Coursework', value: stats?.coursework?.count ?? 0, icon: BarChart3, color: 'teal' },
                  { label: 'Enrollments', value: enrollments.length, icon: GraduationCap, color: 'orange' },
                ].map(card => (
                  <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <div className={`w-10 h-10 rounded-xl bg-${card.color}-100 flex items-center justify-center mb-3`}>
                      <card.icon className={`w-5 h-5 text-${card.color}-600`} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                    <div className="text-sm text-gray-500">{card.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Campuses ──────────────────────────────────────────────── */}
            {activeTab === 'campuses' && (
              <div>
                {!showForm && <button onClick={() => setShowForm(true)} className={`${btnPrimary} flex items-center gap-2 mb-4`}><Plus className="w-4 h-4" />Add Campus</button>}
                {showForm && (
                  <FormPanel title="Add Campus" onClose={() => setShowForm(false)}>
                    <form onSubmit={handleCampus} className="space-y-3">
                      <input required placeholder="Campus name" className={inputCls} value={campusForm.name} onChange={e => setCampusForm(p => ({ ...p, name: e.target.value }))} />
                      <input placeholder="Address (optional)" className={inputCls} value={campusForm.address} onChange={e => setCampusForm(p => ({ ...p, address: e.target.value }))} />
                      <button type="submit" className={btnPrimary}>Create Campus</button>
                    </form>
                  </FormPanel>
                )}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm"><thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Address</th>
                  </tr></thead><tbody className="divide-y divide-gray-50">
                    {campuses.map((c: any) => <tr key={c.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium text-gray-900">{c.name}</td><td className="px-4 py-3 text-gray-500">{c.address || '—'}</td></tr>)}
                  </tbody></table>
                </div>
              </div>
            )}

            {/* ── Classes ───────────────────────────────────────────────── */}
            {activeTab === 'classes' && (
              <div>
                {!showForm && <button onClick={() => setShowForm(true)} className={`${btnPrimary} flex items-center gap-2 mb-4`}><Plus className="w-4 h-4" />Add Class</button>}
                {showForm && (
                  <FormPanel title="Add Class" onClose={() => setShowForm(false)}>
                    <form onSubmit={handleClass} className="space-y-3">
                      <select required className={inputCls} value={classForm.campusId} onChange={e => setClassForm(p => ({ ...p, campusId: e.target.value }))}>
                        <option value="">Select campus</option>
                        {campuses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <input required placeholder="Class name (e.g. Grade 10)" className={inputCls} value={classForm.name} onChange={e => setClassForm(p => ({ ...p, name: e.target.value }))} />
                      <input required placeholder="Code (e.g. G10)" className={inputCls} value={classForm.code} onChange={e => setClassForm(p => ({ ...p, code: e.target.value }))} />
                      <button type="submit" className={btnPrimary}>Create Class</button>
                    </form>
                  </FormPanel>
                )}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm"><thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Class</th><th className="px-4 py-3 text-left">Code</th><th className="px-4 py-3 text-left">Campus</th>
                  </tr></thead><tbody className="divide-y divide-gray-50">
                    {classes.map((c: any) => <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                      <td className="px-4 py-3"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{c.code}</span></td>
                      <td className="px-4 py-3 text-gray-500">{c.campus_name}</td>
                    </tr>)}
                  </tbody></table>
                </div>
              </div>
            )}

            {/* ── Sections ──────────────────────────────────────────────── */}
            {activeTab === 'sections' && (
              <div>
                {!showForm && <button onClick={() => setShowForm(true)} className={`${btnPrimary} flex items-center gap-2 mb-4`}><Plus className="w-4 h-4" />Add Section</button>}
                {showForm && (
                  <FormPanel title="Add Section" onClose={() => setShowForm(false)}>
                    <form onSubmit={handleSection} className="space-y-3">
                      <select required className={inputCls} value={sectionForm.classId} onChange={e => setSectionForm(p => ({ ...p, classId: e.target.value }))}>
                        <option value="">Select class</option>
                        {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <input required placeholder="Section name (e.g. Section A)" className={inputCls} value={sectionForm.name} onChange={e => setSectionForm(p => ({ ...p, name: e.target.value }))} />
                      <input type="number" placeholder="Capacity (default 35)" className={inputCls} value={sectionForm.capacity} onChange={e => setSectionForm(p => ({ ...p, capacity: e.target.value }))} />
                      <button type="submit" className={btnPrimary}>Create Section</button>
                    </form>
                  </FormPanel>
                )}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm"><thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Section</th><th className="px-4 py-3 text-left">Class</th><th className="px-4 py-3 text-left">Capacity</th>
                  </tr></thead><tbody className="divide-y divide-gray-50">
                    {sections.map((s: any) => <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3 text-gray-500">{s.class_name}</td>
                      <td className="px-4 py-3 text-gray-500">{s.capacity}</td>
                    </tr>)}
                  </tbody></table>
                </div>
              </div>
            )}

            {/* ── Subjects ──────────────────────────────────────────────── */}
            {activeTab === 'subjects' && (
              <div>
                {!showForm && <button onClick={() => setShowForm(true)} className={`${btnPrimary} flex items-center gap-2 mb-4`}><Plus className="w-4 h-4" />Add Subject</button>}
                {showForm && (
                  <FormPanel title="Add Subject" onClose={() => setShowForm(false)}>
                    <form onSubmit={handleSubject} className="space-y-3">
                      <select required className={inputCls} value={subjectForm.classId} onChange={e => setSubjectForm(p => ({ ...p, classId: e.target.value }))}>
                        <option value="">Select class</option>
                        {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <input required placeholder="Subject name (e.g. AP Physics 1)" className={inputCls} value={subjectForm.name} onChange={e => setSubjectForm(p => ({ ...p, name: e.target.value }))} />
                      <input required placeholder="Code (e.g. PHYS-101)" className={inputCls} value={subjectForm.code} onChange={e => setSubjectForm(p => ({ ...p, code: e.target.value }))} />
                      <button type="submit" className={btnPrimary}>Create Subject</button>
                    </form>
                  </FormPanel>
                )}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm"><thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Subject</th><th className="px-4 py-3 text-left">Code</th><th className="px-4 py-3 text-left">Class</th>
                  </tr></thead><tbody className="divide-y divide-gray-50">
                    {subjects.map((s: any) => <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{s.code}</span></td>
                      <td className="px-4 py-3 text-gray-500">{s.class_name}</td>
                    </tr>)}
                  </tbody></table>
                </div>
              </div>
            )}

            {/* ── Academic Years ────────────────────────────────────────── */}
            {activeTab === 'academic-years' && (
              <div>
                {!showForm && <button onClick={() => setShowForm(true)} className={`${btnPrimary} flex items-center gap-2 mb-4`}><Plus className="w-4 h-4" />Add Academic Year</button>}
                {showForm && (
                  <FormPanel title="Add Academic Year" onClose={() => setShowForm(false)}>
                    <form onSubmit={handleYear} className="space-y-3">
                      <input required placeholder="Name (e.g. 2026-2027)" className={inputCls} value={yearForm.name} onChange={e => setYearForm(p => ({ ...p, name: e.target.value }))} />
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs text-gray-500 mb-1 block">Start Date</label><input required type="date" className={inputCls} value={yearForm.startDate} onChange={e => setYearForm(p => ({ ...p, startDate: e.target.value }))} /></div>
                        <div><label className="text-xs text-gray-500 mb-1 block">End Date</label><input required type="date" className={inputCls} value={yearForm.endDate} onChange={e => setYearForm(p => ({ ...p, endDate: e.target.value }))} /></div>
                      </div>
                      <button type="submit" className={btnPrimary}>Create Academic Year</button>
                    </form>
                  </FormPanel>
                )}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm"><thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Start</th><th className="px-4 py-3 text-left">End</th><th className="px-4 py-3 text-left">Status</th>
                  </tr></thead><tbody className="divide-y divide-gray-50">
                    {academicYears.map((ay: any) => <tr key={ay.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{ay.name}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(ay.start_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(ay.end_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${ay.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{ay.is_active ? 'Active' : 'Inactive'}</span></td>
                    </tr>)}
                  </tbody></table>
                </div>
              </div>
            )}

            {/* ── Enrollments ───────────────────────────────────────────── */}
            {activeTab === 'enrollments' && (
              <div>
                {!showForm && <button onClick={() => setShowForm(true)} className={`${btnPrimary} flex items-center gap-2 mb-4`}><Plus className="w-4 h-4" />Enroll Student</button>}
                {showForm && (
                  <FormPanel title="Enroll Student" onClose={() => setShowForm(false)}>
                    <form onSubmit={handleEnroll} className="space-y-3">
                      <select required className={inputCls} value={enrollForm.studentId} onChange={e => setEnrollForm(p => ({ ...p, studentId: e.target.value }))}>
                        <option value="">Select student</option>
                        {students.map((s: any) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.email})</option>)}
                      </select>
                      <select required className={inputCls} value={enrollForm.sectionId} onChange={e => setEnrollForm(p => ({ ...p, sectionId: e.target.value }))}>
                        <option value="">Select section</option>
                        {sections.map((s: any) => <option key={s.id} value={s.id}>{s.class_name} – {s.name}</option>)}
                      </select>
                      <select required className={inputCls} value={enrollForm.academicYearId} onChange={e => setEnrollForm(p => ({ ...p, academicYearId: e.target.value }))}>
                        <option value="">Select academic year</option>
                        {academicYears.map((ay: any) => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
                      </select>
                      <button type="submit" className={btnPrimary}>Enroll</button>
                    </form>
                  </FormPanel>
                )}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm"><thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Student</th><th className="px-4 py-3 text-left">Section</th><th className="px-4 py-3 text-left">Year</th><th className="px-4 py-3"></th>
                  </tr></thead><tbody className="divide-y divide-gray-50">
                    {enrollments.map((en: any) => <tr key={en.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{en.first_name} {en.last_name}</td>
                      <td className="px-4 py-3 text-gray-500">{en.class_name} – {en.section_name}</td>
                      <td className="px-4 py-3 text-gray-500">{en.academic_year_name}</td>
                      <td className="px-4 py-3 text-right"><button onClick={() => handleUnenroll(en.id)} className={btnDanger}><Trash2 className="w-4 h-4" /></button></td>
                    </tr>)}
                  </tbody></table>
                </div>
              </div>
            )}

            {/* ── Allocations ───────────────────────────────────────────── */}
            {activeTab === 'allocations' && (
              <div>
                {!showForm && <button onClick={() => setShowForm(true)} className={`${btnPrimary} flex items-center gap-2 mb-4`}><Plus className="w-4 h-4" />Assign Teacher</button>}
                {showForm && (
                  <FormPanel title="Assign Teacher to Subject" onClose={() => setShowForm(false)}>
                    <form onSubmit={handleAlloc} className="space-y-3">
                      <select required className={inputCls} value={allocForm.teacherId} onChange={e => setAllocForm(p => ({ ...p, teacherId: e.target.value }))}>
                        <option value="">Select teacher</option>
                        {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                      </select>
                      <select required className={inputCls} value={allocForm.subjectId} onChange={e => setAllocForm(p => ({ ...p, subjectId: e.target.value }))}>
                        <option value="">Select subject</option>
                        {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                      </select>
                      <select required className={inputCls} value={allocForm.sectionId} onChange={e => setAllocForm(p => ({ ...p, sectionId: e.target.value }))}>
                        <option value="">Select section</option>
                        {sections.map((s: any) => <option key={s.id} value={s.id}>{s.class_name} – {s.name}</option>)}
                      </select>
                      <button type="submit" className={btnPrimary}>Assign</button>
                    </form>
                  </FormPanel>
                )}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm"><thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Teacher</th><th className="px-4 py-3 text-left">Subject</th><th className="px-4 py-3 text-left">Section</th><th className="px-4 py-3"></th>
                  </tr></thead><tbody className="divide-y divide-gray-50">
                    {allocations.map((al: any) => <tr key={al.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{al.teacher_first_name} {al.teacher_last_name}</td>
                      <td className="px-4 py-3 text-gray-500">{al.subject_name} <span className="text-xs text-gray-400">({al.subject_code})</span></td>
                      <td className="px-4 py-3 text-gray-500">{al.section_name}</td>
                      <td className="px-4 py-3 text-right"><button onClick={() => handleDeallocate(al.id)} className={btnDanger}><Trash2 className="w-4 h-4" /></button></td>
                    </tr>)}
                  </tbody></table>
                </div>
              </div>
            )}

            {/* ── Users ─────────────────────────────────────────────────── */}
            {activeTab === 'users' && (
              <div>
                {!showForm && <button onClick={() => setShowForm(true)} className={`${btnPrimary} flex items-center gap-2 mb-4`}><UserPlus className="w-4 h-4" />Invite User</button>}
                {showForm && (
                  <FormPanel title="Create User Account" onClose={() => setShowForm(false)}>
                    <form onSubmit={handleUser} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input required placeholder="First name" className={inputCls} value={userForm.firstName} onChange={e => setUserForm(p => ({ ...p, firstName: e.target.value }))} />
                        <input required placeholder="Last name" className={inputCls} value={userForm.lastName} onChange={e => setUserForm(p => ({ ...p, lastName: e.target.value }))} />
                      </div>
                      <input required type="email" placeholder="Email" className={inputCls} value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} />
                      <input required type="password" placeholder="Password (min 6 chars)" className={inputCls} value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} />
                      <div className="grid grid-cols-2 gap-3">
                        <select className={inputCls} value={userForm.role} onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))}>
                          <option value="STUDENT">Student</option>
                          <option value="TEACHER">Teacher</option>
                          <option value="SCHOOL_ADMIN">School Admin</option>
                        </select>
                        <select className={inputCls} value={userForm.campusId} onChange={e => setUserForm(p => ({ ...p, campusId: e.target.value }))}>
                          <option value="">No campus</option>
                          {campuses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <button type="submit" className={btnPrimary}>Create Account</button>
                    </form>
                  </FormPanel>
                )}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm"><thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Campus</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3"></th>
                   </tr></thead><tbody className="divide-y divide-gray-50">
                    {users.map((u: any) => <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.first_name} {u.last_name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'TEACHER' ? 'bg-violet-100 text-violet-700' : u.role === 'SCHOOL_ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{u.role}</span></td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{u.campus_name || '—'}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td className="px-4 py-3 text-right">{u.is_active && <button onClick={() => handleDeactivate(u.id)} className={btnDanger} title="Deactivate"><Trash2 className="w-4 h-4" /></button>}</td>
                    </tr>)}
                  </tbody></table>
                </div>
              </div>
            )}

            {/* ── Parents & Guardians Management ─────────────────────────── */}
            {activeTab === 'parent-associations' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Parents &amp; Guardians</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Issue secure single-use school invitations and manage verified parent-student associations.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowInviteForm(true);
                        setShowForm(false);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-3.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Issue Parent Invitation</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(true);
                        setShowInviteForm(false);
                      }}
                      className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 px-3.5 rounded-lg text-xs transition-colors"
                    >
                      <span>Link Existing Account</span>
                    </button>
                  </div>
                </div>

                {/* Generated Invitation Success Banner */}
                {lastGeneratedInvite && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs text-emerald-950">
                    <div className="font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Parent Invitation Link Ready!
                      </span>
                      <button
                        onClick={() => setLastGeneratedInvite(null)}
                        className="text-emerald-500 hover:text-emerald-700"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Send this single-use link to <strong>{lastGeneratedInvite.invited_parent_name}</strong> (
                      {lastGeneratedInvite.invited_email}). Valid for 72 hours.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        readOnly
                        value={
                          typeof window !== 'undefined'
                            ? `${window.location.origin}${lastGeneratedInvite.invitationUrl}`
                            : lastGeneratedInvite.invitationUrl
                        }
                        className="flex-1 bg-white border border-emerald-300 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-800 select-all"
                      />
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}${lastGeneratedInvite.invitationUrl}`;
                          navigator.clipboard.writeText(url);
                          flash('Invitation URL copied to clipboard!');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shrink-0"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}

                {/* Issue Parent Invitation Form */}
                {showInviteForm && (
                  <FormPanel title="Issue School Parent Invitation" onClose={() => setShowInviteForm(false)}>
                    <StatusMsg msg={msg} />
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.currentTarget as any;
                        try {
                          const res = await api.createParentInvitation({
                            studentId: form.studentId.value,
                            invitedEmail: form.invitedEmail.value,
                            invitedParentName: form.invitedParentName.value,
                            relationshipType: form.relationship.value || 'GUARDIAN',
                          });
                          setLastGeneratedInvite(res);
                          setShowInviteForm(false);
                          flash('Parent invitation generated successfully!');
                          await loadAll();
                        } catch (err: any) {
                          flash('Error: ' + err.message);
                        }
                      }}
                      className="grid grid-cols-2 gap-3 text-xs"
                    >
                      <div className="col-span-2">
                        <label className="font-medium text-gray-700 mb-1 block">Enrolled Student</label>
                        <select name="studentId" required className={inputCls}>
                          <option value="">Select student</option>
                          {students.map((s: any) => (
                            <option key={s.id} value={s.id}>
                              {s.first_name} {s.last_name} ({s.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-medium text-gray-700 mb-1 block">Parent Full Name</label>
                        <input
                          name="invitedParentName"
                          required
                          placeholder="e.g. Eleanor Chen"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="font-medium text-gray-700 mb-1 block">Parent Email Address</label>
                        <input
                          name="invitedEmail"
                          type="email"
                          required
                          placeholder="e.g. parent@example.com"
                          className={inputCls}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="font-medium text-gray-700 mb-1 block">Relationship</label>
                        <select name="relationship" defaultValue="MOTHER" className={inputCls}>
                          <option value="MOTHER">Mother</option>
                          <option value="FATHER">Father</option>
                          <option value="GUARDIAN">Guardian</option>
                          <option value="OTHER">Other Authorized Representative</option>
                        </select>
                      </div>
                      <div className="col-span-2 pt-1 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowInviteForm(false)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button type="submit" className={btnPrimary}>
                          Generate Secure Invitation Link
                        </button>
                      </div>
                    </form>
                  </FormPanel>
                )}

                {/* Direct Link Existing Form */}
                {showForm && (
                  <FormPanel title="Link Existing Parent Account to Student" onClose={() => setShowForm(false)}>
                    <StatusMsg msg={msg} />
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.currentTarget as any;
                        try {
                          await api.createParentAssociation({
                            parentId: form.parentId.value,
                            studentId: form.studentId.value,
                            relationshipType: form.relationship.value || 'GUARDIAN',
                          });
                          flash('Parent linked!');
                          setShowForm(false);
                          await loadAll();
                        } catch (err: any) {
                          flash('Error: ' + err.message);
                        }
                      }}
                      className="grid grid-cols-3 gap-3 text-xs"
                    >
                      <div>
                        <label className="font-medium text-gray-600 mb-1 block">Parent Account</label>
                        <select name="parentId" required className={inputCls}>
                          <option value="">Select parent</option>
                          {parents.map((p: any) => (
                            <option key={p.id} value={p.id}>
                              {p.first_name} {p.last_name} — {p.email}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-medium text-gray-600 mb-1 block">Student</label>
                        <select name="studentId" required className={inputCls}>
                          <option value="">Select student</option>
                          {students.map((s: any) => (
                            <option key={s.id} value={s.id}>
                              {s.first_name} {s.last_name} — {s.email}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-medium text-gray-600 mb-1 block">Relationship</label>
                        <input
                          name="relationship"
                          defaultValue="GUARDIAN"
                          className={inputCls}
                          placeholder="MOTHER / FATHER / GUARDIAN"
                        />
                      </div>
                      <div className="col-span-3 pt-1">
                        <button type="submit" className={btnPrimary}>
                          Save Link
                        </button>
                      </div>
                    </form>
                  </FormPanel>
                )}

                {/* Section 1: School-Issued Parent Invitations */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-2">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                      Pending &amp; Issued Parent Invitations
                    </h3>
                    <span className="text-[11px] text-gray-400">
                      {parentInvitations.length} invitation(s) recorded
                    </span>
                  </div>

                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Invited Parent', 'Student', 'Relationship', 'Status', 'Expires', 'Actions'].map((h) => (
                          <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs">
                      {parentInvitations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-gray-400">
                            No parent invitations issued yet. Click &quot;Issue Parent Invitation&quot; to invite a family.
                          </td>
                        </tr>
                      ) : (
                        parentInvitations.map((inv: any) => (
                          <tr key={inv.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {inv.invited_parent_name}
                              <span className="text-[11px] text-gray-400 block font-mono">{inv.invited_email}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {inv.student_first_name} {inv.student_last_name}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{inv.relationship_type}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  inv.status === 'ACCEPTED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : inv.status === 'REVOKED'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-[11px]">
                              {new Date(inv.expires_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                              {inv.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const res = await api.resendParentInvitation(inv.id);
                                        setLastGeneratedInvite(res);
                                        flash('Invitation refreshed!');
                                        await loadAll();
                                      } catch (err: any) {
                                        flash('Error: ' + err.message);
                                      }
                                    }}
                                    className="text-xs text-blue-600 hover:underline font-semibold"
                                  >
                                    Refresh/Link
                                  </button>
                                  <button
                                    onClick={async () => {
                                      try {
                                        await api.revokeParentInvitation(inv.id);
                                        flash('Invitation revoked.');
                                        await loadAll();
                                      } catch (err: any) {
                                        flash('Error: ' + err.message);
                                      }
                                    }}
                                    className="text-xs text-red-500 hover:underline font-semibold"
                                  >
                                    Revoke
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Section 2: Active Parent-Student Links */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-2">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                      Active Verified Parent-Student Links
                    </h3>
                    <span className="text-[11px] text-gray-400">
                      {parentAssociations.length} link(s) active
                    </span>
                  </div>

                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Parent', 'Student', 'Relationship', ''].map((h) => (
                          <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs">
                      {parentAssociations.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-6 text-gray-400">
                            No active parent-student links yet.
                          </td>
                        </tr>
                      ) : (
                        parentAssociations.map((pa: any) => (
                          <tr key={pa.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {pa.parent_first_name} {pa.parent_last_name}
                              <span className="text-[11px] text-gray-400 block font-mono">{pa.parent_email}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {pa.student_first_name} {pa.student_last_name}
                              <span className="text-[11px] text-gray-400 block font-mono">{pa.student_email}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                {pa.relationship_type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteParentAssociation(pa.id)}
                                className={btnDanger}
                                title="Delete Link"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Invite Codes ───────────────────────────────────────────── */}
            {activeTab === 'invites' && (
              <div>
                {!showForm && <button onClick={() => setShowForm(true)} className={`${btnPrimary} flex items-center gap-2 mb-4`}><Plus className="w-4 h-4" />Generate Invite Code</button>}
                {showForm && (
                  <FormPanel title="Generate School Invite Code" onClose={() => setShowForm(false)}>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          await api.createAdminInvite({
                            inviteCode: inviteForm.inviteCode || undefined,
                            sectionId: inviteForm.sectionId || undefined,
                            targetRole: inviteForm.targetRole,
                            maxUses: parseInt(inviteForm.maxUses) || 100,
                          });
                          flash('Invite code generated!');
                          setInviteForm({ inviteCode: '', sectionId: '', targetRole: 'STUDENT', maxUses: '100' });
                          setShowForm(false);
                          await loadAll();
                        } catch (err: any) { flash('Error: ' + err.message); }
                      }}
                      className="space-y-3"
                    >
                      <input placeholder="Custom code (leave blank to auto-generate)" className={inputCls + ' uppercase font-mono'} value={inviteForm.inviteCode} onChange={e => setInviteForm(p => ({ ...p, inviteCode: e.target.value }))} />
                      <select className={inputCls} value={inviteForm.sectionId} onChange={e => setInviteForm(p => ({ ...p, sectionId: e.target.value }))}>
                        <option value="">Optional: Auto-enroll into section</option>
                        {sections.map((s: any) => <option key={s.id} value={s.id}>{s.class_name} › {s.name}</option>)}
                      </select>
                      <div className="grid grid-cols-2 gap-3">
                        <select className={inputCls} value={inviteForm.targetRole} onChange={e => setInviteForm(p => ({ ...p, targetRole: e.target.value }))}>
                          <option value="STUDENT">STUDENT</option>
                          <option value="TEACHER">TEACHER</option>
                        </select>
                        <input type="number" min={1} max={5000} placeholder="Max uses" className={inputCls} value={inviteForm.maxUses} onChange={e => setInviteForm(p => ({ ...p, maxUses: e.target.value }))} />
                      </div>
                      <button type="submit" className={btnPrimary}>Create Invite Code</button>
                    </form>
                  </FormPanel>
                )}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">Code</th>
                      <th className="px-4 py-3 text-left">Target Role</th>
                      <th className="px-4 py-3 text-left">Section</th>
                      <th className="px-4 py-3 text-left">Uses</th>
                      <th className="px-4 py-3 text-left">Expires</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {invites.map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono font-bold text-indigo-700">{inv.invite_code}</td>
                          <td className="px-4 py-3 text-xs">{inv.target_role}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{inv.section_name || 'School-wide'}</td>
                          <td className="px-4 py-3 text-xs">{inv.uses_count} / {inv.max_uses}</td>
                          <td className="px-4 py-3 text-xs text-gray-400">{new Date(inv.expires_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Bulk CSV Import ─────────────────────────────────────────── */}
            {activeTab === 'bulk-csv' && (
              <div className="max-w-2xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Bulk User Import (CSV)</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Upload a CSV file to create multiple users at once. Required columns:
                  <code className="ml-1 bg-gray-100 px-1 rounded text-xs">email, password, firstName, lastName, role</code>.
                  Optional: <code className="bg-gray-100 px-1 rounded text-xs">campusId</code>
                </p>
                <BulkCsvPanel flash={flash} inputCls={inputCls} btnPrimary={btnPrimary} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Bulk CSV Panel ─────────────────────────────────────────────────────────── //
function BulkCsvPanel({ flash, inputCls, btnPrimary }: { flash: (m: string) => void; inputCls: string; btnPrimary: string }) {
  const [csvText, setCsvText] = useState('');
  const [result, setResult] = useState<{ created: number; failed: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim());
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCsvText(ev.target?.result as string ?? '');
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) { flash('Error: No CSV content loaded'); return; }
    const rows = parseCSV(csvText);
    if (!rows.length) { flash('Error: No valid rows found in CSV'); return; }
    setLoading(true);
    try {
      const res = await api.bulkCreateUsers(rows);
      setResult(res);
      flash(`Done: ${res.created} created, ${res.failed.length} failed`);
    } catch (err: any) {
      flash('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Upload CSV File</label>
        <input type="file" accept=".csv,text/csv" onChange={handleFile}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 file:text-xs file:font-medium" />
      </div>
      {csvText && (
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Preview (first 5 rows)</label>
          <pre className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs overflow-x-auto max-h-40">
            {csvText.split('\n').slice(0, 6).join('\n')}
          </pre>
          <p className="text-xs text-gray-400 mt-1">{parseCSV(csvText).length} rows detected</p>
        </div>
      )}
      <button type="submit" disabled={loading || !csvText} className={btnPrimary + ' disabled:opacity-50'}>
        {loading ? 'Importing...' : 'Import Users'}
      </button>
      {result && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
          <div className="flex gap-4 text-sm">
            <span className="text-green-700 font-medium">✓ {result.created} created</span>
            {result.failed.length > 0 && <span className="text-red-600 font-medium">✗ {result.failed.length} failed</span>}
          </div>
          {result.failed.map((f, i) => (
            <div key={i} className="text-xs text-red-600 bg-red-50 rounded p-2">
              Row {i + 1} ({f.row?.email}): {f.error}
            </div>
          ))}
        </div>
      )}
    </form>
  );
}

