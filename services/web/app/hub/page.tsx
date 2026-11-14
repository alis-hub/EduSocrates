'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  api,
  getApiBaseUrl,
  getStoredUser,
  getToken,
  logout,
} from '@/lib/api';
import { KaTeXMath } from '@/components/KaTeXMath';
import { MathGraphPlayground } from '@/components/MathGraphPlayground';
import { BrandLogo } from '@/components/BrandLogo';
import {
  HubWorkspaceHeader,
  CURATED_STUDY_UNITS,
  StudyUnit,
} from '@/components/HubWorkspaceHeader';
import { HubToolBanner } from '@/components/HubToolBanner';
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Code2,
  Compass,
  Flame,
  GitBranch,
  HelpCircle,
  KeyRound,
  Layers,
  Lock,
  LogIn,
  LogOut,
  MessageSquare,
  Network,
  PenTool,
  PlusCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Unlock,
  X,
} from 'lucide-react';

type HubTab =
  | 'sandbox'
  | 'code'
  | 'flashcards'
  | 'concepts'
  | 'quizzes'
  | 'grapher'
  | 'discussions'
  | 'whiteboards'
  | 'coursework';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

const ANON_STORAGE_KEY = 'edusocrates_hub_anon_v1';

export default function PublicLearningHubPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<HubTab>('sandbox');
  const [toast, setToast] = useState('');

  // Unified Learning Workspace State
  const [currentUnit, setCurrentUnit] = useState<StudyUnit>(CURATED_STUDY_UNITS[0]);
  const [tutorQueriesCount, setTutorQueriesCount] = useState<number>(0);
  const [cardsReviewedCount, setCardsReviewedCount] = useState<number>(0);
  const [checkpointsClearedCount, setCheckpointsClearedCount] = useState<number>(0);
  const [quizzesTakenCount, setQuizzesTakenCount] = useState<number>(0);

  // Gamification & Invite Migration
  const [gamification, setGamification] = useState<any>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);

  // Anonymous Trial Cap + Conversion Modal
  const [anonQueryCount, setAnonQueryCount] = useState(0);
  const [anonSessionKey, setAnonSessionKey] = useState('');
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  // 1. Socratic Sandbox State
  const [topic, setTopic] = useState("Newton's Second Law & Friction");
  const [level, setLevel] = useState<'ELEMENTARY' | 'HIGH_SCHOOL' | 'AP_UNDERGRAD'>('HIGH_SCHOOL');
  const [mode, setMode] = useState<'EXPLANATION' | 'CHECK_MY_LOGIC' | 'TOY_PROBLEM'>('EXPLANATION');
  const [sandboxMsgs, setSandboxMsgs] = useState<ChatMsg[]>([]);
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxStreaming, setSandboxStreaming] = useState(false);
  const sandboxEndRef = useRef<HTMLDivElement>(null);

  // 2. Code Debugger State
  const [codeLang, setCodeLang] = useState('python');
  const [codeSnippet, setCodeSnippet] = useState(
    'def binary_search(arr, target):\n    left, right = 0, len(arr)\n    while left < right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid\n        else:\n            right = mid\n    return -1',
  );
  const [codeQuestion, setCodeQuestion] = useState(
    'Why might this loop run forever when target is not found?',
  );
  const [codeMsgs, setCodeMsgs] = useState<ChatMsg[]>([]);
  const [codeStreaming, setCodeStreaming] = useState(false);

  // 3. Flashcards State
  const [decks, setDecks] = useState<any[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<{ deck: any; cards: any[] } | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [clueStage, setClueStage] = useState<0 | 1 | 2 | 3>(0);
  const [aiDeckTopic, setAiDeckTopic] = useState('');
  const [aiDeckSubject, setAiDeckSubject] = useState('Physics');
  const [generatingDeck, setGeneratingDeck] = useState(false);
  const [draftDeck, setDraftDeck] = useState<any>(null);

  // 4. Concept DAG State
  const [conceptDomain, setConceptDomain] = useState('physics');
  const [concepts, setConcepts] = useState<any[]>([]);
  const [activeNode, setActiveNode] = useState<any>(null);
  const [checkpointAns, setCheckpointAns] = useState('');
  const [evalResult, setEvalResult] = useState<any>(null);
  const [evalBusy, setEvalBusy] = useState(false);

  // 5. Practice Quizzes State
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<{ quiz: any; questions: any[] } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizGenForm, setQuizGenForm] = useState({
    subject: 'Calculus',
    topic: 'Chain Rule & Derivatives',
    difficultyLevel: 'HIGH_SCHOOL',
    questionCount: 4,
  });
  const [quizBusy, setQuizBusy] = useState(false);

  // 6. Discussions & Whiteboards & Public Coursework
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<{ thread: any; replies: any[] } | null>(null);
  const [newThread, setNewThread] = useState({ title: '', subjectTag: 'Physics', body: '' });
  const [replyText, setReplyText] = useState('');
  const [summonAi, setSummonAi] = useState(true);

  const [rooms, setRooms] = useState<any[]>([]);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [publicCoursework, setPublicCoursework] = useState<any[]>([]);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 4500);
  };

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);

    // Load anonymous localStorage state
    try {
      const raw = localStorage.getItem(ANON_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.key) setAnonSessionKey(parsed.key);
        if (typeof parsed.count === 'number') setAnonQueryCount(parsed.count);
        if (Array.isArray(parsed.sandboxMsgs) && parsed.sandboxMsgs.length > 0) {
          setSandboxMsgs(parsed.sandboxMsgs);
        }
      } else {
        const key = `anon-${Math.random().toString(36).slice(2, 10)}`;
        setAnonSessionKey(key);
        localStorage.setItem(ANON_STORAGE_KEY, JSON.stringify({ key, count: 0, sandboxMsgs: [] }));
      }
    } catch {}

    refreshHubData(Boolean(stored));
  }, []);

  const refreshHubData = async (isAuth: boolean) => {
    const [dRes, cRes, qRes, tRes, rRes, cwRes] = await Promise.all([
      api.hub.getDecks().catch(() => ({ decks: [] })),
      api.hub.getConceptNodes('physics').catch(() => ({ nodes: [] })),
      api.hub.getQuizzes().catch(() => ({ quizzes: [] })),
      api.hub.getThreads().catch(() => ({ threads: [] })),
      api.hub.getWhiteboardRooms().catch(() => ({ rooms: [] })),
      api.getPublicCoursework().catch(() => []),
    ]);
    setDecks(dRes.decks || []);
    setConcepts(cRes.nodes || []);
    setQuizzes(qRes.quizzes || []);
    setThreads(tRes.threads || []);
    setRooms(rRes.rooms || []);
    setPublicCoursework(Array.isArray(cwRes) ? cwRes : []);

    if (isAuth) {
      const prof = await api.hub.getGamificationProfile().catch(() => null);
      if (prof) setGamification(prof);
    }
  };

  useEffect(() => {
    sandboxEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sandboxMsgs]);

  const persistAnon = (count: number, msgs: ChatMsg[]) => {
    try {
      localStorage.setItem(
        ANON_STORAGE_KEY,
        JSON.stringify({ key: anonSessionKey, count, sandboxMsgs: msgs.slice(-12) }),
      );
    } catch {}
  };

  const requireAccountForSave = (): boolean => {
    if (user) return true;
    setSignupModalOpen(true);
    return false;
  };

  // Generic SSE consumer
  async function consumeSse(
    endpoint: string,
    payload: Record<string, any>,
    onToken: (tok: string) => void,
  ): Promise<boolean> {
    const token = getToken();
    const res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 429) {
      setSignupModalOpen(true);
      return false;
    }
    if (!res.ok || !res.body) {
      throw new Error('Unable to reach Socratic AI stream');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        try {
          const parsed = JSON.parse(line.slice(6));
          if (parsed.token) onToken(parsed.token);
        } catch {}
      }
    }
    return true;
  }

  // ── 1. Socratic Sandbox Send ──
  const sendSandboxPrompt = async (overrideMsg?: string) => {
    const msgText = (overrideMsg ?? sandboxInput).trim();
    if (!msgText || sandboxStreaming) return;

    if (!user && anonQueryCount >= 3) {
      setSignupModalOpen(true);
      return;
    }

    if (!overrideMsg) setSandboxInput('');
    const nextUserMsgs: ChatMsg[] = [...sandboxMsgs, { role: 'user', content: msgText }];
    setSandboxMsgs([...nextUserMsgs, { role: 'assistant', content: '' }]);
    setSandboxStreaming(true);

    try {
      let replyAcc = '';
      const ok = await consumeSse(
        '/hub/sandbox/stream',
        {
          topic,
          message: msgText,
          level,
          mode,
          history: sandboxMsgs.slice(-8),
          anonSessionKey,
        },
        (tok) => {
          replyAcc += tok;
          setSandboxMsgs([...nextUserMsgs, { role: 'assistant', content: replyAcc }]);
        },
      );
      if (ok) {
        const finalMsgs: ChatMsg[] = [...nextUserMsgs, { role: 'assistant', content: replyAcc }];
        setTutorQueriesCount((prev) => prev + 1);
        if (!user) {
          const nc = anonQueryCount + 1;
          setAnonQueryCount(nc);
          persistAnon(nc, finalMsgs);
        } else {
          api.hub.getGamificationProfile().then(setGamification).catch(() => {});
        }
      }
    } catch (err: any) {
      setSandboxMsgs([
        ...nextUserMsgs,
        { role: 'assistant', content: `Error: ${err.message}` },
      ]);
    } finally {
      setSandboxStreaming(false);
    }
  };

  // ── 2. Code Debugger Send ──
  const sendCodeDebug = async () => {
    if (!codeSnippet.trim() || !codeQuestion.trim() || codeStreaming) return;
    if (!user && anonQueryCount >= 3) {
      setSignupModalOpen(true);
      return;
    }

    const userDisplay = `[${codeLang}] ${codeQuestion}`;
    const nextMsgs: ChatMsg[] = [...codeMsgs, { role: 'user', content: userDisplay }];
    setCodeMsgs([...nextMsgs, { role: 'assistant', content: '' }]);
    setCodeStreaming(true);

    try {
      let acc = '';
      const ok = await consumeSse(
        '/hub/code/debug-socratic',
        {
          language: codeLang,
          code: codeSnippet,
          question: codeQuestion,
          level,
          history: codeMsgs.slice(-6),
          anonSessionKey,
        },
        (tok) => {
          acc += tok;
          setCodeMsgs([...nextMsgs, { role: 'assistant', content: acc }]);
        },
      );
      if (ok && !user) {
        const nc = anonQueryCount + 1;
        setAnonQueryCount(nc);
        persistAnon(nc, sandboxMsgs);
      }
    } catch (err: any) {
      setCodeMsgs([...nextMsgs, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setCodeStreaming(false);
    }
  };

  // ── 3. Flashcards Handlers ──
  const openDeck = async (deckId: string) => {
    const res = await api.hub.getDeckById(deckId);
    setSelectedDeck(res);
    setCardIndex(0);
    setClueStage(0);
  };

  const handleGenerateTopicDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiDeckTopic.trim()) return;
    setGeneratingDeck(true);
    try {
      const res = await api.hub.generateFlashcards({
        topic: aiDeckTopic,
        subjectArea: aiDeckSubject,
        cardCount: 6,
        saveDeck: false,
      });
      setDraftDeck({
        title: res.title,
        subjectArea: res.subject_area || aiDeckSubject,
        cards: res.cards.map((c: any) => ({
          conceptTitle: c.concept_title,
          clueTier1: c.clue_tier_1,
          clueTier2: c.clue_tier_2,
          terminalDefinition: c.terminal_definition,
        })),
      });
    } catch (err: any) {
      showToast('Error: ' + err.message);
    } finally {
      setGeneratingDeck(false);
    }
  };

  const handleSaveDraftDeck = async () => {
    if (!requireAccountForSave() || !draftDeck) return;
    try {
      const saved = await api.hub.createDeck({ ...draftDeck, isPublic: true });
      setDraftDeck(null);
      setAiDeckTopic('');
      showToast('Study deck saved & published!');
      const dRes = await api.hub.getDecks();
      setDecks(dRes.decks || []);
      await openDeck(saved.deck.id);
      api.hub.getGamificationProfile().then(setGamification).catch(() => {});
    } catch (err: any) {
      showToast('Error: ' + err.message);
    }
  };

  const handleRateCard = async (quality: number) => {
    if (!selectedDeck) return;
    const currentCard = selectedDeck.cards[cardIndex];
    setCardsReviewedCount((prev) => prev + 1);
    if (!user) {
      // Allow interactive preview, prompt on save
      const nextIdx = (cardIndex + 1) % selectedDeck.cards.length;
      setCardIndex(nextIdx);
      setClueStage(0);
      showToast('Previewed card! Sign in free to save SM-2 intervals & streaks.');
      return;
    }
    try {
      const res = await api.hub.reviewCard(currentCard.id, quality);
      if (res.gamification) setGamification(res.gamification);
      showToast(`Scheduled next review in ${res.review.interval_days} day(s) (+10 XP)`);
      setCardIndex((cardIndex + 1) % selectedDeck.cards.length);
      setClueStage(0);
    } catch (err: any) {
      showToast('Error: ' + err.message);
    }
  };

  // ── Unified Workspace Unit Selector ──
  const handleSelectUnit = (unit: StudyUnit) => {
    setCurrentUnit(unit);
    setTopic(unit.title);
    setMode(unit.defaultMode);
    setConceptDomain(unit.conceptDomain);
    switchConceptDomain(unit.conceptDomain);
    setAiDeckTopic(unit.title);
    setAiDeckSubject(unit.subject);
    setQuizGenForm((prev) => ({
      ...prev,
      subject: unit.subject,
      topic: unit.title,
    }));
    showToast(`Loaded Unified Study Workspace for "${unit.title}". All tools connected!`);
  };

  // ── 4. Concept DAG Handlers ──
  const switchConceptDomain = async (domain: string) => {
    setConceptDomain(domain);
    setActiveNode(null);
    setEvalResult(null);
    const res = await api.hub.getConceptNodes(domain).catch(() => ({ nodes: [] }));
    setConcepts(res.nodes || []);
  };

  const handleEvaluateCheckpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNode || !checkpointAns.trim()) return;
    setEvalBusy(true);
    try {
      const res = await api.hub.evaluateConcept(activeNode.id, checkpointAns);
      setEvalResult(res);
      if (res?.passed) {
        setCheckpointsClearedCount((prev) => prev + 1);
      }
      if (res.gamification) setGamification(res.gamification);
      const refreshed = await api.hub.getConceptNodes(conceptDomain).catch(() => ({ nodes: [] }));
      setConcepts(refreshed.nodes || []);
    } catch (err: any) {
      showToast('Error: ' + err.message);
    } finally {
      setEvalBusy(false);
    }
  };

  // ── 5. Practice Quiz Handlers ──
  const openQuiz = async (quizId: string) => {
    const res = await api.hub.getQuizById(quizId);
    setActiveQuiz(res);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuizBusy(true);
    try {
      const res = await api.hub.generateQuiz(quizGenForm);
      setActiveQuiz(res);
      setQuizAnswers({});
      setQuizResult(null);
      const qList = await api.hub.getQuizzes().catch(() => ({ quizzes: [] }));
      setQuizzes(qList.quizzes || []);
    } catch (err: any) {
      showToast('Error: ' + err.message);
    } finally {
      setQuizBusy(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setQuizBusy(true);
    try {
      const res = await api.hub.submitQuizAttempt(activeQuiz.quiz.id, quizAnswers);
      setQuizResult(res);
      setQuizzesTakenCount((prev) => prev + 1);
      if (res.gamification) setGamification(res.gamification);
    } catch (err: any) {
      showToast('Error: ' + err.message);
    } finally {
      setQuizBusy(false);
    }
  };

  // ── 6. Discussions & Whiteboards ──
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAccountForSave()) return;
    try {
      const res = await api.hub.createThread({ ...newThread, isPublic: true, askAiGuide: true });
      setNewThread({ title: '', subjectTag: 'Physics', body: '' });
      setActiveThread(res);
      const tRes = await api.hub.getThreads();
      setThreads(tRes.threads || []);
    } catch (err: any) {
      showToast('Error: ' + err.message);
    }
  };

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAccountForSave() || !activeThread || !replyText.trim()) return;
    try {
      await api.hub.createReply(activeThread.thread.id, {
        replyBody: replyText,
        summonAiGuide: summonAi,
      });
      setReplyText('');
      const refreshed = await api.hub.getThreadById(activeThread.thread.id);
      setActiveThread(refreshed);
    } catch (err: any) {
      showToast('Error: ' + err.message);
    }
  };

  const handleCreateWhiteboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomTitle.trim()) return;
    try {
      const res = await api.hub.createWhiteboardRoom({ title: newRoomTitle, isPublic: true });
      window.location.href = `/whiteboard/${res.room.id}`;
    } catch (err: any) {
      showToast('Error: ' + err.message);
    }
  };

  // ── Auth Conversion & Invite Migration ──
  const handleQuickSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.publicSignup(signupForm);
      setUser(res.user);
      setSignupModalOpen(false);
      showToast('Welcome! Your learning progress & streaks will now persist.');
      const prof = await api.hub.getGamificationProfile().catch(() => null);
      if (prof) setGamification(prof);
    } catch (err: any) {
      showToast('Error: ' + err.message);
    }
  };

  const handleRedeemInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAccountForSave()) return;
    setInviteBusy(true);
    try {
      const res = await api.redeemInvite(inviteCode);
      setInviteModalOpen(false);
      showToast(`Joined ${res.schoolName}! Redirecting to your Student Dashboard...`);
      setTimeout(() => {
        window.location.href = '/student';
      }, 900);
    } catch (err: any) {
      showToast('Error: ' + err.message);
    } finally {
      setInviteBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <BrandLogo variant="navbar" />
            </Link>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full">
              Public Learning Hub
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {gamification ? (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-xs font-semibold text-amber-900">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span>{gamification.current_streak}d Streak</span>
                <span className="text-amber-300">|</span>
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>{gamification.total_xp} XP</span>
              </div>
            ) : (
              <div className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                Free Trial Queries: {Math.max(0, 3 - anonQueryCount)} / 3 left
              </div>
            )}

            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg"
            >
              <KeyRound className="w-3.5 h-3.5" /> Join School Code
            </button>

            <Link
              href="/schools"
              className="text-xs font-medium text-slate-600 hover:text-indigo-600 px-2 py-1"
            >
              Schools
            </Link>
            <Link
              href="/try-teacher"
              className="text-xs font-medium text-slate-600 hover:text-indigo-600 px-2 py-1"
            >
              Try as Teacher
            </Link>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {user.role === 'STUDENT' && (
                  <Link
                    href="/student"
                    className="text-xs bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg font-medium"
                  >
                    My School Dashboard
                  </Link>
                )}
                <span className="text-xs text-slate-600 font-medium">
                  {user.firstName} ({user.role === 'INDEPENDENT_STUDENT' ? 'Hub' : user.role})
                </span>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In / Free Account
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {toast && (
          <div className="mb-4 rounded-xl px-4 py-2.5 text-sm bg-indigo-50 border border-indigo-200 text-indigo-900">
            {toast}
          </div>
        )}

        {/* Unified Learning Workspace Header */}
        <HubWorkspaceHeader
          currentUnit={currentUnit}
          onSelectUnit={handleSelectUnit}
          activeTab={activeTab}
          onSelectTab={(t) => setActiveTab(t)}
          user={user}
          anonQueryCount={anonQueryCount}
          gamification={gamification}
          onOpenSignup={() => setSignupModalOpen(true)}
          tutorQueriesCount={tutorQueriesCount}
          cardsReviewedCount={cardsReviewedCount}
          checkpointsClearedCount={checkpointsClearedCount}
          quizzesTakenCount={quizzesTakenCount}
        />

        {/* Tool Tabs */}
        <div className="flex gap-1.5 overflow-x-auto bg-white border border-slate-200 rounded-2xl p-1.5 mb-6 shadow-sm">
          {[
            { key: 'sandbox', label: 'Socratic Tutor', icon: Sparkles },
            { key: 'code', label: 'Code Debugger', icon: Code2 },
            { key: 'flashcards', label: 'Flashcards (SM-2)', icon: Layers },
            { key: 'concepts', label: 'Knowledge Maps', icon: GitBranch },
            { key: 'quizzes', label: 'Practice Quizzes', icon: HelpCircle },
            { key: 'grapher', label: 'STEM Grapher', icon: Compass },
            { key: 'discussions', label: 'Peer Discussions', icon: MessageSquare },
            { key: 'whiteboards', label: 'Whiteboards', icon: PenTool },
            { key: 'coursework', label: 'Public Bank', icon: BookOpen },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as HubTab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: Socratic Sandbox ── */}
        {activeTab === 'sandbox' && (
          <div className="space-y-6">
            <HubToolBanner
              toolKey="sandbox"
              activeTopic={currentUnit.title}
              onNavigateTab={setActiveTab}
            />

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 h-fit">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-600" /> Configure Study Session
                </h2>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Topic or Concept</label>
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Scaffolding Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="ELEMENTARY">Elementary (Intuitive Analogies)</option>
                    <option value="HIGH_SCHOOL">High School (Foundational)</option>
                    <option value="AP_UNDERGRAD">AP / Undergrad (Rigorous Proofs)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-[#F5921D]" /> Pedagogical Mode (Visually Indicated)
                  </label>
                  <div className="space-y-1.5">
                    {[
                      {
                        v: 'EXPLANATION',
                        label: 'Guided Explanation',
                        sub: 'Step-by-step discovery via questions',
                        badge: 'Discovery',
                        activeStyle: 'border-blue-500 bg-blue-50/80 text-blue-950 ring-1 ring-blue-500',
                      },
                      {
                        v: 'CHECK_MY_LOGIC',
                        label: 'Check My Logic',
                        sub: 'Spot flaws in your deductions',
                        badge: 'Validator',
                        activeStyle: 'border-amber-500 bg-amber-50/80 text-amber-950 ring-1 ring-amber-500',
                      },
                      {
                        v: 'TOY_PROBLEM',
                        label: 'Toy Problem',
                        sub: 'Simplified numerical challenges',
                        badge: 'Intuition',
                        activeStyle: 'border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-1 ring-emerald-500',
                      },
                    ].map((m) => (
                      <button
                        key={m.v}
                        type="button"
                        onClick={() => setMode(m.v as any)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs border transition-all ${
                          mode === m.v
                            ? `${m.activeStyle} font-semibold shadow-xs`
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{m.label}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-white border border-slate-200">
                            {m.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{m.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-2">Starter Prompts:</p>
                  <div className="space-y-1.5">
                    {[
                      'Can you help me check why static friction does not always equal μN?',
                      'Give me a tiny numerical thought experiment to test my intuition.',
                    ].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => sendSandboxPrompt(sample)}
                        className="w-full text-left text-xs bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg p-2 text-slate-700"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl flex flex-col h-[560px] overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{topic}</div>
                    <div className="text-xs text-slate-500">
                      {level.replace('_', ' ')} · {mode.replace('_', ' ')} · 5-Layer Guardrailed
                    </div>
                  </div>
                </div>

                {/* Visually Obvious Selected Pedagogical Mode Banner */}
                <div
                  className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 text-xs transition-colors ${
                    mode === 'EXPLANATION'
                      ? 'bg-blue-50/90 border-blue-200 text-blue-950'
                      : mode === 'CHECK_MY_LOGIC'
                      ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                      : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] shadow-xs ${
                        mode === 'EXPLANATION'
                          ? 'bg-blue-600 text-white'
                          : mode === 'CHECK_MY_LOGIC'
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      Active Mode: {mode.replace('_', ' ')}
                    </span>
                    <span className="font-medium text-slate-700 text-xs">
                      {mode === 'EXPLANATION' &&
                        'Guided Discovery: AI asks probing questions so you deduce the core principles.'}
                      {mode === 'CHECK_MY_LOGIC' &&
                        'Reasoning Validator: AI audits your statements for gaps, invalid assumptions, or fallacies.'}
                      {mode === 'TOY_PROBLEM' &&
                        'Intuition Sandbox: AI constructs simplified numerical mini-cases to test your mental model.'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                    5-Layer Guardrailed · Zero Answer Leaks
                  </span>
                </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {sandboxMsgs.length === 0 && (
                  <div className="py-6 px-4 max-w-lg mx-auto text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#1E225B]/10 text-[#1E225B] flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6 text-[#F5921D]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#1E225B] text-base">
                        What would you like to master today?
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        GuruMera guides your reasoning with Socratic clues — never handing over a raw answer.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTopic("Physics: Newton's Laws");
                          sendSandboxPrompt("Help me understand Newton's Third Law");
                        }}
                        className="p-3 rounded-xl border border-slate-200 hover:border-[#1E225B] hover:bg-slate-50 transition-all text-xs group"
                      >
                        <div className="font-bold text-[#1E225B] group-hover:text-[#F5921D] flex items-center gap-1.5">
                          💡 Physics
                        </div>
                        <div className="text-slate-600 mt-1">
                          &ldquo;Help me understand Newton&apos;s Third Law&rdquo;
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('code');
                        }}
                        className="p-3 rounded-xl border border-slate-200 hover:border-[#1E225B] hover:bg-slate-50 transition-all text-xs group"
                      >
                        <div className="font-bold text-[#1E225B] group-hover:text-[#F5921D] flex items-center gap-1.5">
                          🔍 Code Debugger
                        </div>
                        <div className="text-slate-600 mt-1">
                          &ldquo;Debug my Python loop&rdquo;
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTopic('Biology: Cellular Respiration');
                          sendSandboxPrompt('Quiz me on cellular biology');
                        }}
                        className="p-3 rounded-xl border border-slate-200 hover:border-[#1E225B] hover:bg-slate-50 transition-all text-xs group"
                      >
                        <div className="font-bold text-[#1E225B] group-hover:text-[#F5921D] flex items-center gap-1.5">
                          🧬 Biology
                        </div>
                        <div className="text-slate-600 mt-1">
                          &ldquo;Quiz me on cellular biology&rdquo;
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTopic('Calculus: Derivatives');
                          sendSandboxPrompt('Why does the derivative of e^x equal e^x?');
                        }}
                        className="p-3 rounded-xl border border-slate-200 hover:border-[#1E225B] hover:bg-slate-50 transition-all text-xs group"
                      >
                        <div className="font-bold text-[#1E225B] group-hover:text-[#F5921D] flex items-center gap-1.5">
                          📐 Calculus
                        </div>
                        <div className="text-slate-600 mt-1">
                          &ldquo;Why does the derivative of e^x equal e^x?&rdquo;
                        </div>
                      </button>
                    </div>
                  </div>
                )}
                {sandboxMsgs.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${
                        m.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                      }`}
                    >
                      {m.role === 'assistant' ? (
                        <KaTeXMath text={m.content || '...'} />
                      ) : (
                        <span className="whitespace-pre-wrap">{m.content}</span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={sandboxEndRef} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendSandboxPrompt();
                }}
                className="p-4 border-t border-slate-100 flex gap-2"
              >
                <input
                  value={sandboxInput}
                  onChange={(e) => setSandboxInput(e.target.value)}
                  disabled={sandboxStreaming}
                  placeholder="Share your reasoning or question (supports $math$ syntax)..."
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="submit"
                  disabled={sandboxStreaming || !sandboxInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-sm font-medium disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </form>
            </div>
          </div>
          </div>
        )}

        {/* ── TAB 2: Socratic Code Debugger ── */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            <HubToolBanner
              toolKey="code"
              activeTopic={currentUnit.title}
              onNavigateTab={setActiveTab}
            />

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-600" /> Paste Buggy Code Snippet
                  </h2>
                  <select
                    value={codeLang}
                    onChange={(e) => setCodeLang(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-white font-medium"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript / TypeScript</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                  </select>
                </div>
                <textarea
                  rows={11}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  className="w-full font-mono text-xs bg-slate-900 text-emerald-300 rounded-xl p-4 outline-none"
                />
                <input
                  value={codeQuestion}
                  onChange={(e) => setCodeQuestion(e.target.value)}
                  placeholder="What bug or unexpected output are you observing?"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="button"
                  onClick={sendCodeDebug}
                  disabled={codeStreaming}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                >
                  {codeStreaming ? 'Tracing logic...' : 'Debug Socratic-Style (No Spoiler Fixes)'}
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 h-[480px] overflow-y-auto space-y-3">
                <h3 className="font-semibold text-sm text-slate-800 border-b border-slate-100 pb-2">
                  Socratic Trace &amp; Diagnostic Questions
                </h3>
                {codeMsgs.length === 0 && (
                  <p className="text-sm text-slate-400 py-10 text-center">
                    Submit a code snippet and question on the left to start guided edge-case tracing.
                  </p>
                )}
                {codeMsgs.map((m, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-3 text-sm ${
                      m.role === 'user' ? 'bg-indigo-50 text-indigo-950' : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="text-[11px] font-bold uppercase mb-1 text-slate-500">
                      {m.role === 'user' ? 'Your Bug Report' : 'GuruMera Code Coach'}
                    </div>
                    <KaTeXMath text={m.content || '...'} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: Socratic Flashcards & SM-2 ── */}
        {activeTab === 'flashcards' && (
          <div className="space-y-6">
            <HubToolBanner
              toolKey="flashcards"
              activeTopic={currentUnit.title}
              onNavigateTab={setActiveTab}
            />

            {/* Topic-Driven AI Generator */}
            <form
              onSubmit={handleGenerateTopicDeck}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap items-end gap-3"
            >
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Generate Custom Socratic Deck on Any Topic
                </label>
                <input
                  required
                  value={aiDeckTopic}
                  onChange={(e) => setAiDeckTopic(e.target.value)}
                  placeholder="e.g. Newton's Third Law, Cellular Respiration, Recursion"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="w-40">
                <label className="text-xs font-medium text-slate-600 block mb-1">Subject</label>
                <input
                  value={aiDeckSubject}
                  onChange={(e) => setAiDeckSubject(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={generatingDeck}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {generatingDeck ? 'Generating...' : 'Auto-Generate Deck'}
              </button>
            </form>

            {draftDeck && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-indigo-950">{draftDeck.title} (Preview &amp; Edit)</h3>
                    <p className="text-xs text-indigo-700">Review progressive clues before publishing to library</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDraftDeck(null)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-slate-600"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSaveDraftDeck}
                      className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold"
                    >
                      Save &amp; Study Deck
                    </button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {draftDeck.cards.map((c: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-xl p-3 border border-indigo-100 text-xs space-y-1">
                      <div className="font-bold text-slate-900">{c.conceptTitle}</div>
                      <div><span className="font-semibold text-indigo-600">Clue 1:</span> {c.clueTier1}</div>
                      <div><span className="font-semibold text-amber-600">Clue 2:</span> {c.clueTier2}</div>
                      <div><span className="font-semibold text-emerald-700">Definition:</span> {c.terminalDefinition}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 text-sm">Available Study Decks</h3>
                {decks.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => openDeck(d.id)}
                    className={`w-full text-left bg-white border rounded-xl p-4 transition-all ${
                      selectedDeck?.deck?.id === d.id
                        ? 'border-indigo-500 ring-2 ring-indigo-100'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="text-xs font-semibold text-indigo-600">{d.subject_area}</div>
                    <div className="font-bold text-slate-900 mt-0.5">{d.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{d.card_count} cards · by {d.creator_name || 'GuruMera'}</div>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-2">
                {!selectedDeck || selectedDeck.cards.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
                    Select a flashcard deck on the left or generate a new AI deck above to practice with 2-tier Socratic clues.
                  </div>
                ) : (
                  (() => {
                    const card = selectedDeck.cards[cardIndex];
                    return (
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{selectedDeck.deck.title}</span>
                          <span>Card {cardIndex + 1} of {selectedDeck.cards.length}</span>
                        </div>
                        <div className="text-center py-4">
                          <h3 className="text-2xl font-bold text-slate-900">{card.concept_title}</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            Try recalling the principle before unlocking clues progressively!
                          </p>
                        </div>

                        {clueStage >= 1 && (
                          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 text-sm text-indigo-950">
                            <span className="font-semibold">Clue Tier 1:</span> {card.clue_tier_1}
                          </div>
                        )}
                        {clueStage >= 2 && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-sm text-amber-950">
                            <span className="font-semibold">Clue Tier 2:</span> {card.clue_tier_2}
                          </div>
                        )}
                        {clueStage >= 3 && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-sm text-emerald-950">
                            <span className="font-semibold">Terminal Definition:</span>{' '}
                            <KaTeXMath text={card.terminal_definition} />
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                          {clueStage < 3 ? (
                            <button
                              type="button"
                              onClick={() => setClueStage((clueStage + 1) as any)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
                            >
                              {clueStage === 0
                                ? 'Reveal Clue 1'
                                : clueStage === 1
                                  ? 'Reveal Clue 2'
                                  : 'Reveal Full Definition'}
                            </button>
                          ) : (
                            <div className="flex flex-wrap gap-2 w-full justify-between items-center">
                              <span className="text-xs text-slate-500 font-medium">Rate Recall (SM-2):</span>
                              <div className="flex gap-2">
                                {[
                                  { q: 1, label: 'Again', cls: 'bg-red-100 text-red-700' },
                                  { q: 3, label: 'Hard', cls: 'bg-amber-100 text-amber-800' },
                                  { q: 4, label: 'Good', cls: 'bg-emerald-100 text-emerald-700' },
                                  { q: 5, label: 'Easy', cls: 'bg-blue-100 text-blue-700' },
                                ].map((b) => (
                                  <button
                                    key={b.q}
                                    type="button"
                                    onClick={() => handleRateCard(b.q)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${b.cls}`}
                                  >
                                    {b.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: Concept Knowledge Maps (DAG) ── */}
        {activeTab === 'concepts' && (
          <div className="space-y-6">
            <HubToolBanner
              toolKey="concepts"
              activeTopic={currentUnit.title}
              onNavigateTab={setActiveTab}
            />

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-bold text-slate-900">Concept Knowledge Tree (Mastery DAG)</h2>
                <p className="text-xs text-slate-500">
                  Pass each Socratic checkpoint (score ≥ 70) to unlock downstream concepts.
                </p>
              </div>
              <div className="flex gap-2">
                {['physics', 'calculus', 'cs'].map((dom) => (
                  <button
                    key={dom}
                    onClick={() => switchConceptDomain(dom)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase ${
                      conceptDomain === dom
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    {dom}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {concepts.map((node, idx) => {
                const locked = node.mastery_status === 'LOCKED';
                const mastered = node.mastery_status === 'MASTERED';
                return (
                  <div
                    key={node.id}
                    className={`rounded-2xl border p-5 transition-all ${
                      mastered
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : locked
                          ? 'bg-slate-100 border-slate-200 opacity-75'
                          : 'bg-white border-indigo-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-slate-400">Node #{idx + 1}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          mastered
                            ? 'bg-emerald-100 text-emerald-800'
                            : locked
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {node.mastery_status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900">{node.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 mb-4">{node.description}</p>
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => {
                        setActiveNode(node);
                        setCheckpointAns('');
                        setEvalResult(null);
                      }}
                      className="w-full py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white disabled:bg-slate-300"
                    >
                      {locked ? 'Complete Parent Node First' : mastered ? 'Review Checkpoint' : 'Attempt Checkpoint'}
                    </button>
                  </div>
                );
              })}
            </div>

            {activeNode && (
              <form
                onSubmit={handleEvaluateCheckpoint}
                className="bg-white border border-indigo-200 rounded-2xl p-6 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Checkpoint: {activeNode.title}</h3>
                  <button type="button" onClick={() => setActiveNode(null)} className="text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-indigo-900 bg-indigo-50 p-3 rounded-xl">
                  {activeNode.socratic_checkpoint_prompt}
                </p>
                <textarea
                  required
                  rows={3}
                  value={checkpointAns}
                  onChange={(e) => setCheckpointAns(e.target.value)}
                  placeholder="Write your conceptual explanation (at least 1–2 thoughtful sentences)..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="submit"
                  disabled={evalBusy}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg"
                >
                  {evalBusy ? 'Evaluating...' : 'Evaluate Conceptual Explanation'}
                </button>
                {evalResult && (
                  <div
                    className={`rounded-xl p-4 text-sm ${
                      evalResult.passed
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                        : 'bg-amber-50 border border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="font-bold mb-1">
                      Score: {evalResult.score}/100 — {evalResult.passed ? 'Passed & Unlocked!' : 'Keep Refining'}
                    </div>
                    <p>{evalResult.feedback}</p>
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {/* ── TAB 5: Practice Quizzes & Misconception Debrief ── */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <HubToolBanner
              toolKey="quizzes"
              activeTopic={currentUnit.title}
              onNavigateTab={setActiveTab}
            />

            <form
              onSubmit={handleGenerateQuiz}
              className="bg-white border border-slate-200 rounded-2xl p-5 grid md:grid-cols-5 gap-3 items-end"
            >
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Subject</label>
                <input
                  required
                  value={quizGenForm.subject}
                  onChange={(e) => setQuizGenForm((p) => ({ ...p, subject: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-600 block mb-1">Topic Focus</label>
                <input
                  required
                  value={quizGenForm.topic}
                  onChange={(e) => setQuizGenForm((p) => ({ ...p, topic: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Difficulty</label>
                <select
                  value={quizGenForm.difficultyLevel}
                  onChange={(e) => setQuizGenForm((p) => ({ ...p, difficultyLevel: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="ELEMENTARY">Elementary</option>
                  <option value="HIGH_SCHOOL">High School</option>
                  <option value="AP_UNDERGRAD">AP / Undergrad</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={quizBusy}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                {quizBusy ? 'Generating...' : 'New AI Quiz'}
              </button>
            </form>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="space-y-2.5">
                <h3 className="font-bold text-sm text-slate-800">Ungraded Practice Quizzes</h3>
                {quizzes.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => openQuiz(q.id)}
                    className={`w-full text-left bg-white border rounded-xl p-4 ${
                      activeQuiz?.quiz?.id === q.id
                        ? 'border-indigo-500 ring-2 ring-indigo-100'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="text-xs text-indigo-600 font-semibold">
                      {q.subject} · {q.difficulty_level}
                    </div>
                    <div className="font-bold text-slate-900 mt-0.5">{q.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{q.question_count} diagnostic MCQs</div>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-2">
                {!activeQuiz ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
                    Pick a practice quiz on the left or generate one above. Practice quizzes never affect school grades!
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{activeQuiz.quiz.title}</h3>
                      <p className="text-xs text-slate-500">Ungraded self-diagnostic · Post-quiz Socratic debrief included</p>
                    </div>

                    {activeQuiz.questions.map((q, qi) => (
                      <div key={q.id} className="border border-slate-100 rounded-xl p-4 space-y-2">
                        <div className="font-medium text-sm text-slate-900">
                          {qi + 1}. {q.question_text}
                        </div>
                        <div className="space-y-1.5">
                          {(Array.isArray(q.options) ? q.options : []).map((opt: string, oi: number) => (
                            <label
                              key={oi}
                              className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-sm cursor-pointer ${
                                quizAnswers[q.id] === oi
                                  ? 'bg-indigo-50 border-indigo-400'
                                  : 'border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                checked={quizAnswers[q.id] === oi}
                                onChange={() => setQuizAnswers((p) => ({ ...p, [q.id]: oi }))}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      disabled={quizBusy}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
                    >
                      Check Understanding &amp; View Socratic Debrief
                    </button>

                    {quizResult && (
                      <div className="border-t border-slate-200 pt-5 space-y-4">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold text-indigo-950">
                              Diagnostic Score: {quizResult.score}% ({quizResult.correctCount}/{quizResult.totalQuestions})
                            </div>
                            <div className="text-xs text-indigo-700">
                              {quizResult.persisted ? 'Saved to practice history (+XP)' : 'Sign in free to track quiz mastery history'}
                            </div>
                          </div>
                        </div>

                        {quizResult.debrief?.length > 0 && (
                          <div className="space-y-2.5">
                            <h4 className="font-bold text-sm text-slate-800">
                              Socratic Misconception Debrief
                            </h4>
                            {quizResult.debrief.map((d: any, di: number) => (
                              <div key={di} className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm space-y-1">
                                {d.question_text && <div className="font-semibold text-amber-950">{d.question_text}</div>}
                                <p className="text-amber-900">{d.socratic_guidance}</p>
                                <p className="text-xs font-semibold text-indigo-800 pt-1">
                                  Guiding Question: {d.guiding_question}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 6: STEM Grapher ── */}
        {activeTab === 'grapher' && (
          <div className="space-y-6">
            <HubToolBanner
              toolKey="grapher"
              activeTopic={currentUnit.title}
              onNavigateTab={setActiveTab}
            />
            <MathGraphPlayground
              onAskSocratic={(prompt) => {
                setTopic('Function & Curve Analysis');
                setActiveTab('sandbox');
                sendSandboxPrompt(prompt);
              }}
            />
          </div>
        )}

        {/* ── TAB 7: Peer Learning Discussions ── */}
        {activeTab === 'discussions' && (
          <div className="space-y-6">
            <HubToolBanner
              toolKey="discussions"
              activeTopic={currentUnit.title}
              onNavigateTab={setActiveTab}
            />

            <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <form onSubmit={handleCreateThread} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-indigo-600" /> Ask the Study Community
                </h3>
                <input
                  required
                  value={newThread.title}
                  onChange={(e) => setNewThread((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Question title"
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
                />
                <input
                  value={newThread.subjectTag}
                  onChange={(e) => setNewThread((p) => ({ ...p, subjectTag: e.target.value }))}
                  placeholder="Subject (e.g. Physics, CS)"
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
                />
                <textarea
                  required
                  rows={3}
                  value={newThread.body}
                  onChange={(e) => setNewThread((p) => ({ ...p, body: e.target.value }))}
                  placeholder="Explain what you tried and where your intuition stalled..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
                />
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white text-xs font-semibold py-2 rounded-lg"
                >
                  Post Thread (+AI Socratic Starter)
                </button>
              </form>

              <div className="space-y-2">
                {threads.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => api.hub.getThreadById(t.id).then(setActiveThread)}
                    className={`w-full text-left bg-white border rounded-xl p-4 ${
                      activeThread?.thread?.id === t.id
                        ? 'border-indigo-500 ring-2 ring-indigo-100'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                      {t.subject_tag}
                    </span>
                    <div className="font-bold text-sm text-slate-900 mt-1">{t.title}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {t.author_name} · {t.reply_count} replies
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
              {!activeThread ? (
                <div className="text-center py-16 text-slate-400 text-sm">
                  Select a discussion thread on the left to read peer reasoning &amp; Socratic AI moderation.
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold">
                      {activeThread.thread.subject_tag}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mt-2">{activeThread.thread.title}</h2>
                    <p className="text-xs text-slate-500">Started by {activeThread.thread.author_name}</p>
                    <p className="text-sm text-slate-700 mt-3 whitespace-pre-wrap">{activeThread.thread.body}</p>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    {activeThread.replies.map((r: any) => (
                      <div
                        key={r.id}
                        className={`rounded-xl p-4 text-sm ${
                          r.is_ai_socratic_guide
                            ? 'bg-indigo-50 border border-indigo-200'
                            : 'bg-slate-50 border border-slate-100'
                        }`}
                      >
                        <div className="text-xs font-bold mb-1 text-slate-700">
                          {r.is_ai_socratic_guide ? '🤖 GuruMera Socratic Guide' : r.author_name}
                        </div>
                        <KaTeXMath text={r.reply_body} />
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleCreateReply} className="space-y-2 pt-3 border-t border-slate-100">
                    <textarea
                      required
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Contribute a hint, analogy, or follow-up question..."
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm"
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={summonAi}
                          onChange={(e) => setSummonAi(e.target.checked)}
                        />
                        Also ask @GuruMera AI Moderator to synthesize &amp; guide
                      </label>
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                      >
                        Post Reply
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
          </div>
        )}

        {/* ── TAB 8: Collaborative Whiteboard Rooms ── */}
        {activeTab === 'whiteboards' && (
          <div className="space-y-6">
            <HubToolBanner
              toolKey="whiteboards"
              activeTopic={currentUnit.title}
              onNavigateTab={setActiveTab}
            />

            <form
              onSubmit={handleCreateWhiteboard}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap gap-3 items-center"
            >
              <input
                required
                value={newRoomTitle}
                onChange={(e) => setNewRoomTitle(e.target.value)}
                placeholder="New Study Room Title (e.g. Calculus Chain Rule Peer Session)"
                className="flex-1 min-w-[240px] border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-lg"
              >
                Start Free-Form Whiteboard Room
              </button>
            </form>

            <div className="grid md:grid-cols-3 gap-4">
              {rooms.map((rm) => (
                <Link
                  key={rm.id}
                  href={`/whiteboard/${rm.id}`}
                  className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-5 shadow-sm transition-all"
                >
                  <div className="text-xs font-semibold text-indigo-600">
                    {rm.coursework_title ? `Coursework: ${rm.coursework_title}` : 'Open Peer Study Room'}
                  </div>
                  <div className="font-bold text-slate-900 mt-1">{rm.title}</div>
                  <div className="text-xs text-slate-500 mt-2">
                    {rm.participant_count} participant(s) · Open Canvas →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 9: Public Coursework Resource Bank ── */}
        {activeTab === 'coursework' && (
          <div className="space-y-6">
            <HubToolBanner
              toolKey="coursework"
              activeTopic={currentUnit.title}
              onNavigateTab={setActiveTab}
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicCoursework.length === 0 ? (
                <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
                  No public directory assignments published yet.
                </div>
              ) : (
                publicCoursework.map((cw) => (
                  <Link
                    key={cw.id}
                    href={`/coursework/${cw.id}`}
                    className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-5 shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                        {cw.subject_name}
                      </span>
                      <span className="text-slate-400">{cw.school_name}</span>
                    </div>
                    <h3 className="font-bold text-slate-900">{cw.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-3">{cw.description}</p>
                    <div className="text-xs font-semibold text-indigo-600 mt-3">
                      Open Socratic AI Study Workspace →
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Non-Blocking Account Conversion Modal */}
      {signupModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F5921D] bg-[#F5921D]/10 px-2.5 py-0.5 rounded-full mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 3 Free Trial Queries Completed
                </div>
                <h3 className="font-extrabold text-lg text-[#1E225B]">
                  You&apos;re on a roll! 🔥
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Sign up with Google to save your learning streak, sync flashcards, and unlock unlimited AI tutoring.
                </p>
              </div>
              <button onClick={() => setSignupModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Transparent Trial Breakdown Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-[#249EA0]" /> Free Tier Allowance Rules
              </div>
              <p className="text-[11px] leading-relaxed">
                • <strong>What counts:</strong> Interactive prompts to the Socratic AI Tutor &amp; Code Debugger (3 queries allowed per 24 hours).
              </p>
              <p className="text-[11px] leading-relaxed">
                • <strong>What is unlimited:</strong> Knowledge Maps, Public Flashcards, Practice Quizzes, STEM Grapher, and Discussions are 100% free with no limit.
              </p>
              <p className="text-[11px] leading-relaxed">
                • <strong>Reset time:</strong> Allowance resets every 24 hours, or create a free account right now to continue immediately.
              </p>
            </div>

            {/* Google SSO One-Click Action */}
            <button
              type="button"
              onClick={async () => {
                await api.ssoLogin({
                  provider: 'google',
                  email: 'samira.learner@gmail.com',
                  firstName: 'Samira',
                  lastName: 'Learner',
                });
                window.location.reload();
              }}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl border border-slate-300 shadow-xs transition-all text-xs sm:text-sm"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign up with Google</span>
            </button>

            <div className="relative my-3 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                — OR WITH EMAIL —
              </span>
            </div>

            <form onSubmit={handleQuickSignup} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  placeholder="First Name"
                  value={signupForm.firstName}
                  onChange={(e) => setSignupForm((p) => ({ ...p, firstName: e.target.value }))}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#1E225B]"
                />
                <input
                  required
                  placeholder="Last Name"
                  value={signupForm.lastName}
                  onChange={(e) => setSignupForm((p) => ({ ...p, lastName: e.target.value }))}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#1E225B]"
                />
              </div>
              <input
                required
                type="email"
                placeholder="Email address"
                value={signupForm.email}
                onChange={(e) => setSignupForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#1E225B]"
              />
              <input
                required
                type="password"
                minLength={6}
                placeholder="Password (min 6 chars)"
                value={signupForm.password}
                onChange={(e) => setSignupForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#1E225B]"
              />
              <button
                type="submit"
                className="w-full bg-[#1E225B] hover:bg-[#141740] text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition-colors"
              >
                Create Free Account
              </button>
            </form>
            <div className="text-center text-xs text-slate-500 pt-1">
              Already have an account?{' '}
              <Link href="/login" className="text-[#1E225B] font-bold hover:underline">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Join School via Invite Code Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Join a School with Invite Code</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Migrate your Hub profile into an enrolled school section while keeping your XP, streaks, and flashcard decks intact!
                </p>
              </div>
              <button onClick={() => setInviteModalOpen(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRedeemInvite} className="space-y-3">
              <input
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="e.g. HORIZON-2026"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm uppercase font-mono"
              />
              <button
                type="submit"
                disabled={inviteBusy}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50"
              >
                {inviteBusy ? 'Enrolling...' : 'Redeem Code & Enroll'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Sleek Compact In-App Bottom Navigation Dock ── */}
      <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2.5 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('sandbox')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 ${
                activeTab === 'sandbox' ? 'bg-[#1E225B] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Socratic Tutor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('flashcards')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 ${
                activeTab === 'flashcards' ? 'bg-[#1E225B] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Flashcards</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('concepts')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 ${
                activeTab === 'concepts' ? 'bg-[#1E225B] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Knowledge Map</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quizzes')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 ${
                activeTab === 'quizzes' ? 'bg-[#1E225B] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Practice Quizzes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('whiteboards')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 ${
                activeTab === 'whiteboards' ? 'bg-[#1E225B] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Whiteboards</span>
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-auto text-xs">
            {user ? (
              <span className="text-[11px] text-slate-500">
                Logged in as <strong className="text-[#1E225B]">{user.firstName}</strong>
              </span>
            ) : (
              <Link href="/login" className="text-[#1E225B] font-bold hover:underline flex items-center gap-1">
                <span>Sign In to Save Progress</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
