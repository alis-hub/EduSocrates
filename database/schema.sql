-- EduSocrates Multi-Tenant Platform
-- Production PostgreSQL 16 DDL with Row-Level Security (RLS)

-- Enable UUID and Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT');
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
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coursework_id UUID NOT NULL REFERENCES coursework(id) ON DELETE CASCADE,
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
USING (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

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
USING (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

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
