'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Flame,
  GitBranch,
  HelpCircle,
  Info,
  Layers,
  Lock,
  MessageSquare,
  Network,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

export interface StudyUnit {
  id: string;
  title: string;
  subject: string;
  category: 'Physics' | 'Computer Science' | 'Biology' | 'Mathematics' | 'Economics';
  description: string;
  starterPrompt: string;
  conceptDomain: string;
  sampleQuestion: string;
  defaultMode: 'EXPLANATION' | 'CHECK_MY_LOGIC' | 'TOY_PROBLEM';
}

export const CURATED_STUDY_UNITS: StudyUnit[] = [
  {
    id: 'newtons-laws',
    title: "Newton's Laws of Motion & Friction",
    subject: 'Physics',
    category: 'Physics',
    description: 'Forces, mass, action-reaction pairs, and friction behavior in mechanical systems.',
    starterPrompt: "Can you help me understand Newton's Third Law and why action-reaction pairs don't cancel out?",
    conceptDomain: 'physics',
    sampleQuestion: 'Two ice skaters push off each other on frictionless ice. What conservation law explains their motion?',
    defaultMode: 'EXPLANATION',
  },
  {
    id: 'python-loops',
    title: 'Python Loops & Algorithmic Complexity',
    subject: 'Computer Science',
    category: 'Computer Science',
    description: 'Iteration mechanics, nested loops, binary search bounds, and asymptotic Big-O runtime analysis.',
    starterPrompt: 'Why might my binary search loop run infinitely when the target is absent?',
    conceptDomain: 'cs',
    sampleQuestion: 'In a binary search on N elements, how many comparisons occur in the worst case and why?',
    defaultMode: 'CHECK_MY_LOGIC',
  },
  {
    id: 'cellular-biology',
    title: 'Cellular Respiration & ATP Cycle',
    subject: 'Biology',
    category: 'Biology',
    description: 'Glycolysis, Krebs cycle, and electron transport chain mechanisms in eukaryotic cells.',
    starterPrompt: 'Quiz me on cellular biology: How does the proton gradient drive ATP synthesis in mitochondria?',
    conceptDomain: 'biology',
    sampleQuestion: 'What is the final electron acceptor in the aerobic electron transport chain?',
    defaultMode: 'TOY_PROBLEM',
  },
  {
    id: 'calculus-derivatives',
    title: 'Calculus: Derivatives & Chain Rule',
    subject: 'Mathematics',
    category: 'Mathematics',
    description: 'Instantaneous rates of change, power rule, product rule, and composite function differentiation.',
    starterPrompt: 'Why does the derivative of e^x equal e^x from the limit definition of a derivative?',
    conceptDomain: 'math',
    sampleQuestion: 'If f(x) = sin(x^2), how does the chain rule decompose the rate of change of outer vs inner functions?',
    defaultMode: 'EXPLANATION',
  },
  {
    id: 'supply-demand',
    title: 'Microeconomics: Supply, Demand & Elasticity',
    subject: 'Economics',
    category: 'Economics',
    description: 'Market equilibrium, price elasticity of demand, consumer surplus, and deadweight loss.',
    starterPrompt: 'Why does an inelastic demand curve allow producers to raise total revenue by increasing prices?',
    conceptDomain: 'economics',
    sampleQuestion: 'If price rises by 10% and quantity demanded falls by 2%, is demand elastic or inelastic?',
    defaultMode: 'EXPLANATION',
  },
];

interface HubWorkspaceHeaderProps {
  currentUnit: StudyUnit;
  onSelectUnit: (unit: StudyUnit) => void;
  activeTab: string;
  onSelectTab: (tab: any) => void;
  user: any;
  anonQueryCount: number;
  gamification: any;
  onOpenSignup: () => void;
  tutorQueriesCount: number;
  cardsReviewedCount: number;
  checkpointsClearedCount: number;
  quizzesTakenCount: number;
}

