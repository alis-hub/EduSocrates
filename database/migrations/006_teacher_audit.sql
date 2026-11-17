-- Sprint: teacher access audit. Records who opened which AI transcript. Idempotent.
CREATE TABLE IF NOT EXISTS transcript_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES ai_tutoring_sessions(id) ON DELETE CASCADE,
    coursework_id UUID REFERENCES coursework(id) ON DELETE SET NULL,
    viewed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_transcript_log_school ON transcript_access_log(school_id, viewed_at DESC);
ALTER TABLE transcript_access_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_transcript_access_log ON transcript_access_log;
CREATE POLICY tenant_isolation_transcript_access_log ON transcript_access_log
  FOR ALL
  USING (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID)
  WITH CHECK (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gurumera_app') THEN
    GRANT SELECT, INSERT ON transcript_access_log TO gurumera_app;
  END IF;
END $$;
