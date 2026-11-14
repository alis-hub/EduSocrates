'use client';

import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  Code2,
  Compass,
  GitBranch,
  HelpCircle,
  Layers,
  Lightbulb,
  MessageSquare,
  Network,
  PenTool,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface ToolConfig {
  title: string;
  tagline: string;
  explanation: string;
  previewSteps: Array<{ step: number; title: string; desc: string }>;
  contextualHelp: string[];
  nextTool?: { label: string; tab: string };
  badgeText?: string;
  badgeColor?: string;
}

const TOOL_CONFIGS: Record<string, ToolConfig> = {
  sandbox: {
    title: 'Socratic AI Tutor',
    tagline: 'Guided Inquiry — Never Direct Answer Leaks',
    explanation:
      'Unlike answer-generator chatbots that bypass learning, the Socratic AI Tutor guides your reasoning using progressive diagnostic questions and analogies. Your answers are checked step-by-step from first principles.',
    previewSteps: [
      { step: 1, title: 'Share Your Thinking', desc: 'Ask any question or outline what you understand so far.' },
      { step: 2, title: 'Receive Socratic Clue', desc: 'The AI diagnoses your hurdle and poses a guiding sub-question.' },
      { step: 3, title: 'Achieve Mastery', desc: 'Solve the problem yourself to build permanent cognitive understanding.' },
    ],
    contextualHelp: [
      'State what you know or suspect first; guessing is encouraged and helps the AI tailor its hints.',
      'Answer in complete sentences to test your conceptual clarity.',
      'If stuck, ask: "Can you give me a simple toy problem or real-world analogy to picture this?"',
      'The AI tutor operates under strict academic integrity — final equations and answer keys are shielded.',
    ],
    nextTool: { label: 'Explore Concept Tree', tab: 'concepts' },
    badgeText: '5-Layer Guardrailed',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  code: {
    title: 'Socratic Code Debugger',
    tagline: 'Algorithmic Tracing & Edge-Case Probing',
    explanation:
      'Locate bugs in Python, JavaScript, Java, or C++ through guided execution tracing rather than copy-pasting raw fixes. Discover why boundary conditions fail and learn to think like a runtime compiler.',
    previewSteps: [
      { step: 1, title: 'Paste Code & Symptom', desc: 'Provide your code and what output was unexpected.' },
      { step: 2, title: 'Trace Memory & Variables', desc: 'The AI asks you to walk through index values for a small input.' },
      { step: 3, title: 'Patch the Defect', desc: 'Correct the off-by-one or pointer logic with full comprehension.' },
    ],
    contextualHelp: [
      'Describe both what the code was supposed to do and what actually occurred (e.g. infinite loop, IndexOutOfBounds).',
      'Walk through the code with a 2-element test input to locate where loop invariants break.',
      'Focus on boundary limits: 0, 1, empty array, or identical duplicates.',
    ],
    nextTool: { label: 'Reinforce Concepts with Flashcards', tab: 'flashcards' },
    badgeText: 'Algorithmic Scaffolding',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  flashcards: {
    title: '2-Tier Socratic Flashcards (SM-2)',
    tagline: 'Progressive Clue Reveal & Spaced Repetition',
    explanation:
      'Cards designed for deep conceptual retention. Each card contains 2 progressive hint tiers before revealing the final definition, scheduled with the SM-2 spaced repetition algorithm for optimal memory consolidation.',
    previewSteps: [
      { step: 1, title: 'Attempt Active Recall', desc: 'Read the concept prompt and try to recall the principle first.' },
      { step: 2, title: 'Reveal Tiered Clues', desc: 'If needed, unlock Clue 1 (analogy) and Clue 2 (derivation hint).' },
      { step: 3, title: 'Rate Recall Ease', desc: 'The SM-2 algorithm schedules your next review date dynamically.' },
    ],
    contextualHelp: [
      'Always pause for 5-10 seconds before revealing Clue 1 to strengthen neural retrieval paths.',
      'Use Clue 1 for visual intuition; use Clue 2 for structural formula or mathematical connections.',
      'Rate cards honestly: "Hard" reviews sooner, while "Easy" spaces out over weeks.',
    ],
    nextTool: { label: 'Test with Practice Quiz', tab: 'quizzes' },
    badgeText: 'SM-2 Memory Retention',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  concepts: {
    title: 'Concept Knowledge Maps (DAG)',
    tagline: 'Prerequisite Dependency Trees & Mastery Gates',
    explanation:
      'Visualize how ideas connect across your subject. Prerequisite branches must be mastered by passing short Socratic conceptual checkpoints before downstream advanced topics unlock.',
    previewSteps: [
      { step: 1, title: 'Explore Prerequisites', desc: 'Inspect foundational nodes (e.g., Kinematics before Momentum).' },
      { step: 2, title: 'Take Socratic Checkpoint', desc: 'Explain a key conceptual question in your own words.' },
      { step: 3, title: 'Unlock Advanced Nodes', desc: 'Passing score (>=70%) opens advanced downstream subjects.' },
    ],
    contextualHelp: [
      'Green nodes are Mastered; Blue/White nodes are Ready to Unlock; Gray nodes are Locked by prerequisites.',
      'Click any node to read its learning objectives and take the checkpoint.',
      'Checkpoint evaluations require conceptual depth — state the physical or logical reason, not just a keyword.',
    ],
    nextTool: { label: 'Review Flashcards for this Node', tab: 'flashcards' },
    badgeText: 'Prerequisite Tree',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  quizzes: {
    title: 'Ungraded Diagnostic Practice Quizzes',
    tagline: 'Misconception Debriefs — Zero Gradebook Pressure',
    explanation:
      'Low-stakes self-assessments separate from formal academic grading. When you miss a question, GuruMera doesn’t penalize you — it generates a Socratic Misconception Debrief explaining why the distractor seemed tempting.',
    previewSteps: [
      { step: 1, title: 'Answer Diagnostic MCQs', desc: 'Test your understanding across multiple-choice questions.' },
      { step: 2, title: 'Receive Instant Debrief', desc: 'Read why incorrect options were cleverly designed traps.' },
      { step: 3, title: 'Earn Mastery XP', desc: 'Log practice attempts to build topic mastery and maintain streaks.' },
    ],
    contextualHelp: [
      'Practice quizzes do NOT affect school transcripts or gradebooks; guess freely to discover what you don’t know.',
      'Pay close attention to the Socratic Debrief after submission to address underlying conceptual gaps.',
      'Generate a fresh quiz anytime for any topic with custom difficulty levels.',
    ],
    nextTool: { label: 'Ask AI Tutor to Clarify Missed Questions', tab: 'sandbox' },
    badgeText: 'Misconception Isolation',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  grapher: {
    title: 'Interactive STEM Function Grapher',
    tagline: 'Visual Curve Exploration & Equation Analysis',
    explanation:
      'Plot multiple mathematical functions simultaneously, inspect roots, extrema, and intersections, and send formulas directly to the Socratic AI Tutor for guided calculus or physics analysis.',
    previewSteps: [
      { step: 1, title: 'Enter Equations', desc: 'Plot functions like f(x) = sin(x) or quadratic curves.' },
      { step: 2, title: 'Inspect Intersections', desc: 'Adjust bounds, zoom, and visualize tangents and roots.' },
      { step: 3, title: 'Ask AI Tutor', desc: 'Click "Analyze with Tutor" to explore the derivative and limits.' },
    ],
    contextualHelp: [
      'Supports standard math syntax: x^2, sin(x), cos(x), exp(x), sqrt(x), abs(x).',
      'Use the comparison inputs to see how changing parameters (e.g., damping or frequency) shifts the curve.',
    ],
    nextTool: { label: 'Discuss on Whiteboard', tab: 'whiteboards' },
  },
  discussions: {
    title: 'Peer Learning & Socratic Discussion',
    tagline: 'Moderated Community Inquiries',
    explanation:
      'Collaborate with fellow learners worldwide. Mention @GuruMera AI Moderator to synthesize student viewpoints and pose constructive guiding questions to advance the discussion.',
    previewSteps: [
      { step: 1, title: 'Post a Discussion Question', desc: 'Ask about challenging concepts or thought experiments.' },
      { step: 2, title: 'Peer Collaboration', desc: 'Exchange hints, counterexamples, and alternative derivations.' },
      { step: 3, title: 'AI Synthesis', desc: 'GuruMera summarizes collective insights without giving away answers.' },
    ],
    contextualHelp: [
      'Avoid posting homework problems asking for direct numerical solutions.',
      'Check the "Ask @GuruMera AI Guide" box to receive automated synthesis and guiding questions.',
    ],
  },
  whiteboards: {
    title: 'Collaborative Study Whiteboard',
    tagline: 'Shared Visual Canvas with Real-Time Synced Drawing',
    explanation:
      'Draw force body diagrams, graph geometric constructions, or map algorithmic data structures collaboratively with peers or teachers in a persistent room.',
    previewSteps: [
      { step: 1, title: 'Create or Join Room', desc: 'Launch a private institutional canvas or open peer room.' },
      { step: 2, title: 'Sketch & Diagram', desc: 'Use pens, shapes, arrows, and colors to illustrate your thinking.' },
      { step: 3, title: 'Collaborate Live', desc: 'Watch peer updates synchronize over WebSockets in real time.' },
    ],
    contextualHelp: [
      'Share the room URL with classmates to collaborate on study problems simultaneously.',
      'Rooms tied to a school tenant remain private to that school; Public Hub rooms are open peer study halls.',
    ],
  },
  coursework: {
    title: 'Public Academic Resource Bank',
    tagline: 'Real Curriculum Assignments from Leading Academies',
    explanation:
      'Explore real homework prompts and problem sets published by certified educators across physics, calculus, computer science, and humanities.',
    previewSteps: [
      { step: 1, title: 'Select an Assignment', desc: 'Browse assignments by subject area and grade level.' },
      { step: 2, title: 'Open Socratic Workspace', desc: 'Work through the problem with rubric-shielded guidance.' },
      { step: 3, title: 'Submit or Study', desc: 'Institutional students submit for grades; public learners study freely.' },
    ],
    contextualHelp: [
      'All student submissions and teacher private notes remain completely private.',
      'Only approved curriculum prompts are indexed in the Public Directory.',
    ],
  },
};

interface HubToolBannerProps {
  toolKey: string;
  onNavigateTab?: (tab: any) => void;
  activeTopic?: string;
}

export function HubToolBanner({ toolKey, onNavigateTab, activeTopic }: HubToolBannerProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  const cfg = TOOL_CONFIGS[toolKey] || TOOL_CONFIGS.sandbox;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-base sm:text-lg text-[#1E225B]">
              {cfg.title}
            </h3>
            {cfg.badgeText && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                {cfg.badgeText}
              </span>
            )}
            {activeTopic && (
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                Active Topic: <strong>{activeTopic}</strong>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
            {cfg.explanation}
          </p>
        </div>

        {/* Toggle Contextual Help */}
        <button
          type="button"
          onClick={() => setHelpOpen(!helpOpen)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#1E225B] hover:text-[#F5921D] px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#F5921D]" />
          <span>How to use this tool</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${helpOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Illustrative 3-Step Preview Cycle */}
      <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        {cfg.previewSteps.map((step) => (
          <div
            key={step.step}
            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E7E3D8]"
          >
            <div className="w-5 h-5 rounded-full bg-[#1E225B] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              {step.step}
            </div>
            <div>
              <div className="font-bold text-[#1E225B]">{step.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Collapsible Contextual Guide & Best Study Practices */}
      {helpOpen && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 bg-indigo-50/50 rounded-xl p-3.5 text-xs text-indigo-950 space-y-2 animate-fadeIn">
          <div className="font-bold flex items-center gap-1.5 text-[#1E225B]">
            <Lightbulb className="w-4 h-4 text-[#F5921D]" />
            Best Study Strategies for {cfg.title}:
          </div>
          <ul className="space-y-1.5 pl-5 list-disc text-[11px] text-slate-700">
            {cfg.contextualHelp.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Navigation to the Next Tool in the Unified Ecosystem */}
      {cfg.nextTool && onNavigateTab && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Connected Ecosystem Step:</span>
          <button
            type="button"
            onClick={() => onNavigateTab(cfg.nextTool!.tab)}
            className="inline-flex items-center gap-1.5 text-[#1E225B] hover:text-[#F5921D] font-bold text-xs group transition-colors"
          >
            <span>{cfg.nextTool.label}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
