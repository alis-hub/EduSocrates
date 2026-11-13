'use client';

import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { MarketingFooter } from '@/components/MarketingFooter';
import {
  Brain,
  CheckCircle2,
  Compass,
  GraduationCap,
  Heart,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E225B] flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-[#E7E3D8] bg-white/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo variant="navbar" />
          </Link>
          <nav className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/hub" className="text-slate-600 hover:text-[#1E225B]">Public Hub</Link>
            <Link href="/schools" className="text-slate-600 hover:text-[#1E225B]">For Schools</Link>
            <Link href="/pricing" className="text-slate-600 hover:text-[#1E225B]">Pricing</Link>
            <Link href="/login" className="bg-[#1E225B] hover:bg-[#141740] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="py-16 md:py-20 px-5 sm:px-6 text-center max-w-4xl mx-auto">
          <div className="inline-block mb-3">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-[#F5921D] px-3.5 py-1 rounded-full bg-[#F5921D]/10 border border-[#F5921D]/20">
              – Discover the Why! –
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1E225B] tracking-tight leading-tight mb-5">
            Restoring the Spirit of Wonder to Generative Learning
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            We built GuruMera because AI shouldn&apos;t be a shortcut that robs learners of the struggle and joy of problem-solving. It should be a patient, wise tutor that guides curiosity.
          </p>
        </section>

        {/* Core Principles */}
        <section className="py-12 bg-white border-y border-[#E7E3D8] px-5 sm:px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#1E225B]/10 text-[#1E225B] flex items-center justify-center font-bold">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#1E225B] text-lg">The Socratic Way</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Direct answers cause cognitive bypass. Socratic inquiry builds durable neural pathways by asking progressive questions, testing edge cases, and uncovering misconceptions.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F5921D]/15 text-[#DC7B0C] flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#1E225B] text-lg">Academic Integrity First</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                With 5-layer server-side guardrails, prompt-injection defense, and server-side answer-key shielding, educators can trust students to use AI without cheating.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#249EA0]/15 text-[#249EA0] flex items-center justify-center font-bold">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#1E225B] text-lg">Universal Educational Access</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every learner worldwide deserves access to high-order tutoring. Our Public Learning Hub is 100% free and open, with continuous progress carrying forward into school classrooms.
              </p>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="py-16 text-center px-5 sm:px-6">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
            <h2 className="text-2xl font-bold text-[#1E225B]">Experience Socratic Learning Today</h2>
            <p className="text-sm text-slate-600">
              Start in our free Public Hub or explore a live 2-hour sandbox simulation designed for classroom educators.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/hub" className="bg-[#F5921D] hover:bg-[#DC7B0C] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md">
                Start Learning for Free
              </Link>
              <Link href="/schools" className="bg-white hover:bg-slate-50 text-[#1E225B] border border-slate-300 font-semibold px-5 py-3 rounded-xl text-sm transition-all">
                For Schools &amp; Academies
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Marketing Footer */}
      <MarketingFooter />
    </div>
  );
}
