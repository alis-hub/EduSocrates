-- GuruMera Sprint 0 — security foundation (idempotent)
-- Run as the schema OWNER / superuser, e.g.:
--   psql -U edusocrates -d edusocrates_dev -v app_password="'<strong password>'" -f database/migrations/004_sprint0_security.sql

-- 1. Real TOTP multi-factor authentication for administrators
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_secret    TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled   BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_last_step BIGINT;

-- 2. Restricted application role. It owns nothing and cannot bypass RLS, so tenant isolation
--    is enforced by PostgreSQL itself. Point DATABASE_APP_URL at this role.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gurumera_app') THEN
    CREATE ROLE gurumera_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END $$;

\if :{?app_password}
ALTER ROLE gurumera_app PASSWORD :app_password;
\endif

DO $$ BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO gurumera_app', current_database());
END $$;
GRANT USAGE ON SCHEMA public TO gurumera_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO gurumera_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO gurumera_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO gurumera_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO gurumera_app;

-- 3. The schools table must not be writable by every tenant.
DROP POLICY IF EXISTS schools_tenant_write_policy ON schools;
CREATE POLICY schools_tenant_write_policy ON schools
  FOR UPDATE USING (id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
REVOKE INSERT, DELETE ON schools FROM gurumera_app;
