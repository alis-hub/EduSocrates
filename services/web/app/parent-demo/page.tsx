'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Filter,
  GraduationCap,
  Heart,
  HelpCircle,
  Info,
  Layers,
  Lock,
  MessageSquare,
  Network,
  RotateCcw,
  RotateCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react';

interface DemoChild {
  id: string;
  name: string;
  grade: string;
  section: string;
  relationship: string;
  avatarInitials: string;
  color: string;
  overallAverage: number;
  completedCount: number;
  pendingCount: number;
  overdueCount: number;
  attendanceRate: number;
  subjects: Array<{
    name: string;
    teacher: string;
    average: number;
    trend: 'UP' | 'STEADY';
    gradedCount: number;
    pendingCount: number;
    strengths: string[];
    focusAreas: string[];
  }>;
  assignments: Array<{
    id: string;
    title: string;
    subject: string;
    type: 'QUIZ' | 'ESSAY' | 'PROBLEM_SET' | 'LAB_REPORT';
    dueDate: string;
    status: 'GRADED' | 'SUBMITTED' | 'PENDING' | 'OVERDUE';
    score?: number;
    maxScore: number;
    feedback?: string;
    instructions: string;
  }>;
  conceptMastery: Array<{
    group: string;
    items: Array<{
      id: string;
      title: string;
      status: 'MASTERED' | 'DEVELOPING' | 'NEEDS_PRACTICE';
      practiceCount: number;
      evidence: string;
    }>;
  }>;
  activity: {
    totalHours: number;
    topicsCount: number;
    quizzesTaken: number;
    flashcardsStudied: number;
    tutorSessions: number;
    streakDays: number;
    weeklyMinutes: Array<{ day: string; minutes: number }>;
  };
  feedback: Array<{
    teacher: string;
    subject: string;
    date: string;
    comment: string;
  }>;
  attendance: {
    present: number;
    absent: number;
    late: number;
    notices: Array<{ date: string; title: string; body: string }>;
  };
}

