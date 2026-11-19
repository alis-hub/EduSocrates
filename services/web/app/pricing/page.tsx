'use client';

import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { MarketingFooter } from '@/components/MarketingFooter';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  GraduationCap,
  HelpCircle,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function PricingPage() {
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
            <Link href="/try-teacher" className="text-slate-600 hover:text-[#1E225B]">Teacher Demo</Link>
            <Link href="/schools" className="text-slate-600 hover:text-[#1E225B]">For Schools</Link>
            <Link href="/login" className="bg-[#1E225B] hover:bg-[#141740] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Pricing Hero */}
      <main className="flex-1 max-w-6xl mx-auto px-5 sm:px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-block mb-3">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-[#F5921D] px-3.5 py-1 rounded-full bg-[#F5921D]/10 border border-[#F5921D]/20">
              – Discover the Why! –
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1E225B] tracking-tight mb-4">
            Free for students. Simple pricing for schools.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Individual students learn for free. Schools, academies and tuition teachers: email us for pricing.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Free Tier */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="inline-block text-xs font-bold text-[#249EA0] uppercase tracking-wider bg-teal-50 border border-teal-200 px-3 py-1 rounded-full mb-3">
                Individual Students
              </div>
              <h2 className="text-2xl font-black text-[#1E225B]">Free</h2>
              <div className="text-3xl font-extrabold text-[#1E225B] mt-2 mb-1">
                Rs 0 <span className="text-xs text-slate-400 font-normal">for individual students</span>
              </div>
              <p className="text-xs text-slate-600 mb-6">
                No payment details needed. Fair-use limits apply to AI tutor messages.
              </p>

              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Universal Public Learning Hub access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>2-Tier Socratic Flashcard Generator (SM-2)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Interactive Concept Knowledge Trees &amp; Checkpoints</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live Peer Collaborative Whiteboards</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Study streaks and XP</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Join a teacher's class with a class code</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                href="/hub"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#F5921D] hover:bg-[#DC7B0C] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md"
              >
                <Compass className="w-4 h-4" /> Start Learning for Free
              </Link>
            </div>
          </div>

          {/* Academy Enterprise Tier */}
          <div className="bg-white border-2 border-[#1E225B] rounded-2xl p-8 shadow-md relative flex flex-col justify-between">
            <div>
              <div className="inline-block text-xs font-bold text-[#F5921D] uppercase tracking-wider bg-[#F5921D]/10 border border-[#F5921D]/30 px-3 py-1 rounded-full mb-3">
                Schools, Academies &amp; Tuition Teachers
              </div>
              <h2 className="text-2xl font-black text-[#1E225B]">For Schools &amp; Teachers</h2>
              <div className="text-3xl font-extrabold text-[#1E225B] mt-2 mb-1">
                Contact sales <span className="text-xs text-slate-400 font-normal">for pricing</span>
              </div>
              <p className="text-xs text-slate-600 mb-6">
                Set up your school or class in a minute, then email us to agree pricing for your students.
              </p>

              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Classes, sections and rosters with simple class codes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Coursework with rubrics and AI strictness settings</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Teachers can review AI conversations; every view is logged</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Each school's data kept separate from every other school's</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Parent view with result acknowledgement</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Support by email</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <a
                href="mailto:info@gurumera.com?subject=GuruMera%20pricing%20enquiry"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md"
              >
                <GraduationCap className="w-4 h-4" /> Email info@gurumera.com
              </a>
              <Link href="/start/school" className="block text-center text-xs text-[#1E225B] font-semibold mt-3 hover:underline">
                Or set up your school or class first
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Preview */}
        <section className="bg-white border border-[#E7E3D8] rounded-2xl p-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-[#F5921D]" />
            <h3 className="font-bold text-[#1E225B] text-lg">Frequently Asked Questions</h3>
          </div>
          <div className="space-y-4 text-xs md:text-sm text-slate-700">
            <div>
              <h4 className="font-bold text-[#1E225B]">Can teachers test the platform before committing?</h4>
              <p className="mt-1 text-slate-600 leading-relaxed">
                Yes. The teacher demo at /try-teacher needs no signup, so you can try setting coursework and see how the tutor responds to students.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#1E225B]">How much does it cost for a school or academy?</h4>
              <p className="mt-1 text-slate-600 leading-relaxed">
                Pricing depends on the size of your school or class. Email info@gurumera.com with your school name and number of students and we will reply with a quote.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Marketing Footer */}
      <MarketingFooter />
    </div>
  );
}
