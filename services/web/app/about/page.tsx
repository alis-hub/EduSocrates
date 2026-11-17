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
  Target,
  Lightbulb,
  Rocket,
  BookOpen,
  Milestone,
  Layers,
  Eye,
  Scale,
  Award,
  ArrowRight,
  Clock,
  Flame,
  Cpu,
  TrendingUp,
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

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-5 sm:px-6 text-center max-w-4xl mx-auto">
          <div className="inline-block mb-4">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-[#F5921D] px-4 py-1.5 rounded-full bg-[#F5921D]/10 border border-[#F5921D]/25">
              – Discover the Why! –
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#1E225B] tracking-tight leading-[1.15] mb-6">
            Restoring the Spirit of Wonder to Generative Learning
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-normal">
            GuruMera is an intelligent educational ecosystem that combines multi-campus institutional administration with a dedicated, defense-in-depth Socratic AI tutor and a universal public learning commons. We believe learning is not about acquiring answers—it is about discovering how to think.
          </p>
        </section>

        {/* 1. Why GuruMera Was Founded */}
        <section className="py-16 bg-white border-y border-[#E7E3D8] px-5 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2 rounded-lg bg-[#F5921D]/10 text-[#F5921D]">
                <Flame className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F5921D]">Origin Story</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B] mb-6">
              Why GuruMera Was Founded
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-center text-slate-600 leading-relaxed">
              <div className="space-y-4">
                <p>
                  With the sudden explosion of consumer generative AI, the classroom encountered an unprecedented crisis: AI became an instant homework machine. Instead of grappling with complex problems, students learned to prompt chatbots for immediate solutions, essays, and code snippets.
                </p>
                <p>
                  This created a catastrophic <strong>cognitive bypass</strong>. While homework scores looked perfect on paper, conceptual retention plummeted, intellectual resilience eroded, and the joy of genuine discovery vanished.
                </p>
              </div>
              <div className="bg-[#FAF9F5] border border-[#E7E3D8] rounded-2xl p-6 relative">
                <div className="border-l-4 border-[#F5921D] pl-4 italic text-slate-700 font-medium">
                  &ldquo;Education is not the filling of a pail, but the lighting of a fire.&rdquo;
                </div>
                <p className="mt-4 text-sm text-slate-600">
                  GuruMera was founded to turn generative AI from a passive answer generator into a <strong>patient, inquisitive Socrates</strong>—an AI study mentor that never spoils the answer, but instead sparks curiosity and guides learners through progressive questioning.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. The Educational Problem We Are Solving */}
        <section className="py-16 px-5 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#249EA0] mb-2 block">The Challenge</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
              The Educational Crisis of the AI Era
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Modern classrooms and independent learners face systemic hurdles that traditional software and consumer chatbots exacerbate.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E7E3D8] shadow-xs hover:border-[#1E225B]/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1E225B] text-base mb-2">Cognitive Bypass &amp; Cheating</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Generic LLMs deliver complete answers instantly, robbing students of the vital &ldquo;productive struggle&rdquo; required to forge deep neural connections.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E7E3D8] shadow-xs hover:border-[#1E225B]/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#F5921D] flex items-center justify-center font-bold mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1E225B] text-base mb-2">The 2-Sigma Tutoring Gap</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Bloom&apos;s famous 2-Sigma research proved 1-on-1 tutoring produces two standard deviations of improvement, yet personal tutors remain unaffordable for most families.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E7E3D8] shadow-xs hover:border-[#1E225B]/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-4">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1E225B] text-base mb-2">The Teacher &ldquo;Black Box&rdquo;</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Educators cannot see where students struggle at home. They only see finished homework, leaving learning gaps undetected until exam day.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Our Learning Philosophy (Core 3 Principles) */}
        <section className="py-16 bg-[#1E225B] text-white px-5 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F5921D] mb-2 block">
                Foundational Tenets
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Our Learning Philosophy
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-3">
                Everything we build at GuruMera is anchored in three non-negotiable principles of human cognition:
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Principle 1 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 hover:border-[#F5921D]/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-8 h-8 rounded-full bg-[#F5921D] text-[#1E225B] font-extrabold text-sm flex items-center justify-center">
                      1
                    </span>
                    <Brain className="w-6 h-6 text-[#F5921D]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Understand Before Memorizing</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    Formulas and definitions quickly evaporate if they are not anchored in intuition. We push learners to grasp the underlying &ldquo;why&rdquo; and first principles before ever committing steps to memory. When you truly understand, you can reconstruct any answer from scratch.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-semibold text-[#F5921D]">
                  Focus: Conceptual Anchoring &amp; First Principles
                </div>
              </div>

              {/* Principle 2 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 hover:border-[#249EA0]/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-8 h-8 rounded-full bg-[#249EA0] text-white font-extrabold text-sm flex items-center justify-center">
                      2
                    </span>
                    <Lightbulb className="w-6 h-6 text-[#249EA0]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Think Before Answering</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    Speed is not the measure of intelligence. We encourage deliberate pause, edge-case testing, and dialectical inquiry. By prompting students to state their hypotheses and assumptions before finalizing work, we replace impulsive guessing with analytical rigor.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-semibold text-[#249EA0]">
                  Focus: Metacognitive Reflection &amp; Hypothesis Testing
                </div>
              </div>

              {/* Principle 3 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 hover:border-[#F5921D]/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-8 h-8 rounded-full bg-[#F5921D] text-[#1E225B] font-extrabold text-sm flex items-center justify-center">
                      3
                    </span>
                    <Target className="w-6 h-6 text-[#F5921D]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Master Through Practice</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    Knowledge remains fragile until forged through active, deliberate application. Through spaced-repetition flashcards, dynamic toy problems, and iterative debugging, learners turn passive awareness into durable, instinctive mastery.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-semibold text-[#F5921D]">
                  Focus: Deliberate Practice &amp; Spaced Retrieval
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Pedagogical Principles */}
        <section className="py-16 px-5 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E225B] mb-2 block">Pedagogy</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
              Our Pedagogical Architecture
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Rooted in centuries of educational theory, elevated by modern cognitive science.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-[#E7E3D8] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#1E225B]/10 text-[#1E225B]">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#1E225B] text-base">The Classical Socratic Method</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Rather than answering inquiries with lectures, the tutor poses counter-questions, decomposes complex challenges into manageable micro-steps, and guides students to spot contradictions in their own logic.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#E7E3D8] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#F5921D]/15 text-[#DC7B0C]">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#1E225B] text-base">Scaffolded Zone of Proximal Development</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Drawing on Vygotsky&apos;s ZPD, our system dynamically adjusts hints based on current comprehension—offering subtle analogies when close, and structured foundational reviews when lost.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#E7E3D8] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#249EA0]/15 text-[#249EA0]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#1E225B] text-base">Productive Struggle &amp; Metacognition</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                We safeguard the &ldquo;aha!&rdquo; moment. GuruMera protects the brief cognitive discomfort where genuine learning happens, teaching students to monitor and regulate their own thinking process.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#E7E3D8] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#1E225B] text-base">Multi-Modal Dual Coding</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Learning is reinforced through combined visual and verbal channels: interactive STEM function plotters, concept dependency trees, and two-tier spaced repetition flashcards.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Approach to Responsible AI */}
        <section className="py-16 bg-white border-y border-[#E7E3D8] px-5 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-2xl mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#249EA0] mb-2 block">Safety &amp; Ethics</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
                Our Approach to Responsible AI
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2">
                We believe educational AI requires far higher safety, privacy, and integrity standards than general-purpose consumer chat interfaces.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E7E3D8]">
                <ShieldCheck className="w-6 h-6 text-[#1E225B] mb-3" />
                <h4 className="font-bold text-sm text-[#1E225B] mb-1.5">Zero Direct Solutions Policy</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Strict defense-in-depth filters intercept and deflect prompts like &ldquo;give me the answer&rdquo;, &ldquo;write this essay&rdquo;, or &ldquo;solve for x&rdquo;.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E7E3D8]">
                <Lock className="w-6 h-6 text-[#F5921D] mb-3" />
                <h4 className="font-bold text-sm text-[#1E225B] mb-1.5">Your school's data stays separate</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Each school's data is kept apart from every other school's at the database level. We do not sell student data or show ads.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E7E3D8]">
                <Scale className="w-6 h-6 text-[#249EA0] mb-3" />
                <h4 className="font-bold text-sm text-[#1E225B] mb-1.5">Server-Side Answer Shielding</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Grading rubrics and teacher answer keys remain safely cloaked on secure backend servers, immune to client-side prompt extraction.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E7E3D8]">
                <Eye className="w-6 h-6 text-indigo-600 mb-3" />
                <h4 className="font-bold text-sm text-[#1E225B] mb-1.5">Teacher Audit Transparency</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Full dialogue transcripts and prompt injection flags are transparently visible to teachers, ensuring human oversight at all times.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Team & Leadership */}
        <section className="py-16 px-5 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F5921D] mb-2 block">Who We Are</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
              Team &amp; Leadership
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              A passionate collective of educators, cognitive scientists, machine learning engineers, and software architects dedicated to human-centric pedagogy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E7E3D8] text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#1E225B]/10 text-[#1E225B] font-bold text-xl flex items-center justify-center mx-auto">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-[#1E225B] text-base">Pedagogical Leadership</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Guided by veteran classroom educators with deep expertise in curriculum design, student assessment, and Vygotskian scaffolding.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E7E3D8] text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#F5921D]/15 text-[#DC7B0C] font-bold text-xl flex items-center justify-center mx-auto">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-[#1E225B] text-base">AI Safety &amp; Engineering</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Engineers specializing in multi-layer AI guardrails, latency optimization, and defense against adversarial prompt injections.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E7E3D8] text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#249EA0]/15 text-[#249EA0] font-bold text-xl flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-[#1E225B] text-base">Product &amp; School Partnerships</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated liaisons working alongside school district leaders, parents, and self-learners to refine classroom workflows and equity of access.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Long-Term Vision */}
        <section className="py-16 bg-[#FAF9F5] border-t border-[#E7E3D8] px-5 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1E225B] px-3.5 py-1 rounded-full bg-[#1E225B]/10">
              Looking Forward
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E225B] tracking-tight">
              Our Long-Term Vision
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              We envision a world where every single learner—regardless of geography, economic background, or school district—has access to a world-class, infinite-patience 1-on-1 Socratic tutor. A companion that does not do the thinking for them, but empowers them to believe in their own intellectual capability.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              By harmonizing public learning commons with institutional school infrastructure, GuruMera bridges the divide between formal schooling and lifelong self-directed exploration.
            </p>
          </div>
        </section>

        {/* 8. Educational Capabilities Roadmap */}
        <section className="py-16 bg-white border-y border-[#E7E3D8] px-5 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-[#249EA0] mb-2 block">Future Horizons</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
                Educational Capabilities Roadmap
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2">
                A transparent look at the innovations we are delivering across upcoming releases.
              </p>
            </div>

            <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 md:before:left-1/2 before:w-0.5 before:bg-[#E7E3D8] before:-translate-x-1/2">
              {/* Phase 1 */}
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="md:w-1/2 md:text-right md:pr-8">
                  <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 mb-2">
                    Current Release (v3.0) — Live
                  </span>
                  <h3 className="font-bold text-lg text-[#1E225B]">Universal Socratic Foundation</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    7-Tool Public Learning Hub, 2-Tier Spaced Repetition Flashcards, Concept Knowledge Maps, Teacher Sandbox Simulator, and Multi-tenant School Admin &amp; Parent Portals.
                  </p>
                </div>
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white">
                  ✓
                </div>
                <div className="md:w-1/2 md:pl-8 hidden md:block" />
              </div>

              {/* Phase 2 */}
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="md:w-1/2 md:pr-8 hidden md:block" />
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#F5921D] text-white flex items-center justify-center font-bold text-xs ring-4 ring-white">
                  2
                </div>
                <div className="md:w-1/2 md:pl-8 pl-12">
                  <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 mb-2">
                    Upcoming (Q1–Q2 2027)
                  </span>
                  <h3 className="font-bold text-lg text-[#1E225B]">Voice-First &amp; Multimodal Diagnostics</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Low-latency conversational voice tutoring for auditory learners, handwriting vision analysis for step-by-step math error detection, and personalized neurodivergent cognitive pacing.
                  </p>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="md:w-1/2 md:text-right md:pr-8 pl-12 md:pl-0">
                  <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 mb-2">
                    Near-Term Horizon (Q3–Q4 2027)
                  </span>
                  <h3 className="font-bold text-lg text-[#1E225B]">Peer Socratic Circles &amp; Global Standards</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    AI-moderated peer debate rooms, native alignment with international curricula (IB, Cambridge, AP, CBSE), and offline-first edge models for bandwidth-constrained rural schools.
                  </p>
                </div>
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#249EA0] text-white flex items-center justify-center font-bold text-xs ring-4 ring-white">
                  3
                </div>
                <div className="md:w-1/2 md:pl-8 hidden md:block" />
              </div>

              {/* Phase 4 */}
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="md:w-1/2 md:pr-8 hidden md:block" />
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#1E225B] text-white flex items-center justify-center font-bold text-xs ring-4 ring-white">
                  4
                </div>
                <div className="md:w-1/2 md:pl-8 pl-12">
                  <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 mb-2">
                    Long-Term Horizon (2028+)
                  </span>
                  <h3 className="font-bold text-lg text-[#1E225B]">Interactive Socratic Labs &amp; Reasoning Credentials</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Simulated physics and chemistry problem sandboxes where the AI questions real-time experimental choices; verifiable mastery credentials based on demonstrated problem-solving rigor rather than rote testing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="py-20 text-center px-5 sm:px-6">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#E7E3D8] p-8 sm:p-12 shadow-sm space-y-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
              Experience Socratic Learning Today
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Start learning immediately in our free Public Hub or explore a live 2-hour sandbox simulation designed for classroom educators.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/hub" className="bg-[#F5921D] hover:bg-[#DC7B0C] text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all shadow-md">
                Start Learning for Free
              </Link>
              <Link href="/try-teacher" className="bg-white hover:bg-slate-50 text-[#1E225B] border border-slate-300 font-semibold px-6 py-3.5 rounded-xl text-sm transition-all">
                Try as a Teacher (2h Sandbox)
              </Link>
              <Link href="/schools" className="bg-slate-100 hover:bg-slate-200 text-[#1E225B] font-semibold px-6 py-3.5 rounded-xl text-sm transition-all">
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