const DEMO_CHILDREN: DemoChild[] = [
  {
    id: 'alex',
    name: 'Alex Chen',
    grade: 'Grade 12',
    section: 'Section A',
    relationship: 'Mother',
    avatarInitials: 'AC',
    color: 'bg-blue-600',
    overallAverage: 91.2,
    completedCount: 14,
    pendingCount: 2,
    overdueCount: 1,
    attendanceRate: 98.4,
    subjects: [
      {
        name: 'AP Physics 1',
        teacher: 'Dr. Robert Harrison',
        average: 93.5,
        trend: 'UP',
        gradedCount: 8,
        pendingCount: 1,
        strengths: ["Newton's Laws of Motion", 'Work-Energy Theorem', 'Free-body diagrams'],
        focusAreas: ['Rotational Dynamics Friction Limits'],
      },
      {
        name: 'Calculus AB',
        teacher: 'Prof. Sarah Davis',
        average: 89.0,
        trend: 'STEADY',
        gradedCount: 6,
        pendingCount: 1,
        strengths: ['Derivatives Power Rule', 'Chain Rule Mechanics'],
        focusAreas: ['Implicit Differentiation Word Problems'],
      },
    ],
    assignments: [
      {
        id: 'a1',
        title: "Newton's Third Law & Friction Lab Analysis",
        subject: 'AP Physics 1',
        type: 'LAB_REPORT',
        dueDate: 'Tomorrow at 11:59 PM',
        status: 'PENDING',
        maxScore: 100,
        instructions:
          'Construct free-body diagrams for an inclined plane problem with kinetic friction coefficient μ=0.25. State why normal force does not equal weight on an incline.',
      },
      {
        id: 'a2',
        title: 'Composite Functions & Chain Rule Quiz',
        subject: 'Calculus AB',
        type: 'QUIZ',
        dueDate: '3 days ago',
        status: 'GRADED',
        score: 94,
        maxScore: 100,
        feedback:
          'Superb algebraic decomposition on trigonometric composite derivatives. Clear step-by-step reasoning.',
        instructions: 'Differentiate sin(x^2 + 1) and e^(3x) using the formal chain rule definition.',
      },
      {
        id: 'a3',
        title: 'Momentum Conservation in Inelastic Collisions',
        subject: 'AP Physics 1',
        type: 'PROBLEM_SET',
        dueDate: 'Yesterday',
        status: 'OVERDUE',
        maxScore: 50,
        instructions:
          'Analyze two gliders colliding on a frictionless air track. Calculate velocity after collision and lost kinetic energy.',
      },
      {
        id: 'a4',
        title: 'Related Rates & Geometric Optimization',
        subject: 'Calculus AB',
        type: 'PROBLEM_SET',
        dueDate: 'Next Friday',
        status: 'PENDING',
        maxScore: 100,
        instructions:
          'Solve the conical tank draining rate problem using similar triangles and implicit differentiation.',
      },
      {
        id: 'a5',
        title: 'Rotational Inertia Diagnostic Checkpoint',
        subject: 'AP Physics 1',
        type: 'QUIZ',
        dueDate: 'Last week',
        status: 'GRADED',
        score: 48,
        maxScore: 50,
        feedback: 'Demonstrated solid grasp of mass distribution versus linear mass.',
        instructions: 'Rank solid cylinder, hoop, and solid sphere rolling down an incline.',
      },
    ],
    conceptMastery: [
      {
        group: 'AP Physics 1: Newtonian Dynamics',
        items: [
          {
            id: 'c1',
            title: "Newton's First Law (Inertia)",
            status: 'MASTERED',
            practiceCount: 5,
            evidence: 'Passed checkpoint with 95% reasoning accuracy',
          },
          {
            id: 'c2',
            title: "Newton's Second Law (F = ma)",
            status: 'MASTERED',
            practiceCount: 4,
            evidence: 'Solved multi-mass Atwood machine without formula cheats',
          },
          {
            id: 'c3',
            title: "Newton's Third Law (Action-Reaction)",
            status: 'DEVELOPING',
            practiceCount: 3,
            evidence: 'Mastered contact pairs; practicing field forces (gravitational)',
          },
          {
            id: 'c4',
            title: 'Conservation of Linear Momentum',
            status: 'NEEDS_PRACTICE',
            practiceCount: 2,
            evidence: 'Needs review on 2D oblique collisions',
          },
        ],
      },
      {
        group: 'Calculus AB: Differential Calculus',
        items: [
          {
            id: 'c5',
            title: 'Limits & Continuity',
            status: 'MASTERED',
            practiceCount: 6,
            evidence: 'Accurately resolved indeterminate 0/0 limits algebraically',
          },
          {
            id: 'c6',
            title: 'Chain Rule Mechanics',
            status: 'DEVELOPING',
            practiceCount: 3,
            evidence: 'Proficient on polynomials; reviewing inverse trigonometric functions',
          },
          {
            id: 'c7',
            title: 'Related Rates Formulation',
            status: 'NEEDS_PRACTICE',
            practiceCount: 1,
            evidence: 'Needs practice connecting geometric formulas with time derivatives',
          },
        ],
      },
    ],
    activity: {
      totalHours: 18.5,
      topicsCount: 9,
      quizzesTaken: 6,
      flashcardsStudied: 84,
      tutorSessions: 24,
      streakDays: 4,
      weeklyMinutes: [
        { day: 'Mon', minutes: 45 },
        { day: 'Tue', minutes: 60 },
        { day: 'Wed', minutes: 30 },
        { day: 'Thu', minutes: 75 },
        { day: 'Fri', minutes: 50 },
        { day: 'Sat', minutes: 65 },
        { day: 'Sun', minutes: 40 },
      ],
    },
    feedback: [
      {
        teacher: 'Dr. Robert Harrison',
        subject: 'AP Physics 1',
        date: 'Nov 12, 2026',
        comment:
          'Alex demonstrated exemplary first-principles derivation during our forces seminar. He is explaining concepts to peers with great clarity.',
      },
      {
        teacher: 'Prof. Sarah Davis',
        subject: 'Calculus AB',
        date: 'Nov 08, 2026',
        comment:
          'Strong performance on the derivative theorems quiz. Recommend 15 minutes of practice with related rates word problems this weekend.',
      },
    ],
    attendance: {
      present: 88,
      absent: 1,
      late: 1,
      notices: [
        {
          date: 'Nov 14, 2026',
          title: 'Parent-Teacher Consultations Booking Open',
          body: 'Conferences are scheduled for the end of the term. Please review student concept mastery before your appointment.',
        },
        {
          date: 'Nov 06, 2026',
          title: 'AP STEM Mock Exam Schedule',
          body: 'Mid-term practice examinations will take place in the main hall on Friday, Nov 28.',
        },
      ],
    },
  },
  {
    id: 'emily',
    name: 'Emily Chen',
    grade: 'Grade 9',
    section: 'Section B',
    relationship: 'Mother',
    avatarInitials: 'EC',
    color: 'bg-emerald-600',
    overallAverage: 88.5,
    completedCount: 11,
    pendingCount: 3,
    overdueCount: 0,
    attendanceRate: 99.1,
    subjects: [
      {
        name: 'Mathematics 9',
        teacher: 'Ms. Clara Vance',
        average: 90.0,
        trend: 'UP',
        gradedCount: 6,
        pendingCount: 2,
        strengths: ['Linear Equations', 'Pythagorean Theorem', 'Graphing Functions'],
        focusAreas: ['Quadratic Factoring'],
      },
      {
        name: 'General Science',
        teacher: 'Mr. David Lee',
        average: 87.0,
        trend: 'UP',
        gradedCount: 5,
        pendingCount: 1,
        strengths: ['Cellular Biology', 'Photosynthesis Mechanisms'],
        focusAreas: ['Chemical Equations Balancing'],
      },
    ],
    assignments: [
      {
        id: 'e1',
        title: 'Cellular Respiration & Mitochondria Inquiry',
        subject: 'General Science',
        type: 'PROBLEM_SET',
        dueDate: 'In 2 days',
        status: 'PENDING',
        maxScore: 50,
        instructions:
          'Trace the stages of cellular respiration: glycolysis, Krebs cycle, and electron transport chain. Explain the role of oxygen.',
      },
      {
        id: 'e2',
        title: 'Linear Systems Substitution Practice',
        subject: 'Mathematics 9',
        type: 'QUIZ',
        dueDate: '4 days ago',
        status: 'GRADED',
        score: 46,
        maxScore: 50,
        feedback: 'Accurate variable isolation and substitution. Well organized working.',
        instructions: 'Solve 2x + y = 10 and 3x - 2y = 8 using substitution.',
      },
      {
        id: 'e3',
        title: 'Plant vs Animal Cells Microscopic Analysis',
        subject: 'General Science',
        type: 'LAB_REPORT',
        dueDate: 'Last week',
        status: 'GRADED',
        score: 92,
        maxScore: 100,
        feedback: 'Detailed cell wall and chloroplast diagrams. Excellent notes.',
        instructions: 'Compare eukaryotic structures and explain why animal cells lack rigid walls.',
      },
    ],
    conceptMastery: [
      {
        group: 'General Science: Biology & Cells',
        items: [
          {
            id: 'ec1',
            title: 'Cell Organelle Functions',
            status: 'MASTERED',
            practiceCount: 4,
            evidence: 'Correctly mapped nucleus, mitochondria, and ribosomes',
          },
          {
            id: 'ec2',
            title: 'Photosynthesis & ATP Cycle',
            status: 'DEVELOPING',
            practiceCount: 3,
            evidence: 'Understands light reactions; practicing Calvin cycle nuances',
          },
          {
            id: 'ec3',
            title: 'Chemical Equation Balancing',
            status: 'NEEDS_PRACTICE',
            practiceCount: 1,
            evidence: 'Needs practice with conservation of atoms across polyatomic ions',
          },
        ],
      },
      {
        group: 'Mathematics 9: Algebra Foundations',
        items: [
          {
            id: 'ec4',
            title: 'Linear Slope-Intercept Form',
            status: 'MASTERED',
            practiceCount: 7,
            evidence: 'Seamlessly graphs y = mx + b and interprets rate of change',
          },
          {
            id: 'ec5',
            title: 'Quadratic Factoring',
            status: 'NEEDS_PRACTICE',
            practiceCount: 2,
            evidence: 'Review recommended: Flashcard practice on difference of squares',
          },
        ],
      },
    ],
    activity: {
      totalHours: 14.2,
      topicsCount: 7,
      quizzesTaken: 4,
      flashcardsStudied: 62,
      tutorSessions: 18,
      streakDays: 3,
      weeklyMinutes: [
        { day: 'Mon', minutes: 35 },
        { day: 'Tue', minutes: 45 },
        { day: 'Wed', minutes: 40 },
        { day: 'Thu', minutes: 50 },
        { day: 'Fri', minutes: 30 },
        { day: 'Sat', minutes: 45 },
        { day: 'Sun', minutes: 35 },
      ],
    },
    feedback: [
      {
        teacher: 'Ms. Clara Vance',
        subject: 'Mathematics 9',
        date: 'Nov 11, 2026',
        comment:
          'Emily is showing outstanding curiosity in algebra. Her willingness to ask why operations balance on both sides is fantastic.',
      },
    ],
    attendance: {
      present: 92,
      absent: 0,
      late: 1,
      notices: [
        {
          date: 'Nov 14, 2026',
          title: 'Parent-Teacher Consultations Booking Open',
          body: 'Conferences are scheduled for the end of the term. Please review student concept mastery before your appointment.',
        },
      ],
    },
  },
];

