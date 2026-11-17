import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { MarketingFooter } from '@/components/MarketingFooter';
import { KnowledgeMapsInteractiveDemo } from './KnowledgeMapsInteractiveDemo';
import {
  Network,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Target,
  Compass,
  Layers,
  Brain,
  Unlock,
  Lock,
  Search,
  BookOpen,
  Award,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Visual Knowledge Maps & Concept Dependency Trees (DAG) | GuruMera',
  description:
    'Master complex academic curriculums with GuruMera’s interactive Directed Acyclic Graph (DAG) Knowledge Maps. Uncover hidden prerequisite gaps and navigate your personal learning tree.',
  keywords: [
    'Concept Knowledge Maps',
    'Curriculum DAG',
    'Directed Acyclic Graph learning',
    'prerequisite gap detector',
    'visual learning roadmap',
    'STEM concept tree',
    'adaptive learning paths',
    'mastery skill tree',
  ],
  openGraph: {
    title: 'Visual Knowledge Maps (DAG) | GuruMera',
    description:
      'Never get lost in textbooks again. GuruMera’s visual concept dependency maps reveal prerequisite pathways and diagnose exactly where your understanding broke down.',
    type: 'website',
  },
};

export default function KnowledgeMapsPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E225B] flex flex-col font-sans">
      {/* ─── Structured JSON-LD SEO Schema ──────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'GuruMera Concept Knowledge Maps (DAG)',
            applicationCategory: 'EducationalSoftware',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0.00',
              priceCurrency: 'USD',
            },
            description:
              'Topological learning graph engine that models academic subjects as Directed Acyclic Graphs to diagnose missing prerequisites and guide mastery.',
          }),
        }}
      />

      {/* ─── Sticky Header ──────────────────────────────────────────────── */}
      <header className="border-b border-[#E7E3D8] bg-white/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <BrandLogo variant="navbar" />
          </Link>
          <nav className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm font-semibold">
            <Link href="/features" className="text-[#F5921D] font-bold">
              Features
            </Link>
            <Link href="/hub" className="text-slate-600 hover:text-[#1E225B] transition-colors">
              Public Hub
            </Link>
            <Link href="/schools" className="text-slate-600 hover:text-[#1E225B] transition-colors">
              For Schools
            </Link>
            <Link href="/pricing" className="text-slate-600 hover:text-[#1E225B] transition-colors">
              Pricing
            </Link>
            <Link
              href="/hub?tab=concepts"
              className="bg-[#1E225B] hover:bg-[#141740] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Explore Maps Free
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── Breadcrumbs ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-5 pb-2 text-xs text-slate-500 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#1E225B] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/features" className="hover:text-[#1E225B] transition-colors">Features</Link>
        <span>/</span>
        <span className="text-[#1E225B] font-semibold">Knowledge Maps</span>
      </div>

      <main className="flex-1">
        {/* ─── Hero Section ──────────────────────────────────────────────── */}
        <section className="pt-10 pb-16 px-5 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-[#249EA0]/10 border border-[#249EA0]/25 text-[#249EA0] text-xs font-bold uppercase tracking-wider">
            <GitBranch className="w-4 h-4" />
            Directed Acyclic Graph (DAG) Engine
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#1E225B] tracking-tight leading-[1.15] mb-6">
            See the Complete Roadmap. <br className="hidden sm:inline" />
            <span className="text-[#249EA0]">Pinpoint Missing Links</span> Before You Get Stuck.
          </h1>

          <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto mb-8 font-normal">
            Struggling with advanced calculus or physics is rarely about the current lesson—it is almost always an unaddressed gap in an earlier prerequisite. GuruMera’s visual Knowledge Maps trace dependencies to unlock effortless comprehension.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/hub?tab=concepts"
              className="bg-[#249EA0] hover:bg-[#1D8284] text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm sm:text-base"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Knowledge Maps in Hub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#interactive-demo"
              className="bg-white hover:bg-slate-50 text-[#1E225B] border border-slate-300 font-semibold px-5 py-3.5 rounded-xl transition-all text-sm sm:text-base shadow-2xs"
            >
              Interact With Sample Graph
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Network className="w-4 h-4 text-[#249EA0]" />
              Topological Prerequisite Mapping
            </span>
            <span className="flex items-center gap-1.5">
              <Unlock className="w-4 h-4 text-[#F5921D]" />
              Gamified Node Unlock Progression
            </span>
            <span className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-emerald-600" />
              One-Click Remediation Checkpoints
            </span>
          </div>
        </section>

        {/* ─── Interactive Demonstration ─────────────────────────────────── */}
        <section id="interactive-demo" className="py-12 bg-white border-y border-[#E7E3D8] px-5 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold text-[#249EA0] uppercase tracking-wider">
                Live Interactive Concept Tree
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B] mt-1.5">
                Navigate the AP Physics &amp; Mechanics Graph
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Click any node in the dependency network below to inspect its prerequisite requirements, difficulty rating, diagnostic checkpoints, and connected flashcards!
              </p>
            </div>

            <KnowledgeMapsInteractiveDemo />
          </div>
        </section>

        {/* ─── Section 1: What the Feature Does ────────────────────────────── */}
        <section className="py-16 px-5 sm:px-6 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#249EA0] uppercase tracking-wider mb-2">
                <Target className="w-4 h-4" />
                What It Does
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B] mb-4">
                A Living, Topological Map of Every Subject You Study
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
                Instead of treating learning like a flat, boring table of contents, GuruMera represents your entire course as a Directed Acyclic Graph (DAG). Every edge represents an essential cognitive foundation.
              </p>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Semantic Prerequisite Graphs:</strong> See exactly which prior principles are required before tackling higher-level concepts.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Visual Mastery Tracking:</strong> Nodes reflect real-time status: <em>Locked</em> (foundations missing), <em>Unlocked</em> (ready to learn), <em>In Progress</em>, or <em>Mastered</em>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Automated Diagnostic Tracing:</strong> When you miss questions on a quiz, the system walks backward through the graph to isolate the root misunderstanding.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Direct Study Ecosystem:</strong> Click any node to instantly launch targeted Socratic inquiries, review relevant 2-tier flashcards, or take a 3-question diagnostic.
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-[#FAF9F5] border border-[#E7E3D8] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E7E3D8] text-xs font-bold text-[#1E225B]">
                <Network className="w-4 h-4 text-[#249EA0]" />
                Topological States Explained
              </div>
              <div className="space-y-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <div className="font-bold text-[#1E225B]">Mastered (100% Retained)</div>
                    <p className="text-slate-500 mt-0.5">All diagnostic checkpoints passed and flashcards reviewed on SM-2 schedule.</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#F5921D] mt-1 shrink-0" />
                  <div>
                    <div className="font-bold text-[#1E225B]">In Progress (Active Work)</div>
                    <p className="text-slate-500 mt-0.5">Prerequisites satisfied; currently engaging in Socratic tutoring and practice quizzes.</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-slate-300 mt-1 shrink-0" />
                  <div>
                    <div className="font-bold text-[#1E225B]">Locked (Prerequisite Gap)</div>
                    <p className="text-slate-500 mt-0.5">Prevents cognitive overload. Complete upstream foundation nodes to unlock access.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 2: Why Students Need It ─────────────────────────────── */}
        <section className="py-16 bg-[#1E225B] text-white px-5 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#F5921D] uppercase tracking-wider">
                The Learning Bottleneck
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-1.5">
                Why Linear Learning Causes Hidden Failure
              </h2>
              <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                Knowledge is not a straight line—it is a network. When curriculums ignore prerequisites, students hit brick walls.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-4 font-bold text-lg">
                    🧱
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">The Hidden Anchor</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    A student struggling with Rotational Dynamics isn’t bad at physics; they simply forgot how torque relates to the cross product of two vectors from 4 weeks prior.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-[#F5921D]">
                  Knowledge Maps expose the exact anchor holding you back.
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 font-bold text-lg">
                    🗺️
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">No Sense of Direction</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Reading a 900-page textbook produces tunnel vision. Students have no idea why Chapter 7 matters for Chapter 14 or what concepts are critical keystones.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-[#F5921D]">
                  DAG visualization creates macro clarity and peace of mind.
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 font-bold text-lg">
                    🎮
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Gamified Skill Mastery</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Unlocking nodes in an interactive tree triggers the same intrinsic motivation as leveling up a character in an RPG, transforming study dread into momentum.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-emerald-400">
                  Turns abstract courses into tangible milestones.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 3: How It Works ─────────────────────────────────────── */}
        <section className="py-16 px-5 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#249EA0] uppercase tracking-wider">
              Under the Hood
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B] mt-1.5">
              How the DAG Algorithm Guides Your Study
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every concept has an upstream origin and a downstream application.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#1E225B] text-white flex items-center justify-center text-sm font-bold mb-3">
                1
              </div>
              <h3 className="font-bold text-[#1E225B] text-sm mb-1.5">Curriculum Topology</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Subjects are modeled as directed mathematical graphs with weighted dependency relationships between fundamental ideas.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#249EA0] text-white flex items-center justify-center text-sm font-bold mb-3">
                2
              </div>
              <h3 className="font-bold text-[#1E225B] text-sm mb-1.5">Diagnostic Evaluation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                As you take diagnostic quizzes or solve Socratic exercises, the system updates node mastery states in real time.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#F5921D] text-white flex items-center justify-center text-sm font-bold mb-3">
                3
              </div>
              <h3 className="font-bold text-[#1E225B] text-sm mb-1.5">Root Gap Isolation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If an error occurs, the DAG engine traces backward along prerequisite paths to highlight where the foundation fractured.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold mb-3">
                4
              </div>
              <h3 className="font-bold text-[#1E225B] text-sm mb-1.5">Downstream Unlock</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mastering the foundation immediately unlocks advanced topics, ensuring you always work at your optimal Zone of Proximal Development.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Section 4: Practical Real-World Example ─────────────────────── */}
        <section className="py-16 bg-[#FAF9F5] border-t border-[#E7E3D8] px-5 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-[#249EA0] uppercase tracking-wider">
                Real Student Case Study
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B] mt-1.5">
                The Calculus II Integration Wall
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                How Knowledge Maps saved an engineering freshman from failing midterms.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-red-600 font-bold text-xs uppercase tracking-wider">
                  Without Knowledge Maps (Linear Blindness)
                </div>
                <div className="space-y-3 text-xs text-slate-700">
                  <p>
                    <strong>The Problem:</strong> Maya spent 6 hours failing Integration by Parts homework problems ($ \int u \, dv = uv - \int v \, du $).
                  </p>
                  <p>
                    <strong>Linear Attempt:</strong> She kept redoing practice problems, thinking she was &ldquo;bad at calculus&rdquo;. Her stress escalated and she gave up at 2 AM.
                  </p>
                  <div className="text-[11px] text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    <strong>Root Cause Unknown:</strong> She didn&apos;t realize her confusion wasn&apos;t with integration—it was that she had forgotten differential notation ($dv = v&apos;(x)dx$) and the product rule from Calc I.
                  </div>
                </div>
              </div>

              <div className="bg-white border border-emerald-300 rounded-2xl p-6 shadow-xs ring-2 ring-emerald-500/10">
                <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                  With GuruMera Knowledge Map (DAG Pinpointing)
                </div>
                <div className="space-y-3 text-xs text-slate-700">
                  <p>
                    <strong>The Diagnosis:</strong> Maya opened the GuruMera Calculus Map. Clicking &ldquo;Integration by Parts&rdquo; showed two red prerequisite links: <em>Product Rule</em> and <em>Differential Notation</em>.
                  </p>
                  <p>
                    <strong>The 8-Minute Fix:</strong> A 3-question diagnostic quiz revealed she was mishandling $du = u&apos;(x)dx$. After reviewing the 2-tier flashcard for differentials, the entire concept made sense.
                  </p>
                  <div className="text-[11px] text-slate-500 italic">Illustrative scenario, not a real student result.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Direct CTA Banner ─────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-[#1E225B] to-[#141740] text-white py-16 px-5 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-5">
            <span className="text-xs font-bold text-[#F5921D] uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/20 inline-block">
              Free Curriculum Exploration
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Explore Your Subject&apos;s Knowledge Map?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              Inspect visual dependency trees for Physics, Calculus, Biology, Chemistry, and Computer Science without any paywall.
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/hub?tab=concepts"
                className="bg-[#249EA0] hover:bg-[#1D8284] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm sm:text-base"
              >
                <span>Launch Knowledge Maps in Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/hub?tab=quizzes"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3.5 rounded-xl border border-white/20 transition-all text-sm sm:text-base"
              >
                Take Diagnostic Mastery Quiz
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
