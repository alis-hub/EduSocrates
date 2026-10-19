'use client';
import { useEffect, useState } from 'react';
import { api, getStoredUser, logout } from '@/lib/api';
import {
  BookOpen, LogOut, PlusCircle, MessageSquare, CheckSquare2, ChevronLeft,
  ShieldAlert, Star, FileText, Eye, X,
} from 'lucide-react';

type View = 'list' | 'create' | 'audit' | 'submissions' | 'transcript';

const GUIDANCE_MODES = [
  { value: 'SOCRATIC_STRICT', label: 'Socratic Strict — guiding questions only' },
  { value: 'SOCRATIC_HINTS_ONLY', label: 'Hints Only — one hint per turn (max 2 per cycle)' },
  { value: 'TERMINOLOGY_ONLY', label: 'Terminology Only — vocabulary clarification, no scaffolding' },
  { value: 'DISABLED', label: 'AI Disabled — no AI tutor' },
];

const COURSEWORK_TYPES = ['HOMEWORK', 'QUIZ', 'ASSIGNMENT'];



const THREAT_COLORS: Record<string, string> = {
  BLOCKED: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-gray-100 text-gray-600',
  SAFE: 'bg-green-100 text-green-700',
};

export default function TeacherDashboard() {
  const user = getStoredUser();
  const [view, setView] = useState<View>('list');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const [coursework, setCoursework] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [selectedCw, setSelectedCw] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({ score: '', teacherFeedback: '' });
  const [aiTranscripts, setAiTranscripts] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessionMessages, setSessionMessages] = useState<any[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', sectionId: '', subjectId: '', courseworkType: 'HOMEWORK',
    aiGuidanceMode: 'SOCRATIC_STRICT', maxScore: '100', dueDate: '',
    aiSystemNotes: '', rubric: '', timeLimitMinutes: '',
  });
  const [previewDesc, setPreviewDesc] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 5000); };


  useEffect(() => {
    const init = async () => {
      const [cw, sub, sec, au] = await Promise.all([
        api.getTeacherCoursework().catch(() => []),
        api.getSubjects().catch(() => []),
        api.getSections().catch(() => []),
        api.getAuditLog(100).catch(() => ({ entries: [] })),
      ]);
      setCoursework(cw);
      setSubjects(sub);
      setSections(sec);
      setAuditLog(au?.entries ?? []);
      setLoading(false);
    };
    init();
  }, []);



  const openCoursework = async (cw: any) => {
    setSelectedCw(cw);
    setGradingId(null);
    setGradeForm({ score: '', teacherFeedback: '' });
    setView('submissions');
    const [subs, transcripts] = await Promise.all([
      api.getSubmissions(cw.id).catch(() => []),
      api.getAiTranscripts(cw.id).catch(() => []),
    ]);
    setSubmissions(subs);
    setAiTranscripts(transcripts);
  };

  const handleGrade = async (submissionId: string) => {
    try {
      await api.gradeSubmission(submissionId, {
        score: Number(gradeForm.score),
        teacherFeedback: gradeForm.teacherFeedback,
      });
      flash('Grade saved!');
      setGradingId(null);
      const subs = await api.getSubmissions(selectedCw.id).catch(() => []);
      setSubmissions(subs);
    } catch (err: any) { flash('Error: ' + err.message); }
  };

  const openTranscript = async (session: any) => {
    setSelectedSession(session);
    setTranscriptLoading(true);
    setView('transcript');
    const data = await api.getSessionMessages(session.session_id).catch(() => ({ messages: [] }));
    setSessionMessages(data.messages ?? []);
    setTranscriptLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sectionId) { flash('Error: Please select a section'); return; }
    try {
      await api.createCoursework({
        sectionId: form.sectionId,
        subjectId: form.subjectId,
        title: form.title,
        description: form.description,
        courseworkType: form.courseworkType,
        aiGuidanceMode: form.aiGuidanceMode,
        maxScore: Number(form.maxScore),
        dueDate: form.dueDate || null,
        aiSystemNotes: form.aiSystemNotes || null,
        rubric: form.rubric || null,
        timeLimitMinutes: form.timeLimitMinutes ? Number(form.timeLimitMinutes) : null,
      });
      flash('Coursework published!');
      setForm({ title: '', description: '', sectionId: '', subjectId: '', courseworkType: 'HOMEWORK', aiGuidanceMode: 'SOCRATIC_STRICT', maxScore: '100', dueDate: '', aiSystemNotes: '', rubric: '', timeLimitMinutes: '' });
      setPreviewDesc(false);
      const cw = await api.getTeacherCoursework().catch(() => []);
      setCoursework(cw);
      setView('list');
    } catch (err: any) { flash('Error: ' + err.message); }
  };



  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400';
  const btnPrimary = 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors';

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-gray-900">EduSocrates</span>
          <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">Teacher</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.firstName} {user?.lastName}</span>
          <button onClick={logout} className="text-gray-400 hover:text-red-500"><LogOut className="w-4 h-4" /></button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Breadcrumb / nav when inside submissions or transcript */}
        {(view === 'submissions' || view === 'transcript') && (
          <button onClick={() => setView(view === 'transcript' ? 'submissions' : 'list')}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            {view === 'transcript' ? `Back to ${selectedCw?.title} Submissions` : 'Back to My Coursework'}
          </button>
        )}

        {msg && (
          <div className={`rounded-lg p-3 mb-4 text-sm ${msg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {msg}
          </div>
        )}

        {/* ── Main Tab Nav ─────────────────────────────────────────────────── */}
        {(view === 'list' || view === 'create' || view === 'audit') && (
          <>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
              {[
                { key: 'list', label: 'My Coursework', icon: CheckSquare2 },
                { key: 'create', label: 'New Coursework', icon: PlusCircle },
                { key: 'audit', label: 'AI Audit Log', icon: ShieldAlert },
              ].map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setView(key as View)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === key ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>

            {/* ── Coursework List ─────────────────────────────────────────── */}
            {view === 'list' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">My Coursework</h2>
                  <span className="text-sm text-gray-400">{coursework.length} items</span>
                </div>
                {coursework.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">No coursework yet. Create your first assignment!</div>
                ) : coursework.map((cw: any) => (
                  <div key={cw.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => openCoursework(cw)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">{cw.coursework_type}</span>
                          <span className="text-xs text-gray-400">{cw.ai_guidance_mode}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{cw.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cw.description}</p>
                      </div>
                      <div className="text-right ml-4 shrink-0">
                        <div className="text-xs text-gray-400">{cw.due_date ? new Date(cw.due_date).toLocaleDateString() : 'No due date'}</div>
                        <div className="text-xs text-gray-400 mt-1">Max: {cw.max_score} pts</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Create Coursework ───────────────────────────────────────── */}
            {view === 'create' && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-5">Publish New Coursework</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Title *</label>
                    <input required placeholder="Assignment title" className={inputCls} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-600 block">Description (supports Markdown) *</label>
                      <button type="button" onClick={() => setPreviewDesc(p => !p)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                        {previewDesc ? '✏️ Edit Markdown' : '👁️ Preview Formatted'}
                      </button>
                    </div>
                    {previewDesc ? (
                      <div className="w-full border border-blue-100 bg-blue-50/50 rounded-lg p-3 text-sm min-h-[96px] whitespace-pre-wrap leading-relaxed text-gray-800">
                        {form.description || <span className="text-gray-400 italic">No description text entered.</span>}
                      </div>
                    ) : (
                      <textarea required rows={4} placeholder="Describe the assignment in detail (Markdown supported)..." className={inputCls + ' resize-none'} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Section *</label>
                      <select required className={inputCls} value={form.sectionId} onChange={e => setForm(p => ({ ...p, sectionId: e.target.value }))}>
                        <option value="">Select section</option>
                        {sections.map((s: any) => <option key={s.id} value={s.id}>{s.class_name} › {s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Subject *</label>
                      <select required className={inputCls} value={form.subjectId} onChange={e => setForm(p => ({ ...p, subjectId: e.target.value }))}>
                        <option value="">Select subject</option>
                        {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Coursework Type</label>
                      <select className={inputCls} value={form.courseworkType} onChange={e => {
                        const val = e.target.value;
                        setForm(p => ({
                          ...p,
                          courseworkType: val,
                          aiGuidanceMode: val === 'QUIZ' && p.aiGuidanceMode === 'SOCRATIC_STRICT' ? 'TERMINOLOGY_ONLY' : p.aiGuidanceMode,
                          timeLimitMinutes: val === 'QUIZ' && !p.timeLimitMinutes ? '15' : p.timeLimitMinutes,
                        }));
                      }}>
                        {COURSEWORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">AI Guidance Mode</label>
                      <select className={inputCls} value={form.aiGuidanceMode} onChange={e => setForm(p => ({ ...p, aiGuidanceMode: e.target.value }))}>
                        {GUIDANCE_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Max Score</label>
                      <input type="number" min={1} max={1000} className={inputCls} value={form.maxScore} onChange={e => setForm(p => ({ ...p, maxScore: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Due Date (optional)</label>
                      <input type="datetime-local" className={inputCls} value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                    </div>
                    {form.courseworkType === 'QUIZ' && (
                      <div className="col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <label className="text-xs font-semibold text-amber-900 mb-1 block">Quiz Time Limit (minutes)</label>
                        <input type="number" min={1} max={300} placeholder="e.g. 15" className={inputCls} value={form.timeLimitMinutes} onChange={e => setForm(p => ({ ...p, timeLimitMinutes: e.target.value }))} />
                        <p className="text-xs text-amber-700 mt-1">Student browser will show a live countdown timer and auto-submit when time expires.</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Grading Rubric (optional — injected into AI prompt as teacher guidance)</label>
                    <textarea rows={3} placeholder="E.g. '10pts: identifies Newton's 2nd Law. 10pts: correct equation setup. 5pts: unit analysis.'" className={inputCls + ' resize-none'} value={form.rubric} onChange={e => setForm(p => ({ ...p, rubric: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">AI Pedagogical Notes (private — injected into AI system prompt)</label>
                    <textarea rows={3} placeholder="E.g. 'Final answer is 42 J. Do not reveal. Guide students using conservation of energy.'" className={inputCls + ' resize-none'} value={form.aiSystemNotes} onChange={e => setForm(p => ({ ...p, aiSystemNotes: e.target.value }))} />
                  </div>
                  <button type="submit" className={btnPrimary}>Publish Coursework</button>
                </form>
              </div>
            )}


            {/* ── AI Audit Log ────────────────────────────────────────────── */}
            {view === 'audit' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">AI Guardrail Audit Log</h2>
                  <span className="text-sm text-gray-400">{auditLog.length} entries</span>
                </div>
                {auditLog.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">No AI sessions recorded yet.</div>
                ) : (
                  <div className="space-y-3">
                    {auditLog.map((entry: any, i: number) => (
                      <div key={i} className={`bg-white border rounded-xl p-4 shadow-sm ${entry.threat_level === 'BLOCKED' ? 'border-red-200' : 'border-gray-100'}`}>
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${THREAT_COLORS[entry.threat_level] ?? THREAT_COLORS.SAFE}`}>
                                {entry.threat_level}
                              </span>
                              {entry.first_name && (
                                <span className="text-xs text-gray-700 font-medium">{entry.first_name} {entry.last_name}</span>
                              )}
                              {entry.coursework_title && (
                                <span className="text-xs text-gray-400 truncate">({entry.coursework_title})</span>
                              )}
                              <span className="text-xs text-gray-400">{entry.intent_category}</span>
                              {entry.pii_detected && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">PII Detected</span>}
                              {entry.response_intercepted && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Response Intercepted</span>}
                            </div>
                            <p className="text-sm text-gray-700 truncate">{entry.student_message}</p>
                            {entry.matched_patterns?.length > 0 && (
                              <p className="text-xs text-gray-400 mt-0.5">Matched: {entry.matched_patterns.join(', ')}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {entry.timestamp ? new Date(entry.timestamp * 1000).toLocaleString() : (entry.created_at ? new Date(entry.created_at).toLocaleString() : '')}
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

        {/* ── Submissions View ──────────────────────────────────────────────── */}
        {view === 'submissions' && selectedCw && (
          <div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">{selectedCw.coursework_type}</span>
                <span className="text-xs text-gray-400">{selectedCw.ai_guidance_mode}</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{selectedCw.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{selectedCw.description}</p>
            </div>

            {/* AI Transcripts table */}
            {aiTranscripts.length > 0 && (
              <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5 mb-6">
                <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />AI Session Transcripts
                </h3>
                <div className="space-y-2">
                  {aiTranscripts.map((t: any) => (
                    <div key={t.session_id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{t.first_name} {t.last_name}</span>
                        <span className="text-xs text-gray-400 ml-2">{t.student_message_count} messages · {t.flagged_count > 0 ? <span className="text-red-600">{t.flagged_count} flagged</span> : 'no flags'}</span>
                      </div>
                      <button onClick={() => openTranscript(t)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-2 py-1 transition-colors">
                        <Eye className="w-3.5 h-3.5" />View Chat
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submissions table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />Student Submissions
                </h3>
                <span className="text-xs text-gray-400">{submissions.length} submissions</span>
              </div>
              {submissions.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No submissions yet.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {submissions.map((sub: any) => (
                    <div key={sub.id} className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{sub.first_name} {sub.last_name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">Submitted {new Date(sub.submitted_at).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {sub.status === 'GRADED' && (
                            <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                              <Star className="w-3.5 h-3.5" />{sub.score}/{selectedCw.max_score}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${sub.status === 'GRADED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {sub.status}
                          </span>
                        </div>
                      </div>

                      {sub.submission_text && (
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-3 max-h-32 overflow-y-auto">
                          {sub.submission_text}
                        </div>
                      )}

                      {sub.teacher_feedback && (
                        <div className="bg-blue-50 rounded-lg p-2.5 text-sm text-blue-800 mb-3">
                          <span className="text-xs font-medium text-blue-600">Your feedback: </span>{sub.teacher_feedback}
                        </div>
                      )}

                      {gradingId === sub.id ? (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">Score (max {selectedCw.max_score})</label>
                              <input type="number" min={0} max={selectedCw.max_score} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400" value={gradeForm.score} onChange={e => setGradeForm(p => ({ ...p, score: e.target.value }))} />
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs text-gray-500 mb-1 block">Feedback (optional)</label>
                              <input placeholder="Written feedback for student..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400" value={gradeForm.teacherFeedback} onChange={e => setGradeForm(p => ({ ...p, teacherFeedback: e.target.value }))} />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleGrade(sub.id)} className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-colors">Save Grade</button>
                            <button onClick={() => setGradingId(null)} className="text-gray-500 hover:text-gray-700 text-sm py-1.5 px-3 rounded-lg transition-colors">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setGradingId(sub.id); setGradeForm({ score: sub.score ?? '', teacherFeedback: sub.teacher_feedback ?? '' }); }}
                          className="text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1">
                          <Star className="w-3.5 h-3.5" />{sub.status === 'GRADED' ? 'Update Grade' : 'Grade Submission'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Transcript View ───────────────────────────────────────────────── */}
        {view === 'transcript' && selectedSession && (
          <div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Chat Transcript — {selectedSession.first_name} {selectedSession.last_name}
              </h2>
              <p className="text-xs text-gray-400 mt-1">{selectedSession.student_message_count} messages · Session {selectedSession.session_id?.slice(0, 8)}…</p>
            </div>

            {transcriptLoading ? (
              <div className="text-center py-12 text-gray-400">Loading messages…</div>
            ) : sessionMessages.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No messages in this session (session may have expired from Redis).</div>
            ) : (
              <div className="space-y-3">
                {sessionMessages.map((msg: any, i: number) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-sm'}`}>
                      <div className="text-xs opacity-60 mb-1">{msg.role === 'user' ? 'Student' : 'AI Tutor'}</div>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
