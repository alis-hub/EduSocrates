'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { MarketingFooter } from '@/components/MarketingFooter';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  FileCheck,
  Heart,
  HelpCircle,
  KeyRound,
  Layers,
  Lock,
  Mail,
  MessageSquare,
  Network,
  RotateCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';

const PARENT_FAQS = [
  {
    q: 'What is the dedicated route for accepting a school-issued invitation?',
    a: 'Every school invitation points to a dedicated secure route: /parent/invitation/{token}. Opening this link performs a real-time cryptographic validation of your school token. You will review your child’s name and relationship, and then establish your private password to activate your account. Opening the page never activates the account automatically.',
  },
  {
    q: 'What is the 3-step invitation and onboarding process?',
    a: 'Step 1: Your child’s school administration issues a secure single-use invitation link directly to your email. Step 2: You open the link, confirm your identity and relationship (Mother, Father, Guardian), and choose a private password. Step 3: You gain immediate access to your child’s authorized academic portal.',
  },
  {
    q: 'Can both parents or multiple guardians have separate accounts for the same child?',
    a: 'Yes. Where permitted by school policy, multiple authorized guardians (e.g. Mother, Father, Legal Guardian) can each receive individual invitation links. Each guardian maintains their own login credentials, private password, and notification preferences without needing to share credentials.',
  },
  {
    q: 'What is the difference between learning summaries and raw student conversations?',
    a: 'Parents can view comprehensive academic grades, weekly study hours, topics explored, and concept mastery levels. However, word-for-word conversational transcripts between your child and the Socratic AI are strictly shielded. This protects the student’s psychological safety so they feel free to make mistakes, ask vulnerable questions, and reason through confusion without fear of surveillance.',
  },
  {
    q: 'Can parents see assignments, due dates, and examination results?',
    a: 'Yes. Parents can view all upcoming, pending, submitted, graded, and overdue assignments, along with official scores, rubric criteria, and teacher feedback notes.',
  },
  {
    q: 'Can parents monitor concept mastery across subjects?',
    a: 'Yes. The Concept Mastery view visualizes your child’s knowledge graph across subjects (such as Kinematics, Thermodynamics, Calculus), identifying which topics are Mastered, Developing, or Need Practice based on Socratic checkpoint evaluations.',
  },
  {
    q: 'Does GuruMera provide direct homework answers or solve problems for students?',
    a: 'No. GuruMera is designed to guide, not to answer. When a student pastes a homework question, the tutor asks guiding questions and offers small examples so the student works out the solution themselves. Teachers can also mark the correct answer so the tutor is blocked from stating it.',
  },
  {
    q: 'How does GuruMera protect student privacy?',
    a: 'Each school\'s data is kept separate from every other school\'s at the database level. Only your child\'s school and the parents linked to them can see their results, and we do not sell student data or show ads.',
  },
  {
    q: 'Can parents create accounts independently without a school invitation?',
    a: 'No. Public self-registration for parents is strictly prohibited to guarantee verified guardian-student relationships. All parent accounts must originate through secure invitations issued by your child’s school administration.',
  },
  {
    q: 'What if my child’s school does not use GuruMera yet?',
    a: 'You can explore our interactive Parent Demo to see the portal in action, and share GuruMera with your school administration or request an onboarding consultation.',
  },
  {
    q: 'Can one parent account support multiple children across different grades?',
    a: 'Yes! GuruMera natively supports multi-child families. You can seamlessly switch between your children from a single dashboard without managing multiple logins.',
  },
  {
    q: 'Can parents communicate with teachers through the portal?',
    a: 'Yes, when enabled by the school, parents can view official teacher notes, request consultation meetings, and follow progress updates.',
  },
  {
    q: 'Is the Parent Portal free for invited families?',
    a: 'Yes. Access to the Parent Portal is included as part of your school’s GuruMera partnership at zero cost to families.',
  },
  {
    q: 'What happens when a child advances to the next grade or changes schools?',
    a: 'Student and parent associations are managed by the school tenant. When transitioning to a new GuruMera partner school, the new academy issues an association link that links to your existing account without duplicate logins.',
  },
  {
    q: 'How can a parent reset their password?',
    a: 'Parents can use the "Forgot Password" link on the sign-in page to receive a secure recovery email at their verified address.',
  },
  {
    q: 'What happens if an invitation link expires?',
    a: 'Invitations expire after 72 hours for security. If your link has expired, simply contact your child’s school administration or teacher to issue a refreshed single-use link with one click.',
  },
  {
    q: 'Are peer whiteboard sessions and study room chats visible to parents?',
    a: 'No. Private peer communications, collaborative whiteboard room notes, and student-to-teacher private consultation queries remain confidential to students and teachers.',
  },
  {
    q: 'Is there a way to test the Parent Portal right now without an invitation?',
    a: 'Yes! Click "Explore Parent Demo" to enter a fully populated, interactive demonstration environment featuring a sample family (Eleanor Chen with high school student Alex and middle school student Emily).',
  },
];

