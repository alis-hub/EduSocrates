-- EduSocrates v2.3.0 Upgrade Migration (Idempotent)
-- Safe to run on an existing PostgreSQL 16 / Neon database with v1 data.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Extend user_role enum with INDEPENDENT_STUDENT
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'INDEPENDENT_STUDENT';

-- 2. Extend schools for Universal Public Hub Flag
ALTER TABLE schools
    ADD COLUMN IF NOT EXISTS is_public_hub BOOLEAN DEFAULT FALSE NOT NULL;

UPDATE schools
SET is_public_hub = TRUE
WHERE id = '00000000-0000-0000-0000-000000000000';

-- 3. Extend coursework for public visibility & teacher prompt override
DO $$ BEGIN
    CREATE TYPE coursework_access_level AS ENUM ('PRIVATE', 'PUBLIC_DIRECTORY', 'UNLISTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE coursework
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN IF NOT EXISTS access_level VARCHAR(32) DEFAULT 'PRIVATE' NOT NULL,
    ADD COLUMN IF NOT EXISTS socratic_system_prompt_override TEXT;

-- 4. Extend ai_tutoring_sessions for Public Hub Sandbox sessions
ALTER TABLE ai_tutoring_sessions
    ALTER COLUMN coursework_id DROP NOT NULL;

ALTER TABLE ai_tutoring_sessions
    ADD COLUMN IF NOT EXISTS session_type VARCHAR(32) DEFAULT 'COURSEWORK' NOT NULL;

-- 5. Universal Public Learning Hub & Funnel Tables

CREATE TABLE IF NOT EXISTS public_practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    topic_name VARCHAR(255) NOT NULL,
    difficulty_level VARCHAR(32) DEFAULT 'HIGH_SCHOOL' NOT NULL,
    mode VARCHAR(32) DEFAULT 'EXPLANATION' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_public_practice_user ON public_practice_sessions(user_id);

CREATE TABLE IF NOT EXISTS socratic_flashcard_decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coursework_id UUID REFERENCES coursework(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    subject_area VARCHAR(128) NOT NULL,
    is_public BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_school ON socratic_flashcard_decks(school_id, is_public);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_coursework ON socratic_flashcard_decks(coursework_id);

CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES socratic_flashcard_decks(id) ON DELETE CASCADE,
    concept_title VARCHAR(255) NOT NULL,
    clue_tier_1 TEXT NOT NULL,
    clue_tier_2 TEXT NOT NULL,
    terminal_definition TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck ON flashcards(deck_id);

CREATE TABLE IF NOT EXISTS student_card_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    interval_days INT DEFAULT 1 NOT NULL,
    repetition_number INT DEFAULT 0 NOT NULL,
    ease_factor NUMERIC(4,2) DEFAULT 2.50 NOT NULL,
    next_review_due TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_reviewed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_student_card_review UNIQUE (student_id, card_id)
);
CREATE INDEX IF NOT EXISTS idx_card_reviews_due ON student_card_reviews(student_id, next_review_due);

CREATE TABLE IF NOT EXISTS concept_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_node_id UUID REFERENCES concept_nodes(id) ON DELETE SET NULL,
    domain_slug VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    socratic_checkpoint_prompt TEXT NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_concept_nodes_domain ON concept_nodes(domain_slug);

CREATE TABLE IF NOT EXISTS student_concept_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES concept_nodes(id) ON DELETE CASCADE,
    mastery_status VARCHAR(32) DEFAULT 'LOCKED' NOT NULL,
    last_debrief_score NUMERIC(5,2),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_student_concept UNIQUE (student_id, node_id)
);

