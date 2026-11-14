-- GuruMera v3.0 Parent Module Upgrade Migration (Idempotent)
-- Implements School-Issued Parent Invitations & Multi-Child Association Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create parent_invitations table
CREATE TABLE IF NOT EXISTS parent_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    invited_email VARCHAR(255) NOT NULL,
    invited_parent_name VARCHAR(128) NOT NULL,
    invitation_token_hash VARCHAR(255) NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship_type VARCHAR(32) DEFAULT 'GUARDIAN' NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_parent_invitations_school ON parent_invitations(school_id);
CREATE INDEX IF NOT EXISTS idx_parent_invitations_email ON parent_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_parent_invitations_token ON parent_invitations(invitation_token_hash);
CREATE INDEX IF NOT EXISTS idx_parent_invitations_student ON parent_invitations(student_id);

-- Enable RLS on parent_invitations
ALTER TABLE parent_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_parent_invitations ON parent_invitations;
CREATE POLICY tenant_isolation_parent_invitations ON parent_invitations
    FOR ALL
    USING (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

-- 2. Ensure parent_student_associations has needed fields and indexes
CREATE INDEX IF NOT EXISTS idx_parent_student_parent ON parent_student_associations(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_school ON parent_student_associations(school_id);

-- 3. Seed Child 2 (Emily Chen) for multi-child demonstration if Horizon Academy exists
DO $$
DECLARE
    v_school_id UUID := '11111111-1111-4111-a111-111111111111';
    v_parent_id UUID := '11111111-1111-4111-a111-111111110004'; -- Eleanor Chen
    v_emily_id UUID := '11111111-1111-4111-a111-111111110005';
    v_campus_id UUID := 'c1111111-1111-4111-a111-111111111111';
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE id = v_parent_id) THEN
        -- Insert Emily Chen as student
        INSERT INTO users (id, school_id, campus_id, role, email, password_hash, first_name, last_name, is_active)
        VALUES (
            v_emily_id,
            v_school_id,
            v_campus_id,
            'STUDENT',
            'emily.chen@horizon.edu',
            '$2b$10$CnBEPdJSUeirnixKcXHxs.T.Ilc/7mX/iroJzALzTyFrY1nBdeL7a',
            'Emily',
            'Chen',
            TRUE
        ) ON CONFLICT (id) DO NOTHING;

        -- Link Emily to Eleanor Chen
        INSERT INTO parent_student_associations (id, school_id, parent_id, student_id, relationship_type)
        VALUES (
            'ea111111-1111-4111-a111-111111111112',
            v_school_id,
            v_parent_id,
            v_emily_id,
            'MOTHER'
        ) ON CONFLICT (parent_id, student_id) DO NOTHING;
    END IF;
END $$;
