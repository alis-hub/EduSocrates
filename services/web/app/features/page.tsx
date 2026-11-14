import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { MarketingFooter } from '@/components/MarketingFooter';
import {
  Brain,
  Layers,
  Network,
  Users,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Platform Features & Educational Product Suite | GuruMera',
  description:
    'Explore GuruMera’s complete educational product suite: Socratic AI Tutor, 2-Tier Spaced Repetition Flashcards, Concept Knowledge Maps, and Collaborative Peer Whiteboards.',
  keywords: [
    'GuruMera features',
    'educational AI products',
    'Socratic AI tutor',
    'spaced repetition flashcards',
    'concept knowledge maps',
    'collaborative whiteboard STEM',
    'AI study tools',
    'active learning platform',
  ],
  openGraph: {
    title: 'Platform Features & Educational Product Suite | GuruMera',
    description:
      'Discover the Why behind STEM concepts. Explore individual product information pages for Socratic tutoring, flashcards, knowledge trees, and peer whiteboards.',
    type: 'website',
  },
};

const FEATURES = [
  {
    id: 'socratic-tutor',
    href: '/features/socratic-tutor',
    title: 'Socratic AI Tutor',
    tagline: 'Guided STEM Learning Without Spoiled Answers',
    badge: 'Flagship AI Mentor',
    badgeColor: 'bg-[#1E225B]/10 text-[#1E225B] border-[#1E225B]/20',
    icon: Brain,
    iconColor: 'text-[#249EA0]',
    description:
      'Unlike answer-generator chatbots that create a cognitive bypass, GuruMera’s Socratic AI Tutor guides students using progressive diagnostic inquiries, physical analogies, and multi-tier hints to derive solutions themselves.',
    highlights: [
      'Zero direct-answer leak guarantee',
      'Prompt-injection shielded against cheating',
      'Step-by-step diagnostic misconception isolation',
      'LaTeX math derivations and code debugging',
    ],
    ctaText: 'Explore Socratic AI Tutor Page',
  },
  {
    id: 'flashcards',
    href: '/features/flashcards',
    title: '2-Tier Spaced Repetition Flashcards',
    tagline: 'Intuition-First Memory Retention via SM-2',
    badge: 'Cognitive Science Engine',
    badgeColor: 'bg-[#F5921D]/10 text-[#DC7B0C] border-[#F5921D]/25',
    icon: Layers,
    iconColor: 'text-[#F5921D]',
    description:
      'Standard flashcards train superficial keyword recognition. GuruMera tests fundamental intuition in Tier 1 before asking for formal formulas or definitions in Tier 2, powered by the modified SuperMemo SM-2 algorithm.',
    highlights: [
      'Dual-tier prompt architecture (Intuition → Formula)',
      'Algorithmic SM-2 interval scheduling',
      'In-card Socratic clues if you get stuck',
      'Instant AI deck generation from notes or syllabi',
    ],
    ctaText: 'Explore 2-Tier Flashcards Page',
  },
  {
    id: 'knowledge-maps',
    href: '/features/knowledge-maps',
    title: 'Concept Knowledge Maps (DAG)',
    tagline: 'Visual Prerequisite Trees & Mastery Tracking',
    badge: 'Topological Learning',
    badgeColor: 'bg-[#249EA0]/10 text-[#249EA0] border-[#249EA0]/25',
    icon: Network,
    iconColor: 'text-[#249EA0]',
    description:
      'Subjects are modeled as Directed Acyclic Graphs (DAGs) showing exact prerequisite connections. When you get stuck on advanced calculus or physics, the map isolates the forgotten upstream concept immediately.',
    highlights: [
      'Visual dependency roadmap of entire courses',
      'Automated backward gap tracing for failed problems',
      'Gamified skill tree progression (Locked → Mastered)',
      '1-click handoff to targeted practice and quizzes',
    ],
    ctaText: 'Explore Knowledge Maps Page',
  },
  {
    id: 'peer-whiteboards',
    href: '/features/peer-whiteboards',
    title: 'Peer Collaborative Whiteboards',
    tagline: 'Real-Time Infinite Canvas for STEM Derivations',
    badge: 'Live Peer Study',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Users,
    iconColor: 'text-emerald-600',
    description:
      'Typing math equations and science schematics in text chat is painful. Peer Whiteboards give you an instant, zero-download collaborative canvas with coordinate grids, peer cursors, and live stroke synchronization.',
    highlights: [
      'Sub-50ms low-latency WebSocket drawing',
      'STEM coordinate grid and geometric shape tools',
      'Live peer cursors with participant presence badges',
      '1-click room creation and 6-digit invite codes',
    ],
    ctaText: 'Explore Peer Whiteboards Page',
  },
];

export default function FeaturesOverviewPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E225B] flex flex-col font-sans">
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
              href="/hub"
              className="bg-[#1E225B] hover:bg-[#141740] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Open Public Hub
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── Breadcrumbs ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-5 pb-2 text-xs text-slate-500 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#1E225B] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[#1E225B] font-semibold">Features Suite</span>
      </div>

      <main className="flex-1">
        {/* ─── Hero Section ──────────────────────────────────────────────── */}
        <section className="pt-10 pb-16 px-5 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-[#1E225B]/10 border border-[#1E225B]/20 text-[#1E225B] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#F5921D]" />
            Educational Product Suite
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#1E225B] tracking-tight leading-[1.15] mb-6">
            Four Breakthrough Products. <br className="hidden sm:inline" />
            <span className="text-[#F5921D]">One Mastered Understanding.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto mb-8 font-normal">
            Every feature on GuruMera was engineered to reject passive spoon-fed answers and foster independent cognitive stamina. Explore individual product information pages below.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/hub"
              className="bg-[#F5921D] hover:bg-[#DC7B0C] text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm sm:text-base"
            >
              <span>Explore Public Learning Hub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/try-teacher"
              className="bg-white hover:bg-slate-50 text-[#1E225B] border border-slate-300 font-semibold px-5 py-3.5 rounded-xl transition-all text-sm sm:text-base shadow-2xs"
            >
              Try Teacher Sandbox (2h Demo)
            </Link>
          </div>
        </section>

        {/* ─── 4 Feature Product Cards Grid ──────────────────────────────── */}
        <section className="py-12 px-5 sm:px-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="bg-white border border-[#E7E3D8] rounded-2xl p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${feature.badgeColor}`}>
                        {feature.badge}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                      </div>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-[#1E225B] mb-1">
                      {feature.title}
                    </h2>
                    <p className="text-xs font-semibold text-[#F5921D] mb-3">
                      {feature.tagline}
                    </p>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                      {feature.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Core Capabilities:
                      </div>
                      {feature.highlights.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Link
                      href={feature.href}
                      className="w-full bg-[#1E225B] hover:bg-[#141740] text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                    >
                      <span>{feature.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Bottom Direct Call to Action ───────────────────────────────── */}
        <section className="bg-gradient-to-r from-[#1E225B] to-[#141740] text-white py-16 px-5 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-5">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Start Learning with GuruMera Today
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              Join thousands of students and schools discovering the joy of true conceptual discovery.
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/hub"
                className="bg-[#F5921D] hover:bg-[#DC7B0C] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-md text-sm sm:text-base"
              >
                Launch Public Learning Hub
              </Link>
              <Link
                href="/signup"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3.5 rounded-xl border border-white/20 transition-all text-sm sm:text-base"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
