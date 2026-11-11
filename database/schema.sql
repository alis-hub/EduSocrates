-- EduSocrates Multi-Tenant Platform
-- Production PostgreSQL 16 DDL with Row-Level Security (RLS)

-- Enable UUID and Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'INDEPENDENT_STUDENT');
EXCEPTION
    WHEN duplicate_object THEN
        BEGIN
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'INDEPENDENT_STUDENT';
        EXCEPTION WHEN others THEN null;
        END;
END $$;

DO $$ BEGIN
    CREATE TYPE coursework_access_level AS ENUM ('PRIVATE', 'PUBLIC_DIRECTORY', 'UNLISTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE coursework_type AS ENUM ('HOMEWORK', 'QUIZ', 'ASSIGNMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ai_mode_setting AS ENUM ('SOCRATIC_STRICT', 'SOCRATIC_HINTS_ONLY', 'TERMINOLOGY_ONLY', 'DISABLED');
EXCEPTION
    WHEN duplicate_object THEN
        -- Add value if not present
        BEGIN
            ALTER TYPE ai_mode_setting ADD VALUE IF NOT EXISTS 'TERMINOLOGY_ONLY';
        EXCEPTION WHEN others THEN null;
        END;
END $$;

-- 1. Organizations (Tenants)
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    is_public_hub BOOLEAN DEFAULT FALSE NOT NULL,
    subscription_status VARCHAR(32) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Campuses / Branches
CREATE TABLE IF NOT EXISTS campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_campus_school FOREIGN KEY (school_id) REFERENCES schools(id)
);
CREATE INDEX IF NOT EXISTS idx_campuses_school_id ON campuses(school_id);

-- 3. Academic Sessions & Grades
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL, -- e.g., "2026-2027"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_academic_years_school_id ON academic_years(school_id);

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL, -- e.g., "Grade 10"
    code VARCHAR(32) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_classes_school_campus ON classes(school_id, campus_id);

CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL, -- e.g., "Section A"
    capacity INT DEFAULT 35
);
CREATE INDEX IF NOT EXISTS idx_sections_school_class ON sections(school_id, class_id);

CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL, -- e.g., "AP Physics 1"
    code VARCHAR(32) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_subjects_school_class ON subjects(school_id, class_id);

-- 4. Users and RBAC
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
    role user_role NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_school_user_email UNIQUE (school_id, email)
);
CREATE INDEX IF NOT EXISTS idx_users_lookup ON users(school_id, role, email);

-- 5. Academic Enrollments & Assignments
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_student_section_term UNIQUE (student_id, section_id, academic_year_id)
);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);

CREATE TABLE IF NOT EXISTS teacher_subject_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_allocations_teacher ON teacher_subject_allocations(teacher_id, school_id);

