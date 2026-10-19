# EduSocrates — Multi-Tenant Educational Platform with Socratic AI Guidance

Enterprise-grade academic management system with a defense-in-depth Socratic AI tutoring engine. Built with **Next.js 15+**, **NestJS 11**, **Python FastAPI**, and **PostgreSQL 16 Row-Level Security**.

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

