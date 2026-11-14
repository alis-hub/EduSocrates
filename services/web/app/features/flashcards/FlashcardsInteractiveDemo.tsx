'use client';

import { useState } from 'react';
import {
  Layers,
  RotateCw,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Clock,
  TrendingUp,
  Brain,
  ChevronRight,
  ChevronLeft,
  Award,
} from 'lucide-react';

interface Flashcard {
  id: string;
  subject: string;
  unit: string;
  tier1Front: string;
  tier1Back: string;
  tier2Front: string;
  tier2Back: string;
  clue: string;
  formula: string;
}

const DEMO_CARDS: Flashcard[] = [
  {
    id: 'lenz',
    subject: 'Physics',
    unit: 'Electromagnetism',
    tier1Front: 'If you drop a strong neodymium magnet down a vertical hollow copper tube, why does it descend at a slow, constant crawl rather than accelerating?',
    tier1Back: 'Moving the magnet creates a changing magnetic flux in the copper. By Faraday’s law, this induces circular eddy currents. By Lenz’s law, these currents generate an opposing upward magnetic field that resists the magnet’s motion!',
    tier2Front: 'State Faraday’s Law of Electromagnetic Induction and Lenz’s Law in formal vector/derivative notation. What is the physical meaning of the minus sign?',
    tier2Back: 'Faraday-Lenz Equation:\n\n$$\\mathcal{E} = -\\frac{d\\Phi_B}{dt} = -\\frac{d}{dt}\\int \\mathbf{B} \\cdot d\\mathbf{A}$$\n\nThe minus sign represents Lenz’s Law: the induced electromotive force creates a magnetic field that directly opposes the change in original magnetic flux.',
    clue: 'Think about conservation of energy: if the induced field accelerated the magnet faster, you would get free kinetic energy for nothing!',
    formula: 'EMF = -dΦ/dt',
  },
  {
    id: 'lechatelier',
    subject: 'Chemistry',
    unit: 'Chemical Equilibrium',
    tier1Front: 'In the Haber process: N₂(g) + 3H₂(g) ⇌ 2NH₃(g), if you suddenly compress the reaction vessel to half its volume, which way does the equilibrium shift and WHY in terms of particle collisions?',
    tier1Back: 'The forward side has 4 moles of gas; the product side has only 2 moles. Compressing volume increases pressure and collision frequency. The system relieves pressure by shifting toward the side with fewer gas molecules (the products, NH₃).',
    tier2Front: 'Express the reaction quotient Q_p for the Haber reaction. Explain mathematically why volume compression forces Q_p < K_p.',
    tier2Back: 'Reaction Quotient:\n\n$$Q_p = \\frac{(P_{NH_3})^2}{(P_{N_2})(P_{H_2})^3}$$\n\nDoubling pressure scales numerator by 2² = 4, but denominator by 2⁴ = 16. Thus Q_p drops to 1/4 of its value, making Q_p < K_p. The reaction must shift right to restore equilibrium.',
    clue: 'Count gas moles on left (1 + 3 = 4) vs right (2). Less space favors fewer particles.',
    formula: 'Q_p = (P_NH3)² / [(P_N2)(P_H2)³]',
  },
  {
    id: 'ftc',
    subject: 'Calculus',
    unit: 'Integration & Accumulation',
    tier1Front: 'What is the intuitive geometric connection between the rate of change of an accumulated area under a curve f(t) and the curve’s current height at x?',
    tier1Back: 'Adding a thin slice of width dx to the accumulated area adds a rectangle of area f(x) · dx. Dividing by dx to get the rate of growth gives back exactly f(x)! Hence, differentiation undoes accumulation.',
    tier2Front: 'State the Fundamental Theorem of Calculus Part 1 formally, including continuity conditions and derivative expression.',
    tier2Back: 'Fundamental Theorem of Calculus (FTC Part 1):\n\nIf f is continuous on [a, b] and $$g(x) = \\int_{a}^{x} f(t)\\,dt$$, then g is continuous on [a, b], differentiable on (a, b), and:\n\n$$g\'(x) = \\frac{d}{dx}\\left[\\int_{a}^{x} f(t)\\,dt\\right] = f(x)$$',
    clue: 'Think of an odometer (total distance) vs speedometer (current speed). How are they related?',
    formula: 'd/dx ∫[a to x] f(t)dt = f(x)',
  },
];