CREATE TABLE IF NOT EXISTS parent_student_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship_type VARCHAR(32) DEFAULT 'GUARDIAN' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_parent_student UNIQUE (parent_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_parent_student_lookup ON parent_student_associations(school_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_student_parent_lookup ON parent_student_associations(student_id);

-- 6. Coursework System
CREATE TABLE IF NOT EXISTS coursework (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    coursework_type coursework_type NOT NULL,
    max_score NUMERIC(5,2) DEFAULT 100.00,
    due_date TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days') NOT NULL,
    ai_guidance_mode ai_mode_setting DEFAULT 'SOCRATIC_STRICT' NOT NULL,
    ai_system_notes TEXT, -- Extra hints/pedagogical context injected by teacher
    rubric TEXT, -- Optional grading rubric injected into AI prompt as teacher_guidance
    time_limit_minutes INT, -- NULL means no time limit; used for QUIZ type auto-submit
    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    access_level VARCHAR(32) DEFAULT 'PRIVATE' NOT NULL,
    socratic_system_prompt_override TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_coursework_section ON coursework(section_id, school_id);

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    coursework_id UUID NOT NULL REFERENCES coursework(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submission_text TEXT,
    attachment_urls JSONB DEFAULT '[]'::JSONB,
    score NUMERIC(5,2),
    teacher_feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status VARCHAR(32) DEFAULT 'SUBMITTED' NOT NULL
);
-- UNIQUE constraint so ON CONFLICT (coursework_id, student_id) upsert works correctly
DO $$ BEGIN
    ALTER TABLE submissions ADD CONSTRAINT uq_submissions_coursework_student UNIQUE (coursework_id, student_id);
EXCEPTION
    WHEN duplicate_object OR duplicate_table THEN null;
END $$;
CREATE INDEX IF NOT EXISTS idx_submissions_coursework_student ON submissions(coursework_id, student_id);


-- 7. Socratic AI Interaction Logs & Auditing
CREATE TABLE IF NOT EXISTS ai_tutoring_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coursework_id UUID REFERENCES coursework(id) ON DELETE CASCADE,
    session_type VARCHAR(32) DEFAULT 'COURSEWORK' NOT NULL,
    session_status VARCHAR(32) DEFAULT 'ACTIVE' NOT NULL,
    total_tokens_consumed INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_lookup ON ai_tutoring_sessions(school_id, student_id, coursework_id);

CREATE TABLE IF NOT EXISTS ai_tutoring_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES ai_tutoring_sessions(id) ON DELETE CASCADE,
    sender_type VARCHAR(16) NOT NULL, -- 'STUDENT', 'ASSISTANT', 'SYSTEM_FLAG'
    content TEXT NOT NULL,
    flagged_jailbreak_attempt BOOLEAN DEFAULT FALSE,
    guardrail_response_code VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_messages_session ON ai_tutoring_messages(session_id, created_at);

-- Row Level Security Policy Setup
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coursework ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tutoring_sessions ENABLE ROW LEVEL SECURITY;

-- Existing policies (preserved)
DROP POLICY IF EXISTS tenant_isolation_coursework ON coursework;
CREATE POLICY tenant_isolation_coursework ON coursework
FOR ALL
USING (
  school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
  OR is_public = TRUE
  OR access_level IN ('PUBLIC_DIRECTORY', 'UNLISTED')
);

DROP POLICY IF EXISTS tenant_isolation_submissions ON submissions;
CREATE POLICY tenant_isolation_submissions ON submissions
FOR ALL
USING (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_campuses ON campuses;
CREATE POLICY tenant_isolation_campuses ON campuses
FOR ALL
USING (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_ai_sessions ON ai_tutoring_sessions;
CREATE POLICY tenant_isolation_ai_sessions ON ai_tutoring_sessions
FOR ALL
USING (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

-- New policies for previously unprotected tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_classes ON classes;
CREATE POLICY tenant_isolation_classes ON classes
FOR ALL
USING (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_sections ON sections;
CREATE POLICY tenant_isolation_sections ON sections
FOR ALL
USING (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_subjects ON subjects;
CREATE POLICY tenant_isolation_subjects ON subjects
FOR ALL
USING (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_academic_years ON academic_years;
CREATE POLICY tenant_isolation_academic_years ON academic_years
FOR ALL
USING (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_enrollments ON enrollments;
CREATE POLICY tenant_isolation_enrollments ON enrollments
FOR ALL
USING (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

ALTER TABLE teacher_subject_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_teacher_subject_allocations ON teacher_subject_allocations;
CREATE POLICY tenant_isolation_teacher_subject_allocations ON teacher_subject_allocations
FOR ALL
USING (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

-- ai_tutoring_messages: no school_id — filter via session join
ALTER TABLE ai_tutoring_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ai_tutoring_messages ON ai_tutoring_messages;
CREATE POLICY tenant_isolation_ai_tutoring_messages ON ai_tutoring_messages
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ai_tutoring_sessions ats
    WHERE ats.id = ai_tutoring_messages.session_id
    AND ats.school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
  )
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_users ON users;
CREATE POLICY tenant_isolation_users ON users
FOR ALL
USING (
  school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
  OR school_id = '00000000-0000-0000-0000-000000000000'::UUID
);

ALTER TABLE parent_student_associations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_parent_student ON parent_student_associations;
CREATE POLICY tenant_isolation_parent_student ON parent_student_associations
FOR ALL
USING (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

-- schools: permissive bypass so cross-tenant auth reads work
-- Allow all authenticated DB roles to read school rows (auth checks)
DROP POLICY IF EXISTS schools_read_policy ON schools;
CREATE POLICY schools_read_policy ON schools
FOR SELECT
USING (true);

DROP POLICY IF EXISTS schools_tenant_write_policy ON schools;
CREATE POLICY schools_tenant_write_policy ON schools
FOR ALL
USING (true);


-- ============================================================================
-- 8. UNIVERSAL PUBLIC LEARNING HUB & FUNNEL TABLES (v2.3.0)
-- ============================================================================

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
