import Link from 'next/link';
import {
  BookOpen,
  Compass,
  FlaskConical,
  GraduationCap,
  Layers,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-lg tracking-tight">EduSocrates</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">
              v2.3
            </span>
          </div>
          <nav className="flex items-center gap-3 text-sm font-medium">
            <Link href="/hub" className="text-slate-600 hover:text-indigo-600 px-2 py-1">
              Public Hub
            </Link>
            <Link href="/try-teacher" className="text-slate-600 hover:text-indigo-600 px-2 py-1">
              Try as Teacher
            </Link>
            <Link href="/schools" className="text-slate-600 hover:text-indigo-600 px-2 py-1">
              For Schools
            </Link>
            <Link
              href="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            5-Layer Guardrailed Socratic Learning Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-5">
            AI That Guides Discovery — Never Hands Over the Answer
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            Explore interactive Socratic tutoring, spaced-repetition flashcards, mastery concept maps,
            and live collaborative STEM whiteboards in the Public Hub — or onboard your school in minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/hub"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition-colors"
            >
              <Compass className="w-4 h-4" /> Open Public Learning Hub
            </Link>
            <Link
              href="/try-teacher"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition-colors"
            >
              <FlaskConical className="w-4 h-4" /> Try Teacher Sandbox (2h Demo)
            </Link>
            <Link
              href="/schools"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <GraduationCap className="w-4 h-4" /> Onboard Your School
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: '5-Layer Anti-Cheat AI Guardrails',
              desc: 'Prompt-injection defense, intent routing, and server-side answer-key shielding ensure real conceptual mastery.',
            },
            {
              icon: Layers,
              title: '7 Public STEM & Study Tools',
              desc: 'Socratic Sandbox, Code Debugger, SM-2 Flashcards, Knowledge Maps, Misconception Quizzes, Grapher, and Whiteboards.',
            },
            {
              icon: Users,
              title: 'Seamless Hub-to-School Migration',
              desc: 'Start as an independent learner in the Public Hub and join any school later via Invite Code without losing streaks or XP.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-slate-900 mb-2">{f.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
