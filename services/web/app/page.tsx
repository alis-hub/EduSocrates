'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { ProductPreviewMockup } from '@/components/ProductPreviewMockup';
import { MarketingFooter } from '@/components/MarketingFooter';
import { LandingModals, ModalType } from '@/components/LandingModals';
import {
  ArrowRight,
  ArrowRightLeft,
  CheckCircle2,
  Compass,
  FileText,
  FlaskConical,
  GraduationCap,
  HelpCircle,
  Layers,
  Lock,
  Mail,
  Menu,
  MessageSquare,
  Network,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E225B] flex flex-col font-sans">
      {/* ─── Header & Navigation ────────────────────────────────────────── */}
      <header className="border-b border-[#E7E3D8] bg-white/95 backdrop-blur-md sticky top-0 z-30 transition-all">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <BrandLogo variant="navbar" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold">
            <Link
              href="/hub"
              className="text-slate-600 hover:text-[#1E225B] transition-colors"
            >
              Public Hub
            </Link>
            <Link
              href="/try-teacher"
              className="text-slate-600 hover:text-[#249EA0] transition-colors"
            >
              Teacher Demo
            </Link>
            <Link
              href="/schools"
              className="text-slate-600 hover:text-[#F5921D] transition-colors"
            >
              For Schools
            </Link>
            <Link
              href="/parents"
              className="text-slate-600 hover:text-[#1E225B] transition-colors"
            >
              For Parents
            </Link>
            <button
              type="button"
              onClick={() => setActiveModal('pricing')}
              className="text-slate-600 hover:text-[#1E225B] transition-colors"
            >
              Pricing
            </button>
            <Link
              href="/login"
              className="bg-[#1E225B] hover:bg-[#141740] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md"
            >
              Sign In
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-[#1E225B] rounded-lg transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Collapsible Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E7E3D8] bg-white px-6 py-5 space-y-4 shadow-lg animate-fadeIn">
            <div className="flex flex-col space-y-3 text-sm font-semibold">
              <Link
                href="/hub"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-slate-700 hover:text-[#1E225B] border-b border-slate-100"
              >
                <span>Public Learning Hub</span>
                <Compass className="w-4 h-4 text-[#F5921D]" />
              </Link>
              <Link
                href="/try-teacher"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-slate-700 hover:text-[#249EA0] border-b border-slate-100"
              >
                <span>Teacher Sandbox Demo</span>
                <FlaskConical className="w-4 h-4 text-[#249EA0]" />
              </Link>
              <Link
                href="/schools"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-slate-700 hover:text-[#1E225B] border-b border-slate-100"
              >
                <span>For Schools &amp; Academies</span>
                <GraduationCap className="w-4 h-4 text-[#1E225B]" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveModal('pricing');
                }}
                className="flex items-center justify-between py-2 text-slate-700 hover:text-[#1E225B] border-b border-slate-100 text-left"
              >
                <span>Plans &amp; Pricing</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </button>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center bg-[#1E225B] hover:bg-[#141740] text-white py-2.5 rounded-xl font-bold text-sm shadow-sm"
              >
                Sign In / Free Sign Up
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section className="pt-12 md:pt-16 pb-12 px-5 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Tagline Display */}
          <div className="inline-block mb-3">
            <span className="text-sm md:text-base font-bold uppercase tracking-widest text-[#F5921D] px-3.5 py-1 rounded-full bg-[#F5921D]/10 border border-[#F5921D]/20">
              – Discover the Why! –
            </span>
          </div>

          {/* Hero Eyebrow */}
          <div className="mt-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-slate-600 bg-white border border-[#E7E3D8] px-4 py-1.5 rounded-full shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#F5921D]" />
              The AI Learning Hub for Independent Minds &amp; Forward-Thinking Schools
            </span>
          </div>

          {/* H1 Headline (Exact) */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1E225B] leading-[1.15] mb-5">
            AI That Guides Discovery — Never Hands Over the Answer
          </h1>

          {/* Hero Description */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Master any subject with interactive Socratic tutoring and smart study tools. Join the Public Hub as an independent learner, or bring your entire classroom onboard in minutes.
          </p>

          {/* CTA Hierarchy Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-xl mx-auto mb-10">
            {/* Primary Action (Solid, Bold, Prominent) */}
            <Link
              href="/hub"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F5921D] hover:bg-[#DC7B0C] text-white font-bold text-sm md:text-base px-7 py-3.5 rounded-xl shadow-lg shadow-[#F5921D]/25 transition-all transform hover:-translate-y-0.5"
            >
              <Compass className="w-5 h-5" />
              <span>Start Learning for Free</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>

            {/* Secondary Action 1 (Outlined / Ghost) */}
            <Link
              href="/try-teacher"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#1E225B] border border-slate-300 font-semibold text-sm md:text-base px-5 py-3.5 rounded-xl transition-all hover:border-[#249EA0] hover:text-[#249EA0] shadow-2xs"
            >
              <FlaskConical className="w-4 h-4 text-[#249EA0]" />
              <span>Try the Teacher Demo</span>
            </Link>

            {/* Secondary Action 2 (Outlined / Ghost) */}
            <Link
              href="/schools"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#1E225B] border border-slate-300 font-semibold text-sm md:text-base px-5 py-3.5 rounded-xl transition-all hover:border-[#1E225B] shadow-2xs"
            >
              <GraduationCap className="w-4 h-4 text-[#1E225B]" />
              <span>For Schools &amp; Academies</span>
            </Link>
          </div>
        </div>

        {/* ─── Product Visuals (Show, Don't Tell!) ────────────────────────── */}
        <div className="relative">
          <div className="absolute inset-0 max-w-4xl mx-auto bg-gradient-to-r from-[#249EA0]/10 via-[#F5921D]/10 to-[#1E225B]/10 rounded-3xl blur-2xl transform -translate-y-4 -z-10" />
          <ProductPreviewMockup />
        </div>
      </section>

      {/* ─── Trust Anchors & Metrics Bar ───────────────────────────────── */}
      <section className="border-y border-[#E7E3D8] bg-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-around gap-6 text-xs md:text-sm font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#249EA0]" />
            <span>Built for FERPA &amp; COPPA Compliance</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F5921D]" />
            <span>Powered by Google Gemini AI</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#1E225B]" />
            <span>100% Student Privacy (Zero Ad Tracking)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Zero Direct-Answer Leak Guarantee</span>
          </div>
        </div>
      </section>

      {/* ─── Feature Cards Scannability & Impact ─────────────────────────── */}
      <section className="py-16 md:py-20 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#F5921D] uppercase tracking-wider">
              Engineered for Real Understanding
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E225B] mt-1.5">
              Why Educators &amp; Motivated Learners Choose GuruMera
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1: Academic Integrity */}
            <div className="group bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#1E225B]/10 text-[#1E225B] flex items-center justify-center mb-5 group-hover:bg-[#1E225B] group-hover:text-white transition-colors duration-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1E225B] mb-2.5">
                  Enterprise-Grade Academic Integrity
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Our multi-layer defense system prevents cheating and answer-skipping, ensuring students do the real cognitive work required for mastery.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-500">
                <span className="bg-slate-100 px-2.5 py-0.5 rounded-full">Injection Shielding</span>
                <span className="bg-slate-100 px-2.5 py-0.5 rounded-full">Answer-Key Defense</span>
              </div>
            </div>

            {/* Feature 2: All-in-One Study Toolkit */}
            <div className="group bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#F5921D]/15 text-[#DC7B0C] flex items-center justify-center mb-5 group-hover:bg-[#F5921D] group-hover:text-white transition-colors duration-300">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1E225B] mb-2.5">
                  An All-in-One Study Toolkit
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Everything a student needs in one place: intelligent flashcards, visual knowledge maps, collaborative whiteboards, and a guided STEM code debugger.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-500">
                <span className="bg-slate-100 px-2.5 py-0.5 rounded-full">SM-2 Repetition</span>
                <span className="bg-slate-100 px-2.5 py-0.5 rounded-full">Live Whiteboards</span>
              </div>
            </div>

            {/* Feature 3: Learning Continuity */}
            <div className="group bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#249EA0]/15 text-[#249EA0] flex items-center justify-center mb-5 group-hover:bg-[#249EA0] group-hover:text-white transition-colors duration-300">
                  <ArrowRightLeft className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1E225B] mb-2.5">
                  Seamless Learning Continuity
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Start learning independently today. If your school joins later, instantly link your accounts without ever losing your progress, streaks, or earned XP.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-500">
                <span className="bg-slate-100 px-2.5 py-0.5 rounded-full">Invite-Code Sync</span>
                <span className="bg-slate-100 px-2.5 py-0.5 rounded-full">Continuous XP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works (Visual Graphic) ─────────────────────────────── */}
      <section className="py-16 bg-white border-y border-[#E7E3D8] px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#249EA0] uppercase tracking-wider">
              The Pedagogical Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B] mt-1">
              How Socratic Tutoring Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#1E225B] text-white flex items-center justify-center mx-auto text-xl font-black shadow-md">
                1
              </div>
              <h3 className="font-bold text-[#1E225B] text-base">Inquire &amp; Explore</h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Bring any challenging problem from calculus, physics, chemistry, or code. No answer keys required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#F5921D] text-white flex items-center justify-center mx-auto text-xl font-black shadow-md">
                2
              </div>
              <h3 className="font-bold text-[#1E225B] text-base">Guided Cognitive Discovery</h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                The AI diagnoses misconceptions, provides progressive hints, and poses guiding questions so you take the next step.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#249EA0] text-white flex items-center justify-center mx-auto text-xl font-black shadow-md">
                3
              </div>
              <h3 className="font-bold text-[#1E225B] text-base">Mastery &amp; School Sync</h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Lock in concepts with spaced-repetition flashcards and knowledge tree checkpoints. Progress carries over if your school joins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Social Proof & Testimonials ───────────────────────────────── */}
      <section className="py-16 md:py-20 px-5 sm:px-6 bg-[#FAF9F5]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#1E225B] uppercase tracking-wider">
              Trusted by Educators &amp; Learners
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B] mt-1">
              What Our Community Says
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1: Teacher */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#F5921D] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic leading-relaxed mb-4">
                  &ldquo;GuruMera changed the game in AP Physics. Students stopped copying AI answers and started actually understanding the derivations before class.&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="font-bold text-[#1E225B] text-sm">Dr. Elena Torres</div>
                <div className="text-xs text-slate-500">AP Physics Lead, Horizon High</div>
              </div>
            </div>

            {/* Testimonial 2: Student */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#F5921D] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic leading-relaxed mb-4">
                  &ldquo;Instead of feeling stuck or just reading an answer key, the Socratic hints helped me figure out calculus by myself. The feeling when you solve it yourself is unmatched.&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="font-bold text-[#1E225B] text-sm">Marcus K.</div>
                <div className="text-xs text-slate-500">Independent High School Learner</div>
              </div>
            </div>

            {/* Testimonial 3: Administrator */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#F5921D] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic leading-relaxed mb-4">
                  &ldquo;The multi-tenant school onboarding took less than 10 minutes, and the audit logs give our academic board full compliance confidence.&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="font-bold text-[#1E225B] text-sm">David Chen</div>
                <div className="text-xs text-slate-500">Academy EdTech Director</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Call to Action Banner ──────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#1E225B] to-[#141740] text-white py-14 px-5 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Ready to Discover the Why?
          </h2>
          <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto">
            Experience the difference of AI designed for true cognitive growth. Join thousands of students and schools today.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/hub"
              className="bg-[#F5921D] hover:bg-[#DC7B0C] text-white font-bold px-7 py-3 rounded-xl transition-all shadow-md"
            >
              Start Learning for Free
            </Link>
            <Link
              href="/try-teacher"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-xl border border-white/20 transition-all"
            >
              Try Teacher Sandbox (2h Demo)
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Comprehensive Expanded Footer ──────────────────────────────── */}
      <MarketingFooter />
    </div>
  );
}
