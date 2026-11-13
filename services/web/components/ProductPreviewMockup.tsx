'use client';

import { useState } from 'react';
import {
  Bot,
  Brain,
  CheckCircle2,
  Code,
  Eye,
  Layers,
  Lock,
  MessageSquare,
  Network,
  RotateCw,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';

export function ProductPreviewMockup() {
  const [activeTab, setActiveTab] = useState<'tutor' | 'map' | 'flashcard'>('tutor');
  const [clueLevel, setClueLevel] = useState<0 | 1 | 2>(0);
  const [interactiveStep, setInteractiveStep] = useState<number>(0);

  return (
    <div className="w-full max-w-5xl mx-auto my-10 rounded-2xl bg-white border border-[#E7E3D8] shadow-2xl shadow-slate-200/60 overflow-hidden text-left">
      {/* Window Title Bar */}
      <div className="bg-[#FAF9F5] border-b border-[#E7E3D8] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
          </div>
          <span className="text-xs font-semibold text-[#1E225B] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#249EA0]" />
            GuruMera Active Learning Interface
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('tutor')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'tutor'
                ? 'bg-[#1E225B] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#1E225B]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Socratic AI Tutor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'map'
                ? 'bg-[#1E225B] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#1E225B]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Knowledge Map
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('flashcard')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'flashcard'
                ? 'bg-[#1E225B] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#1E225B]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            2-Tier Flashcards
          </button>
        </div>
      </div>

      {/* Tab 1: Socratic AI Tutor Mockup */}
      {activeTab === 'tutor' && (
        <div className="p-4 md:p-6 bg-slate-50/70">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 max-w-3xl mx-auto shadow-xs">
            {/* Subject Banner */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1E225B]">AP Physics 1: Momentum &amp; Impulse</span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  Socratic Strict Mode
                </span>
              </div>
              <span className="text-slate-400 hidden sm:inline">Session ID: gm-preview-2026</span>
            </div>

            {/* Message 1: Student Cheat / Direct Request */}
            <div className="flex gap-3 justify-end">
              <div className="max-w-[85%] bg-slate-100 text-slate-800 rounded-2xl rounded-br-xs px-4 py-2.5 text-sm">
                Can you just write out the complete formula and give me the final number for problem 3? I have 5 minutes left.
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center shrink-0 mt-0.5 text-slate-600">
                <User className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Guardrail Notice */}
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-[#DC7B0C] bg-[#F5921D]/10 border border-[#F5921D]/30 py-1.5 px-3 rounded-full mx-auto w-fit">
              <Lock className="w-3 h-3" />
              Direct Solution Shield Activated · Guiding Cognitive Discovery
            </div>

            {/* Message 2: Socratic AI Tutor Guiding Response */}
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-full bg-[#1E225B] flex items-center justify-center shrink-0 mt-0.5 text-white">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="max-w-[85%] bg-white border border-slate-200 rounded-2xl rounded-bl-xs p-4 text-sm text-slate-800 space-y-2 shadow-xs">
                <p className="font-medium text-[#1E225B]">
                  I hear you're on a tight deadline, but I want to make sure you truly nail this concept! 💡
                </p>
                <p>
                  Let&apos;s step back to first principles: in problem 3, two ice skaters push off one another on frictionless ice. Since there is no net external force acting on the two-skater system, what quantity <em>must remain constant</em> before and after the push?
                </p>
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setInteractiveStep(1)}
                    className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors"
                  >
                    A) Total Kinetic Energy
                  </button>
                  <button
                    type="button"
                    onClick={() => setInteractiveStep(2)}
                    className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold px-3 py-1.5 rounded-lg border border-emerald-300 transition-colors"
                  >
                    B) Total Momentum (p = mv)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInteractiveStep(3)}
                    className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                  >
                    C) Total Acceleration
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Feedback */}
            {interactiveStep === 2 && (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Spot on! Total Momentum is conserved.</strong>
                  <p className="mt-0.5 text-emerald-800">
                    Because initial momentum was zero, skater A&apos;s momentum must exactly cancel skater B&apos;s: <em>m₁v₁ + m₂v₂ = 0</em>. Now solve for <em>v₂</em> in 1 line!
                  </p>
                </div>
              </div>
            )}
            {interactiveStep === 1 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Think carefully: during an explosion or push, chemical/muscle energy turns into motion, so kinetic energy actually changes! What does Newton&apos;s 3rd Law tell us about the forces?
                </p>
              </div>
            )}

            {/* Simulated Input Bar */}
            <div className="pt-2 flex items-center gap-2">
              <input
                disabled
                value="Explaining my reasoning: Since momentum is conserved..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
              />
              <button
                disabled
                className="bg-[#1E225B] text-white p-2.5 rounded-xl opacity-80"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Visual Knowledge Map Mockup */}
      {activeTab === 'map' && (
        <div className="p-6 bg-slate-50/70">
          <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-[#1E225B] text-sm">Physics Concept Dependency Tree</h4>
                <p className="text-xs text-slate-500">Pass Socratic checkpoints to unlock downstream advanced topics.</p>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full border border-indigo-200">
                Mastery Score: 85%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Node 1 */}
              <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase">Mastered</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="font-bold text-slate-900 text-sm">1. Kinematics</div>
                <p className="text-xs text-slate-600 mt-1">Displacement, velocity vectors, and constant acceleration.</p>
              </div>

              {/* Node 2 */}
              <div className="p-4 rounded-xl border-2 border-[#1E225B] bg-white shadow-md relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-[#F5921D] uppercase">In Progress</span>
                  <Brain className="w-4 h-4 text-[#F5921D]" />
                </div>
                <div className="font-bold text-[#1E225B] text-sm">2. Newton&apos;s Laws</div>
                <p className="text-xs text-slate-600 mt-1">Inertia, F=ma force diagrams, and action-reaction pairs.</p>
                <div className="mt-2 text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded w-fit">
                  Checkpoint: 80% Passed
                </div>
              </div>

              {/* Node 3 */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 relative opacity-70">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Locked</span>
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <div className="font-bold text-slate-700 text-sm">3. Momentum &amp; Impulse</div>
                <p className="text-xs text-slate-500 mt-1">Prerequisite: Complete Newton&apos;s 3rd Law Socratic Checkpoint.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 2-Tier Flashcard Mockup */}
      {activeTab === 'flashcard' && (
        <div className="p-6 bg-slate-50/70">
          <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-center space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span className="font-semibold text-[#1E225B]">SM-2 Spaced Repetition Card</span>
              <span>Deck: Classical Mechanics (Card 3 of 15)</span>
            </div>

            <div className="py-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#249EA0]">Concept Question</span>
              <h3 className="text-lg font-bold text-[#1E225B] mt-1">
                What is the relationship between an applied Force and the rate of change of Momentum?
              </h3>
            </div>

            {/* Clue Tier 1 */}
            {clueLevel >= 1 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 text-left animate-fadeIn">
                <strong className="font-bold flex items-center gap-1.5 text-[#DC7B0C]">
                  <Sparkles className="w-3.5 h-3.5" /> Clue 1 (Intuition):
                </strong>
                Recall Newton&apos;s Second Law expressed in its original calculus form rather than just F = ma.
              </div>
            )}

            {/* Clue Tier 2 */}
            {clueLevel >= 2 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900 text-left animate-fadeIn">
                <strong className="font-bold flex items-center gap-1.5 text-indigo-700">
                  <Eye className="w-3.5 h-3.5" /> Clue 2 (Derivative Connection):
                </strong>
                If momentum p = mv and mass is constant, then dp/dt = m(dv/dt) = ma. What does this equal?
              </div>
            )}

            {/* Interactive Clue Reveal Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setClueLevel(1)}
                className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition-colors ${
                  clueLevel >= 1
                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Reveal Clue 1
              </button>
              <button
                type="button"
                onClick={() => setClueLevel(2)}
                className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition-colors ${
                  clueLevel >= 2
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Reveal Clue 2
              </button>
              <button
                type="button"
                onClick={() => setClueLevel(0)}
                className="text-xs px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
