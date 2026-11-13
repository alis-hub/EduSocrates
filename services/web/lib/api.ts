// API client — calls the NestJS API Gateway
function getApiBase(): string {
  let url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1').trim().replace(/\/+$/, '');
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`;
  }
  return url;
}
const API_BASE = getApiBase();

export function getApiBaseUrl(): string {
  return API_BASE;
}

export function getWsBaseUrl(): string {
  if (API_BASE.startsWith('https://')) return API_BASE.replace(/^https:\/\//, 'wss://');
  if (API_BASE.startsWith('http://')) return API_BASE.replace(/^http:\/\//, 'ws://');
  return API_BASE;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('edusocrates_token');
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

/** Set auth cookie readable by Next.js middleware (edge runtime). */
function setAuthCookie(token: string) {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24; // 1 day in seconds
  document.cookie = `edusocrates_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/** Clear the auth cookie. */
function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'edusocrates_token=; path=/; max-age=0; SameSite=Lax';
}

export function setStoredAuth(accessToken: string, user: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('edusocrates_token', accessToken);
  localStorage.setItem('edusocrates_user', JSON.stringify(user));
  setAuthCookie(accessToken);
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────── //
  login: async (email: string, password: string) => {
    const res = await apiFetch<{ accessToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredAuth(res.accessToken, res.user);
    return res;
  },

  publicSignup: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const res = await apiFetch<{ accessToken: string; user: any }>('/auth/public-signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredAuth(res.accessToken, res.user);
    return res;
  },

  ssoLogin: async (data: {
    provider: 'google' | 'linkedin';
    email: string;
    firstName?: string;
    lastName?: string;
  }) => {
    const res = await apiFetch<{ accessToken: string; user: any; tenantRouted?: boolean }>(
      '/auth/sso',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
    setStoredAuth(res.accessToken, res.user);
    return res;
  },

  redeemInvite: async (inviteCode: string) => {
    const res = await apiFetch<{ accessToken: string; user: any; schoolName: string }>(
      '/auth/redeem-invite',
      {
        method: 'POST',
        body: JSON.stringify({ inviteCode }),
      },
    );
    setStoredAuth(res.accessToken, res.user);
    return res;
  },

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    schoolId: string;
    campusId?: string;
  }) =>
    apiFetch<{ id: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ── Admin — Campuses ──────────────────────────────────────────────────── //
  getCampuses: () => apiFetch<any[]>('/admin/campuses'),
  createCampus: (data: { name: string; address?: string }) =>
    apiFetch('/admin/campuses', { method: 'POST', body: JSON.stringify(data) }),

  // ── Admin — Classes ───────────────────────────────────────────────────── //
  getClasses: () => apiFetch<any[]>('/admin/classes'),
  createClass: (data: { campusId: string; name: string; code: string }) =>
    apiFetch('/admin/classes', { method: 'POST', body: JSON.stringify(data) }),

  // ── Admin — Sections ──────────────────────────────────────────────────── //
  getSections: () => apiFetch<any[]>('/admin/sections'),
  createSection: (data: { classId: string; name: string; capacity?: number }) =>
    apiFetch('/admin/sections', { method: 'POST', body: JSON.stringify(data) }),

  // ── Admin — Subjects ──────────────────────────────────────────────────── //
  getSubjects: () => apiFetch<any[]>('/admin/subjects'),
  createSubject: (data: { classId: string; name: string; code: string }) =>
    apiFetch('/admin/subjects', { method: 'POST', body: JSON.stringify(data) }),

  // ── Admin — Stats ─────────────────────────────────────────────────────── //
  getAdminStats: () => apiFetch<any>('/admin/stats'),

  // ── Admin — Academic Years ────────────────────────────────────────────── //
  getAcademicYears: () => apiFetch<any[]>('/admin/academic-years'),
  createAcademicYear: (data: { name: string; startDate: string; endDate: string }) =>
    apiFetch('/admin/academic-years', { method: 'POST', body: JSON.stringify(data) }),

  // ── Admin — Enrollments ───────────────────────────────────────────────── //
  getEnrollments: () => apiFetch<any[]>('/admin/enrollments'),
  createEnrollment: (data: { studentId: string; sectionId: string; academicYearId: string }) =>
    apiFetch('/admin/enrollments', { method: 'POST', body: JSON.stringify(data) }),
  deleteEnrollment: (id: string) =>
    apiFetch(`/admin/enrollments/${id}`, { method: 'DELETE' }),

  // ── Admin — Allocations ───────────────────────────────────────────────── //
  getAllocations: () => apiFetch<any[]>('/admin/allocations'),
  createAllocation: (data: { teacherId: string; subjectId: string; sectionId: string }) =>
    apiFetch('/admin/allocations', { method: 'POST', body: JSON.stringify(data) }),
  deleteAllocation: (id: string) =>
    apiFetch(`/admin/allocations/${id}`, { method: 'DELETE' }),

  // ── Admin — Users ─────────────────────────────────────────────────────── //
  getUsers: () => apiFetch<any[]>('/admin/users'),
  createUser: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    campusId?: string;
  }) => apiFetch('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  deactivateUser: (id: string) =>
    apiFetch(`/admin/users/${id}/deactivate`, { method: 'PATCH' }),

  /** Bulk user provisioning — CSV rows parsed client-side, sent as array. */
  bulkCreateUsers: (users: any[]) =>
    apiFetch<{ created: number; failed: any[] }>('/admin/users/bulk', {
      method: 'POST',
      body: JSON.stringify({ users }),
    }),

  // ── Admin — Parent Associations ───────────────────────────────────────── //
  getParentAssociations: () => apiFetch<any[]>('/admin/parent-associations'),
  createParentAssociation: (data: { parentId: string; studentId: string; relationshipType?: string }) =>
    apiFetch('/admin/parent-associations', { method: 'POST', body: JSON.stringify(data) }),
  deleteParentAssociation: (id: string) =>
    apiFetch(`/admin/parent-associations/${id}`, { method: 'DELETE' }),

  // ── Teacher ───────────────────────────────────────────────────────────── //
  getTeacherCoursework: () => apiFetch<any[]>('/teacher/coursework'),
  getSubmissions: (courseworkId: string) =>
    apiFetch<any[]>(`/teacher/coursework/${courseworkId}/submissions`),
  gradeSubmission: (submissionId: string, data: { score: number; teacherFeedback?: string }) =>
    apiFetch(`/teacher/submissions/${submissionId}/grade`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getAuditLog: (limit = 50, filters: { courseworkId?: string; flaggedOnly?: boolean } = {}) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (filters.courseworkId) params.set('courseworkId', filters.courseworkId);
    if (filters.flaggedOnly) params.set('flaggedOnly', 'true');
    return apiFetch<any>(`/teacher/analytics/ai-audit?${params}`);
  },
  createCoursework: (data: any) =>
    apiFetch('/coursework', { method: 'POST', body: JSON.stringify(data) }),
  getAiTranscripts: (courseworkId: string) =>
    apiFetch<any[]>(`/teacher/coursework/${courseworkId}/ai-transcripts`),
  getSessionMessages: (sessionId: string) =>
    apiFetch<any>(`/teacher/ai-sessions/${sessionId}/messages`),

  // ── Student ───────────────────────────────────────────────────────────── //
  /** Get student's coursework with optional status and subjectId filters. */
  getStudentCoursework: (filters: { status?: string; subjectId?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.subjectId) params.set('subjectId', filters.subjectId);
    const qs = params.toString() ? `?${params}` : '';
    return apiFetch<any[]>(`/student/coursework${qs}`);
  },
  submitCoursework: (data: { courseworkId: string; submissionText?: string; attachmentUrls?: string[] }) =>
    apiFetch('/student/submissions', { method: 'POST', body: JSON.stringify(data) }),

  // ── AI ────────────────────────────────────────────────────────────────── //
  startAiSession: (courseworkId: string) =>
    apiFetch<{ session_id: string; subjectId?: string }>('/ai/session/start', {
      method: 'POST',
      body: JSON.stringify({ courseworkId }),
    }),

  // ── Parent ────────────────────────────────────────────────────────────── //
  /** Returns the list of children linked to the authenticated parent. */
  getMyChildren: () => apiFetch<any[]>('/parent/children'),
  /** Returns read-only coursework+grades for a specific child (parent must be linked). */
  getChildCoursework: (studentId: string) =>
    apiFetch<any[]>(`/parent/children/${studentId}/coursework`),

  // ── Super Admin ───────────────────────────────────────────────────────── //
  superAdmin: {
    getStats: () => apiFetch<any>('/super-admin/stats'),
    getSchools: () => apiFetch<any[]>('/super-admin/schools'),
    createSchool: (data: { name: string; slug: string; domain?: string }) =>
      apiFetch('/super-admin/schools', { method: 'POST', body: JSON.stringify(data) }),
    updateSchoolStatus: (id: string, status: 'ACTIVE' | 'SUSPENDED') =>
      apiFetch(`/super-admin/schools/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    getAiAudit: (limit = 100) =>
      apiFetch<any>(`/super-admin/ai-audit?limit=${limit}`),
    getLeads: () => apiFetch<{ leads: any[] }>('/super-admin/leads'),
    updateLeadStatus: (id: string, status: string) =>
      apiFetch(`/super-admin/leads/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // ── Admin Invites ─────────────────────────────────────────────────────── //
  getAdminInvites: () => apiFetch<{ invites: any[] }>('/admin/invites'),
  createAdminInvite: (data: {
    inviteCode?: string;
    sectionId?: string;
    targetRole?: string;
    maxUses?: number;
  }) => apiFetch('/admin/invites', { method: 'POST', body: JSON.stringify(data) }),

  // ── Teacher Visibility & Public Coursework ────────────────────────────── //
  updateCourseworkVisibility: (
    id: string,
    data: { accessLevel?: string; isPublic?: boolean; socraticSystemPromptOverride?: string },
  ) =>
    apiFetch(`/teacher/coursework/${id}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getPublicCoursework: (subject?: string) => {
    const qs = subject ? `?subject=${encodeURIComponent(subject)}` : '';
    return apiFetch<any[]>(`/public/coursework${qs}`);
  },
  getPublicCourseworkById: (id: string) => apiFetch<any>(`/public/coursework/${id}`),

  // ── Universal Public Learning Hub & Onboarding ────────────────────────── //
  hub: {
    getPublicSchools: () => apiFetch<{ schools: any[] }>('/public/schools'),
    submitSchoolLead: (data: {
      requesterEmail: string;
      schoolName: string;
      campusCity: string;
      roleType: string;
    }) => apiFetch('/leads/school-inquiry', { method: 'POST', body: JSON.stringify(data) }),
    onboardingWizard: async (data: {
      schoolName: string;
      domain?: string;
      adminEmail: string;
      adminPassword: string;
      adminFirstName: string;
      adminLastName: string;
      campusName: string;
      campusCity: string;
      className: string;
      academicYear?: string;
      sectionName?: string;
      subjectName: string;
      inviteCode?: string;
    }) => {
      const res = await apiFetch<{ accessToken: string; user: any; provisioned: any }>(
        '/onboarding/wizard',
        { method: 'POST', body: JSON.stringify(data) },
      );
      setStoredAuth(res.accessToken, res.user);
      return res;
    },

    // Try-as-a-Teacher Sandbox
    startTeacherSandbox: () => apiFetch<any>('/sandbox/teacher/start', { method: 'POST' }),
    getTeacherSandbox: (token: string) => apiFetch<any>(`/sandbox/teacher/${token}`),
    updateTeacherSandbox: (token: string, data: any) =>
      apiFetch<any>(`/sandbox/teacher/${token}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    // Flashcards
    getDecks: (filters: { courseworkId?: string; subjectArea?: string } = {}) => {
      const params = new URLSearchParams();
      if (filters.courseworkId) params.set('courseworkId', filters.courseworkId);
      if (filters.subjectArea) params.set('subjectArea', filters.subjectArea);
      const qs = params.toString() ? `?${params}` : '';
      return apiFetch<{ decks: any[] }>(`/hub/flashcards/decks${qs}`);
    },
    getDeckById: (deckId: string) => apiFetch<{ deck: any; cards: any[] }>(`/hub/flashcards/decks/${deckId}`),
    generateFlashcards: (data: {
      topic?: string;
      subjectArea?: string;
      courseworkId?: string;
      assignmentTitle?: string;
      assignmentDescription?: string;
      rubric?: string;
      cardCount?: number;
      saveDeck?: boolean;
      isPublic?: boolean;
    }) => apiFetch<any>('/hub/flashcards/generate', { method: 'POST', body: JSON.stringify(data) }),
    createDeck: (data: {
      title: string;
      subjectArea: string;
      courseworkId?: string;
      isPublic?: boolean;
      cards: Array<{
        conceptTitle: string;
        clueTier1: string;
        clueTier2: string;
        terminalDefinition: string;
      }>;
    }) => apiFetch<any>('/hub/flashcards/decks', { method: 'POST', body: JSON.stringify(data) }),
    reviewCard: (cardId: string, quality: number) =>
      apiFetch<any>('/hub/flashcards/review', {
        method: 'POST',
        body: JSON.stringify({ cardId, quality }),
      }),

    // Concept Maps (DAG)
    getConceptNodes: (domain?: string) => {
      const qs = domain ? `?domain=${encodeURIComponent(domain)}` : '';
      return apiFetch<{ nodes: any[] }>(`/hub/concepts/nodes${qs}`);
    },
    evaluateConcept: (nodeId: string, studentAnswer: string) =>
      apiFetch<any>('/hub/concepts/evaluate', {
        method: 'POST',
        body: JSON.stringify({ nodeId, studentAnswer }),
      }),

    // Practice Quizzes
    getQuizzes: (subject?: string) => {
      const qs = subject ? `?subject=${encodeURIComponent(subject)}` : '';
      return apiFetch<{ quizzes: any[] }>(`/hub/quizzes${qs}`);
    },
    getQuizById: (quizId: string) => apiFetch<{ quiz: any; questions: any[] }>(`/hub/quizzes/${quizId}`),
    generateQuiz: (data: {
      subject: string;
      topic?: string;
      difficultyLevel?: string;
      questionCount?: number;
      courseworkId?: string;
      courseworkDescription?: string;
    }) => apiFetch<{ quiz: any; questions: any[] }>('/hub/quizzes/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    submitQuizAttempt: (quizId: string, selectedAnswers: Record<string, number>) =>
      apiFetch<any>(`/hub/quizzes/${quizId}/attempt`, {
        method: 'POST',
        body: JSON.stringify({ selectedAnswers }),
      }),

    // Discussions
    getThreads: (subjectTag?: string) => {
      const qs = subjectTag ? `?subjectTag=${encodeURIComponent(subjectTag)}` : '';
      return apiFetch<{ threads: any[] }>(`/hub/discussions/threads${qs}`);
    },
    getThreadById: (threadId: string) =>
      apiFetch<{ thread: any; replies: any[] }>(`/hub/discussions/threads/${threadId}`),
    createThread: (data: {
      title: string;
      body: string;
      subjectTag?: string;
      isPublic?: boolean;
      askAiGuide?: boolean;
    }) => apiFetch<{ thread: any; replies: any[] }>('/hub/discussions/threads', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    createReply: (threadId: string, data: { replyBody: string; summonAiGuide?: boolean }) =>
      apiFetch<{ reply: any; aiReply?: any }>(`/hub/discussions/threads/${threadId}/replies`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // Whiteboards
    getWhiteboardRooms: (courseworkId?: string) => {
      const qs = courseworkId ? `?courseworkId=${encodeURIComponent(courseworkId)}` : '';
      return apiFetch<{ rooms: any[] }>(`/hub/whiteboard/rooms${qs}`);
    },
    createWhiteboardRoom: (data: { title: string; courseworkId?: string; isPublic?: boolean }) =>
      apiFetch<{ room: any }>('/hub/whiteboard/session/create', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getWhiteboardRoom: (roomId: string) => apiFetch<{ room: any }>(`/hub/whiteboard/${roomId}`),
    updateWhiteboardState: (roomId: string, canvasState: { strokes: any[]; notes: any[] }) =>
      apiFetch<any>(`/hub/whiteboard/${roomId}`, {
        method: 'PUT',
        body: JSON.stringify({ canvasState }),
      }),

    // Gamification
    getGamificationProfile: () => apiFetch<any>('/hub/gamification/profile'),
    recordActivity: (xpDelta = 10, badgeCode?: string) =>
      apiFetch<any>('/hub/gamification/record-activity', {
        method: 'POST',
        body: JSON.stringify({ xpDelta, badgeCode }),
      }),
  },
};


export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('edusocrates_user');
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem('edusocrates_token');
  localStorage.removeItem('edusocrates_user');
  clearAuthCookie();
  window.location.href = '/login';
}
