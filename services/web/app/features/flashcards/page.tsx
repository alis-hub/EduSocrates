import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { MarketingFooter } from '@/components/MarketingFooter';
import { FlashcardsInteractiveDemo } from './FlashcardsInteractiveDemo';
import {
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  Brain,
  RotateCw,
  Flame,
  Zap,
  Target,
  BookOpen,
  Award,
  BarChart3,
  Lightbulb,
} from 'lucide-react';

export const metadata: Metadata = {
  title: '2-Tier Spaced Repetition Flashcards (SM-2) | GuruMera',
  description:
    'Retain 95%+ of what you learn with GuruMera’s 2-Tier Spaced Repetition Flashcards. Combining intuition-first conceptual prompts with the SuperMemo SM-2 algorithm.',
  keywords: [
    '2-Tier Flashcards',
    'Spaced Repetition SM-2',
    'Active Recall Flashcards',
    'STEM flashcards',
    'memory retention algorithm',
    'SuperMemo algorithm',
    'Ebbinghaus forgetting curve',
    'conceptual flashcards',
  ],
  openGraph: {
    title: '2-Tier Spaced Repetition Flashcards | GuruMera',
    description:
      'Stop cramming. Start mastering. GuruMera’s 2-tier flashcard system tests deep conceptual intuition before formal formulas, scheduled with the SM-2 algorithm.',
    type: 'website',
  },
};

