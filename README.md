# GuruMera v3.0 — *Discover the Why!* | Multi-Tenant Educational Platform & Public Socratic Learning Hub

Enterprise-grade academic management system with a defense-in-depth Socratic AI tutoring engine and an open Public Learning Hub. Built with **Next.js 16**, **NestJS 12**, **Python FastAPI**, and **PostgreSQL 16 Row-Level Security**.

---

## About GuruMera

### What is GuruMera?
**GuruMera** (*"Discover the Why!"*) is an intelligent educational platform designed both for **schools & academies** and for **independent self-learners worldwide**. At its core, it pairs multi-campus academic administration with a dedicated, pedagogical **Socratic AI Tutor** and a **Universal Public Learning Hub**.

Unlike conventional AI tools that generate answers or write essays on demand, GuruMera embeds the classical **Socratic Method** into every workflow. It engages learners through guided inquiry, progressive clues, thought-provoking questions, interactive math graphing, and concept-mapping checkpoints—building lasting problem-solving habits while actively preventing academic dishonesty.

---

### Purpose & Vision
In the era of generative AI, classrooms face a growing dilemma: students frequently treat chatbots as instant "homework solvers," bypassing foundational thinking. At the same time, motivated independent learners lack structured, interactive guidance outside enrolled classrooms.

GuruMera addresses both needs:
1. **Restore Active Learning**: Provide a 24/7 study coach that challenges, hints, and probes misconceptions without giving away final solutions.
2. **Empower Institutions & Educators**: Give schools a secure, multi-tenant digital campus where coursework, rubrics, study decks, collaborative whiteboards, and AI session auditing coexist cleanly.
3. **Open Universal Access**: Offer an instant Public Learning Hub (`/hub`), live 2-hour *"Try as a Teacher"* simulator (`/try-teacher`), and self-serve school onboarding (`/schools`), allowing learners to carry streaks, XP, and flashcards seamlessly into any school later via Invite Code.

---

### Who Are the Intended Users?

* **🏫 School & Academy Administrators**: Configure campuses, academic years, classes, sections, and subjects; manage rosters (individually or via bulk CSV); and issue school Invite Codes (`/admin`).
* **👩‍🏫 Teachers & Educators**: Publish coursework (`PRIVATE`, `UNLISTED`, or shared in the `PUBLIC_DIRECTORY`), attach grading rubrics and AI strictness rules, auto-generate editable Socratic flashcard decks from rubrics, launch collaborative assignment whiteboards, grade work, and inspect student-AI chat transcripts (`/teacher`).
* **🎓 Enrolled School Students**: Manage deadlines, open coursework-linked Socratic tutors, collaborate on shared study whiteboards, and submit timed quizzes or assignments (`/student`).
* **🌍 Independent & Public Learners**: Explore public flashcards, Socratic tutoring, code debugging, concept knowledge trees, practice quizzes, and STEM graphing immediately—starting anonymously for quick exploration or saving long-term streaks with a free account (`/hub`).
* **👨‍👩‍👧 Parents & Guardians**: Monitor their children's upcoming assignments, submission status, grades, and teacher feedback in a dedicated read-only portal (`/parent`).
* **🌐 Platform / Super Administrators**: Oversee onboarded schools, review incoming school interest leads, and monitor platform-wide AI safety metrics (`/super-admin`).

---

### What Can It Do?

* **7-Tool Public Learning Hub (`/hub`)**:
  1. **Socratic Subject Sandbox**: Guided discovery across *Elementary*, *High School*, and *AP/Undergrad* depths with *Guided Explanation*, *Check My Logic*, and *Toy Problem* modes.
  2. **Socratic Code Debugger**: Helps learners locate bugs in Python, JavaScript, C++, or Java via edge-case tracing rather than handing out copy-paste fixes.
  3. **2-Tier Socratic Flashcards (SM-2)**: Progressive 2-clue reveal cards scheduled using spaced repetition, auto-generated from either an assignment rubric or any learner-chosen topic.
  4. **Concept Knowledge Maps**: Prerequisite topic trees where learners unlock advanced subjects by passing short Socratic conceptual checkpoints.
  5. **Ungraded Practice Quizzes & Misconception Debriefs**: Self-diagnostic quizzes separated from school gradebooks, paired with AI explanations of *why* incorrect choices seemed tempting.
  6. **Interactive STEM Function Grapher**: Plot and compare curves visually and send equations directly to the Socratic tutor for slope and root analysis.
  7. **Peer Discussion Boards & Collaborative Whiteboards**: Moderated community Q&A alongside shared real-time drawing and sticky-note whiteboards (`/whiteboard/[roomId]`).
