-- Parents acknowledge they have reviewed a child's graded result. One acknowledgement per parent per submission. Idempotent.
CREATE TABLE IF NOT EXISTS parent_acknowledgements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    note VARCHAR(500),
    acknowledged_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_parent_ack UNIQUE (parent_id, submission_id)
);
CREATE INDEX IF NOT EXISTS idx_parent_ack_submission ON parent_acknowledgements(submission_id);
CREATE INDEX IF NOT EXISTS idx_parent_ack_school ON parent_acknowledgements(school_id, acknowledged_at DESC);
ALTER TABLE parent_acknowledgements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_parent_acknowledgements ON parent_acknowledgements;
CREATE POLICY tenant_isolation_parent_acknowledgements ON parent_acknowledgements
  FOR ALL
  USING (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID)
  WITH CHECK (school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gurumera_app') THEN
    GRANT SELECT, INSERT ON parent_acknowledgements TO gurumera_app;
  END IF;
END $$;
