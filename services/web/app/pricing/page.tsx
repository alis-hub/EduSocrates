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
            Transparent, Simple Plans for Every Learning Stage
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Free forever for self-directed public learners. Powerful, compliant multi-campus infrastructure for schools and academies.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Free Tier */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="inline-block text-xs font-bold text-[#249EA0] uppercase tracking-wider bg-teal-50 border border-teal-200 px-3 py-1 rounded-full mb-3">
                Independent Learners
              </div>
              <h2 className="text-2xl font-black text-[#1E225B]">Free Forever</h2>
              <div className="text-3xl font-extrabold text-[#1E225B] mt-2 mb-1">
                $0 <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>
              <p className="text-xs text-slate-600 mb-6">
                No credit card required. Explore Socratic discovery and study tools anytime.
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
                  <span>Continuous Study Streaks &amp; XP Preservation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Seamless school linking via Invite Code</span>
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
            <div className="absolute -top-3.5 right-6 bg-[#1E225B] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
              Most Popular for Academies
            </div>
            <div>
              <div className="inline-block text-xs font-bold text-[#F5921D] uppercase tracking-wider bg-[#F5921D]/10 border border-[#F5921D]/30 px-3 py-1 rounded-full mb-3">
                Schools &amp; Academies
              </div>
              <h2 className="text-2xl font-black text-[#1E225B]">Campus Enterprise</h2>
              <div className="text-3xl font-extrabold text-[#1E225B] mt-2 mb-1">
                Custom <span className="text-xs text-slate-400 font-normal">/ annual seat licensing</span>
              </div>
              <p className="text-xs text-slate-600 mb-6">
                Turnkey institutional tenant setup with full administrative control &amp; audit logging.
              </p>

              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multi-Campus, Class &amp; Section Roster Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Coursework-Linked Rubrics &amp; AI Strictness Enforcement</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-Time Teacher Transcript &amp; AI Audit Logging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>FERPA &amp; COPPA Guaranteed Compliance Isolation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Single Sign-On (Google &amp; LinkedIn / SAML)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dedicated EdTech Deployment Engineer &amp; SLA Support</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                href="/schools"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md"
              >
                <GraduationCap className="w-4 h-4" /> Onboard Your School
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
                Yes! We offer a zero-signup 2-hour ephemeral sandbox at /try-teacher where teachers can test rubrics and watch how the Socratic AI blocks cheating.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#1E225B]">How does pricing scale for large multi-campus academies?</h4>
              <p className="mt-1 text-slate-600 leading-relaxed">
                Our Campus Enterprise tier includes volume discounts based on student headcount, including parent portals and administrative oversight at no extra cost.
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