* **Strict "Zero Direct Solutions" AI Guardrails**: Automatically detects prompt-injection attempts and direct answer requests, deflecting them into constructive guiding questions.
* **Ephemeral *"Try as a Teacher"* Simulator (`/try-teacher`)**: Zero-signup 2-hour sandbox preloaded with sample physics coursework and simulated student test prompts so educators can test AI guardrails live.
* **6-Step Self-Serve School Onboarding (`/schools`)**: Atomic guided setup creating a school workspace, campus, administrator login, initial class/section/subject, and student Invite Code in one workflow.

---

### Available Options & Modes

#### 1. Per-Assignment AI Guidance Modes
* **Socratic Strict (Default)**: Pure guided questioning using analogies and conceptual prompts; blocks equations, final answers, and spoiler code blocks.
* **Hints Only**: Structured progressive hints capped cleanly per cycle while requiring the student to complete reasoning steps.
* **Terminology Only**: Vocabulary and definition clarification only—ideal for quizzes and exam review.
* **Disabled**: Turns off AI tutoring completely for independent evaluations.

#### 2. Coursework Sharing Scopes
* **Private**: Visible strictly to students enrolled in the assigned section.
* **Unlisted**: Shareable via direct URL without appearing in public listings; private teacher notes and school submissions remain hidden.
* **Public Directory**: Published into the Public Hub Resource Bank for learners everywhere.

#### 3. Configurable AI Providers
Supports **Google Gemini**, **OpenAI**, and a deterministic **Offline Mock Engine** for local testing or zero-cost demos.

---

### How It Works (The Educational Journey)

```
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│  1. Public Hub / Setup  │       │ 2. Coursework & Decks   │       │   3. Socratic Tutoring  │
│ Learn freely on /hub OR │ ────▶ │ Teacher sets prompt,    │ ────▶ │ Learner explores hints, │
│ redeem School Invite to │       │ rubric, AI strictness & │       │ flashcards, concepts, & │
│ join a campus classroom │       │ auto-generated decks    │       │ peer whiteboards safely │
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
                                                                                 │
                                                                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│   5. Parent Oversight   │       │   4. Review & Grading   │       │  3b. AI Audit Console   │
│ Parents track grades,   │ ◀──── │ Teacher grades work &   │ ◀──── │ Teacher reviews chat    │
│ feedback, & deadlines   │       │ returns feedback to the │       │ transcripts to identify │
│ in real time.           │       │ student portal.         │       │ common misconceptions.  │
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
```

1. **Discover or Enroll**: Independent learners start immediately on `/hub`, while schools onboard via `/schools` or `/super-admin`. Learners joining a school later redeem an Invite Code (e.g., `HORIZON-2026`) without losing streaks or flashcards.
2. **Design & Publish**: Teachers create assignments, define rubrics, adjust AI strictness, and optionally generate an editable 2-tier flashcard deck or open a linked whiteboard room.
3. **Socratic Exploration**: Students and independent learners work through concepts using Socratic dialogue, code tracing, practice quizzes with misconception debriefs, and collaborative boards.
4. **Assess & Coach**: Teachers review submissions, inspect flagged AI audit interactions, assign rubric scores, and share feedback—while parents track progress in real time.

---

### Summary of Benefits

| For Schools & Academies | For Teachers | For Students & Self-Learners | For Parents |
| :--- | :--- | :--- | :--- |
| • Multi-tenant data isolation<br>• Self-serve 6-step onboarding<br>• Invite-code student funnel | • Granular AI strictness per task<br>• Auto-generated Socratic decks<br>• Live guardrail preview sandbox | • 24/7 Socratic coaching & code debug<br>• Spaced repetition, XP streaks & DAG maps<br>• Free public study bank | • Real-time deadline & grade visibility<br>• Transparent teacher feedback<br>• Academic integrity assurance |

---

## Architecture

```
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────────────────┐
│   Next.js 15+   │────▶│  NestJS API Gateway │────▶│  Python FastAPI AI Gateway   │
│   Web Frontend  │     │  (Port 3000)         │     │  (Port 8000)                 │
│   (Port 3001)   │     │                      │     │                              │
│  /login         │     │  JWT + RBAC Guards   │     │  5-Layer Defense Pipeline:   │
│  /admin         │     │  RLS Tenant Context  │     │  1. Pre-Sanitization         │
│  /teacher       │     │  Redis Rate Limiting │     │  2. Intent Classification    │
│  /student       │     │  AI Session Proxy    │     │  3. Context Injection        │
└─────────────────┘     └─────────────────────┘     │  4. Low-Temp LLM Inference   │
                                  │                  │  5. Output Verification      │
                         ┌────────┴────────┐         └──────────────────────────────┘
                         │  PostgreSQL 16  │
                         │  (RLS Policies) │
                         │  Redis 7        │
                         └─────────────────┘
```

## Quick Start (Local Development)

### Prerequisites
- **Node.js 22+** · **Python 3.12+** · **PostgreSQL 16** · **Redis 7**
- Or: **Docker Desktop** (for one-command setup)

