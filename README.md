# GuruMera — *Discover the Why!* | Multi-Tenant Educational Platform & Public Socratic Learning Hub

Enterprise-grade academic management system with a defense-in-depth Socratic AI tutoring engine, an open Public Learning Hub, an institutional academy management suite, and a dedicated parent oversight portal. Built with **Next.js 16.3 (Turbopack)**, **NestJS 12**, **Python FastAPI**, **PostgreSQL 16 (Row-Level Security)**, and **Redis 7**.

---

## Table of Contents
1. [About GuruMera](#about-gurumera)
   - [What is GuruMera?](#what-is-gurumera)
   - [Why GuruMera Was Founded](#why-gurumera-was-founded)
   - [The Educational Problem We Are Solving](#the-educational-problem-we-are-solving)
   - [Our Learning Philosophy](#our-learning-philosophy)
   - [Pedagogical Principles](#pedagogical-principles)
   - [Approach to Responsible AI](#approach-to-responsible-ai)
   - [Team & Leadership](#team--leadership)
   - [Upcoming Educational Capabilities Roadmap](#upcoming-educational-capabilities-roadmap)
2. [Core Portals & Capabilities](#core-portals--capabilities)
   - [Universal Public Learning Hub (`/hub`)](#universal-public-learning-hub-hub)
   - [Parent Module & Guardian Portal (`/parents`, `/parent`, `/parent-demo`)](#parent-module--guardian-portal-parents-parent-parent-demo)
   - [Institutional Suite & School Onboarding (`/schools`, `/school-demo`)](#institutional-suite--school-onboarding-schools-school-demo)
   - [Teacher Experience & Ephemeral Sandbox (`/teacher`, `/try-teacher`)](#teacher-experience--ephemeral-sandbox-teacher-try-teacher)
   - [Student Learning Experience (`/student`, `/coursework/[id]`)](#student-learning-experience-student-courseworkid)
   - [Enhanced Authentication & SSO (`/login`, `/signup`)](#enhanced-authentication--sso-login-signup)
3. [Socratic AI Guardrails (5-Layer Defense-in-Depth Pipeline)](#socratic-ai-guardrails-5-layer-defense-in-depth-pipeline)
4. [System Architecture](#system-architecture)
5. [Database Architecture & Production Migrations](#database-architecture--production-migrations)
6. [Quick Start (Local Development)](#quick-start-local-development)
7. [Demo Accounts & Interactive Sandboxes](#demo-accounts--interactive-sandboxes)
8. [LLM Provider Configuration](#llm-provider-configuration)
9. [Project Structure](#project-structure)
10. [Testing & Verification](#testing--verification)

---

## About GuruMera

### What is GuruMera?
**GuruMera** (*"Discover the Why!"*) is an intelligent educational platform designed both for **schools & academies** and for **independent self-learners worldwide**. At its core, it pairs multi-campus academic administration with a dedicated, pedagogical **Socratic AI Tutor** and a **Universal Public Learning Hub**.

Unlike conventional AI tools that generate answers or write essays on demand, GuruMera embeds the classical **Socratic Method** into every workflow. It engages learners through guided inquiry, progressive clues, thought-provoking questions, interactive math graphing, and concept-mapping checkpoints—building lasting problem-solving habits while actively preventing academic dishonesty.

---

### Why GuruMera Was Founded
With the rapid emergence of generative AI, classrooms faced an acute dilemma: students began treating conversational LLMs as instant homework solvers. Rather than working through challenging concepts, learners received direct copy-paste solutions, essays, and code. This created an acute **cognitive bypass**—homework grades appeared immaculate, yet foundational retention collapsed and the joy of genuine discovery evaporated.

GuruMera was founded to turn generative AI from a passive answer vending machine into a **patient, wise Socrates**—an educational AI tutor that refuses to spoil answers, defends academic integrity, and guides learners step-by-step through guided inquiry.

---

### The Educational Problem We Are Solving
1. **Cognitive Bypass & Cheating**: Standard conversational AI bypasses the "productive struggle" required for deep cognitive wiring.
2. **The 2-Sigma Tutoring Inequality**: 1-on-1 human tutoring yields transformative two-standard-deviation improvements (Bloom's 2 Sigma), but remains prohibitively expensive for most families.
3. **The Teacher "Black Box"**: Educators are blind to where students stumble during independent study at home until test day.
4. **Disconnected Systems**: Fragmentation between open exploration for self-learners, formal institutional school administration, and parent oversight.

---

### Our Learning Philosophy
GuruMera is anchored in three foundational cognitive principles:
1. **Understand before memorizing**: Facts and formulas evaporate without conceptual grounding. True mastery requires understanding the *why* and first principles before committing methods to memory. When a learner truly understands, they can reconstruct answers from scratch.
2. **Think before answering**: Speed is not the measure of intellectual capability. We foster deliberate pause, hypothesis testing, and dialectical reasoning—encouraging learners to examine their assumptions before reaching a conclusion.
3. **Master through practice**: Durable knowledge is forged through active, deliberate application. Spaced repetition, adaptive toy problems, and iterative debugging transform passive familiarity into permanent, intuitive capability.

---

### Pedagogical Principles
* **Classical Socratic Dialectic**: Guiding inquiries via progressive hints, counter-questions, and analogies rather than declarative lectures.
* **Zone of Proximal Development (ZPD)**: Scaffolding hints dynamically based on student comprehension level (*Elementary*, *High School*, *AP/Undergraduate*).
* **Productive Struggle & Metacognition**: Protecting the cognitive friction where genuine learning happens and training students to monitor their own problem-solving processes.
* **Dual Coding & Multi-Modal Interaction**: Pairing Socratic dialogue with interactive STEM function graphing, prerequisite knowledge trees, and 2-tier spaced repetition flashcards.

---

### Approach to Responsible AI
* **Defense-in-Depth Guardrails**: Multi-layer server-side input and output filtering that detects prompt injections and strictly deflects direct solution demands.
* **Zero Direct Solutions Policy**: Absolute refusal to supply answers, code solutions, or pre-written essays.
* **FERPA & COPPA Privacy by Design**: Student data is never used to train public foundation models, never monetized, and strictly isolated via PostgreSQL Row-Level Security.
* **Server-Side Answer-Key Shielding**: Rubrics and answer keys are cloaked server-side and never exposed to client-side prompt manipulation.
* **Human-in-the-Loop Transparency**: Comprehensive audit transcripts and injection alert metrics provided directly to teachers and administrators.

---

### Team & Leadership
* **Pedagogical Leadership**: Experienced educators specializing in curriculum scaffolding, assessment rubrics, and Vygotskian learning frameworks.
* **AI Safety & Engineering**: Systems architects and machine learning engineers focused on low-latency inference, defensive prompting, and multi-tier guardrails.
* **Product & Institutional Partnerships**: Domain specialists partnering with school academies, teachers, and parents to ensure equity, privacy, and seamless classroom workflows.

---

### Upcoming Educational Capabilities Roadmap
* **Phase 1: Universal Foundation (v3.0 - Current)**: 7-tool Public Learning Hub, 2-tier flashcards (SM-2), prerequisite knowledge maps, teacher sandbox simulator, multi-tenant school onboarding, parent oversight suite, and multi-child profile tracking.
* **Phase 2: Voice & Multimodal Diagnostics (Q1-Q2 2027)**: Real-time conversational voice tutoring with natural cadence; multimodal vision for handwritten math error analysis; adaptive neurodivergent pacing.
* **Phase 3: Peer Socratic Circles & Global Standards (Q3-Q4 2027)**: AI-moderated peer debate rooms; native alignment with IB, Cambridge IGCSE, AP, and CBSE curricula; offline-first edge models for bandwidth-constrained schools.
* **Phase 4: Socratic Simulation Labs & Mastery Credentials (2028+)**: Interactive STEM sandboxes with dynamic AI inquiry; verifiable mastery credentials based on demonstrated reasoning and problem-solving rigor.

---

## Core Portals & Capabilities

### Universal Public Learning Hub (`/hub`)
The Public Learning Hub provides an open, connected ecosystem where students experience the product rather than just read about it.
* **Unified Learning Workspace**: When studying a topic (e.g. *Newton's Laws* or *Differential Calculus*), students transition seamlessly across tools without losing topic context:
  - **AI Tutor**: Guides conceptual understanding through progressive questioning.
  - **Knowledge Map**: Visualizes prerequisite relationships and mastery checkpoints.
  - **Flashcards**: Reinforces essential concepts with 2-clue progressive reveals.
  - **Practice Quiz**: Validates comprehension with misconception debriefs.
  - **Progress Tracker**: Records mastery levels and learning streaks.
* **The 7 Public Learning Tools**:
  1. **Socratic Subject Sandbox**: Multi-level inquiry (*Elementary*, *High School*, *AP/Undergrad*) with selectable pedagogical modes (*Guided Explanation*, *Check My Logic*, *Toy Problem*).
  2. **Socratic Code Debugger**: Guided edge-case tracing in Python, JavaScript, C++, and Java without spoiling solutions.
  3. **2-Tier Socratic Flashcards (SM-2)**: Progressive 2-clue reveal flashcards auto-scheduled using spaced repetition.
  4. **Concept Knowledge Maps (DAG)**: Interactive topic trees with unlockable nodes verified via Socratic checkpoint prompts.
  5. **Practice Quizzes & Misconception Debriefs**: Diagnostic quizzes explaining *why* incorrect choices seemed tempting.
  6. **Interactive STEM Function Grapher**: Real-time curve plotting with one-click export to Socratic slope and root analysis.
  7. **Peer Collaborative Whiteboard (`/whiteboard/[roomId]`)**: Real-time multi-user drawing, LaTeX equations, and sticky notes.
* **Transparent Trial Allowance**: Explains what counts as a query (each AI response), tracks usage clearly (3 free trial queries), and resets daily or links permanently upon free signup.

---

### Parent Module & Guardian Portal (`/parents`, `/parent`, `/parent-demo`)
Designed specifically for parents to stay informed without compromising their student's psychological safety or intellectual independence.
* **School-Issued Invitation Flow (`/parent/invitation/{token}`)**:
  1. The school issues a cryptographically hashed invitation link.
  2. The parent opens the link, reviews student details, and completes account verification.
  3. The parent gains authorized, read-only access to academic records.
  *(Invitations are never accepted merely by opening the link; explicit verification is required.)*
* **Multiple Guardian Support**: Both parents or multiple authorized guardians can receive separate credentials for the same student when permitted by school policy.
* **5-Point Transparency & Privacy Matrix**:
  - **Academic Performance**: ✅ Visible (Grades, assignment scores, and rubric breakdowns).
  - **Learning Activity Summaries**: ✅ Visible (Study time, subject breakdowns, active streaks).
  - **AI Tutor Usage Summaries**: ✅ Visible (Query volume, active topics, learning frequency).
  - **Raw Student-AI Conversations**: 🛡️ Shielded (Private to student; accessible only to school teachers for academic integrity audits).
  - **Private Student Communications**: 🛡️ Shielded (Protected from external visibility).
* **Interactive Parent Demo (`/parent-demo`)**:
  - Preloaded with a fictional family at Horizon Academy: **Alex Chen** (Grade 12, Section A) and **Emily Chen** (Grade 9, Section B).
  - Displays student **Profile Picture**, **Section**, **Grade**, and **Full Name** in both the child switcher and active profile banner.
  - Visualizes real-time switching across KPIs (Overall GPA, Attendance, Study Streaks), Coursework submissions, Concept Mastery Trees, and Teacher Feedback.
* **Authenticated Parent Portal (`/parent`)**:
  - Live production guardian portal with multi-child selector tabs, section badges, and academic summaries.

---

### Institutional Suite & School Onboarding (`/schools`, `/school-demo`)
Built to give school principals, academy leaders, and department heads an enterprise-grade academic operating system.
* **Institutional Product Showcase**: Features 8 authentic GuruMera management dashboards:
  1. *School Administrator Dashboard*: Tenant-wide health, campus roster counts, and licensing.
  2. *Teacher Dashboard*: Class management, assignment scheduling, and grading queues.
  3. *Student Dashboard*: Coursework deadlines, Socratic study coach, and flashcard queues.
  4. *Parent Dashboard*: Child overview, academic standing, and teacher feedback.
  5. *Classroom & Section Management*: Multi-campus course sections and teacher allocations.
  6. *Assignment & Assessment Management*: Rubric builders, AI strictness controls, and whiteboard integration.
  7. *Student Performance Analytics*: Mastery tracking and gradebook distributions.
  8. *AI Interaction & Safety Audit Transcripts*: Real-time safety logs, injection alerts, and student inquiry patterns.
* **7-Step Self-Serve Institutional Onboarding**:
  1. **Domain Ownership Verification**: Validates school web domains (`@school.edu`).
  2. **Identity & SSO Integration**: Google Workspace & Microsoft 365 tenant linking.
  3. **Campuses & Departments**: Multi-facility configuration (e.g. North Campus, West Campus).
  4. **School Branding & Customization**: Custom colors, institutional crest, and portal URL.
  5. **Roles & Permission Configuration**: Granular RBAC for Principals, Department Heads, Teachers, and TAs.
  6. **Data Retention & Privacy Controls**: Automated FERPA/COPPA compliance schedules and transcript retention.
  7. **Configuration Review & Activation**: Atomic tenant provisioning and student Invite Code generation.
* **Preconfigured Multi-Campus Demo (`/school-demo`)**:
  - Interactive walkthrough of **Horizon Academy** across two campuses (*North Senior High* & *West Junior Academy*), with live classes, teacher allocations, student rosters, and analytics.

---

### Teacher Experience & Ephemeral Sandbox (`/teacher`, `/try-teacher`)
* **Coursework & Rubric Builder**: Create assignments with multi-criteria rubrics and attach custom Socratic prompt guidelines.
* **AI Strictness Controls**:
  - *Socratic Strict (Default)*: Pure guided questioning using analogies and conceptual prompts; blocks equations and final code.
  - *Hints Only*: Progressive hints capped per inquiry cycle while requiring student reasoning.
  - *Terminology Only*: Clarifies definitions and vocabulary—ideal for exam review.
  - *Disabled*: Turns off AI assistance entirely for independent assessments.
* **Auto-Generated Socratic Decks**: One-click generation of 2-tier flashcard decks directly from assignment rubrics.
* **Teacher AI Audit Console**: Inspect student-AI dialogue sessions, review flagged prompt injections, and spot classroom-wide misconceptions before exam day.
* **Ephemeral Teacher Sandbox (`/try-teacher`)**: Zero-signup, 2-hour interactive test flight preloaded with sample AP Physics coursework and student test prompts to test guardrail behavior live.

---

### Student Learning Experience (`/student`, `/coursework/[id]`)
* **Coursework-Linked Socratic Chat**: Integrated AI study coach aware of teacher rubrics and learning goals, delivering hints without spoiling answers.
* **Spaced Repetition Flashcard Queue**: SM-2 spaced repetition cards with progressive clues that reward first-try recall.
* **Shared Study Whiteboards**: Real-time collaborative canvas for homework problem-solving with classmates.
* **Streak & Mastery XP**: Gamified study streaks and mastery levels that persist across grades and transfer seamlessly between schools via Invite Codes.

---

### Enhanced Authentication & SSO (`/login`, `/signup`)
* **Focused Authentication Layout**: Clean, distraction-free sign-in and sign-up pages with minimal legal footers.
* **Single Sign-On (SSO)**:
  - **Google SSO**: One-click login optimized for students and Google Workspace schools.
  - **LinkedIn SSO**: Professional single sign-on optimized for educators and administrators.
* **Multi-Tenant Domain Auto-Routing**: Automatically maps OAuth callbacks to the correct school tenant based on domain (e.g. logging in with `@horizon.edu` auto-routes directly to Horizon Academy).
* **Instant Demo Login**: One-click demo credential bypass buttons for School Admin, Teacher, Student, and Parent accounts.

---

## Socratic AI Guardrails (5-Layer Defense-in-Depth Pipeline)

The core Socratic engine is defended by a 5-layer pipeline implemented in Python FastAPI:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Student Prompt / Input                          │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Layer 1: Input Pre-Sanitization & PII Redaction                       │
│  - Strips zero-width exploits, control characters, and obfuscation     │
│  - Redacts sensitive PII (emails, phone numbers, student IDs)          │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Layer 2: Multi-Vector Intent Classifier & Injection Defense           │
│  - Detects "ignore previous instructions", roleplay/DAN jailbreaks    │
│  - Intercepts direct solution demands ("solve this", "write my essay") │
│  - Action: Blocks exploit & redirects into Socratic guiding prompt    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ [SAFE]
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Layer 3: Socratic Context Injection & Rubric Cloaking                 │
│  - Injects student Zone of Proximal Development (ZPD) scaffold level   │
│  - Injects assignment learning objectives and teacher strictness rules │
│  - Server-side cloaks grading keys so prompts cannot extract them      │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Layer 4: Low-Temperature LLM Inference (Gemini / OpenAI / Mock)       │
│  - Generates dialectical, progressive guiding questions & clues        │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Layer 5: Output Verification & Solution Interception                  │
│  - Scans model output for accidental answer spills or raw formulas     │
│  - Intercepts answers and replaces with conceptual hints + logs audit  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                Streamed Socratic Response to Learner                   │
└────────────────────────────────────────────────────────────────────────┘
```

* **Rate Limiting**: 15 queries per hour per student per subject session (Redis Token Bucket).
* **Anonymous Public Trial**: 3 queries per 24 hours for unauthenticated visitors on `/hub`.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Client Layer (Next.js 16.3)                           │
│  • Public Hub (/hub)      • Schools (/schools)        • Parents (/parents)      │
│  • Parent Demo (/parent-demo)  • School Demo (/school-demo)  • Auth (/login)   │
│  • Teacher (/teacher)     • Student (/student)        • Admin (/admin)          │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ HTTPS / SSE
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      API Gateway — NestJS 12 (Port 3000)                        │
│  • JWT Auth & SSO Handler (Google / LinkedIn)   • Multi-Tenant Domain Routing   │
│  • PostgreSQL RLS Tenant Context Injection      • Parent Invitation Service     │
│  • Coursework, Rubrics, & Grading               • Redis Quota Rate Limiter      │
└───────────────────┬─────────────────────────────────────────┬───────────────────┘
                    │                                         │
                    ▼ HTTP                                    ▼ SQL
┌──────────────────────────────────────┐  ┌───────────────────────────────────────┐
│    AI Gateway — FastAPI (Port 8000)  │  │     PostgreSQL 16 Database + Redis 7  │
│  • 5-Layer Defense-in-Depth Pipeline │  │  • Multi-Tenant Row-Level Security   │
│  • PII Redaction & Prompt Cloaking   │  │  • Parent-Student Associations Table │
│  • Google Gemini / OpenAI / Mock     │  │  • Cryptographic Parent Invitations  │
│  • SSE Socratic Streaming            │  │  • Redis 7 Cache & Rate Limiting     │
└──────────────────────────────────────┘  └───────────────────────────────────────┘
```

---

## Database Architecture & Production Migrations

GuruMera enforces multi-tenancy at the database level using **PostgreSQL 16 Row-Level Security (RLS)**. Every tenant query runs with session-scoped context:

```sql
-- Injected per-request by NestJS database interceptor:
SET LOCAL app.current_tenant_id = '<school_uuid>';

-- RLS Policy Example:
CREATE POLICY tenant_isolation_coursework ON coursework
  FOR ALL USING (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
```

### Production Migration Sequence
When deploying GuruMera to a production or staging database, execute the SQL scripts in this exact order:

| Step | File | Purpose | Notes |
|:---:|:---|:---|:---|
| **1** | `database/schema.sql` | Core schema, enums, RLS policies, tables (schools, campuses, users, courses, coursework, submissions, whiteboards). | Execute on fresh database. |
| **2** | `database/seed.sql` | Demo tenants (*Horizon Academy*, *Apex Academy*), admin/teacher/student/parent accounts, and initial subjects. | Baseline fixtures. |
| **3** | `database/migrations/002_v230_public_hub.sql` | Public Hub tables: flashcards (SM-2), knowledge maps (DAG), practice quizzes, STEM graph storage, and anonymous trial limits. | Idempotent (`IF NOT EXISTS`). |
| **4** | `database/migrations/002_seed_v230.sql` | Seed data for public flashcards, physics & math concept nodes, and sample quizzes. | Idempotent seed. |
| **5** | `database/migrations/003_v300_parent_module.sql` | Creates `parent_invitations` table with cryptographic token hashing, expiry tracking, RLS policies, indexes, and seeds Child 2 (*Emily Chen*). | Idempotent upgrade. |

```bash
# Example execution using psql:
psql -U edusocrates -d edusocrates_prod -f database/schema.sql
psql -U edusocrates -d edusocrates_prod -f database/seed.sql
psql -U edusocrates -d edusocrates_prod -f database/migrations/002_v230_public_hub.sql
psql -U edusocrates -d edusocrates_prod -f database/migrations/002_seed_v230.sql
psql -U edusocrates -d edusocrates_prod -f database/migrations/003_v300_parent_module.sql
```

---

## Quick Start (Local Development)

### Prerequisites
* **Node.js 22+**
* **Python 3.12+**
* **PostgreSQL 16**
* **Redis 7**
*(Or Docker Desktop for a single-command setup)*

---

### Option A — Docker Compose (Recommended)

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Build and start all services
docker compose up --build
```
Access the application at **http://localhost:3000** (or port configured in `.env`).

---

### Option B — Manual Local Setup

#### Step 1: Database Setup
```bash
psql -U postgres -c "CREATE USER edusocrates WITH PASSWORD 'socrates_password';"
psql -U postgres -c "CREATE DATABASE edusocrates_dev OWNER edusocrates;"

# Run schema and migrations
psql -U edusocrates -d edusocrates_dev -f database/schema.sql
psql -U edusocrates -d edusocrates_dev -f database/seed.sql
psql -U edusocrates -d edusocrates_dev -f database/migrations/002_v230_public_hub.sql
psql -U edusocrates -d edusocrates_dev -f database/migrations/002_seed_v230.sql
psql -U edusocrates -d edusocrates_dev -f database/migrations/003_v300_parent_module.sql
```

#### Step 2: AI Gateway (Python FastAPI)
```bash
cd services/ai-gateway
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*OpenAPI Interactive Docs*: http://localhost:8000/docs

#### Step 3: API Gateway (NestJS)
```bash
cd services/api-gateway
npm install
npm run start:dev
```
*API Base URL*: http://localhost:3000/api/v1

#### Step 4: Web Application (Next.js 16)
```bash
cd services/web
npm install
npm run dev
```
*Web Portal*: http://localhost:3000

---

## Demo Accounts & Interactive Sandboxes

### Preloaded Credentials (Horizon Academy)

| Role | Email | Password | Primary Portal |
|:---|:---|:---|:---|
| **School Administrator** | `admin@horizon.edu` | `Password123!` | `/admin` |
| **Teacher (Physics)** | `teacher.physics@horizon.edu` | `Password123!` | `/teacher` |
| **Student (Alex Chen)** | `alex.chen@horizon.edu` | `Password123!` | `/student` |
| **Parent (Eleanor Chen)** | `parent@horizon.edu` | `Password123!` | `/parent` |

### Zero-Signup Interactive Sandboxes
* **Universal Public Hub**: [`/hub`](http://localhost:3000/hub) — Explore all 7 tools without an account.
* **Teacher Guardrail Simulator**: [`/try-teacher`](http://localhost:3000/try-teacher) — 2-hour sandbox to test prompt injection defenses.
* **Interactive Parent Demo**: [`/parent-demo`](http://localhost:3000/parent-demo) — Multi-child overview for Alex Chen (Grade 12, Section A) and Emily Chen (Grade 9, Section B).
* **Multi-Campus School Demo**: [`/school-demo`](http://localhost:3000/school-demo) — Preconfigured institutional environment with North & West campuses.
* **Parent Invitation Demo**: [`/parent/invitation/demo-invitation-token`](http://localhost:3000/parent/invitation/demo-invitation-token) — Experience the school-issued guardian token verification flow.

---

## LLM Provider Configuration

Configure the provider in `.env` or `services/ai-gateway/.env`:

| Provider | Configuration | Description |
|:---|:---|:---|
| **Mock (Default)** | `DEFAULT_PROVIDER=mock` | Zero API key needed. Deterministic Socratic responses and instant local testing. |
| **Google Gemini** | `DEFAULT_PROVIDER=gemini`<br>`GEMINI_API_KEY=your_gemini_key` | Supports Gemini 1.5 Pro and Flash with high-speed Socratic reasoning. |
| **OpenAI** | `DEFAULT_PROVIDER=openai`<br>`OPENAI_API_KEY=your_openai_key` | Supports GPT-4o and GPT-4o-mini. |

---

## Project Structure

```
EduSocrates/
├── database/
│   ├── schema.sql                         # PostgreSQL 16 schema & Row-Level Security (RLS)
│   ├── seed.sql                           # Initial tenants, users, campuses, allocations
│   └── migrations/
│       ├── 002_v230_public_hub.sql        # Public hub tables (flashcards, DAG maps, quizzes)
│       ├── 002_seed_v230.sql              # Public hub fixtures
│       └── 003_v300_parent_module.sql     # Parent invitations & multi-child relationships
├── services/
│   ├── ai-gateway/                        # Python FastAPI Socratic AI Engine (Port 8000)
│   │   ├── app/
│   │   │   ├── core/                      # Config, logging, Redis client
│   │   │   ├── guardrails/                # 5-layer defense pipeline & regex filters
│   │   │   ├── pii/                       # PII detection & redaction
│   │   │   ├── prompts/                   # Socratic system prompts & ZPD level builders
│   │   │   ├── routers/                   # /api/v1/ai/* SSE endpoints
│   │   │   └── services/                  # Gemini, OpenAI, & Mock LLM providers
│   │   └── tests/                         # Unit tests for guardrail layers
│   ├── api-gateway/                       # NestJS 12 API Gateway (Port 3000)
│   │   └── src/
│   │       ├── admin/                     # Campuses, classes, sections, subjects, CSV import
│   │       ├── ai-proxy/                  # AI Gateway proxy & Redis rate-limiter
│   │       ├── auth/                      # JWT, Passport, Google/LinkedIn SSO, RBAC
│   │       ├── coursework/                # Assignments, rubrics, submissions, grading
│   │       ├── database/                  # Postgres pool & RLS tenant context injection
│   │       ├── hub/                       # Public hub endpoints & trial tracking
│   │       └── parent/                    # Parent invitations, validation, & child analytics
│   └── web/                               # Next.js 16.3 App Router Frontend (Port 3000)
│       ├── app/
│       │   ├── (auth)/                    # /login & /signup with Google/LinkedIn SSO
│       │   ├── admin/                     # School administrator console
│       │   ├── coursework/[id]/           # Assignment submission & Socratic tutor
│       │   ├── features/                  # Deep-dive feature showcases
│       │   │   ├── flashcards/            # Spaced repetition deep-dive
│       │   │   ├── knowledge-maps/        # Prerequisite knowledge DAG deep-dive
│       │   │   ├── peer-whiteboards/      # Collaborative whiteboard deep-dive
│       │   │   └── socratic-tutor/        # Socratic tutoring deep-dive
│       │   ├── hub/                       # Unified Public Learning Hub (7 tools)
│       │   ├── parent/                    # Authenticated Parent Portal
│       │   │   └── invitation/[token]/    # Cryptographic invitation redemption
│       │   ├── parent-demo/               # Multi-child interactive parent demo
│       │   ├── parents/                   # Public parent landing & privacy matrix
│       │   ├── school-demo/               # Preconfigured multi-campus school demo
│       │   ├── schools/                   # Institutional suite & 7-step onboarding
│       │   ├── student/                   # Student coursework dashboard
│       │   ├── super-admin/               # Platform oversight & tenant monitoring
│       │   ├── teacher/                   # Teacher class management & AI audit console
│       │   ├── try-teacher/               # 2-hour ephemeral teacher sandbox
│       │   └── whiteboard/[roomId]/       # Real-time collaborative STEM whiteboard
│       └── components/                    # BrandLogo, Navigation, SocraticChatStream, etc.
├── docker-compose.yml                     # Full-stack container orchestration
└── .env.example                           # Root environment variable template
```

---

## Testing & Verification

### 1. AI Guardrails Unit Tests
Run the 5-layer guardrail test suite in the AI Gateway:
```bash
cd services/ai-gateway
python -m pytest tests/ -v
```

### 2. API Gateway Unit & Integration Tests
```bash
cd services/api-gateway
npm run test
```

### 3. Web Frontend Build Verification (Next.js 16 Turbopack)
```bash
cd services/web
npm run build
```
Generates 30 static and server-rendered routes with strict TypeScript verification.

---

## License & Intellectual Property
Copyright © 2026 GuruMera Education Technologies. All rights reserved. Built with pride for independent minds and forward-thinking academies worldwide.
