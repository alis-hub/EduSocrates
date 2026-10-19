'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ShieldAlert } from 'lucide-react';

interface Message {
  role: 'student' | 'assistant' | 'system';
  content: string;
  intercepted?: boolean;
}

interface Props {
  sessionId: string;
  courseworkTitle: string;
  subjectName: string;
  /** Passed to the chat stream endpoint for per-subject quota tracking. */
  subjectId?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function SocraticChatStream({ sessionId, subjectId, courseworkTitle, subjectName }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Welcome! I'm EduSocrates, your Socratic tutor for **${subjectName} — ${courseworkTitle}**. I'm here to help you think through this problem step by step. What part would you like to explore first? 🔍`,
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || streaming) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'student', content: userMsg }]);
    setStreaming(true);

    // Add empty assistant bubble to stream into
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const token = localStorage.getItem('edusocrates_token') || '';
      const res = await fetch(`${API_BASE}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // subjectId forwarded for per-subject rate limiting on the server
        body: JSON.stringify({ sessionId, message: userMsg, subjectId }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson.message || `AI service error (${res.status}). Please try again.`;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: `⚠️ ${errMsg}`,
            intercepted: true,
          };
          return updated;
        });
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let intercepted = false;


      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split('\n').filter(l => l.startsWith('data:'));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(5).trim());
            if (data.done) break;
            if (data.token) {
              if (data.intercepted) intercepted = true;
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.role === 'assistant') {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + data.token,
                    intercepted: data.intercepted || last.intercepted,
                  };
                }
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Sorry, there was a connection issue. Please try again.',
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-blue-50">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-900">EduSocrates Tutor</p>
          <p className="text-xs text-blue-600">{subjectName} &bull; Socratic Mode</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          Active
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center mt-0.5">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'student'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : msg.intercepted
                ? 'bg-amber-50 text-amber-800 border border-amber-200 rounded-bl-sm'
                : 'bg-white text-gray-800 border border-gray-200 shadow-xs rounded-bl-sm'
            }`}>
              {msg.intercepted && (
                <div className="flex items-center gap-1.5 mb-1.5 text-amber-600 text-xs font-medium">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Guardrail activated
                </div>
              )}
              {msg.content}
              {msg.role === 'assistant' && streaming && i === messages.length - 1 && (
                <span className="inline-block w-1.5 h-4 bg-blue-400 animate-pulse ml-0.5 align-middle" />
              )}
            </div>
            {msg.role === 'student' && (
              <div className="w-7 h-7 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center mt-0.5">
                <User className="w-3.5 h-3.5 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2 items-end">
          <textarea
            className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none min-h-[44px] max-h-32"
            rows={1}
            placeholder="Ask a question or share your thinking..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
            disabled={streaming}
          />
          <button
            onClick={sendMessage}
            disabled={streaming || !input.trim()}
            className="h-[44px] w-[44px] flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          EduSocrates guides you — it will not give direct answers. Your queries are rate-limited (15/hour).
        </p>
      </div>
    </div>
  );
}

