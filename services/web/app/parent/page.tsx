'use client';
import { useEffect, useState } from 'react';
import { api, getStoredUser, logout } from '@/lib/api';
import { BookOpen, LogOut, Users, Clock, CheckCircle2, Star, ChevronRight, X } from 'lucide-react';

interface Child {
  student_id: string;
  student_first_name: string;
  student_last_name: string;
  student_email: string;
  relationship_type: string;
}

interface Coursework {
  id: string;
  title: string;
  subject_name: string;
  section_name: string;
  coursework_type: string;
  due_date: string;
  submission_status?: string;
  score?: number;
  max_score: number;
  ai_guidance_mode: string;
}

export default function ParentPortal() {
  const user = getStoredUser();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [coursework, setCoursework] = useState<Coursework[]>([]);
  const [loading, setLoading] = useState(true);
  const [cwLoading, setCwLoading] = useState(false);

  useEffect(() => {
    // Fetch parent's linked children via the API
    api.getMyChildren()
      .then(data => setChildren(data))
      .catch(() => setChildren([]))
      .finally(() => setLoading(false));
  }, []);

  async function viewChildProgress(child: Child) {
    setSelectedChild(child);
    setCwLoading(true);
    try {
      const data = await api.getChildCoursework(child.student_id);
      setCoursework(data);
    } catch {
      setCoursework([]);
    } finally {
      setCwLoading(false);
    }
  }

  const statusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-500';
    if (status === 'GRADED') return 'bg-green-100 text-green-700';
    if (status === 'SUBMITTED') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-500';
  };

  const completedCount = coursework.filter(c => c.submission_status === 'GRADED' || c.submission_status === 'SUBMITTED').length;
  const pendingCount = coursework.filter(c => !c.submission_status).length;
  const avgScore = (() => {
    const graded = coursework.filter(c => c.score !== undefined && c.score !== null);
    if (!graded.length) return null;
    const avg = graded.reduce((sum, c) => sum + (c.score ?? 0) / c.max_score * 100, 0) / graded.length;
    return avg.toFixed(1);
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          {selectedChild && (
            <button onClick={() => { setSelectedChild(null); setCoursework([]); }} className="mr-2 text-gray-400 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          )}
          <BookOpen className="w-6 h-6 text-purple-600" />
          <span className="font-bold text-gray-900">EduSocrates</span>
          <span className="ml-2 text-xs bg-purple-100 text-purple-700 rounded-full px-2 py-0.5">Parent</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.firstName} {user?.lastName}</span>
          <button onClick={logout} className="text-gray-400 hover:text-red-500">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* My Children List */}
        {!selectedChild && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">My Children</h1>
            <p className="text-gray-500 mb-8">Select a child to view their coursework progress.</p>

            {loading ? (
              <div className="text-center py-16 text-gray-400">Loading...</div>
            ) : children.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No children linked to your account</p>
                <p className="text-sm text-gray-400 mt-1">Ask your school administrator to link your child's account.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {children.map(child => (
                  <button
                    key={child.student_id}
                    onClick={() => viewChildProgress(child)}
                    className="w-full text-left bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-purple-200 hover:shadow-md transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-700 font-semibold text-sm">
                          {child.student_first_name[0]}{child.student_last_name[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{child.student_first_name} {child.student_last_name}</div>
                        <div className="text-sm text-gray-500">{child.student_email}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{child.relationship_type}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Selected Child Progress */}
        {selectedChild && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{selectedChild.student_first_name} {selectedChild.student_last_name}</h1>
              <p className="text-gray-500 text-sm mt-0.5">{selectedChild.student_email} · {selectedChild.relationship_type}</p>
            </div>

            {/* Stats summary */}
            {!cwLoading && coursework.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{completedCount}</div>
                  <div className="text-xs text-gray-500 mt-1">Completed</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-amber-500">{pendingCount}</div>
                  <div className="text-xs text-gray-500 mt-1">Pending</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{avgScore !== null ? `${avgScore}%` : '—'}</div>
                  <div className="text-xs text-gray-500 mt-1">Avg Score</div>
                </div>
              </div>
            )}

            {cwLoading ? (
              <div className="text-center py-16 text-gray-400">Loading coursework...</div>
            ) : coursework.length === 0 ? (
              <div className="text-center py-10 text-gray-400">No coursework assigned yet.</div>
            ) : (
              <div className="space-y-3">
                {coursework.map(cw => (
                  <div key={cw.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs bg-indigo-100 text-indigo-700 rounded px-2 py-0.5">{cw.coursework_type}</span>
                          <span className={`text-xs rounded px-2 py-0.5 ${statusColor(cw.submission_status)}`}>
                            {cw.submission_status || 'PENDING'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate">{cw.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{cw.subject_name} &bull; {cw.section_name}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          Due {cw.due_date ? new Date(cw.due_date).toLocaleDateString() : 'No due date'}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {cw.submission_status === 'GRADED' && cw.score !== undefined ? (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <Star className="w-4 h-4" />
                            <span className="font-bold">{cw.score}/{cw.max_score}</span>
                          </div>
                        ) : cw.submission_status === 'SUBMITTED' ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-400" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