CREATE TABLE IF NOT EXISTS practice_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    school_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    coursework_id UUID REFERENCES coursework(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(128) NOT NULL,
    difficulty_level VARCHAR(32) DEFAULT 'HIGH_SCHOOL' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS practice_quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES practice_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_index INT NOT NULL,
    misconception_explanation TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_practice_quiz_questions_quiz ON practice_quiz_questions(quiz_id);

CREATE TABLE IF NOT EXISTS practice_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES practice_quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    selected_answers JSONB NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    socratic_debrief_transcript JSONB DEFAULT '[]'::JSONB NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_practice_quiz_attempts_student ON practice_quiz_attempts(student_id, quiz_id);

CREATE TABLE IF NOT EXISTS discussion_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_tag VARCHAR(128) DEFAULT 'General' NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_school ON discussion_threads(school_id, created_at DESC);

CREATE TABLE IF NOT EXISTS discussion_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reply_body TEXT NOT NULL,
    is_ai_socratic_guide BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_thread ON discussion_replies(thread_id, created_at ASC);

CREATE TABLE IF NOT EXISTS student_gamification_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INT DEFAULT 0 NOT NULL,
    longest_streak INT DEFAULT 0 NOT NULL,
    total_xp INT DEFAULT 0 NOT NULL,
    last_activity_date DATE DEFAULT CURRENT_DATE NOT NULL,
    badges JSONB DEFAULT '[]'::JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS whiteboard_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    coursework_id UUID REFERENCES coursework(id) ON DELETE SET NULL,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    canvas_state JSONB DEFAULT '{"strokes":[],"notes":[]}'::JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_whiteboard_rooms_school ON whiteboard_rooms(school_id, is_active);

CREATE TABLE IF NOT EXISTS whiteboard_participants (
    room_id UUID NOT NULL REFERENCES whiteboard_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS school_interest_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_email VARCHAR(255) NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    campus_city VARCHAR(128) NOT NULL,
    role_type VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS teacher_sandbox_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    temporary_session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    sample_assignment_data JSONB DEFAULT '{}'::JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_teacher_sandbox_expires ON teacher_sandbox_sessions(expires_at);

CREATE TABLE IF NOT EXISTS school_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    invite_code VARCHAR(64) UNIQUE NOT NULL,
    target_role user_role DEFAULT 'STUDENT' NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    max_uses INT DEFAULT 100 NOT NULL,
    uses_count INT DEFAULT 0 NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '90 days') NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_invites_code ON school_invites(invite_code);

-- 6. Updated & New RLS Policies

-- Users policy: allow school tenant OR public hub tenant
DROP POLICY IF EXISTS tenant_isolation_users ON users;
CREATE POLICY tenant_isolation_users ON users
FOR ALL
USING (
    school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    OR school_id = '00000000-0000-0000-0000-000000000000'::UUID
);

-- Coursework policy: allow tenant OR public/unlisted reads
DROP POLICY IF EXISTS tenant_isolation_coursework ON coursework;
CREATE POLICY tenant_isolation_coursework ON coursework
FOR ALL
USING (
    school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    OR is_public = TRUE
    OR access_level IN ('PUBLIC_DIRECTORY', 'UNLISTED')
);

ALTER TABLE socratic_flashcard_decks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_and_public_flashcards ON socratic_flashcard_decks;
CREATE POLICY tenant_and_public_flashcards ON socratic_flashcard_decks
FOR ALL
USING (
    school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    OR is_public = TRUE
);

ALTER TABLE discussion_threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_and_public_discussions ON discussion_threads;
CREATE POLICY tenant_and_public_discussions ON discussion_threads
FOR ALL
USING (
    school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    OR school_id = '00000000-0000-0000-0000-000000000000'::UUID
);

ALTER TABLE whiteboard_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_and_public_whiteboards ON whiteboard_rooms;
CREATE POLICY tenant_and_public_whiteboards ON whiteboard_rooms
FOR ALL
USING (
    school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    OR school_id = '00000000-0000-0000-0000-000000000000'::UUID
);

ALTER TABLE school_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_school_invites ON school_invites;
CREATE POLICY tenant_isolation_school_invites ON school_invites
FOR ALL
USING (
    school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
);
