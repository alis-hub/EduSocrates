'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Network,
  GitBranch,
  CheckCircle2,
  Lock,
  Unlock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Layers,
  Brain,
  HelpCircle,
} from 'lucide-react';

interface ConceptNode {
  id: string;
  title: string;
  tier: number;
  status: 'mastered' | 'in_progress' | 'locked';
  masteryPct: number;
  prerequisites: string[];
  unlocks: string[];
  summary: string;
  keyFormula: string;
  sampleQuestion: string;
}

const NODES: ConceptNode[] = [
  {
    id: 'vectors',
    title: '1. Vectors & Trigonometry',
    tier: 1,
    status: 'mastered',
    masteryPct: 100,
    prerequisites: [],
    unlocks: ['newton', 'momentum'],
    summary: 'Decomposition of vectors into orthogonal components (x, y), vector addition, and scalar dot products.',
    keyFormula: '\\mathbf{A} = A_x \\hat{i} + A_y \\hat{j}, \\quad |\\mathbf{A}| = \\sqrt{A_x^2 + A_y^2}',
    sampleQuestion: 'Given vector A = 3î + 4ĵ, what is its magnitude and direction angle with the x-axis?',
  },
  {
    id: 'kinematics',
    title: '2. 1D & 2D Kinematics',
    tier: 1,
    status: 'mastered',
    masteryPct: 100,
    prerequisites: [],
    unlocks: ['newton', 'work_energy'],
    summary: 'Position, velocity, acceleration relationships under constant acceleration, and projectile motion.',
    keyFormula: 'v_f^2 = v_i^2 + 2a\\Delta x, \\quad \\Delta x = v_i t + \\frac{1}{2}at^2',
    sampleQuestion: 'A ball is launched horizontally from a 20m cliff at 15m/s. How long before it strikes the ground?',
  },
  {
    id: 'newton',
    title: '3. Newton’s Laws & FBDs',
    tier: 2,
    status: 'mastered',
    masteryPct: 100,
    prerequisites: ['vectors', 'kinematics'],
    unlocks: ['work_energy', 'momentum'],
    summary: 'Inertia, F = ma, action-reaction pairs, and construction of free-body diagrams on inclined planes.',
    keyFormula: '\\sum \\mathbf{F} = m\\mathbf{a}',
    sampleQuestion: 'A 5kg block rests on a 30° frictionless ramp. What is the normal force exerted by the ramp?',
  },
  {
    id: 'work_energy',
    title: '4. Work & Conservation of Energy',
    tier: 2,
    status: 'in_progress',
    masteryPct: 65,
    prerequisites: ['kinematics', 'newton'],
    unlocks: ['rotation'],
    summary: 'Mechanical work as the path integral of force, conservative vs non-conservative forces, and energy balance.',
    keyFormula: 'W = \\int \\mathbf{F} \\cdot d\\mathbf{r} = \\Delta K, \\quad E_{total} = K + U',
    sampleQuestion: 'A spring with k = 200 N/m is compressed 0.1m. What speed will a 0.2kg mass achieve when released?',
  },
  {
    id: 'momentum',
    title: '5. Momentum & Impulse',
    tier: 3,
    status: 'in_progress',
    masteryPct: 78,
    prerequisites: ['vectors', 'newton'],
    unlocks: ['rotation'],
    summary: 'Conservation of linear momentum in isolated systems, impulse-momentum theorem, and collision types.',
    keyFormula: '\\mathbf{J} = \\int \\mathbf{F}\\,dt = \\Delta \\mathbf{p}, \\quad \\sum \\mathbf{p}_i = \\sum \\mathbf{p}_f',
    sampleQuestion: 'Why does an airbag reduce injury force during a car crash in terms of the impulse equation?',
  },
  {
    id: 'rotation',
    title: '6. Rotational Dynamics & Torque',
    tier: 4,
    status: 'locked',
    masteryPct: 0,
    prerequisites: ['work_energy', 'momentum'],
    unlocks: [],
    summary: 'Angular velocity, moment of inertia, torque as cross product (r x F), and rotational kinetic energy.',
    keyFormula: '\\boldsymbol{\\tau} = \\mathbf{r} \\times \\mathbf{F} = I\\boldsymbol{\\alpha}',
    sampleQuestion: 'Requires mastering Work & Energy (65%) and Momentum (78%) before unlocking.',
  },
];