---

### Option A — Docker Compose (Recommended)

```bash
# 1. Copy env file
cp .env.example .env

# 2. Start all services (Postgres, Redis, AI Gateway, API Gateway, Web)
docker compose up
```

Access the app at **http://localhost:3001**

---

### Option B — Manual Local Setup

**Step 1: Database**
```bash
psql -U postgres -c "CREATE USER edusocrates WITH PASSWORD 'socrates_password';"
psql -U postgres -c "CREATE DATABASE edusocrates_dev OWNER edusocrates;"
psql -U edusocrates -d edusocrates_dev -f database/schema.sql
psql -U edusocrates -d edusocrates_dev -f database/seed.sql
```

**Step 2: AI Gateway (Python FastAPI)**
```bash
cd services/ai-gateway
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
> OpenAPI Docs: http://localhost:8000/docs

**Step 3: API Gateway (NestJS)**
```bash
cd services/api-gateway
npm install
npm run start:dev
```

**Step 4: Web Frontend (Next.js)**
```bash
cd services/web
npm install
npm run dev
```
> Open: http://localhost:3000

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| School Admin | admin@horizon.edu | Password123! |
| Teacher | teacher.physics@horizon.edu | Password123! |
| Student | alex.chen@horizon.edu | Password123! |

---

## LLM Provider Configuration

Set in `.env` or `services/ai-gateway/.env`:

| Provider | Config |
|----------|--------|
| **Mock (default)** | `DEFAULT_PROVIDER=mock` — No API key needed, deterministic Socratic responses |
| **Google Gemini** | `DEFAULT_PROVIDER=gemini` · `GEMINI_API_KEY=your_key` |
| **OpenAI** | `DEFAULT_PROVIDER=openai` · `OPENAI_API_KEY=your_key` |

---

## Socratic AI Guardrails (5 Layers)

```
Student Input ──▶ [L1: Regex Sanitizer] ──▶ [L2: Intent Classifier]
                          │                          │
                     BLOCKED ──▶ Safe Redirect   EXPLOIT ──▶ Safe Redirect
                          │
                     SAFE ──▶ [L3: Context Injection] ──▶ [L4: LLM Inference]
                                                                    │
                                                          [L5: Output Verifier]
                                                                    │
                                                         ┌──────────┴──────────┐
                                                     SAFE stream          INTERCEPT
                                                    to student         Safe Redirect
                                                                      + Audit Log
```

**Rate Limiting**: 15 queries per hour per student per subject session.

---

## Project Structure

```
EduSocrates/
├── database/
│   ├── schema.sql          # PostgreSQL 16 DDL + RLS policies
│   └── seed.sql            # Demo data (2 tenants, campuses, users, coursework)
├── services/
│   ├── ai-gateway/         # Python FastAPI — Socratic AI orchestration
│   │   ├── app/
│   │   │   ├── guardrails/ # 5-layer pipeline
│   │   │   ├── pii/        # PII redaction engine
│   │   │   ├── prompts/    # Socratic prompt builder
│   │   │   ├── services/   # LLM provider abstraction
│   │   │   └── routers/    # /api/v1/ai/* endpoints
│   │   └── tests/          # 11 guardrail unit tests
│   ├── api-gateway/        # NestJS — REST API + JWT + RBAC
│   │   └── src/
│   │       ├── auth/       # JWT auth, Passport, RBAC guards
│   │       ├── database/   # Postgres pool + RLS context injection
│   │       ├── admin/      # Campuses, classes, sections, subjects
│   │       ├── coursework/ # Coursework CRUD + submission + grading
│   │       └── ai-proxy/   # AI Gateway proxy + token quota (15/hr)
│   └── web/                # Next.js 15+ App Router
│       ├── app/
│       │   ├── (auth)/login/   # Login with demo account buttons
│       │   ├── admin/          # School admin dashboard
│       │   ├── teacher/        # Coursework creation, grading, AI audit console
│       │   └── student/        # Assigned coursework, Socratic chat, submission
│       └── components/
│           └── SocraticChatStream.tsx   # Real-time SSE chat with guardrail indicator
├── docker-compose.yml      # Full-stack orchestration
└── .env.example
```

---

## Running Tests

```bash
# AI Guardrail Unit Tests (11 tests)
cd services/ai-gateway
python -m pytest tests/ -v
```

---

## Multi-Tenancy Verification

The system uses **PostgreSQL Row-Level Security** with session-scoped tenant context:

```sql
-- Injected per-request:
SET LOCAL app.current_tenant_id = '<school_uuid>';

-- RLS policy (example):
CREATE POLICY tenant_isolation ON coursework
  FOR ALL USING (school_id = current_setting('app.current_tenant_id')::UUID);
```

Tenant A data is completely invisible to Tenant B users — enforced at the database layer.

