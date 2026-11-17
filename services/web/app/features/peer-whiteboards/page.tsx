import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { MarketingFooter } from '@/components/MarketingFooter';
import { PeerWhiteboardsInteractiveDemo } from './PeerWhiteboardsInteractiveDemo';
import {
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Share2,
  PenTool,
  Lock,
  Layers,
  Brain,
  Video,
  Download,
  ShieldCheck,
  Grid,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Peer Collaborative Whiteboards — Real-Time STEM Problem Solving | GuruMera',
  description:
    'Sketch derivations, collaborate with peers, and solve complex STEM problems together in real-time with GuruMera’s zero-friction collaborative Peer Whiteboards.',
  keywords: [
    'Peer Whiteboard',
    'collaborative whiteboard for STEM',
    'real-time online whiteboard',
    'study group whiteboard',
    'math canvas online',
    'physics free-body diagram board',
    'Feynman technique peer tutoring',
    'browser-based whiteboard',
  ],
  openGraph: {
    title: 'Peer Collaborative Whiteboards | GuruMera',
    description:
      'Zero installs. Instant rooms. Work through calculus proofs, physics diagrams, and organic chemistry mechanisms with your study group in real-time.',
    type: 'website',
  },
};

export default function PeerWhiteboardsPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E225B] flex flex-col font-sans">
      {/* ─── Structured JSON-LD SEO Schema ──────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'GuruMera Peer Collaborative Whiteboards',
            applicationCategory: 'EducationalSoftware',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0.00',
              priceCurrency: 'USD',
            },
            description:
              'Real-time low-latency collaborative digital canvas designed for STEM derivations, peer tutoring, and study groups.',
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
              href="/hub?tab=whiteboards"
              className="bg-[#1E225B] hover:bg-[#141740] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Start Whiteboard Free
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
        <span className="text-[#1E225B] font-semibold">Peer Whiteboards</span>
      </div>

      <main className="flex-1">
        {/* ─── Hero Section ──────────────────────────────────────────────── */}
        <section className="pt-10 pb-16 px-5 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-[#1E225B]/10 border border-[#1E225B]/25 text-[#1E225B] text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4 text-[#249EA0]" />
            Real-Time Peer Collaboration
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#1E225B] tracking-tight leading-[1.15] mb-6">
            Solve Hard STEM Problems Together. <br className="hidden sm:inline" />
            <span className="text-[#F5921D]">Real-Time Whiteboards</span> Built for Math &amp; Science.
          </h1>

          <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto mb-8 font-normal">
            Typing calculus formulas or physics free-body diagrams into standard chat apps is painful. GuruMera’s Peer Whiteboards let you co-draw, sketch equations, and explain concepts live with classmates in one click—zero downloads required.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/hub?tab=whiteboards"
              className="bg-[#1E225B] hover:bg-[#141740] text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm sm:text-base"
            >
              <PenTool className="w-4 h-4 text-[#F5921D]" />
              <span>Launch a Free Whiteboard Room</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#interactive-demo"
              className="bg-white hover:bg-slate-50 text-[#1E225B] border border-slate-300 font-semibold px-5 py-3.5 rounded-xl transition-all text-sm sm:text-base shadow-2xs"
            >
              Draw on Interactive Canvas
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#F5921D]" />
              Instant 1-Click Link Sharing
            </span>
            <span className="flex items-center gap-1.5">
              <Grid className="w-4 h-4 text-[#249EA0]" />
              STEM Coordinate Grid &amp; Shapes
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Private, school-scoped rooms
            </span>
          </div>
        </section>

        {/* ─── Interactive Demonstration ─────────────────────────────────── */}
        <section id="interactive-demo" className="py-12 bg-white border-y border-[#E7E3D8] px-5 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold text-[#F5921D] uppercase tracking-wider">
                Live Interactive Canvas Simulator
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B] mt-1.5">
                Try Drawing and Peer Cursors Right Here
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Pick a pen color, draw equations or sketches on the grid, watch simulated peer collaborators work in real-time, and test room link generation!
              </p>
            </div>

            <PeerWhiteboardsInteractiveDemo />
          </div>
        </section>

        {/* ─── Section 1: What the Feature Does ────────────────────────────── */}
        <section className="py-16 px-5 sm:px-6 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#249EA0] uppercase tracking-wider mb-2">
                <PenTool className="w-4 h-4" />
                What It Does
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B] mb-4">
                An Infinite Collaborative Canvas Engineered for Academic Work
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
                GuruMera Peer Whiteboards replace unwieldy general-purpose whiteboard tools with an agile, math-and-science native canvas.
              </p>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Sub-50ms Stroke Synchronization:</strong> Real-time WebSocket broadcasting renders every stroke, arrow, and annotation instantaneously across all devices.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>STEM Mathematical Tooling:</strong> Includes Cartesian grids, dot grids, geometric shape snap (lines, circles, vectors), highlighters, and formula stamps.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Live Peer Cursors &amp; Presence:</strong> See where your classmates are pointing, reading, or sketching with labeled color-coded cursors.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Export &amp; Socratic AI Integration:</strong> Export study notes as vector PDFs or forward whiteboard screenshots directly to the Socratic AI Tutor for guided validation.
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-[#FAF9F5] border border-[#E7E3D8] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E7E3D8] text-xs font-bold text-[#1E225B]">
                <ShieldCheck className="w-4 h-4 text-[#249EA0]" />
                Frictionless Collaboration Architecture
              </div>
              <div className="space-y-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="font-bold text-[#1E225B] mb-1">Instant Room Generation</div>
                  <p className="text-slate-500">Create an encrypted collaborative room in 1 second. No downloads, extensions, or mandatory account creation for guest peers.</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="font-bold text-[#1E225B] mb-1">6-Digit Room Code &amp; QR Access</div>
                  <p className="text-slate-500">Students can join seamlessly from tablets, laptops, or smartphones by typing a simple code or scanning a QR code.</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="font-bold text-[#1E225B] mb-1">Safe Study Controls</div>
                  <p className="text-slate-500">Only signed-in members of the same school can open a school room, and the room owner decides who can draw.</p>
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
                Peer Learning &amp; The Feynman Technique
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-1.5">
                Why Students Learn Faster Together
              </h2>
              <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                Educational research consistently proves that teaching a peer is the most powerful learning method known to science.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-4 font-bold text-lg">
                    💬
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">The Text Chat Barrier</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Ever tried explaining an organic chemistry ring reaction or electric field vectors in a Discord or WhatsApp text chat? It is nearly impossible.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-[#F5921D]">
                  Visual sketching eliminates miscommunication instantly.
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 font-bold text-lg">
                    🧠
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">The Feynman Effect</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    When you pick up a digital stylus to walk a classmate through a problem step-by-step, your brain identifies hidden gaps you didn&apos;t realize you had.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-[#F5921D]">
                  Solidifies 90%+ conceptual retention.
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 font-bold text-lg">
                    🤝
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Zero Study Isolation</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Late-night study frustration leads to burnout. Working through challenging assignments side-by-side with a peer restores confidence and stamina.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-emerald-400">
                  Turns stressful homework into collaborative fun.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 3: How It Works ─────────────────────────────────────── */}
        <section className="py-16 px-5 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#F5921D] uppercase tracking-wider">
              Simple Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B] mt-1.5">
              How Peer Whiteboards Work
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              From feeling stuck to collaborative breakthrough in under 60 seconds.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#1E225B] text-white flex items-center justify-center text-sm font-bold mb-3">
                1
              </div>
              <h3 className="font-bold text-[#1E225B] text-sm mb-1.5">Create Room</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click &ldquo;Create Room&rdquo; on the Public Hub. An encrypted canvas session generates immediately with a clean STEM grid.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#249EA0] text-white flex items-center justify-center text-sm font-bold mb-3">
                2
              </div>
              <h3 className="font-bold text-[#1E225B] text-sm mb-1.5">Share Link or Code</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Copy the room invite link or share the 6-digit access code with study partners, lab teammates, or your tutor.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#F5921D] text-white flex items-center justify-center text-sm font-bold mb-3">
                3
              </div>
              <h3 className="font-bold text-[#1E225B] text-sm mb-1.5">Co-Draw in Real-Time</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Everyone sees each other&apos;s strokes and cursors live. Sketch free-body diagrams, plot coordinates, and write out steps.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold mb-3">
                4
              </div>
              <h3 className="font-bold text-[#1E225B] text-sm mb-1.5">Export &amp; Review</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Save the completed board as a high-res image or PDF for test prep, or pass the work to the Socratic AI for feedback.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Section 4: Practical Real-World Example ─────────────────────── */}
        <section className="py-16 bg-[#FAF9F5] border-t border-[#E7E3D8] px-5 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-[#249EA0] uppercase tracking-wider">
                Practical Application
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B] mt-1.5">
                The AP Chemistry Midterm Study Session
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Topic: VSEPR Molecular Geometry &amp; Orbital Hybridization ($sp^3, sp^2, sp$).
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-red-600 font-bold text-xs uppercase tracking-wider">
                  Without Peer Whiteboard (Text Chat Nightmare)
                </div>
                <div className="space-y-3 text-xs text-slate-700">
                  <p>
                    <strong>Alex:</strong> &ldquo;Wait, how does water have a 104.5 degree bond angle if oxygen is sp3? Shouldn&apos;t it be 109.5?&rdquo;
                  </p>
                  <p>
                    <strong>Sarah:</strong> &ldquo;It&apos;s because the two lone pairs push down on the hydrogens. Imagine a pyramid with two invisible balloons on top.&rdquo;
                  </p>
                  <p>
                    <strong>Alex:</strong> &ldquo;I can&apos;t visualize what you mean. Is the lone pair pointing into the screen or out of the screen?&rdquo;
                  </p>
                  <div className="text-[11px] text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    <strong>Result:</strong> 30 minutes wasted trying to describe 3D space with text messages. Both students still feel uncertain.
                  </div>
                </div>
              </div>

              <div className="bg-white border border-emerald-300 rounded-2xl p-6 shadow-xs ring-2 ring-emerald-500/10">
                <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                  With GuruMera Peer Whiteboard (Visual Co-Creation)
                </div>
                <div className="space-y-3 text-xs text-slate-700">
                  <p>
                    <strong>Action:</strong> Sarah opened a Peer Whiteboard in 3 seconds and texted the 6-digit room code to Alex.
                  </p>
                  <p>
                    <strong>Visual Collaboration:</strong> Sarah quickly sketched the tetrahedral wedge-and-dash representation of water, using green for bonding pairs and yellow shading for the bulky lone pairs.
                  </p>
                  <p>
                    <strong>Alex:</strong> Immediately saw how lone-pair lone-pair repulsion compresses the H-O-H angle from $109.5^\circ$ down to $104.5^\circ$, and co-sketched ammonia ($NH_3$ at $107^\circ$) to prove the rule!
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
              Free &amp; Unlimited Study Rooms
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Create a Free Collaborative Whiteboard Right Now
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              No account required to join. Start sketching with classmates, lab partners, or peers in seconds.
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/hub?tab=whiteboards"
                className="bg-[#F5921D] hover:bg-[#DC7B0C] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm sm:text-base"
              >
                <span>Launch Peer Whiteboard in Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/hub?tab=whiteboards"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3.5 rounded-xl border border-white/20 transition-all text-sm sm:text-base"
              >
                Join With Room Code
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
