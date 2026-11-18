-- GuruMera Sprint 1 — onboarding (idempotent). Apply after 004, as the schema owner.

-- 1. Tenant types: a school, an independent tutor/academy, or the public hub.
ALTER TABLE schools ADD COLUMN IF NOT EXISTS tenant_type VARCHAR(16) NOT NULL DEFAULT 'SCHOOL';
ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_tenant_type_chk;
ALTER TABLE schools ADD CONSTRAINT schools_tenant_type_chk CHECK (tenant_type IN ('SCHOOL', 'TUTOR', 'HUB'));
UPDATE schools SET tenant_type = 'HUB' WHERE is_public_hub = TRUE OR id = '00000000-0000-0000-0000-000000000000';

-- 2. Who owns the tenant (the person who signed it up).
ALTER TABLE schools ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- 3. GuruMera serves Grade 6 and above only. Free-text class names stay, the number is explicit.
ALTER TABLE classes ADD COLUMN IF NOT EXISTS grade_level SMALLINT;
ALTER TABLE classes DROP CONSTRAINT IF EXISTS classes_grade_level_chk;
ALTER TABLE classes ADD CONSTRAINT classes_grade_level_chk CHECK (grade_level IS NULL OR grade_level BETWEEN 6 AND 13);

-- 4. Class codes are looked up ignoring case and dashes.
CREATE INDEX IF NOT EXISTS idx_school_invites_code_norm ON school_invites (REPLACE(UPPER(invite_code), '-', ''));
CREATE INDEX IF NOT EXISTS idx_school_invites_section ON school_invites (section_id);
