'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, getApiBaseUrl, getToken } from '@/lib/api';
import { KaTeXMath } from '@/components/KaTeXMath';
import { ArrowLeft, BookOpen, Send, Sparkles } from 'lucide-react';

export default function SharedCourseworkPage() {
  const params = useParams<{ id: string }>();
  const courseworkId = params?.id || '';
  const [cw, setCw] = useState<any>(null);
  const [error, setError] = useState('');
  const [msgs, setMsgs] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    if (!courseworkId) return;
    api
      .getPublicCourseworkById(courseworkId)
      .then(setCw)
      .catch((err) => setError(err.message || 'Assignment not found or private'));
  }, [courseworkId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !cw || streaming) return;
    setInput('');
    const next = [...msgs, { role: 'user' as const, content: text }];
    setMsgs([...next, { role: 'assistant', content: '' }]);
    setStreaming(true);

    try {
      const token = getToken();
      const res = await fetch(`${getApiBaseUrl()}/hub/sandbox/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          topic: `${cw.subject_name}: ${cw.title}`,
          message: `${text}\n\n[Assignment Prompt Context: ${cw.description}]`,
          level: 'HIGH_SCHOOL',
          mode: 'CHECK_MY_LOGIC',
          history: msgs.slice(-8),
        }),
      });
      if (!res.body) throw new Error('Stream unavailable');
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
              setMsgs([...next, { role: 'assistant', content: acc }]);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      setMsgs([...next, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/hub" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Public Learning Hub
        </Link>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
            {error}
          </div>
        ) : !cw ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
            Loading assignment...
          </div>
        ) : (
          <>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                <span className="bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full">
                  {cw.subject_name}
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> {cw.school_name}
                </span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {cw.access_level}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{cw.title}</h1>
              <div className="mt-3 text-sm text-slate-700">
                <KaTeXMath text={cw.description} />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[460px] overflow-hidden shadow-sm">
              <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2 text-sm font-semibold text-indigo-950">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Socratic Study Tutor for this Assignment
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {msgs.length === 0 && (
                  <p className="text-center py-12 text-slate-400 text-sm">
                    Ask a conceptual question or share your first attempt below!
                  </p>
                )}
                {msgs.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${
                        m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <KaTeXMath text={m.content || '...'} />
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Explain your approach or ask for a guiding question..."
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={streaming || !input.trim()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Ask
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
