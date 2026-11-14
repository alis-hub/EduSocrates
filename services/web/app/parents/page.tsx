'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { MarketingFooter } from '@/components/MarketingFooter';
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  Heart,
  HelpCircle,
  KeyRound,
  Layers,
  Lock,
  MessageSquare,
  Network,
  RotateCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';

const PARENT_FAQS = [
  {
    q: 'What is GuruMera and how does it help my child?',
    a: 'GuruMera is an AI-powered educational platform built on guided discovery and conceptual reasoning. Unlike shortcut tools that generate direct homework answers, GuruMera acts as an expert Socratic tutor that diagnoses learning hurdles and poses targeted questions so students genuinely understand the underlying principles.',
  },
  {
    q: 'Does GuruMera provide direct homework answers?',
    a: 'No. GuruMera operates under strict 5-layer pedagogical guardrails. When a student pastes a homework question or test prompt, the AI provides diagnostic clues, analogies, and small numerical toy problems—guiding the student to deduce the solution themselves without ever leaking raw formulas or final answer keys.',
  },
  {
    q: 'Can parents monitor their children’s learning progress?',
    a: 'Yes. The GuruMera Parent Portal provides complete visibility into your child’s assignments, assessment scores, concept mastery tree, learning time, and teacher feedback.',
  },
  {
    q: 'Can parents see assignments and examination results?',
    a: 'Yes. Parents can view all upcoming, pending, submitted, graded, and overdue assignments, along with official scores and teacher feedback notes.',
  },
  {
    q: 'Can parents monitor concept mastery?',
    a: 'Yes. The Concept Mastery view visualizes your child’s knowledge graph across subjects, identifying which topics are Mastered, Developing, or Need Practice based on Socratic checkpoint evaluations.',
  },
  {
    q: 'Can parents see their child’s raw AI Tutor chats?',
    a: 'To protect student learning autonomy and foster honest inquiry, raw chat transcripts are shielded. Instead, parents receive aggregated metrics, topics explored, study consistency, and conceptual mastery breakdowns.',
  },
  {
    q: 'How does GuruMera protect student privacy and safety?',
    a: 'GuruMera implements strict FERPA and COPPA compliant safeguards. Data is isolated per school tenant using database-level Row-Level Security (RLS). Student data is never sold or used for public AI model training.',
  },
  {
    q: 'Can parents create accounts independently?',
    a: 'No. Public self-registration for parents is strictly prohibited to guarantee verified guardian-student relationships. All parent accounts are created exclusively through secure invitations issued by your child’s school administration.',
  },
  {
    q: 'How do parents receive an invitation?',
    a: 'Your child’s school administrator generates a secure, single-use invitation link sent to your registered email address. Opening the link allows you to activate your account in under 60 seconds.',
  },
  {
    q: 'What if my child’s school does not use GuruMera yet?',
    a: 'You can explore our interactive Parent Demo to see the portal in action, and share GuruMera with your school administration or request an onboarding consultation.',
  },
  {
    q: 'Can one parent account support multiple children?',
    a: 'Yes! GuruMera natively supports multi-child families. You can seamlessly switch between your children from a single dashboard without managing multiple logins.',
  },
  {
    q: 'Can both parents/guardians access the same student?',
    a: 'Yes. Schools can invite multiple authorized guardians for the same student record, giving each guardian independent and secure access.',
  },
  {
    q: 'Can parents communicate with teachers?',
    a: 'Yes, when enabled by the school, parents can view official teacher notes, request consultation meetings, and follow progress updates.',
  },
  {
    q: 'Is the Parent Portal free for invited families?',
    a: 'Yes. Access to the Parent Portal is included as part of your school’s GuruMera partnership at zero cost to families.',
  },
  {
    q: 'How can parents reset their password?',
    a: 'Parents can use the "Forgot Password" link on the sign-in page to receive a secure recovery email at their verified address.',
  },
  {
    q: 'What happens when a child changes schools?',
    a: 'Student and parent associations are managed by the school tenant. When transitioning to a new GuruMera partner school, the new academy issues an association link that links to your existing account.',
  },
  {
    q: 'How can a parent request removal of an association?',
    a: 'You can submit an association update request directly through your Parent Profile settings or contact your school administration office.',
  },
  {
    q: 'Is there a way to test the Parent Portal right now?',
    a: 'Yes! Click "Explore Parent Demo" to enter a fully populated, interactive demonstration environment featuring a sample family (Eleanor Chen with high school student Alex and middle school student Emily).',
  },
];