export default function FlashcardsPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E225B] flex flex-col font-sans">
      {/* ─── Structured JSON-LD SEO Schema ──────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'GuruMera 2-Tier Spaced Repetition Flashcards',
            applicationCategory: 'EducationalSoftware',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0.00',
              priceCurrency: 'USD',
            },
            description:
              'Intelligent 2-tier flashcard engine using SuperMemo SM-2 spaced repetition to solidify conceptual intuition and formal STEM formulas.',
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
              href="/hub?tab=flashcards"
              className="bg-[#1E225B] hover:bg-[#141740] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Study Flashcards Free
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
        <span className="text-[#1E225B] font-semibold">2-Tier Flashcards</span>
      </div>

      <main className="flex-1">
        {/* ─── Hero Section ──────────────────────────────────────────────── */}
        <section className="pt-10 pb-16 px-5 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-[#F5921D]/10 border border-[#F5921D]/25 text-[#DC7B0C] text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            Active Recall &amp; Spaced Repetition (SM-2)
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#1E225B] tracking-tight leading-[1.15] mb-6">
            Intuition First. Formula Second. <br className="hidden sm:inline" />
            <span className="text-[#F5921D]">2-Tier Flashcards</span> Built for Mastery.
          </h1>

          <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto mb-8 font-normal">
            Standard flashcards train mindless keyword recognition. GuruMera’s two-tier flashcards challenge you to explain the physical intuition before recalling the equation, powered by the modified SuperMemo SM-2 algorithm for long-term retention.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/hub?tab=flashcards"
              className="bg-[#F5921D] hover:bg-[#DC7B0C] text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm sm:text-base"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open Flashcards in Public Hub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#interactive-demo"
              className="bg-white hover:bg-slate-50 text-[#1E225B] border border-slate-300 font-semibold px-5 py-3.5 rounded-xl transition-all text-sm sm:text-base shadow-2xs"
            >
              Flip Interactive Demo Card
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#249EA0]" />
              5–10 Minutes of Daily Review
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#F5921D]" />
              SuperMemo SM-2 Optimization
            </span>
            <span className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-emerald-600" />
              Zero Rote-Memorization Trap
            </span>
          </div>
        </section>

        {/* ─── Interactive Demonstration ─────────────────────────────────── */}
        <section id="interactive-demo" className="py-12 bg-white border-y border-[#E7E3D8] px-5 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold text-[#F5921D] uppercase tracking-wider">
                Live Interactive Flashcard Deck
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B] mt-1.5">
                Experience the 2-Tier Flip in Real-Time
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Click the card to flip it, reveal Socratic clues, switch between Tier 1 (Intuition) and Tier 2 (Formulas), and test the SM-2 interval scheduler!
              </p>
            </div>

            <FlashcardsInteractiveDemo />
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
                Dual-Tiered Cognitive Architecture with Spaced Repetition
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
                Most flashcards test superficial trivia (&ldquo;What is the capital of France?&rdquo;). But in STEM and academic coursework, true competence requires two distinct cognitive layers.
              </p>
              <div className="space-y-4 text-sm text-slate-700">
                <div className="bg-[#FAF9F5] border border-[#E7E3D8] rounded-xl p-4">
                  <div className="font-bold text-[#1E225B] flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-[#F5921D] text-white flex items-center justify-center text-xs">1</span>
                    Tier 1: Intuition &amp; Mental Models
                  </div>
                  <p className="text-xs text-slate-600">
                    Prompts you to explain the physical phenomenon in your own words before looking at math or symbols. (e.g. &ldquo;Why does pressure increase when gas is compressed?&rdquo;)
                  </p>
                </div>
                <div className="bg-[#FAF9F5] border border-[#E7E3D8] rounded-xl p-4">
                  <div className="font-bold text-[#1E225B] flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-[#1E225B] text-white flex items-center justify-center text-xs">2</span>
                    Tier 2: Mathematical Derivation &amp; Rigor
                  </div>
                  <p className="text-xs text-slate-600">
                    Tests precise formal definitions, LaTeX equation derivations, boundary conditions, and sign conventions. (e.g. $PV = nRT$, $P_1 V_1 = P_2 V_2$).
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <h3 className="font-bold text-[#1E225B] text-base mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#249EA0]" />
                  Key Flashcard Capabilities
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Modified SuperMemo SM-2:</strong> Automatically adjusts repetition intervals based on your response quality (Again, Hard, Good, Easy).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>1-Click AI Deck Generator:</strong> Upload class notes or select a curriculum unit to instantly generate high-yield, curated 2-tier decks.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>In-Card Socratic Clues:</strong> Never get stranded. If you draw a blank, reveal a progressive hint before flipping the card.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>School &amp; Public Sync:</strong> Flashcards mastered on the Public Hub seamlessly link into your school student dashboard.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 2: Why Students Need It ─────────────────────────────── */}
        <section className="py-16 bg-[#1E225B] text-white px-5 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#F5921D] uppercase tracking-wider">
                Cognitive Science
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-1.5">
                Why Standard Cramming Fails (and How We Fix It)
              </h2>
              <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                The human brain is optimized to prune unused neural connections. Without systematic spaced repetition, hours of studying vanish into thin air.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-4 font-bold text-lg">
                    📉
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">The Forgetting Curve</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Ebbinghaus showed that within 48 hours of learning a concept, students forget roughly 75% of it unless reactivated at precise intervals.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-[#F5921D]">
                  SM-2 resets the decay before it drops below 80%.
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 font-bold text-lg">
                    🪞
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">The Recognition Fallacy</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Rereading notes feels comforting because your eyes recognize the text. But recognition is passive; exams require active retrieval under stress.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-[#F5921D]">
                  2-Tier retrieval forces active synaptic generation.
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 font-bold text-lg">
                    ⚡
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Time-Efficient Cram-Free</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Instead of 6-hour panic sessions the night before a midterm, 7 minutes of daily SM-2 flashcard reviews produces 95%+ retention.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-emerald-400">
                  Cut study fatigue by over 70%.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 3: How It Works ─────────────────────────────────────── */}
        <section className="py-16 px-5 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#F5921D] uppercase tracking-wider">
              Algorithmic Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B] mt-1.5">
              How the SM-2 Flashcard Engine Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every review recalibrates your personalized memory curve in real-time.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#1E225B] text-white flex items-center justify-center text-sm font-bold mb-3">
                1
              </div>
              <h3 className="font-bold text-[#1E225B] text-sm mb-1.5">Prompt &amp; Mental Recall</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The card presents the Tier 1 intuition challenge. Before looking at the back, you form the explanation in your mind.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#249EA0] text-white flex items-center justify-center text-sm font-bold mb-3">
                2
              </div>
              <h3 className="font-bold text-[#1E225B] text-sm mb-1.5">Flip &amp; Formula Check</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Flip the card to verify your intuition, then inspect Tier 2: formal math equations, diagrams, and boundary conditions.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#F5921D] text-white flex items-center justify-center text-sm font-bold mb-3">
                3
              </div>
              <h3 className="font-bold text-[#1E225B] text-sm mb-1.5">Recall Quality Rating</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rate your recall on a 4-point scale: Again (blackout), Hard (struggled), Good (recalled cleanly), or Easy (instant recall).
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold mb-3">
                4
              </div>
              <h3 className="font-bold text-[#1E225B] text-sm mb-1.5">SM-2 Interval Scheduling</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The card is scheduled for review in 1 day, 3 days, 6 days, or 14+ days. Easy cards spread out; hard cards resurface quickly.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Section 4: Practical Real-World Example ─────────────────────── */}
        <section className="py-16 bg-[#FAF9F5] border-t border-[#E7E3D8] px-5 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-[#249EA0] uppercase tracking-wider">
                Concrete Example
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B] mt-1.5">
                Standard Flashcard vs. GuruMera 2-Tier Flashcard
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Topic: Lenz’s Law in Electromagnetism.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-red-600 font-bold text-xs uppercase tracking-wider">
                  Traditional Flashcard (Anki / Quizlet)
                </div>
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-900 block mb-1">Front:</span>
                    &ldquo;What is Lenz&apos;s Law?&rdquo;
                  </div>
                  <div className="bg-red-50/60 p-3 rounded-lg border border-red-100 text-slate-700">
                    <span className="font-semibold text-red-700 block mb-1">Back:</span>
                    &ldquo;The direction of an induced current always opposes the change in magnetic flux that produces it.&rdquo;
                  </div>
                  <div className="text-[11px] text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    <strong>Test Result:</strong> Student memorizes the sentence word-for-word. On the test, a magnet falls through a copper pipe. The student has no idea why it falls slowly because they never internalized the eddy current repulsion mechanism.
                  </div>
                </div>
              </div>

              <div className="bg-white border border-emerald-300 rounded-2xl p-6 shadow-xs ring-2 ring-emerald-500/10">
                <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                  GuruMera 2-Tier Flashcard
                </div>
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-900 block mb-1">Tier 1 (Front):</span>
                    &ldquo;If you drop a strong neodymium magnet down a hollow vertical copper pipe, why does it float down slowly instead of falling in freefall?&rdquo;
                  </div>
                  <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100 text-slate-800">
                    <span className="font-semibold text-emerald-800 block mb-1">Tier 1 + 2 (Back):</span>
                    <p className="mb-2"><strong>Intuition:</strong> Moving magnetic fields induce circular eddy currents in copper that create an opposing upward magnetic field (Lenz&apos;s Law / conservation of energy).</p>
                    <p><strong>Formal Math:</strong> $\mathcal{E} = -\frac{d\Phi_B}{dt}$ where the minus sign represents opposing field orientation.</p>
                  </div>
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <strong>Test Result:</strong> 100% score on qualitative and quantitative electromagnetic induction problems.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Direct CTA Banner ─────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-[#1E225B] to-[#141740] text-white py-16 px-5 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-5">
            <span className="text-xs font-bold text-[#F5921D] uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/20 inline-block">
              Free &amp; Unlimited Deck Access
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Start Your Spaced Repetition Streak Today
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              Choose from pre-built AP, IB, and university STEM decks, or generate your own custom AI deck in seconds.
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/hub?tab=flashcards"
                className="bg-[#F5921D] hover:bg-[#DC7B0C] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm sm:text-base"
              >
                <span>Study Flashcards in Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3.5 rounded-xl border border-white/20 transition-all text-sm sm:text-base"
              >
                Sign In to Save Mastery Streaks
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