type ParentDemoTab =
  | 'overview'
  | 'assignments'
  | 'performance'
  | 'mastery'
  | 'activity'
  | 'feedback'
  | 'attendance'
  | 'notifications';

export default function ParentDemoPage() {
  const [selectedChildId, setSelectedChildId] = useState<'alex' | 'emily'>('alex');
  const [activeTab, setActiveTab] = useState<ParentDemoTab>('overview');
  const [assignmentFilter, setAssignmentFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE'>('ALL');
  const [viewingAssignment, setViewingAssignment] = useState<any | null>(null);
  const [unreadCount, setUnreadCount] = useState(3);

  const child = DEMO_CHILDREN.find((c) => c.id === selectedChildId) || DEMO_CHILDREN[0];

  const filteredAssignments = child.assignments.filter((a) => {
    if (assignmentFilter === 'ALL') return true;
    return a.status === assignmentFilter;
  });

  const resetDemo = () => {
    setSelectedChildId('alex');
    setActiveTab('overview');
    setAssignmentFilter('ALL');
    setViewingAssignment(null);
    setUnreadCount(3);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-800 font-sans flex flex-col">
      {/* ── Persistent Demo Indicator Banner ── */}
      <div className="bg-[#1E225B] text-white text-xs px-4 py-2 font-semibold flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
          <span className="bg-[#F5921D] text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
            DEMO ENVIRONMENT
          </span>
          <span className="text-slate-200 text-xs">
            Viewing fictional demo family for <strong>Horizon Academy</strong>. All academic information shown is synthetic.
          </span>
        </div>
        <button
          type="button"
          onClick={resetDemo}
          className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-white transition-colors shrink-0"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Demo</span>
        </button>
      </div>

      {/* ── Top Navigation Bar ── */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo variant="navbar" />
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
              Parent Portal Demo
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <User className="w-3.5 h-3.5 text-[#1E225B]" />
              <span>Signed in as <strong>Eleanor Chen</strong> (Guardian)</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F5921D] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <Link
              href="/parents"
              className="text-xs font-bold bg-[#1E225B] hover:bg-[#141740] text-white px-3.5 py-2 rounded-xl transition-colors"
            >
              Exit Demo
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Demo Container ── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 space-y-6">
        {/* Child Selector Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Linked Children:
            </div>
            <div className="flex items-center gap-2">
              {DEMO_CHILDREN.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedChildId(c.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                    selectedChildId === c.id
                      ? 'bg-[#1E225B] text-white shadow-sm ring-2 ring-[#1E225B]/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full ${c.color} text-white flex items-center justify-center text-[10px] font-bold`}
                  >
                    {c.avatarInitials}
                  </div>
                  <span>{c.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${selectedChildId === c.id ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>
                    {c.grade}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Academy: <strong>Horizon Academy</strong> · Relationship: <strong>{child.relationship}</strong>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 overflow-x-auto bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs">
          {[
            { key: 'overview', label: 'Overview', icon: Compass },
            { key: 'assignments', label: `Assignments (${child.assignments.length})`, icon: BookOpen },
            { key: 'performance', label: 'Academic Performance', icon: Award },
            { key: 'mastery', label: 'Concept Mastery Trees', icon: Network },
            { key: 'activity', label: 'Learning Activity & AI', icon: RotateCw },
            { key: 'feedback', label: `Teacher Feedback (${child.feedback.length})`, icon: MessageSquare },
            { key: 'attendance', label: 'Attendance & Notices', icon: Calendar },
            { key: 'notifications', label: 'Alerts', icon: Bell },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key as ParentDemoTab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === key
                  ? 'bg-[#1E225B] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB 1: OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
                  {child.overallAverage}%
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mt-1">Average Score</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                  {child.completedCount}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mt-1">Completed</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-500">
                  {child.pendingCount}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mt-1">Pending</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                <div className={`text-2xl sm:text-3xl font-extrabold ${child.overdueCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                  {child.overdueCount}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mt-1">Past Due</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-600">
                  {child.attendanceRate}%
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mt-1">Attendance</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">
                  {child.activity.streakDays}d
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mt-1">Study Streak</div>
              </div>
            </div>

            {/* Academic Alerts Banner */}
            {child.overdueCount > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-rose-900">
                    Action Recommended: {child.overdueCount} Assignment Past Due
                  </div>
                  <div className="text-rose-700 mt-0.5 leading-relaxed">
                    &quot;Momentum Conservation in Inelastic Collisions&quot; was due yesterday. Remind {child.name.split(' ')[0]} to submit their work or review with Dr. Harrison.
                  </div>
                </div>
              </div>
            )}

            {/* Two Column Overview: Recent Coursework & Subject Snapshots */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Coursework */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-[#1E225B] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" /> Recent Coursework
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="text-xs font-bold text-[#1E225B] hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {child.assignments.slice(0, 4).map((a) => (
                    <div
                      key={a.id}
                      onClick={() => setViewingAssignment(a)}
                      className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {a.subject}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              a.status === 'GRADED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : a.status === 'OVERDUE'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {a.status}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900">{a.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Due: {a.dueDate}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {a.score !== undefined ? (
                          <div className="font-extrabold text-emerald-700 text-sm">
                            {a.score}/{a.maxScore}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 font-medium">Pending</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Performance Snapshot */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-[#1E225B] flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#F5921D]" /> Subject Breakdown
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('performance')}
                    className="text-xs font-bold text-[#1E225B] hover:underline"
                  >
                    Details →
                  </button>
                </div>

                <div className="space-y-3">
                  {child.subjects.map((sub, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <div className="font-extrabold text-sm text-[#1E225B]">{sub.name}</div>
                          <div className="text-slate-500 text-[11px]">Teacher: {sub.teacher}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-base text-[#1E225B]">{sub.average}%</div>
                          <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 justify-end">
                            <TrendingUp className="w-3 h-3" /> Trending Up
                          </div>
                        </div>
                      </div>

                      <div className="pt-1 text-[11px] text-slate-600 space-y-1">
                        <div>
                          <strong>Demonstrated Strengths:</strong> {sub.strengths.join(', ')}
                        </div>
                        <div>
                          <strong>Target Focus:</strong> {sub.focusAreas.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: ASSIGNMENTS & ASSESSMENTS ── */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                {(['ALL', 'PENDING', 'SUBMITTED', 'GRADED', 'OVERDUE'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setAssignmentFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      assignmentFilter === st
                        ? 'bg-[#1E225B] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-500">
                Showing <strong>{filteredAssignments.length}</strong> of {child.assignments.length} assignments
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filteredAssignments.map((a) => (
                <div
                  key={a.id}
                  onClick={() => setViewingAssignment(a)}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-[#1E225B] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {a.subject}
                      </span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                          a.status === 'GRADED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : a.status === 'OVERDUE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-[#1E225B]">{a.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {a.instructions}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due: {a.dueDate}
                    </div>

                    {a.score !== undefined ? (
                      <div className="font-extrabold text-emerald-700 text-sm">
                        {a.score}/{a.maxScore}
                      </div>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">Click for details →</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: ACADEMIC PERFORMANCE ── */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {child.subjects.map((sub, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-base text-[#1E225B]">{sub.name}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">Teacher: {sub.teacher}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-[#1E225B]">{sub.average}%</div>
                      <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                        <TrendingUp className="w-3.5 h-3.5" /> Trend: +2.5% this month
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-700 mb-1 flex items-center gap-1.5 text-xs text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmed Strengths
                      </h4>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                        {sub.strengths.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-700 mb-1 flex items-center gap-1.5 text-xs text-amber-800">
                        <TargetIcon className="w-3.5 h-3.5 text-amber-600" /> Focus &amp; Practice Recommendations
                      </h4>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                        {sub.focusAreas.map((fa, i) => (
                          <li key={i}>{fa}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: CONCEPT MASTERY TREES ── */}
        {activeTab === 'mastery' && (
          <div className="space-y-6">
            {/* Disclaimer Banner */}
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong>AI-Guided Diagnostic Estimate:</strong> Concept mastery is evaluated continuously through
                Socratic checkpoint questions and problem-solving reasoning. It identifies cognitive gaps and serves as
                a study recommendation—not an official transcript grade.
              </div>
            </div>

            {child.conceptMastery.map((group, gIdx) => (
              <div key={gIdx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-[#1E225B] flex items-center gap-2">
                  <Network className="w-4 h-4 text-teal-600" /> {group.group}
                </h3>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-[#FAF9F5] flex flex-col justify-between space-y-2 text-xs"
                    >
                      <div>
                        <span
                          className={`inline-block font-extrabold text-[10px] px-2 py-0.5 rounded-md mb-1.5 ${
                            item.status === 'MASTERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'DEVELOPING'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                        <div className="font-bold text-slate-900 leading-snug">{item.title}</div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                        {item.evidence}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 5: LEARNING ACTIVITY & AI TUTOR SUMMARY ── */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            {/* Student Privacy Banner */}
            <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs text-purple-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
              <div>
                <strong>Student Psychological Safety &amp; Autonomy:</strong> To foster authentic inquiry and remove
                fear of judgment, raw student-AI chat prompts are kept private. Guardians receive high-level engagement
                metrics, topics explored, study consistency, and concept mastery levels.
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
                  {child.activity.totalHours} hrs
                </div>
                <div className="text-xs text-slate-500 mt-1">Total Socratic Study Time</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#F5921D]">
                  {child.activity.tutorSessions}
                </div>
                <div className="text-xs text-slate-500 mt-1">AI Guided Sessions</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-600">
                  {child.activity.flashcardsStudied}
                </div>
                <div className="text-xs text-slate-500 mt-1">Flashcards Mastered (SM-2)</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">
                  {child.activity.quizzesTaken}
                </div>
                <div className="text-xs text-slate-500 mt-1">Diagnostic Quizzes</div>
              </div>
            </div>

            {/* Weekly Consistency Chart */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-[#1E225B] flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" /> Weekly Study Consistency (Minutes / Day)
              </h3>

              <div className="flex items-end justify-between gap-2 h-36 pt-4 px-4 border-b border-slate-100">
                {child.activity.weeklyMinutes.map((w, i) => {
                  const maxMin = 80;
                  const heightPercent = Math.min(100, Math.round((w.minutes / maxMin) * 100));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-[10px] font-bold text-slate-500">{w.minutes}m</div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[36px] bg-[#1E225B] hover:bg-[#F5921D] rounded-t-lg transition-all"
                      />
                      <div className="text-xs font-bold text-slate-700">{w.day}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 6: TEACHER FEEDBACK ── */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            {child.feedback.map((fb, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                  <div className="font-extrabold text-sm text-[#1E225B] flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" /> {fb.teacher} · {fb.subject}
                  </div>
                  <div className="text-slate-400 text-[11px]">{fb.date}</div>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &quot;{fb.comment}&quot;
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 7: ATTENDANCE & NOTICES ── */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                  {child.attendance.present}
                </div>
                <div className="text-xs text-slate-500 mt-1">Days Present</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">
                  {child.attendance.absent}
                </div>
                <div className="text-xs text-slate-500 mt-1">Days Absent</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-500">
                  {child.attendance.late}
                </div>
                <div className="text-xs text-slate-500 mt-1">Tardy / Late</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#1E225B]">
                  {child.attendanceRate}%
                </div>
                <div className="text-xs text-slate-500 mt-1">Net Attendance Rate</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-[#1E225B] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" /> Official Academy Notices
              </h3>
              <div className="space-y-3">
                {child.attendance.notices.map((nt, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>{nt.date}</span>
                      <span className="font-bold text-[#1E225B]">Official Announcement</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{nt.title}</div>
                    <p className="text-slate-600 leading-relaxed">{nt.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 8: ALERTS & NOTIFICATIONS ── */}
        {activeTab === 'notifications' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 max-w-3xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-[#1E225B]">Guardian Notifications</h3>
              <button
                type="button"
                onClick={() => setUnreadCount(0)}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Mark all as read
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                <div className="font-bold text-blue-900">New Grade Published</div>
                <div className="text-blue-700">
                  AP Physics 1: Newton’s Third Law Lab Analysis graded 94/100 by Dr. Harrison.
                </div>
                <div className="text-[10px] text-blue-400">2 hours ago</div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="font-bold text-emerald-900">Learning Milestone Achieved</div>
                <div className="text-emerald-700">
                  Alex completed 4-day study streak and cleared Socratic checkpoint on Limits &amp; Derivatives.
                </div>
                <div className="text-[10px] text-emerald-500">Yesterday</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <div className="font-bold text-amber-900">Parent-Teacher Conference Booking</div>
                <div className="text-amber-700">
                  Fall Term Parent-Teacher Consultation calendar is now open for reservations.
                </div>
                <div className="text-[10px] text-amber-500">3 days ago</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Assignment Details Modal ── */}
      {viewingAssignment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {viewingAssignment.subject}
                </span>
                <h3 className="font-extrabold text-base text-[#1E225B] mt-1">
                  {viewingAssignment.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingAssignment(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-[#FAF9F5] border border-slate-200 rounded-2xl p-4">
              <div>
                <strong className="text-slate-700 block mb-0.5">Instructions &amp; Problem Statement:</strong>
                <p className="text-slate-600 leading-relaxed">{viewingAssignment.instructions}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                <div>
                  <strong>Submission Status:</strong> {viewingAssignment.status}
                </div>
                <div>
                  <strong>Due Date:</strong> {viewingAssignment.dueDate}
                </div>
              </div>

              {viewingAssignment.score !== undefined && (
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between font-bold text-emerald-800">
                    <span>Grade Recorded:</span>
                    <span>
                      {viewingAssignment.score} / {viewingAssignment.maxScore} (
                      {Math.round((viewingAssignment.score / viewingAssignment.maxScore) * 100)}%)
                    </span>
                  </div>
                  {viewingAssignment.feedback && (
                    <div className="mt-1.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 italic">
                      &quot;{viewingAssignment.feedback}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setViewingAssignment(null)}
                className="bg-[#1E225B] text-white font-bold px-4 py-2 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Floating Contact / Invitation Pill ── */}
      <div className="sticky bottom-4 z-20 max-w-lg mx-auto w-full px-4">
        <div className="bg-[#1E225B] text-white rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#F5921D] shrink-0" />
            <span>Ready for your school to adopt GuruMera?</span>
          </div>
          <Link
            href="/schools"
            className="bg-[#F5921D] hover:bg-[#d87c10] text-white font-bold px-3 py-1.5 rounded-xl shrink-0 transition-colors"
          >
            Request School Invite →
          </Link>
        </div>
      </div>
    </div>
  );
}

function TargetIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
