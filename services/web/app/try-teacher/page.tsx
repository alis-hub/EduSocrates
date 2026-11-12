'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getApiBaseUrl } from '@/lib/api';
import { KaTeXMath } from '@/components/KaTeXMath';
import { BrandLogo } from '@/components/BrandLogo';
import { BookOpen, Clock, FlaskConical, RefreshCw, Send, ShieldCheck } from 'lucide-react';

const SANDBOX_TOKEN_KEY = 'edusocrates_teacher_sandbox_token';

export default function TryTeacherSandboxPage() {
  const [sandbox, setSandbox] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Editable teacher knobs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rubricOrNotes, setRubricOrNotes] = useState('');
  const [aiMode, setAiMode] = useState('SOCRATIC_STRICT');

  // Simulated student chat
  const [studentPrompt, setStudentPrompt] = useState('');
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [streaming, setStreaming] = useState(false);

  const hydrate = (sb: any) => {
    setSandbox(sb);
    const d = sb.sample_assignment_data || {};
    setTitle(d.assignmentTitle || '');
    setDescription(d.assignmentDescription || '');
    setRubricOrNotes(d.rubricOrNotes || '');
    setAiMode(d.aiGuidanceMode || 'SOCRATIC_STRICT');
  };

  const startFresh = async () => {
    setLoading(true);
    setHistory([]);
    try {
      const sb = await api.hub.startTeacherSandbox();
      localStorage.setItem(SANDBOX_TOKEN_KEY, sb.temporary_session_token);
      hydrate(sb);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const existing = localStorage.getItem(SANDBOX_TOKEN_KEY);
    if (existing) {
      api.hub
        .getTeacherSandbox(existing)
        .then((sb) => {
          hydrate(sb);
          setLoading(false);
        })
        .catch(() => startFresh());
    } else {
      startFresh();
    }
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandbox) return;
    setSaving(true);
    try {
      const updated = await api.hub.updateTeacherSandbox(sandbox.temporary_session_token, {
        assignmentTitle: title,
        assignmentDescription: description,
        rubricOrNotes,
        aiGuidanceMode: aiMode,
      });
      hydrate(updated);
      setMsg('Live sandbox rubric & guardrail mode updated! Test a simulated student prompt on the right.');
      setTimeout(() => setMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const runSimulation = async (overridePrompt?: string) => {
    const prompt = (overridePrompt ?? studentPrompt).trim();
    if (!prompt || !sandbox || streaming) return;
    if (!overridePrompt) setStudentPrompt('');

    const nextHistory = [...history, { role: 'user', content: prompt }];
    setHistory([...nextHistory, { role: 'assistant', content: '' }]);
    setStreaming(true);

    try {
      const res = await fetch(
        `${getApiBaseUrl()}/sandbox/teacher/${sandbox.temporary_session_token}/simulate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentPrompt: prompt, history: history.slice(-8) }),
        },
      );
      if (!res.body) throw new Error('Stream failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            const p = JSON.parse(line.slice(6));
            if (p.token) {
              acc += p.token;
              setHistory([...nextHistory, { role: 'assistant', content: acc }]);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      setHistory([...nextHistory, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setStreaming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Spinning up ephemeral 2-hour Teacher Sandbox...
      </div>
    );
  }

  const simulatedStudents = sandbox?.sample_assignment_data?.simulatedStudents || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/hub" className="flex items-center gap-2 font-bold text-slate-900">
            <BrandLogo variant="navbar" showTagline />
          </Link>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
            <FlaskConical className="w-3.5 h-3.5" /> Try as a Teacher (2h Ephemeral Sandbox)
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {sandbox?.expires_at && (
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5" /> Expires {new Date(sandbox.expires_at).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={startFresh}
            className="flex items-center gap-1 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Sandbox
          </button>
          <Link href="/schools" className="bg-purple-600 text-white font-semibold px-3 py-1.5 rounded-lg">
            Onboard Real School
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {msg && (
          <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 text-sm">
            {msg}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Editable Rubric & Guardrail Mode */}
          <form
            onSubmit={handleSaveSettings}
            className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-lg text-slate-900">Instructor Assignment &amp; Guardrail Controls</h1>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Sample Assignment Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Prompt Given to Students</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Private Teacher Rubric / Protected Answer Terms
              </label>
              <textarea
                rows={3}
                value={rubricOrNotes}
                onChange={(e) => setRubricOrNotes(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Socratic Strictness Mode</label>
              <select
                value={aiMode}
                onChange={(e) => setAiMode(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="SOCRATIC_STRICT">SOCRATIC_STRICT (Questions Only)</option>
                <option value="SOCRATIC_HINTS_ONLY">SOCRATIC_HINTS_ONLY (Bounded Hints)</option>
                <option value="TERMINOLOGY_ONLY">TERMINOLOGY_ONLY (Vocabulary Definitions Only)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm"
            >
              {saving ? 'Applying...' : 'Apply Rubric & Mode Live'}
            </button>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Test Simulated Student Prompts (1-Click)
              </h2>
              {simulatedStudents.map((st: any) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => runSimulation(st.samplePrompt)}
                  className="w-full text-left bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-xl p-3 transition-colors"
                >
                  <div className="text-xs font-bold text-slate-900">{st.name}</div>
                  <div className="text-xs text-slate-700 mt-0.5">&ldquo;{st.samplePrompt}&rdquo;</div>
                  <div className="text-[11px] text-slate-500 mt-1">{st.note}</div>
                </button>
              ))}
            </div>
          </form>

          {/* Right: Live Guardrail Simulation Output */}
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[640px] overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
              <div className="font-bold text-sm text-slate-900">Simulated Student View ({aiMode})</div>
              <div className="text-xs text-slate-500">
                Observe how GuruMera enforces your rubric &amp; rejects cheat / injection attempts live.
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {history.length === 0 && (
                <div className="text-center py-20 text-slate-400 text-sm">
                  Click any simulated student prompt on the left or type a test prompt below.
                </div>
              )}
              {history.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[84%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                    }`}
                  >
                    {m.role === 'assistant' ? (
                      <KaTeXMath text={m.content || '...'} />
                    ) : (
                      <span>{m.content}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                runSimulation();
              }}
              className="p-4 border-t border-slate-100 flex gap-2"
            >
              <input
                value={studentPrompt}
                onChange={(e) => setStudentPrompt(e.target.value)}
                placeholder="Type a custom student prompt or adversarial test..."
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                type="submit"
                disabled={streaming || !studentPrompt.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" /> Test
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