export function FlashcardsInteractiveDemo() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [activeTier, setActiveTier] = useState<1 | 2>(1);
  const [clueRevealed, setClueRevealed] = useState<boolean>(false);
  const [lastRating, setLastRating] = useState<string | null>(null);
  const [intervalScheduled, setIntervalScheduled] = useState<string>('Next review in 1 day');
  const [masteryCount, setMasteryCount] = useState<number>(14);

  const card = DEMO_CARDS[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setClueRevealed(false);
    setLastRating(null);
    setCurrentIndex((prev) => (prev + 1) % DEMO_CARDS.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setClueRevealed(false);
    setLastRating(null);
    setCurrentIndex((prev) => (prev - 1 + DEMO_CARDS.length) % DEMO_CARDS.length);
  };

  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    setLastRating(rating);
    if (rating === 'again') {
      setIntervalScheduled('SM-2: Reset to 1 day interval');
    } else if (rating === 'hard') {
      setIntervalScheduled('SM-2: Interval set to 3 days (EF: 2.18)');
    } else if (rating === 'good') {
      setIntervalScheduled('SM-2: Interval set to 6 days (EF: 2.50)');
      setMasteryCount((c) => c + 1);
    } else if (rating === 'easy') {
      setIntervalScheduled('SM-2: Interval set to 14 days (EF: 2.65)');
      setMasteryCount((c) => c + 2);
    }
  };

  return (
    <div className="bg-[#FAF9F5] border border-[#E7E3D8] rounded-2xl shadow-xl overflow-hidden text-left">
      {/* ─── Control Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E7E3D8] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#F5921D]" />
          <span className="text-xs font-bold text-[#1E225B]">
            Interactive 2-Tier Flashcard (Card {currentIndex + 1} of {DEMO_CARDS.length})
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {card.subject}: {card.unit}
          </span>
        </div>

        {/* Tier Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTier(1);
              setIsFlipped(false);
            }}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTier === 1
                ? 'bg-[#1E225B] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#1E225B]'
            }`}
          >
            Tier 1: Intuition
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTier(2);
              setIsFlipped(false);
            }}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTier === 2
                ? 'bg-[#1E225B] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#1E225B]'
            }`}
          >
            Tier 2: Formula &amp; Math
          </button>
        </div>
      </div>

      {/* ─── Main Flashcard Interactive Area ────────────────────────────── */}
      <div className="p-4 sm:p-8 flex flex-col items-center">
        {/* Flippable Card Container */}
        <div
          onClick={handleFlip}
          className={`w-full max-w-2xl min-h-[260px] sm:min-h-[280px] p-6 sm:p-8 rounded-2xl border transition-all duration-300 cursor-pointer shadow-md flex flex-col justify-between ${
            isFlipped
              ? 'bg-white border-[#249EA0]/50 ring-2 ring-[#249EA0]/20'
              : 'bg-white border-slate-200 hover:border-[#1E225B]/40'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-4">
              <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                activeTier === 1 ? 'bg-[#F5921D]/15 text-[#DC7B0C]' : 'bg-[#1E225B]/10 text-[#1E225B]'
              }`}>
                {activeTier === 1 ? 'Tier 1 • Intuition & Mechanism' : 'Tier 2 • Formula & Derivation'}
              </span>
              <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                <RotateCw className="w-3 h-3" />
                {isFlipped ? 'Answer View (Click to Flip)' : 'Prompt View (Click to Flip)'}
              </span>
            </div>

            <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
              {!isFlipped ? (
                <div>
                  <p className="mb-2">
                    {activeTier === 1 ? card.tier1Front : card.tier2Front}
                  </p>
                  <div className="mt-4 text-xs text-slate-400 italic">
                    Think of your answer before flipping the card...
                  </div>
                </div>
              ) : (
                <div className="animate-fadeIn space-y-3">
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Model Answer &amp; Explanation
                  </div>
                  <p className="whitespace-pre-line text-slate-700 text-sm">
                    {activeTier === 1 ? card.tier1Back : card.tier2Back}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Socratic Clue Container */}
          {clueRevealed && !isFlipped && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2 animate-fadeIn">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Socratic Nudge:</strong> {card.clue}
              </span>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 mt-4">
            <span className="font-mono text-[11px]">Key: {card.formula}</span>
            <span>Click anywhere to flip</span>
          </div>
        </div>

        {/* ─── Under-Card Controls ───────────────────────────────────────── */}
        <div className="w-full max-w-2xl mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isFlipped && !clueRevealed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setClueRevealed(true);
                }}
                className="text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>Reveal Socratic Clue</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleFlip}
              className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Flip Card</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              title="Previous card"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-600">
              {currentIndex + 1} / {DEMO_CARDS.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              title="Next card"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── SM-2 Spaced Repetition Rating Buttons ─────────────────────── */}
        {isFlipped && (
          <div className="w-full max-w-2xl mt-6 p-4 bg-white border border-slate-200 rounded-xl shadow-xs animate-fadeIn">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-[#1E225B] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#249EA0]" />
                How easily did you recall this concept? (SM-2 Algorithm)
              </span>
              <span className="text-[11px] text-slate-400">Recalculates Ease Factor</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleRate('again')}
                className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 p-2.5 rounded-lg font-bold text-center transition-colors"
              >
                <div>Again (1)</div>
                <div className="text-[10px] font-normal text-red-600 mt-0.5">Reset: 1 Day</div>
              </button>
              <button
                type="button"
                onClick={() => handleRate('hard')}
                className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 p-2.5 rounded-lg font-bold text-center transition-colors"
              >
                <div>Hard (2)</div>
                <div className="text-[10px] font-normal text-amber-600 mt-0.5">Review: 3 Days</div>
              </button>
              <button
                type="button"
                onClick={() => handleRate('good')}
                className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 p-2.5 rounded-lg font-bold text-center transition-colors"
              >
                <div>Good (3)</div>
                <div className="text-[10px] font-normal text-blue-600 mt-0.5">Review: 6 Days</div>
              </button>
              <button
                type="button"
                onClick={() => handleRate('easy')}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 p-2.5 rounded-lg font-bold text-center transition-colors"
              >
                <div>Easy (4)</div>
                <div className="text-[10px] font-normal text-emerald-600 mt-0.5">Mastered: 14 Days</div>
              </button>
            </div>

            {lastRating && (
              <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {intervalScheduled}
                </span>
                <span className="text-[11px] text-slate-500">Mastery Score: {masteryCount} cards</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Footer Stats Bar ───────────────────────────────────────────── */}
      <div className="bg-white border-t border-[#E7E3D8] px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-[#F5921D]" />
            Streak: <strong>5 Days Active</strong>
          </span>
          <span className="flex items-center gap-1">
            <Brain className="w-3.5 h-3.5 text-[#249EA0]" />
            Retention Rate: <strong>96.4%</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-400">Available free without login</span>
      </div>
    </div>
  );
}