export function KnowledgeMapsInteractiveDemo() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('momentum');

  const selectedNode = NODES.find((n) => n.id === selectedNodeId) || NODES[0];

  return (
    <div className="bg-[#FAF9F5] border border-[#E7E3D8] rounded-2xl shadow-xl overflow-hidden text-left">
      {/* ─── Map Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E7E3D8] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-[#249EA0]" />
          <span className="text-xs font-bold text-[#1E225B]">
            Interactive Concept DAG: AP Physics 1 Mechanics
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Mastered (3)
          </span>
          <span className="flex items-center gap-1.5 text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5921D] inline-block" />
            In Progress (2)
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
            Locked (1)
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E7E3D8]">
        {/* ─── Left Column: Interactive Graph Nodes ─────────────────────── */}
        <div className="lg:col-span-7 p-4 sm:p-6 bg-slate-50/70 space-y-4">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
            Click any node below to inspect dependencies:
          </div>

          {/* Node Grid by Tier */}
          <div className="space-y-4">
            {/* Tier 1 */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase">Tier 1: Foundations</div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {NODES.filter((n) => n.tier === 1).map((node) => {
                  const isSelected = node.id === selectedNodeId;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-white border-[#249EA0] shadow-md ring-2 ring-[#249EA0]/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-[#1E225B] truncate">{node.title}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                      <div className="text-[11px] text-slate-500">Mastery: 100%</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Downward Connector Indicator */}
            <div className="flex justify-around text-slate-300 text-xs py-0.5">
              <span>↓ enables</span>
              <span>↓ enables</span>
            </div>

            {/* Tier 2 */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase">Tier 2: Core Dynamics</div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {NODES.filter((n) => n.tier === 2).map((node) => {
                  const isSelected = node.id === selectedNodeId;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-white border-[#249EA0] shadow-md ring-2 ring-[#249EA0]/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-[#1E225B] truncate">{node.title}</span>
                        {node.status === 'mastered' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F5921D] shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">Mastery: {node.masteryPct}%</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Downward Connector Indicator */}
            <div className="flex justify-around text-slate-300 text-xs py-0.5">
              <span>↓ enables</span>
              <span>↓ enables</span>
            </div>

            {/* Tier 3 & 4 */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase">Tier 3 &amp; 4: Advanced Synthesis</div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {NODES.filter((n) => n.tier >= 3).map((node) => {
                  const isSelected = node.id === selectedNodeId;
                  const isLocked = node.status === 'locked';
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-white border-[#249EA0] shadow-md ring-2 ring-[#249EA0]/20'
                          : isLocked
                          ? 'bg-slate-100/70 border-slate-200 opacity-80'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-[#1E225B] truncate">{node.title}</span>
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F5921D] shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {isLocked ? 'Prerequisites Required' : `Mastery: ${node.masteryPct}%`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Selected Node Inspector ────────────────────── */}
        <div className="lg:col-span-5 p-4 sm:p-6 bg-white flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                selectedNode.status === 'mastered'
                  ? 'bg-emerald-100 text-emerald-800'
                  : selectedNode.status === 'in_progress'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {selectedNode.status.replace('_', ' ')} • {selectedNode.masteryPct}% Mastery
              </span>
              <span className="text-slate-400 font-mono text-[11px]">Node ID: {selectedNode.id}</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#1E225B] mb-2">
              {selectedNode.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              {selectedNode.summary}
            </p>

            {/* Prerequisites breakdown */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-[#1E225B] flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-[#249EA0]" />
                Prerequisite Dependencies:
              </div>
              {selectedNode.prerequisites.length === 0 ? (
                <div className="text-slate-400 italic">None (Root Foundation Node)</div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.prerequisites.map((prereqId) => {
                    const prereqNode = NODES.find((n) => n.id === prereqId);
                    return (
                      <span
                        key={prereqId}
                        className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {prereqNode ? prereqNode.title : prereqId}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Core Equation Box */}
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Mathematical Model:
              </div>
              <div className="font-mono text-xs text-[#1E225B] font-semibold">
                {selectedNode.keyFormula}
              </div>
            </div>

            {/* Checkpoint Question */}
            <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-slate-700">
              <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                Diagnostic Mastery Checkpoint:
              </div>
              <p className="text-slate-600 leading-relaxed">{selectedNode.sampleQuestion}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
            <Link
              href="/hub?tab=sandbox"
              className="flex-1 bg-[#1E225B] hover:bg-[#141740] text-white px-3 py-2 rounded-xl text-xs font-bold text-center transition-colors shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Brain className="w-3.5 h-3.5 text-[#249EA0]" />
              <span>Practice With Socratic Tutor</span>
            </Link>
            <Link
              href="/hub?tab=flashcards"
              className="bg-white hover:bg-slate-50 text-[#1E225B] border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-[#F5921D]" />
              <span>Review Cards</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