export default function ParentsLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteInput, setInviteInput] = useState('');

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-800 font-sans flex flex-col">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="navbar" />
            <span className="hidden sm:inline text-xs font-bold text-[#F5921D] bg-[#F5921D]/10 px-2.5 py-0.5 rounded-full border border-[#F5921D]/30">
              Parent Portal
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link href="/" className="hover:text-[#1E225B] transition-colors">
              Home
            </Link>
            <Link href="/hub" className="hover:text-[#1E225B] transition-colors">
              Learning Hub
            </Link>
            <Link href="/schools" className="hover:text-[#1E225B] transition-colors">
              For Schools
            </Link>
            <Link href="/parents" className="text-[#1E225B] font-bold">
              For Parents
            </Link>
            <Link href="/pricing" className="hover:text-[#1E225B] transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="hover:text-[#1E225B] transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/parent-demo"
              className="text-xs font-bold bg-[#F5921D] hover:bg-[#d87c10] text-white px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Explore Demo</span>
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold bg-[#1E225B] hover:bg-[#141740] text-white px-3.5 py-2 rounded-xl transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1E225B] bg-[#1E225B]/10 px-3 py-1 rounded-full border border-[#1E225B]/20">
          <Heart className="w-3.5 h-3.5 text-[#F5921D]" />
          <span>Dedicated Guardian &amp; Parent Experience</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1E225B] tracking-tight leading-tight">
          Your Child Deserves to Understand, <br className="hidden sm:inline" />
          <span className="text-[#F5921D]">Not Just Memorize.</span>
        </h1>

        <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          GuruMera helps students develop genuine understanding through guided discovery, interactive learning,
          and AI-powered Socratic tutoring that encourages independent thinking. Stay closely connected with your
          child’s actual conceptual growth—not just homework checkboxes.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/parent-demo"
            className="inline-flex items-center gap-2 bg-[#1E225B] hover:bg-[#141740] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all hover:scale-[1.02]"
          >
            <Eye className="w-4 h-4 text-[#F5921D]" />
            <span>Explore Parent Demo</span>
          </Link>

          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-[#1E225B] font-bold text-sm px-5 py-3.5 rounded-xl border border-slate-300 shadow-xs transition-all"
          >
            <KeyRound className="w-4 h-4 text-[#249EA0]" />
            <span>Already Invited? Accept Invitation</span>
          </button>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1E225B] px-3 py-3"
          >
            <span>Existing Parent? Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Security & Access Policy Notice */}
        <div className="max-w-2xl mx-auto mt-6 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center justify-center gap-2 text-left">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Verified Guardian Access Only:</strong> To protect student privacy, parent accounts are created
            strictly through school-issued invitations. Public unverified registration is prohibited.
          </span>
        </div>
      </section>

      {/* ── 5 Core Value Pillars ── */}
      <section className="py-12 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
              Why Parents Trust GuruMera
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
              Built on cognitive science and first-principles education to foster permanent comprehension.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-6 space-y-3 hover:border-[#1E225B]/40 transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1E225B] flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="font-extrabold text-base text-[#1E225B]">Understanding Over Memorization</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                GuruMera guides students to understand core concepts, mechanisms, and reasoning rather than simply
                reciting formulas or memorizing multiple-choice keys.
              </p>
            </div>

            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-6 space-y-3 hover:border-[#1E225B]/40 transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#F5921D] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#F5921D]" />
              </div>
              <h3 className="font-extrabold text-base text-[#1E225B]">Guided AI Socratic Tutoring</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The AI tutor poses progressive diagnostic questions and checks reasoning step-by-step. It never hands
                over raw answers, ensuring your child learns through their own cognitive effort.
              </p>
            </div>

            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-6 space-y-3 hover:border-[#1E225B]/40 transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#249EA0] flex items-center justify-center">
                <Layers className="w-5 h-5 text-[#249EA0]" />
              </div>
              <h3 className="font-extrabold text-base text-[#1E225B]">Multi-Child Family Hub</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamlessly toggle between all your enrolled children from one account. Review high school calculus and
                middle school science without juggling separate logins.
              </p>
            </div>

            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-6 space-y-3 hover:border-[#1E225B]/40 transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-extrabold text-base text-[#1E225B]">Concept Mastery Trees</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Go beyond letter grades. See exactly which curriculum concepts your child has Mastered, which are
                Developing, and where they need targeted practice.
              </p>
            </div>

            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-6 space-y-3 hover:border-[#1E225B]/40 transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="font-extrabold text-base text-[#1E225B]">Student Privacy Safeguards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We shield raw student chat transcripts to preserve psychological safety and learning autonomy, while
                giving parents high-level metrics, mastery scores, and attendance.
              </p>
            </div>

            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-6 space-y-3 hover:border-[#1E225B]/40 transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Award className="w-5 h-5 text-rose-700" />
              </div>
              <h3 className="font-extrabold text-base text-[#1E225B]">Teacher-Parent Partnership</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Read direct teacher feedback, observe assignment rubrics, and coordinate with instructors to support
                your child exactly where help is needed most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7-Step Visual Learning Journey ── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <div className="text-xs font-bold text-[#F5921D] uppercase tracking-wider">The Learning Lifecycle</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
            How GuruMera Helps Your Child Succeed
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            From classroom assignment to conceptual mastery and parent visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 text-center">
          {[
            { step: '1', title: 'Teacher Assigns', desc: 'Curriculum coursework assigned in class' },
            { step: '2', title: 'Student Explores', desc: 'Child reads concept and formulates questions' },
            { step: '3', title: 'Socratic Clues', desc: 'AI diagnoses hurdles with guiding questions' },
            { step: '4', title: 'Self-Discovery', desc: 'Student derives principles independently' },
            { step: '5', title: 'Smart Practice', desc: 'Spaced repetition flashcards & quizzes' },
            { step: '6', title: 'Teacher Evaluates', desc: 'Official grading & targeted feedback' },
            { step: '7', title: 'Parent Visibility', desc: 'Guardian reviews mastery & consistency' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-[#1E225B] transition-all"
            >
              <div>
                <div className="w-7 h-7 mx-auto rounded-full bg-[#1E225B] text-white text-xs font-bold flex items-center justify-center mb-2">
                  {item.step}
                </div>
                <h4 className="font-extrabold text-xs text-[#1E225B]">{item.title}</h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Parent Portal Feature Previews ── */}
      <section className="py-14 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
              Everything You Need in One Modern Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Explore key features available to authenticated guardians.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="border border-slate-200 rounded-2xl p-5 bg-[#FAF9F5] space-y-2">
              <div className="font-bold text-sm text-[#1E225B] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" /> Coursework &amp; Grades
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by pending, submitted, graded, or overdue. Access rubrics and submission timestamps.
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5 bg-[#FAF9F5] space-y-2">
              <div className="font-bold text-sm text-[#1E225B] flex items-center gap-2">
                <Network className="w-4 h-4 text-teal-600" /> Concept Knowledge Maps
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track mastery nodes across Physics, Calculus, and CS with AI diagnostic indicators.
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5 bg-[#FAF9F5] space-y-2">
              <div className="font-bold text-sm text-[#1E225B] flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-amber-600" /> Study Consistency
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review weekly learning time, topics explored, streak records, and AI tutor session summaries.
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5 bg-[#FAF9F5] space-y-2">
              <div className="font-bold text-sm text-[#1E225B] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" /> Teacher Feedback
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Access official instructor progress evaluations and recommendations directly in your feed.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/parent-demo"
              className="inline-flex items-center gap-2 bg-[#F5921D] hover:bg-[#d87c10] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xs transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Launch Interactive Parent Demo with Sample Family</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Student Privacy & Safety Commitments ── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        <div className="bg-[#1E225B] text-white rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5921D] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Privacy &amp; Child Protection
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Uncompromising Safety &amp; Trust Commitments
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 pt-2 text-xs text-slate-200 leading-relaxed">
            <div className="space-y-1.5">
              <h4 className="font-bold text-white text-sm">Tenant Isolation</h4>
              <p>
                Student data is partitioned using database-level Row-Level Security (RLS). Cross-school leakage is
                architecturally impossible.
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-white text-sm">Zero Answer Leaks</h4>
              <p>
                Strict academic integrity guardrails prevent the AI from generating completed essays, problem answers,
                or test keys.
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-white text-sm">FERPA &amp; COPPA Alignment</h4>
              <p>
                Designed to comply with school privacy laws. Student prompts are never sold or used for public LLM
                training.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comprehensive FAQ Accordion ── */}
      <section className="py-14 bg-white border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="text-xs font-bold text-[#F5921D] uppercase tracking-wider">Questions &amp; Answers</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
              Frequently Asked Questions by Parents
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Clear answers on access, privacy, invitation workflows, and educational design.
            </p>
          </div>

          <div className="space-y-3">
            {PARENT_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-[#FAF9F5]"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm text-[#1E225B] hover:text-[#F5921D] transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto space-y-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
          Experience the Future of Socratic Education
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Explore our fully populated demo or activate your school-issued invitation today.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/parent-demo"
            className="bg-[#1E225B] hover:bg-[#141740] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-[#F5921D]" />
            <span>Open Interactive Parent Demo</span>
          </Link>
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl border border-slate-300 shadow-xs transition-colors"
          >
            Accept School Invitation
          </button>
        </div>
      </section>

      {/* ── Accept Invitation Token Entry Modal ── */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#249EA0] bg-[#249EA0]/10 px-2.5 py-0.5 rounded-full mb-1.5">
                  <KeyRound className="w-3.5 h-3.5" /> School Invitation Link
                </div>
                <h3 className="font-extrabold text-lg text-[#1E225B]">Accept School Invitation</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paste the invitation link or token provided in your school invitation email.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                let token = inviteInput.trim();
                if (token.includes('/parent/invitation/')) {
                  token = token.split('/parent/invitation/')[1];
                }
                token = token.replace(/[^a-zA-Z0-9_-]/g, '');
                if (token) {
                  window.location.href = `/parent/invitation/${token}`;
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Invitation Code or Token
                </label>
                <input
                  required
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  placeholder="e.g. 4f9e1d8a2c... or paste full link"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#1E225B] font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={!inviteInput.trim()}
                className="w-full bg-[#1E225B] hover:bg-[#141740] text-white font-bold text-xs py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                Continue to Account Activation →
              </button>
            </form>

            <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              Haven&apos;t received an invitation yet? Contact your child&apos;s school administration office.
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <MarketingFooter />
    </div>
  );
}
