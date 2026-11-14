'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getStoredUser, logout } from '@/lib/api';
import { BrandLogo } from '@/components/BrandLogo';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  Filter,
  Heart,
  HelpCircle,
  Info,
  Layers,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Network,
  RotateCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react';

interface LinkedChild {
  student_id: string;
  student_first_name: string;
  student_last_name: string;
  student_email: string;
  relationship_type: string;
  school_name?: string;
  class_name?: string;
  section_name?: string;
  avg_score?: number;
  completed_count?: number;
  pending_count?: number;
  overdue_count?: number;
}

type ParentTab =
  | 'overview'
  | 'assignments'
  | 'performance'
  | 'mastery'
  | 'activity'
  | 'feedback'
  | 'attendance'
  | 'settings';

export default function AuthenticatedParentPortal() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ParentTab>('overview');
  const [loading, setLoading] = useState(true);

  // Tab Data States
  const [overviewData, setOverviewData] = useState<any>(null);
  const [coursework, setCoursework] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [masteryData, setMasteryData] = useState<any>(null);
  const [activityData, setActivityData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  // UI interaction states
  const [assignmentFilter, setAssignmentFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE'>('ALL');
  const [viewingAssignment, setViewingAssignment] = useState<any | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);

    api
      .getMyChildren()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setChildren(list);
        if (list.length > 0) {
          setSelectedChildId(list[0].student_id);
          loadChildData(list[0].student_id);
        }
      })
      .catch(() => setChildren([]))
      .finally(() => setLoading(false));

    api
      .getParentNotifications()
      .then((res) => setNotifications(Array.isArray(res) ? res : []))
      .catch(() => {});
  }, []);

  const loadChildData = async (studentId: string) => {
    setTabLoading(true);
    try {
      const [ov, cw, pf, ms, act, att, fb] = await Promise.all([
        api.getChildOverview(studentId).catch(() => null),
        api.getChildCoursework(studentId).catch(() => []),
        api.getChildPerformance(studentId).catch(() => null),
        api.getChildMastery(studentId).catch(() => null),
        api.getChildActivity(studentId).catch(() => null),
        api.getChildAttendance(studentId).catch(() => null),
        api.getChildFeedback(studentId).catch(() => []),
      ]);

      setOverviewData(ov);
      setCoursework(cw || []);
      setPerformanceData(pf);
      setMasteryData(ms);
      setActivityData(act);
      setAttendanceData(att);
      setFeedbackData(fb || []);
    } finally {
      setTabLoading(false);
    }
  };

  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
    loadChildData(childId);
  };

  const selectedChild = children.find((c) => c.student_id === selectedChildId) || children[0];

  const filteredCoursework = coursework.filter((c) => {
    if (assignmentFilter === 'ALL') return true;
    if (assignmentFilter === 'PENDING') return !c.submission_status || c.submission_status === 'PENDING';
    if (assignmentFilter === 'OVERDUE') {
      const isPast = c.due_date && new Date(c.due_date) < new Date();
      return isPast && (!c.submission_status || c.submission_status === 'PENDING');
    }
    return c.submission_status === assignmentFilter;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-800 font-sans flex flex-col">
      {/* ── Top Navigation Bar ── */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo variant="navbar" />
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
              Parent Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F5921D] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 pl-2 border-l border-slate-200">
              <span className="font-semibold text-slate-900">
                {currentUser?.firstName} {currentUser?.lastName}
              </span>
              <span className="text-slate-400">({currentUser?.email})</span>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Drawer */}
      {notificationsOpen && (
        <div className="bg-white border-b border-slate-200 shadow-md p-4 sm:p-5 animate-fadeIn">
          <div className="max-w-4xl mx-auto space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-xs text-[#1E225B] uppercase tracking-wider">
                Guardian Notifications
              </h3>
              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close ✕
              </button>
            </div>
            {notifications.map((n) => (
              <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2">
                <Bell className="w-3.5 h-3.5 text-[#F5921D] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">{n.title}</div>
                  <div className="text-slate-600 mt-0.5">{n.message}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{n.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Body Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 space-y-6">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#1E225B] border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-sm font-bold text-slate-700">Loading student profiles...</div>
          </div>
        ) : children.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 bg-purple-100 text-[#1E225B] rounded-2xl flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-extrabold text-[#1E225B]">No Children Linked Yet</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your account is registered as a Parent, but no student associations are currently active.
              Please ask your child&apos;s school administration to send you a parent invitation link.
            </p>
            <div className="pt-2">
              <Link
                href="/parent-demo"
                className="inline-flex items-center gap-1.5 bg-[#1E225B] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs"
              >
                <span>Explore Interactive Demo Instead</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Child Selector Banner */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Linked Student:
                </span>
                <div className="flex items-center gap-2">
                  {children.map((child) => (
                    <button
                      key={child.student_id}
                      type="button"
                      onClick={() => handleSelectChild(child.student_id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                        selectedChildId === child.student_id
                          ? 'bg-[#1E225B] text-white shadow-sm ring-2 ring-[#1E225B]/20'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                        {child.student_first_name[0]}{child.student_last_name[0]}
                      </div>
                      <span>
                        {child.student_first_name} {child.student_last_name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${selectedChildId === child.student_id ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>
                        {child.class_name || 'Grade 12'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Academy: <strong>{selectedChild?.school_name || 'Horizon Academy'}</strong> · Relationship:{' '}
                <strong>{selectedChild?.relationship_type || 'Guardian'}</strong>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1.5 overflow-x-auto bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs">
              {[
                { key: 'overview', label: 'Overview', icon: Compass },
                { key: 'assignments', label: `Coursework (${coursework.length})`, icon: BookOpen },
                { key: 'performance', label: 'Academic Performance', icon: Award },
                { key: 'mastery', label: 'Concept Mastery Trees', icon: Network },
                { key: 'activity', label: 'Learning Activity & AI', icon: RotateCw },
                { key: 'feedback', label: `Teacher Feedback (${feedbackData.length})`, icon: MessageSquare },
                { key: 'attendance', label: 'Attendance & Notices', icon: Calendar },
                { key: 'settings', label: 'Profile & Settings', icon: User },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key as ParentTab)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeTab === key
                      ? 'bg-[#1E225B] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {tabLoading && (
              <div className="text-center py-6 text-xs text-slate-400">Loading updated student metrics...</div>
            )}

            {/* ── TAB 1: OVERVIEW ── */}
            {activeTab === 'overview' && overviewData && (
              <div className="space-y-6">
                {/* KPI Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
                      {overviewData.summary?.avgScore || 88.5}%
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-1">Average Score</div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                      {overviewData.summary?.completedCount || 0}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-1">Completed</div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-amber-500">
                      {overviewData.summary?.pendingCount || 0}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-1">Pending</div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                    <div className={`text-2xl sm:text-3xl font-extrabold ${overviewData.summary?.overdueCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      {overviewData.summary?.overdueCount || 0}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-1">Past Due</div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-teal-600">
                      {attendanceData?.attendanceRate || 98.2}%
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-1">Attendance</div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">
                      {activityData?.summary?.streakDays || 4}d
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-1">Study Streak</div>
                  </div>
                </div>

                {/* Alerts */}
                {overviewData.alerts && overviewData.alerts.length > 0 && (
                  <div className="space-y-2">
                    {overviewData.alerts.map((al: any, i: number) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                          al.severity === 'high'
                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                            : al.severity === 'medium'
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-blue-50 border-blue-200 text-blue-900'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong>{al.title}:</strong> {al.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Two Column Grid */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Recent Coursework */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-extrabold text-sm text-[#1E225B] flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-600" /> Recent Coursework
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('assignments')}
                        className="text-xs font-bold text-[#1E225B] hover:underline"
                      >
                        View All →
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {overviewData.recentCoursework?.length === 0 ? (
                        <div className="text-slate-400 text-xs py-6 text-center">No coursework assigned yet.</div>
                      ) : (
                        overviewData.recentCoursework?.map((a: any) => (
                          <div
                            key={a.id}
                            onClick={() => setViewingAssignment(a)}
                            className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {a.subject_name || 'Subject'}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    a.submission_status === 'GRADED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {a.submission_status || 'PENDING'}
                                </span>
                              </div>
                              <div className="font-bold text-slate-900">{a.title}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No deadline'}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              {a.score != null ? (
                                <div className="font-extrabold text-emerald-700 text-sm">
                                  {a.score}/{a.max_score}
                                </div>
                              ) : (
                                <div className="text-[11px] text-slate-400 font-medium">Pending</div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Teacher Feedback Preview */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-extrabold text-sm text-[#1E225B] flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#F5921D]" /> Instructor Observations
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('feedback')}
                        className="text-xs font-bold text-[#1E225B] hover:underline"
                      >
                        All Feedback →
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      {feedbackData.length === 0 ? (
                        <div className="text-slate-400 py-6 text-center">No teacher feedback recorded yet.</div>
                      ) : (
                        feedbackData.slice(0, 2).map((fb: any) => (
                          <div key={fb.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between text-slate-400 text-[11px]">
                              <span className="font-bold text-slate-800">{fb.teacherName} · {fb.subject}</span>
                              <span>{fb.date}</span>
                            </div>
                            <p className="text-slate-700 italic leading-relaxed">&quot;{fb.content}&quot;</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: COURSEWORK ── */}
            {activeTab === 'assignments' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5" /> Filter:
                    </span>
                    {(['ALL', 'PENDING', 'SUBMITTED', 'GRADED', 'OVERDUE'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setAssignmentFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          assignmentFilter === st
                            ? 'bg-[#1E225B] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="text-xs text-slate-500">
                    Showing <strong>{filteredCoursework.length}</strong> of {coursework.length} items
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {filteredCoursework.map((cw) => (
                    <div
                      key={cw.id}
                      onClick={() => setViewingAssignment(cw)}
                      className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-[#1E225B] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            {cw.subject_name}
                          </span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                              cw.submission_status === 'GRADED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {cw.submission_status || 'PENDING'}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-[#1E225B]">{cw.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {cw.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Due: {cw.due_date ? new Date(cw.due_date).toLocaleDateString() : 'Open'}
                        </div>

                        {cw.score != null ? (
                          <div className="font-extrabold text-emerald-700 text-sm">
                            {cw.score}/{cw.max_score}
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400">View Details →</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 3: ACADEMIC PERFORMANCE ── */}
            {activeTab === 'performance' && performanceData && (
              <div className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {performanceData.subjects?.map((sub: any, idx: number) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="font-extrabold text-base text-[#1E225B]">{sub.name}</h3>
                          <div className="text-xs text-slate-500 mt-0.5">Teacher: {sub.teacherName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-extrabold text-[#1E225B]">{sub.currentAverage}%</div>
                          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                            <TrendingUp className="w-3.5 h-3.5" /> Trend: +2.5% this month
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <h4 className="font-bold text-slate-700 mb-1 flex items-center gap-1.5 text-xs text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmed Strengths
                          </h4>
                          <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                            {sub.strengths?.map((st: string, i: number) => (
                              <li key={i}>{st}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-700 mb-1 flex items-center gap-1.5 text-xs text-amber-800">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Focus &amp; Practice Recommendations
                          </h4>
                          <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                            {sub.focusAreas?.map((fa: string, i: number) => (
                              <li key={i}>{fa}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 4: CONCEPT MASTERY TREES ── */}
            {activeTab === 'mastery' && masteryData && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>AI-Guided Diagnostic Estimate:</strong> {masteryData.disclaimer}
                  </div>
                </div>

                {masteryData.categories?.map((cat: any, cIdx: number) => (
                  <div key={cIdx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <h3 className="font-extrabold text-base text-[#1E225B] flex items-center gap-2">
                      <Network className="w-4 h-4 text-teal-600" /> {cat.subject}
                    </h3>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {cat.concepts?.map((cp: any) => (
                        <div
                          key={cp.id}
                          className="p-4 rounded-2xl border border-slate-200/90 bg-[#FAF9F5] flex flex-col justify-between space-y-2 text-xs"
                        >
                          <div>
                            <span
                              className={`inline-block font-extrabold text-[10px] px-2 py-0.5 rounded-md mb-1.5 ${
                                cp.status === 'MASTERED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : cp.status === 'DEVELOPING'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {cp.status.replace('_', ' ')}
                            </span>
                            <div className="font-bold text-slate-900 leading-snug">{cp.title}</div>
                          </div>

                          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                            {cp.evidence}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── TAB 5: LEARNING ACTIVITY ── */}
            {activeTab === 'activity' && activityData && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs text-purple-950 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Student Psychological Safety &amp; Autonomy:</strong> {activityData.privacyNotice}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
                      {Math.round(activityData.summary?.totalStudyMinutes / 60)} hrs
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Total Socratic Study Time</div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#F5921D]">
                      {activityData.summary?.aiTutorQueries || 28}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">AI Guided Sessions</div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-teal-600">
                      {activityData.summary?.flashcardsReviewed || 48}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Flashcards Mastered (SM-2)</div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">
                      {activityData.summary?.quizzesAttempted || 5}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Diagnostic Quizzes</div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-[#1E225B] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" /> Weekly Study Consistency (Minutes / Day)
                  </h3>

                  <div className="flex items-end justify-between gap-2 h-36 pt-4 px-4 border-b border-slate-100">
                    {activityData.weeklyConsistency?.map((w: any, i: number) => {
                      const maxMin = 80;
                      const heightPercent = Math.min(100, Math.round((w.minutes / maxMin) * 100));
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div className="text-[10px] font-bold text-slate-500">{w.minutes}m</div>
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full max-w-[36px] bg-[#1E225B] hover:bg-[#F5921D] rounded-t-lg transition-all"
                          />
                          <div className="text-xs font-bold text-slate-700">{w.day}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 6: FEEDBACK ── */}
            {activeTab === 'feedback' && (
              <div className="space-y-4">
                {feedbackData.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs">
                    No teacher feedback records available yet.
                  </div>
                ) : (
                  feedbackData.map((fb: any, idx: number) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                      <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                        <div className="font-extrabold text-sm text-[#1E225B] flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-600" /> {fb.teacherName} · {fb.subject}
                        </div>
                        <div className="text-slate-400 text-[11px]">{fb.date}</div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                        &quot;{fb.content}&quot;
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── TAB 7: ATTENDANCE ── */}
            {activeTab === 'attendance' && attendanceData && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                      {attendanceData.presentDays}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Days Present</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">
                      {attendanceData.absentDays}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Days Absent</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-amber-500">
                      {attendanceData.lateDays}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Tardy / Late</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
                      {attendanceData.attendanceRate}%
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Net Attendance Rate</div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-[#1E225B] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" /> Official Academy Notices
                  </h3>
                  <div className="space-y-3">
                    {attendanceData.schoolAnnouncements?.map((nt: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                          <span>{nt.date}</span>
                          <span className="font-bold text-[#1E225B]">Official Announcement</span>
                        </div>
                        <div className="font-bold text-slate-900 text-sm">{nt.title}</div>
                        <p className="text-slate-600 leading-relaxed">{nt.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 8: PROFILE & SETTINGS ── */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 max-w-3xl mx-auto text-xs">
                <div>
                  <h3 className="font-extrabold text-base text-[#1E225B]">Parent Profile &amp; Linked Children</h3>
                  <p className="text-slate-500 mt-0.5">Manage your guardian profile and notification preferences.</p>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Parent Name:</span>
                    <span className="font-bold text-slate-900">{currentUser?.firstName} {currentUser?.lastName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Verified Email:</span>
                    <span className="font-mono text-slate-800">{currentUser?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Account Role:</span>
                    <span className="font-bold text-[#1E225B]">PARENT / GUARDIAN</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800">Linked Student Accounts:</h4>
                  {children.map((ch) => (
                    <div key={ch.student_id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{ch.student_first_name} {ch.student_last_name}</div>
                        <div className="text-[11px] text-slate-500">{ch.student_email} · {ch.relationship_type}</div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Active Association
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Assignment Details Modal */}
      {viewingAssignment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {viewingAssignment.subject_name || viewingAssignment.subject}
                </span>
                <h3 className="font-extrabold text-base text-[#1E225B] mt-1">
                  {viewingAssignment.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingAssignment(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-[#FAF9F5] border border-slate-200 rounded-2xl p-4">
              <div>
                <strong className="text-slate-700 block mb-0.5">Instructions &amp; Problem Statement:</strong>
                <p className="text-slate-600 leading-relaxed">{viewingAssignment.description || viewingAssignment.instructions}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                <div>
                  <strong>Submission Status:</strong> {viewingAssignment.submission_status || 'PENDING'}
                </div>
                <div>
                  <strong>Due Date:</strong> {viewingAssignment.due_date ? new Date(viewingAssignment.due_date).toLocaleDateString() : 'No deadline'}
                </div>
              </div>

              {viewingAssignment.score != null && (
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between font-bold text-emerald-800">
                    <span>Grade Recorded:</span>
                    <span>
                      {viewingAssignment.score} / {viewingAssignment.max_score} (
                      {Math.round((viewingAssignment.score / viewingAssignment.max_score) * 100)}%)
                    </span>
                  </div>
                  {viewingAssignment.teacher_feedback && (
                    <div className="mt-1.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 italic">
                      &quot;{viewingAssignment.teacher_feedback}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setViewingAssignment(null)}
                className="bg-[#1E225B] text-white font-bold px-4 py-2 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
