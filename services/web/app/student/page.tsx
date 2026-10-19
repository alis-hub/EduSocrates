'use client';
import { useEffect, useState, useRef } from 'react';
import { api, getStoredUser, logout } from '@/lib/api';
import SocraticChatStream from '@/components/SocraticChatStream';
import { BookOpen, Clock, CheckCircle2, MessageSquare, Upload, LogOut, ChevronRight, X, Filter, Timer } from 'lucide-react';

interface Coursework {
  id: string;
  title: string;
  subject_name: string;
  subject_id: string;
  section_name: string;
  description: string;
  coursework_type: string;
  due_date: string;
  submission_status?: string;
  score?: number;
  teacher_feedback?: string;
  ai_guidance_mode: string;
  max_score: number;
  time_limit_minutes?: number;
  submission_text?: string;
}


type FilterTab = 'all' | 'upcoming' | 'overdue' | 'completed';

function isOverdue(cw: Coursework): boolean {
  return !cw.submission_status && !!cw.due_date && new Date(cw.due_date) < new Date();
}

function isUpcoming(cw: Coursework): boolean {
  return !cw.submission_status && !!cw.due_date && new Date(cw.due_date) >= new Date();
}

function isCompleted(cw: Coursework): boolean {
  return cw.submission_status === 'SUBMITTED' || cw.submission_status === 'GRADED';
}

