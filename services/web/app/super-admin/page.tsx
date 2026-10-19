'use client';
import { useEffect, useState } from 'react';
import { api, getStoredUser, logout } from '@/lib/api';
import {
  BookOpen, LogOut, BarChart3, Building2, Globe, ShieldAlert,
  Plus, X, CheckCircle2, ToggleLeft, ToggleRight, GraduationCap, Users,
} from 'lucide-react';

type Tab = 'overview' | 'schools' | 'audit';

function StatusMsg({ msg }: { msg: string }) {
  if (!msg) return null;
  const isErr = msg.startsWith('Error');
  return (
    <div className={`rounded-lg p-3 mb-4 text-sm flex items-center gap-2 ${isErr ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
      {!isErr && <CheckCircle2 className="w-4 h-4" />}{msg}
    </div>
  );
}

const THREAT_COLORS: Record<string, string> = {
  BLOCKED: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-gray-100 text-gray-600',
  SAFE: 'bg-green-100 text-green-700',
};

export default function SuperAdminDashboard() {
  const user = getStoredUser();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [stats, setStats] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);

  const [schoolForm, setSchoolForm] = useState({ name: '', slug: '', domain: '' });

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const loadAll = async () => {
    setLoading(true);
    const [s, sc, au] = await Promise.all([
      api.superAdmin.getStats().catch(() => null),
      api.superAdmin.getSchools().catch(() => []),
      api.superAdmin.getAiAudit(200).catch(() => ({ entries: [] })),
    ]);
    setStats(s);
    setSchools(sc);
    setAudit(Array.isArray(au) ? au : (au?.entries ?? []));
    setLoading(false);
  };


  useEffect(() => { loadAll(); }, []);
  const switchTab = (t: Tab) => { setActiveTab(t); setShowForm(false); setMsg(''); };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.superAdmin.createSchool(schoolForm);
      flash('School onboarded successfully!');
      setSchoolForm({ name: '', slug: '', domain: '' });
      setShowForm(false);
      await loadAll();
    } catch (err: any) { flash('Error: ' + err.message); }
  };

  const handleStatus = async (school: any) => {
    const newStatus = school.subscription_status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`${newStatus === 'SUSPENDED' ? 'Suspend' : 'Activate'} "${school.name}"?`)) return;
    try {
      await api.superAdmin.updateSchoolStatus(school.id, newStatus);
      flash(`School ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'}.`);
      await loadAll();
    } catch (err: any) { flash('Error: ' + err.message); }
  };

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400';
  const btnPrimary = 'bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-600" />
          <span className="font-bold text-gray-900">EduSocrates</span>
          <span className="ml-2 text-xs bg-purple-100 text-purple-700 rounded-full px-2 py-0.5">Super Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Platform Admin</span>
          <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors"><LogOut className="w-4 h-4" /></button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Platform Control Center</h1>
        <p className="text-gray-500 mb-6">Manage all schools, monitor AI guardrails, and track platform health</p>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
          {[
            { key: 'overview', label: 'Platform Overview', icon: BarChart3 },
            { key: 'schools', label: 'Schools', icon: Building2 },
            { key: 'audit', label: 'Global AI Audit', icon: ShieldAlert },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => switchTab(key as Tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === key ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : (
          <>
            <StatusMsg msg={msg} />

            {/* ── Platform Overview ─────────────────────────────────────── */}
            {activeTab === 'overview' && stats && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                  {[
                    { label: 'Active Schools', value: stats.schools, icon: Building2, color: 'purple' },
                    { label: 'Total Students', value: stats.students, icon: GraduationCap, color: 'blue' },
                    { label: 'Total Teachers', value: stats.teachers, icon: Users, color: 'violet' },
                    { label: 'School Admins', value: stats.admins, icon: Users, color: 'indigo' },
                    { label: 'Coursework Items', value: stats.courseworkTotal, icon: BarChart3, color: 'emerald' },
                    { label: 'AI Sessions', value: stats.aiSessions, icon: Globe, color: 'rose' },
                  ].map(card => (
                    <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                      <div className={`w-9 h-9 rounded-xl bg-${card.color}-100 flex items-center justify-center mb-3`}>
                        <card.icon className={`w-4 h-4 text-${card.color}-600`} />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                      <div className="text-xs text-gray-500">{card.label}</div>
                    </div>
                  ))}
                </div>

                {/* Quick schools summary */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h2 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2"><Building2 className="w-4 h-4 text-purple-600" />Registered Schools</h2>
                  <div className="space-y-2">
                    {schools.filter(s => s.id !== '00000000-0000-0000-0000-000000000000').map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <span className="font-medium text-gray-900 text-sm">{s.name}</span>
                          <span className="text-xs text-gray-400 ml-2">{s.slug}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{s.student_count} students</span>
                          <span>{s.teacher_count} teachers</span>
                          <span className={`px-2 py-0.5 rounded-full font-medium ${s.subscription_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{s.subscription_status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Schools ───────────────────────────────────────────────── */}
            {activeTab === 'schools' && (
              <div>
                {!showForm && (
                  <button onClick={() => setShowForm(true)} className={`${btnPrimary} flex items-center gap-2 mb-4`}>
                    <Plus className="w-4 h-4" />Onboard New School
                  </button>
                )}
                {showForm && (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-purple-900 text-sm">Onboard New School</h3>
                      <button onClick={() => setShowForm(false)} className="text-purple-400 hover:text-purple-700"><X className="w-4 h-4" /></button>
                    </div>
                    <form onSubmit={handleCreateSchool} className="space-y-3">
                      <input required placeholder="School name" className={inputCls} value={schoolForm.name} onChange={e => setSchoolForm(p => ({ ...p, name: e.target.value }))} />
                      <input required placeholder="Slug (e.g. horizon-academy)" className={inputCls} value={schoolForm.slug} onChange={e => setSchoolForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} />
                      <input placeholder="Domain (optional, e.g. horizon.edu)" className={inputCls} value={schoolForm.domain} onChange={e => setSchoolForm(p => ({ ...p, domain: e.target.value }))} />
                      <button type="submit" className={btnPrimary}>Create School</button>
                    </form>
                  </div>
                )}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm"><thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">School</th>
                    <th className="px-4 py-3 text-left">Slug / Domain</th>
                    <th className="px-4 py-3 text-left">Users</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr></thead><tbody className="divide-y divide-gray-50">
                    {schools.filter(s => s.id !== '00000000-0000-0000-0000-000000000000').map((s: any) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          <div>{s.slug}</div>
                          {s.domain && <div className="text-gray-400">{s.domain}</div>}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          <span>{s.student_count} students · {s.teacher_count} teachers</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.subscription_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {s.subscription_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleStatus(s)} className="text-gray-400 hover:text-purple-600 transition-colors" title={s.subscription_status === 'ACTIVE' ? 'Suspend' : 'Activate'}>
                            {s.subscription_status === 'ACTIVE' ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>
              </div>
            )}

            {/* ── Global AI Audit ───────────────────────────────────────── */}
            {activeTab === 'audit' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-5 h-5 text-purple-600" />
                  <h2 className="font-semibold text-gray-800">Cross-School AI Guardrail Audit Log</h2>
                  <span className="ml-auto text-xs text-gray-400">{audit.length} entries</span>
                </div>
                {audit.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">No AI sessions recorded yet.</div>
                ) : (
                  <div className="space-y-3">
                    {audit.map((entry: any, i: number) => (
                      <div key={i} className={`bg-white border rounded-xl p-4 shadow-sm ${entry.threat_level === 'BLOCKED' ? 'border-red-200' : 'border-gray-100'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${THREAT_COLORS[entry.threat_level] ?? THREAT_COLORS.SAFE}`}>
                                {entry.threat_level}
                              </span>
                              <span className="text-xs text-gray-500 font-medium">{entry.school_name || `${entry.school_id?.slice(0, 8)}…`}</span>
                              {entry.student_name && <span className="text-xs text-gray-400">&bull; {entry.student_name}</span>}
                              {entry.coursework_title && <span className="text-xs text-gray-400 truncate">({entry.coursework_title})</span>}
                              {entry.pii_detected && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">PII</span>}
                              {entry.response_intercepted && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Intercepted</span>}
                            </div>
                            <p className="text-sm text-gray-700 truncate">{entry.student_message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {entry.intent_category} &bull; {entry.timestamp ? new Date(entry.timestamp * 1000).toLocaleString() : (entry.created_at ? new Date(entry.created_at).toLocaleString() : '')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