export default function ParentsLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteInput, setInviteInput] = useState('');

  const handleRouteToInvitation = (inputVal: string) => {
    let token = inputVal.trim();
    if (token.includes('/parent/invitation/')) {
      token = token.split('/parent/invitation/')[1];
    }
    token = token.replace(/[^a-zA-Z0-9_-]/g, '');
    if (token) {
      window.location.href = `/parent/invitation/${token}`;
    }
  };

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
            <span>Accept School Invitation (/parent/invitation)</span>
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

      {/* ── B. 3-STEP EXPLANATION OF INVITATION PROCESS ── */}
      <section className="py-14 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <div className="text-xs font-bold text-[#F5921D] uppercase tracking-wider">
              Simple, Safe &amp; School-Verified
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
              How Guardian Onboarding Works in 3 Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Setting up your parent portal is quick, private, and fully authorized by your child’s academy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-6 space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-[#1E225B] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                1
              </div>
              <h3 className="font-extrabold text-base text-[#1E225B]">
                Your School Sends You a Secure Invitation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your child’s school administration generates a private, cryptographically signed invitation link sent
                directly to your registered guardian email address.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-400">
                Route: /parent/invitation/{'{token}'}
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-6 space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-[#F5921D] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                2
              </div>
              <h3 className="font-extrabold text-base text-[#1E225B]">
                Verify Your Identity &amp; Create Your Account
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Open your link, confirm your child’s name and authorized relationship (Mother, Father, Guardian), and
                set your private password. Existing accounts link seamlessly without duplicate logins.
              </p>
              <div className="pt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Identity verified by school registry
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-6 space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-[#249EA0] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                3
              </div>
              <h3 className="font-extrabold text-base text-[#1E225B]">
                Access Authorized Academic Information
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gain instant visibility into coursework deadlines, grade updates, concept mastery trees, and direct
                teacher notes across all your children in one place.
              </p>
              <div className="pt-2 text-[11px] text-indigo-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Multi-child family dashboard ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── A. DEDICATED INVITATION DESTINATION & TOKEN ACCEPTANCE CARD ── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
        <div className="bg-white border-2 border-indigo-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#249EA0] bg-[#249EA0]/10 px-3 py-0.5 rounded-full mb-1">
                <KeyRound className="w-3.5 h-3.5" /> Dedicated Invitation Route
              </div>
              <h3 className="font-extrabold text-lg sm:text-xl text-[#1E225B]">
                Have a School Invitation Link or Token?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All school invitations route securely to: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">/parent/invitation/{'{token}'}</code>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/parent/invitation/demo-invitation-token"
                className="text-xs font-bold text-[#F5921D] hover:underline bg-[#F5921D]/10 px-3 py-1.5 rounded-xl border border-[#F5921D]/20 transition-colors"
              >
                Try Sample Invitation Route &rarr;
              </Link>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRouteToInvitation(inviteInput);
            }}
            className="flex flex-col sm:flex-row gap-2 pt-1"
          >
            <input
              required
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              placeholder="Paste your invitation token (e.g. 4f9e1d8a2c) or full invitation URL"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#1E225B] font-mono bg-slate-50 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inviteInput.trim()}
              className="bg-[#1E225B] hover:bg-[#141740] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 shrink-0"
            >
              Open Invitation &rarr;
            </button>
          </form>

          {/* Guarantee Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-800">Safe invitation:</strong> Opening an invitation link
              validates token authenticity only. The invitation is <strong>never accepted automatically</strong> merely
              because the page was opened. Account activation occurs only after you verify your details and establish your password.
            </div>
          </div>
        </div>
      </section>

      {/* ── C. EXPLAIN MULTIPLE GUARDIAN ACCESS ── */}
      <section className="py-12 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#249EA0] uppercase tracking-wider">
            <Users className="w-4 h-4" /> Multi-Guardian Architecture
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
                Independent Accounts for Both Parents &amp; Guardians
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                GuruMera supports multiple children under one parent, and also supports multiple authorized guardians
                for the same child with zero credential sharing.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 pt-2 text-xs">
            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-5 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                👨
              </div>
              <h4 className="font-bold text-sm text-[#1E225B]">Separate, Individual Logins</h4>
              <p className="text-slate-600 leading-relaxed">
                Both parents, stepparents, or legal guardians can receive their own unique invitation links. Neither
                parent needs to share passwords or login details.
              </p>
            </div>

            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-5 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                🔔
              </div>
              <h4 className="font-bold text-sm text-[#1E225B]">Personal Notification Preferences</h4>
              <p className="text-slate-600 leading-relaxed">
                Each guardian chooses their own email digest frequency, urgent assignment alerts, and teacher
                announcement settings independently.
              </p>
            </div>

            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-5 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                🛡️
              </div>
              <h4 className="font-bold text-sm text-[#1E225B]">Equal Authorized Visibility</h4>
              <p className="text-slate-600 leading-relaxed">
                Both guardians enjoy full, equal access to authorized grades, concept mastery DAGs, and teacher
                feedback as authorized by school administration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── D. EXPLICIT TRANSPARENCY: WHAT PARENTS CAN SEE VS. WHAT IS PROTECTED ── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="text-xs font-bold text-[#F5921D] uppercase tracking-wider">
            Transparency &amp; Student Psychological Safety
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
            What Parents Can See vs. What Is Protected
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
            To foster honest inquiry and independent problem-solving, GuruMera draws an explicit line between
            actionable academic metrics and private student learning dialogues.
          </p>
        </div>

        {/* 5-Item Comparison Table/Matrix */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs text-xs">
          <div className="grid grid-cols-12 bg-slate-50 p-4 font-bold text-slate-700 border-b border-slate-200">
            <div className="col-span-4 sm:col-span-3">Category</div>
            <div className="col-span-5 sm:col-span-6">Information Details</div>
            <div className="col-span-3 text-right">Visibility Status</div>
          </div>

          {/* 1. Academic Performance */}
          <div className="grid grid-cols-12 p-4 border-b border-slate-100 items-center hover:bg-slate-50/50 transition-colors">
            <div className="col-span-4 sm:col-span-3 font-bold text-[#1E225B] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Academic Performance</span>
            </div>
            <div className="col-span-5 sm:col-span-6 text-slate-600 leading-relaxed pr-2">
              Coursework grades, quiz results, homework submission status, due dates, rubric breakdowns, and official
              teacher progress feedback.
            </div>
            <div className="col-span-3 text-right">
              <span className="bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-full text-[11px]">
                Visible to Parents
              </span>
            </div>
          </div>

          {/* 2. Learning Activity Summaries */}
          <div className="grid grid-cols-12 p-4 border-b border-slate-100 items-center hover:bg-slate-50/50 transition-colors">
            <div className="col-span-4 sm:col-span-3 font-bold text-[#1E225B] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Learning Activity Summaries</span>
            </div>
            <div className="col-span-5 sm:col-span-6 text-slate-600 leading-relaxed pr-2">
              Aggregated weekly study hours, consistency trends, session timestamps, and subject focus distribution
              (e.g. 14.5 hours in Physics &amp; Calculus).
            </div>
            <div className="col-span-3 text-right">
              <span className="bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-full text-[11px]">
                Visible to Parents
              </span>
            </div>
          </div>

          {/* 3. AI Tutor Usage Summaries */}
          <div className="grid grid-cols-12 p-4 border-b border-slate-100 items-center hover:bg-slate-50/50 transition-colors">
            <div className="col-span-4 sm:col-span-3 font-bold text-[#1E225B] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>AI Tutor Usage Summaries</span>
            </div>
            <div className="col-span-5 sm:col-span-6 text-slate-600 leading-relaxed pr-2">
              High-level curriculum topics explored (e.g. &ldquo;Conservation of Momentum in 2D&rdquo;), cognitive effort
              index, and concept mastery status (Mastered, Developing, Needs Practice).
            </div>
            <div className="col-span-3 text-right">
              <span className="bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-full text-[11px]">
                Visible to Parents
              </span>
            </div>
          </div>

          {/* 4. Raw Student Conversations */}
          <div className="grid grid-cols-12 p-4 border-b border-slate-100 items-center bg-rose-50/30 hover:bg-rose-50/50 transition-colors">
            <div className="col-span-4 sm:col-span-3 font-bold text-rose-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Raw Student Conversations</span>
            </div>
            <div className="col-span-5 sm:col-span-6 text-slate-600 leading-relaxed pr-2">
              Word-for-word Socratic chat transcripts, exploratory trial-and-error reasoning, and intermediate question
              prompts. <em>Protected by design to allow vulnerable, honest inquiry.</em>
            </div>
            <div className="col-span-3 text-right">
              <span className="bg-rose-100 text-rose-900 font-bold px-2.5 py-1 rounded-full text-[11px]">
                Shielded from Parents
              </span>
            </div>
          </div>

          {/* 5. Private Student Communications */}
          <div className="grid grid-cols-12 p-4 items-center bg-slate-50/80 hover:bg-slate-50 transition-colors">
            <div className="col-span-4 sm:col-span-3 font-bold text-slate-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Private Student Communications</span>
            </div>
            <div className="col-span-5 sm:col-span-6 text-slate-600 leading-relaxed pr-2">
              Collaborative peer whiteboard room notes, student study room exchanges, and confidential student-to-teacher
              consultation notes.
            </div>
            <div className="col-span-3 text-right">
              <span className="bg-slate-200 text-slate-800 font-bold px-2.5 py-1 rounded-full text-[11px]">
                Confidential
              </span>
            </div>
          </div>
        </div>

        {/* Educational Rationale Box */}
        <div className="bg-[#FAF9F5] border border-indigo-100 rounded-2xl p-4 sm:p-5 text-xs text-slate-700 space-y-1.5">
          <div className="font-extrabold text-[#1E225B] flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-[#F5921D]" /> Why is this distinction critical for your child?
          </div>
          <p className="leading-relaxed text-slate-600">
            Cognitive research shows that when students feel their every prompt is monitored by parents, they hesitate
            to admit confusion, ask &ldquo;basic&rdquo; questions, or guess. By shielding raw exploratory chat prompts while
            delivering comprehensive mastery and grade outcomes, GuruMera creates a safe zone for genuine learning while keeping
            guardians fully informed.
          </p>
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

      {/* ── Parent Portal Feature Previews ── */}
      <section className="py-14 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8">
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
            {PARENT_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#1E225B] hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Final Direct CTA Banner ── */}
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
                  <KeyRound className="w-3.5 h-3.5" /> Destination: /parent/invitation/{'{token}'}
                </div>
                <h3 className="font-extrabold text-lg text-[#1E225B]">Accept School Invitation</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paste the token or link provided by your child’s school administration.
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
                handleRouteToInvitation(inviteInput);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Invitation Code or Link
                </label>
                <input
                  required
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  placeholder="e.g. 4f9e1d8a2c... or paste full link"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#1E225B] font-mono bg-slate-50 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={!inviteInput.trim()}
                className="w-full bg-[#1E225B] hover:bg-[#141740] text-white font-bold text-xs py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                Validate &amp; Open Invitation &rarr;
              </button>
            </form>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
              <span>Want to test the flow?</span>
              <Link
                href="/parent/invitation/demo-invitation-token"
                onClick={() => setInviteModalOpen(false)}
                className="text-[#F5921D] font-bold hover:underline"
              >
                Try Sample Invitation Link &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <MarketingFooter />
    </div>
  );
}