export default function StudentDashboard() {
  const user = getStoredUser();
  const [coursework, setCoursework] = useState<Coursework[]>([]);
  const [allCoursework, setAllCoursework] = useState<Coursework[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Coursework | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');
  const [view, setView] = useState<'list' | 'detail' | 'chat'>('list');

  // Filters
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [subjectFilter, setSubjectFilter] = useState('');

  // Quiz timer
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.getStudentCoursework()
      .then(data => {
        setAllCoursework(data);
        setCoursework(data);
      })
      .catch(() => setAllCoursework([]))
      .finally(() => setLoading(false));
  }, []);

  // Apply tab + subject filter whenever they change
  useEffect(() => {
    let filtered = allCoursework;
    if (subjectFilter) {
      filtered = filtered.filter(cw => cw.subject_id === subjectFilter);
    }
    if (activeTab === 'upcoming') filtered = filtered.filter(isUpcoming);
    else if (activeTab === 'overdue') filtered = filtered.filter(isOverdue);
    else if (activeTab === 'completed') filtered = filtered.filter(isCompleted);
    setCoursework(filtered);
  }, [activeTab, subjectFilter, allCoursework]);

  // Quiz timer countdown
  useEffect(() => {
    if (timerSeconds === null) return;
    if (timerSeconds <= 0) {
      handleAutoSubmit();
      return;
    }
    timerRef.current = setInterval(() => {
      setTimerSeconds(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerSeconds]);

  async function handleAutoSubmit() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerSeconds(null);
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      await api.submitCoursework({ courseworkId: selected.id, submissionText });
      setSubmitMsg('Time up — answer auto-submitted!');
      const updated = await api.getStudentCoursework().catch(() => allCoursework);
      setAllCoursework(updated);
    } catch {
      setSubmitMsg('Auto-submit failed. Please submit manually.');
    } finally {
      setSubmitting(false);
    }
  }

  async function openCoursework(cw: Coursework) {
    setSelected(cw);
    setSessionId(null);
    setSubjectId(null);
    setSubmissionText(cw.submission_text || '');
    setSubmitMsg('');
    setView('detail');


    // Start quiz timer if applicable
    if (cw.coursework_type === 'QUIZ' && cw.time_limit_minutes && !cw.submission_status) {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimerSeconds(cw.time_limit_minutes * 60);
    } else {
      setTimerSeconds(null);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  async function startAiChat() {
    if (!selected) return;
    try {
      const res = await api.startAiSession(selected.id);
      setSessionId(res.session_id);
      setSubjectId(res.subjectId ?? null);
      setView('chat');
    } catch (err: any) {
      alert('Failed to start AI session: ' + err.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerSeconds(null);
    setSubmitting(true);
    try {
      await api.submitCoursework({ courseworkId: selected.id, submissionText });
      setSubmitMsg('Submitted successfully!');
      const updated = await api.getStudentCoursework().catch(() => allCoursework);
      setAllCoursework(updated);
    } catch (err: any) {
      setSubmitMsg('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const statusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-500';
    if (status === 'GRADED') return 'bg-green-100 text-green-700';
    if (status === 'SUBMITTED') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-500';
  };

  // Unique subjects from all coursework
  const subjects = Array.from(
    new Map(allCoursework.map(cw => [cw.subject_id, cw.subject_name])).entries()
  );

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: allCoursework.length },
    { key: 'upcoming', label: 'Upcoming', count: allCoursework.filter(isUpcoming).length },
    { key: 'overdue', label: 'Overdue', count: allCoursework.filter(isOverdue).length },
    { key: 'completed', label: 'Completed', count: allCoursework.filter(isCompleted).length },
  ];

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          {view !== 'list' && (
            <button onClick={() => { setView('list'); setTimerSeconds(null); if (timerRef.current) clearInterval(timerRef.current); }} className="mr-2 text-gray-400 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          )}
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-gray-900">EduSocrates</span>
          <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5">Student</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Quiz countdown timer */}
          {timerSeconds !== null && (
            <div className={`flex items-center gap-1.5 text-sm font-mono font-bold px-3 py-1 rounded-lg ${
              timerSeconds < 60 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-amber-100 text-amber-700'
            }`}>
              <Timer className="w-4 h-4" />
              {formatTimer(timerSeconds)}
            </div>
          )}
          <span className="text-sm text-gray-600">{user?.firstName} {user?.lastName}</span>
          <button onClick={logout} className="text-gray-400 hover:text-red-500">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Content */}
      {view === 'list' && (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Coursework</h1>
          <p className="text-gray-500 mb-6">Your assigned tasks — click any to view details or chat with the Socratic AI tutor.</p>

          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            {/* Tabs */}
            <div className="flex bg-white border border-gray-200 rounded-lg p-1 gap-0.5">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? 'bg-blue-500 text-blue-100' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Subject filter */}
            {subjects.length > 1 && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  value={subjectFilter}
                  onChange={e => setSubjectFilter(e.target.value)}
                >
                  <option value="">All Subjects</option>
                  {subjects.map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : coursework.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              {activeTab !== 'all' || subjectFilter ? 'No coursework matches your filters.' : 'No coursework assigned yet.'}
            </div>
          ) : (
            <div className="space-y-3">
              {coursework.map(cw => (
                <button key={cw.id} onClick={() => openCoursework(cw)}
                  className={`w-full text-left bg-white rounded-xl border shadow-sm p-5 hover:border-blue-200 hover:shadow-md transition-all flex items-center justify-between gap-4 ${
                    isOverdue(cw) ? 'border-red-200' : 'border-gray-100'
                  }`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs bg-indigo-100 text-indigo-700 rounded px-2 py-0.5">{cw.coursework_type}</span>
                      <span className={`text-xs rounded px-2 py-0.5 ${statusColor(cw.submission_status)}`}>
                        {cw.submission_status || (isOverdue(cw) ? 'OVERDUE' : 'PENDING')}
                      </span>
                      {cw.ai_guidance_mode !== 'DISABLED' && (
                        <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded px-2 py-0.5">AI Tutor</span>
                      )}
                      {cw.time_limit_minutes && (
                        <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 rounded px-2 py-0.5 flex items-center gap-1">
                          <Timer className="w-3 h-3" />{cw.time_limit_minutes}min
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">{cw.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{cw.subject_name} &bull; {cw.section_name}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      Due {cw.due_date ? new Date(cw.due_date).toLocaleDateString() : 'No due date'}
                    </div>
                  </div>
                  {cw.score !== null && cw.score !== undefined && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{cw.score}/{cw.max_score}</div>
                      <div className="text-xs text-gray-400">score</div>
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'detail' && selected && (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs bg-indigo-100 text-indigo-700 rounded px-2 py-0.5">{selected.coursework_type}</span>
              <span className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">{selected.subject_name}</span>
              {selected.time_limit_minutes && (
                <span className="text-xs bg-amber-100 text-amber-700 rounded px-2 py-0.5 flex items-center gap-1">
                  <Timer className="w-3 h-3" />Timed: {selected.time_limit_minutes} min
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{selected.title}</h2>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selected.description}</p>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Due: {selected.due_date ? new Date(selected.due_date).toLocaleString() : 'No due date'}</span>
              <span className="text-sm text-gray-500">&bull; Max: {selected.max_score} points</span>
            </div>

            {/* Teacher feedback if graded */}
            {selected.teacher_feedback && (
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-600 mb-1">Teacher Feedback</p>
                <p className="text-sm text-blue-800">{selected.teacher_feedback}</p>
              </div>
            )}
          </div>

          {/* AI Tutor button */}
          {selected.ai_guidance_mode !== 'DISABLED' && !selected.submission_status && (
            <button onClick={startAiChat}
              className="w-full mb-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors">
              <MessageSquare className="w-4 h-4" />
              Open Socratic AI Tutor
            </button>
          )}

          {/* Submit form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Submit Your Work
              {timerSeconds !== null && (
                <span className={`ml-auto font-mono text-sm px-2 py-0.5 rounded ${timerSeconds < 60 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  <Timer className="w-3.5 h-3.5 inline mr-1" />{formatTimer(timerSeconds)}
                </span>
              )}
            </h3>
            {submitMsg && (
              <div className={`rounded-lg p-3 mb-4 text-sm flex items-center gap-2 ${submitMsg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {!submitMsg.startsWith('Error') && <CheckCircle2 className="w-4 h-4" />}
                {submitMsg}
              </div>
            )}
            <textarea
              rows={8}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Write or paste your answer here..."
              value={submissionText}
              onChange={e => setSubmissionText(e.target.value)}
              disabled={selected.submission_status === 'GRADED'}
            />
            {selected.submission_status !== 'GRADED' ? (
              <button type="submit" disabled={submitting || !submissionText.trim()}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm">
                {submitting ? 'Submitting...' : selected.submission_status ? 'Update Submission / Milestone' : 'Submit Answer'}
              </button>
            ) : (
              <p className="mt-3 text-sm text-gray-400 font-medium">Graded submission locked &bull; Score: {selected.score} pts</p>
            )}

          </form>
        </div>
      )}

      {view === 'chat' && selected && sessionId && (
        <div className="max-w-4xl mx-auto px-6 py-6 h-[calc(100vh-73px)]">
          <SocraticChatStream
            sessionId={sessionId}
            subjectId={subjectId ?? undefined}
            courseworkTitle={selected.title}
            subjectName={selected.subject_name}
          />
        </div>
      )}
    </div>
  );
}