export function HubWorkspaceHeader({
  currentUnit,
  onSelectUnit,
  activeTab,
  onSelectTab,
  user,
  anonQueryCount,
  gamification,
  onOpenSignup,
  tutorQueriesCount,
  cardsReviewedCount,
  checkpointsClearedCount,
  quizzesTakenCount,
}: HubWorkspaceHeaderProps) {
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);
  const [trialHelpOpen, setTrialHelpOpen] = useState(false);
  const [showEcosystemGuide, setShowEcosystemGuide] = useState(false);

  // Calculate Unit Mastery Score
  const inquiryScore = Math.min(25, tutorQueriesCount * 8);
  const mapScore = Math.min(25, checkpointsClearedCount * 25);
  const cardScore = Math.min(25, cardsReviewedCount * 5);
  const quizScore = Math.min(25, quizzesTakenCount * 25);
  const totalMastery = inquiryScore + mapScore + cardScore + quizScore;

  const getMasteryBadge = (score: number) => {
    if (score >= 85) return { label: 'Master', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (score >= 50) return { label: 'Proficient', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    if (score >= 20) return { label: 'Explorer', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { label: 'Novice', color: 'bg-slate-100 text-slate-700 border-slate-300' };
  };

  const badge = getMasteryBadge(totalMastery);
  const queriesLeft = Math.max(0, 3 - anonQueryCount);

  return (
    <div className="space-y-4 mb-6">
      {/* ── 1. Anonymous 3-Query Trial Breakdown & Reset Info ── */}
      {!user && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3.5 sm:p-4 text-xs shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#F5921D]/20 text-[#DC7B0C] flex items-center justify-center font-bold shrink-0">
                <Zap className="w-4 h-4 fill-current" />
              </span>
              <div>
                <div className="font-bold text-[#1E225B] flex items-center gap-2">
                  <span>Free Trial: {queriesLeft} of 3 AI Tutor queries remaining today</span>
                  <span className="bg-[#F5921D]/20 text-[#DC7B0C] text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    Resets in 24h
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] mt-0.5">
                  Flashcards, Knowledge Maps, Practice Quizzes, and Whiteboards are <strong>100% free with unlimited access</strong>.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setTrialHelpOpen(!trialHelpOpen)}
                className="text-slate-500 hover:text-[#1E225B] text-xs font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#F5921D]" />
                <span>What counts as a query?</span>
              </button>

              <button
                type="button"
                onClick={onOpenSignup}
                className="bg-[#1E225B] hover:bg-[#141740] text-white font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F5921D]" />
                <span>Unlock Unlimited</span>
              </button>
            </div>
          </div>

          {/* Collapsible Explanatory Drawer on Trial Rules */}
          {trialHelpOpen && (
            <div className="mt-3 pt-3 border-t border-amber-200/60 grid sm:grid-cols-3 gap-3 text-[11px] text-slate-700 animate-fadeIn">
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                <strong className="text-[#1E225B] block mb-0.5">1. What counts as a query?</strong>
                Only sending a direct message or code snippet to the Socratic AI Tutor or Code Debugger uses 1 query turn.
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                <strong className="text-[#1E225B] block mb-0.5">2. What is always unlimited?</strong>
                Flipping flashcards, exploring concept DAG maps, taking diagnostic practice quizzes, and drawing on whiteboards are always free.
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                <strong className="text-[#1E225B] block mb-0.5">3. When does it reset?</strong>
                Your 3 queries reset automatically every 24 hours on your device, or log in with Google for unlimited AI queries forever.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 2. Unified Learning Workspace Unit Selector & Connected Context ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Active Study Unit Information */}
          <div className="relative">
            <span className="text-[10px] font-bold text-[#F5921D] uppercase tracking-wider block mb-0.5">
              Active Study Unit ({currentUnit.category})
            </span>
            <button
              type="button"
              onClick={() => setUnitDropdownOpen(!unitDropdownOpen)}
              className="flex items-center gap-2 text-left group"
            >
              <h2 className="text-base sm:text-lg font-black text-[#1E225B] group-hover:text-[#F5921D] transition-colors">
                {currentUnit.title}
              </h2>
              <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-[#1E225B] transition-transform ${unitDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
              {currentUnit.description}
            </p>

            {/* Study Unit Switcher Dropdown */}
            {unitDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-2 space-y-1 animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Select a Curated Subject Unit
                </div>
                {CURATED_STUDY_UNITS.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      onSelectUnit(u);
                      setUnitDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start justify-between ${
                      currentUnit.id === u.id
                        ? 'bg-[#1E225B] text-white'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{u.title}</div>
                      <div className={`text-[10px] mt-0.5 ${currentUnit.id === u.id ? 'text-slate-300' : 'text-slate-500'}`}>
                        {u.subject} &bull; {u.description}
                      </div>
                    </div>
                    {currentUnit.id === u.id && (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#F5921D] ml-2" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Unit Mastery & Learning Level Badge */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit Mastery</div>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-base font-extrabold text-[#1E225B]">{totalMastery}%</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
            </div>

            {/* Visual Mini Progress Bar */}
            <div className="w-16 bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#249EA0] to-[#F5921D] h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(8, totalMastery)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── 3. Connected Learning Ecosystem Navigation & Mastery Pillars ── */}
        <div className="pt-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="font-bold text-[#1E225B]">Connected Learning Pillars:</span>
            <button
              type="button"
              onClick={() => setShowEcosystemGuide(!showEcosystemGuide)}
              className="text-[#F5921D] hover:underline flex items-center gap-0.5 font-semibold text-[11px]"
            >
              <Info className="w-3.5 h-3.5" />
              <span>How this works</span>
            </button>
          </div>

          {/* The 4 Connected Learning Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Pillar 1: Socratic AI Tutor */}
            <button
              type="button"
              onClick={() => onSelectTab('sandbox')}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                activeTab === 'sandbox'
                  ? 'border-[#1E225B] bg-[#1E225B]/5 font-bold text-[#1E225B] shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F5921D]" />
              <span>1. AI Tutor</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                {tutorQueriesCount} msgs
              </span>
            </button>

            {/* Pillar 2: Knowledge Map */}
            <button
              type="button"
              onClick={() => onSelectTab('concepts')}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                activeTab === 'concepts'
                  ? 'border-[#1E225B] bg-[#1E225B]/5 font-bold text-[#1E225B] shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-[#249EA0]" />
              <span>2. Knowledge Map</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                {checkpointsClearedCount} passed
              </span>
            </button>

            {/* Pillar 3: 2-Tier Flashcards */}
            <button
              type="button"
              onClick={() => onSelectTab('flashcards')}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                activeTab === 'flashcards'
                  ? 'border-[#1E225B] bg-[#1E225B]/5 font-bold text-[#1E225B] shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>3. Flashcards</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                {cardsReviewedCount} cards
              </span>
            </button>

            {/* Pillar 4: Practice Quiz */}
            <button
              type="button"
              onClick={() => onSelectTab('quizzes')}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                activeTab === 'quizzes'
                  ? 'border-[#1E225B] bg-[#1E225B]/5 font-bold text-[#1E225B] shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>4. Practice Quiz</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                {quizzesTakenCount} taken
              </span>
            </button>
          </div>
        </div>

        {/* Explanatory Banner: The Unified Learning Ecosystem */}
        {showEcosystemGuide && (
          <div className="mt-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed animate-fadeIn">
            <div className="font-bold text-[#1E225B] mb-1 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-[#F5921D]" />
              The GuruMera Connected Ecosystem:
            </div>
            <p>
              When you study <strong>{currentUnit.title}</strong>, all tools synchronize around this topic:
            </p>
            <div className="grid sm:grid-cols-4 gap-2 pt-2 text-[11px]">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <strong className="text-indigo-900 block">💬 AI Tutor</strong>
                Explains the concept through guided questions.
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <strong className="text-teal-900 block">🗺️ Knowledge Map</strong>
                Builds concept relationships and prerequisite trees.
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <strong className="text-amber-900 block">🗂️ Flashcards</strong>
                Reinforces important terms using 2-tier clues.
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <strong className="text-emerald-900 block">🧪 Practice Quiz</strong>
                Tests understanding and debriefs misconceptions.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
