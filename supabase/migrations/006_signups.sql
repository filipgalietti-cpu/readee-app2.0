-- Signups table for readee-site questionnaire submissions
CREATE TABLE IF NOT EXISTS signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('parent', 'teacher')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  school_name TEXT,
  grades TEXT[],
  class_size INTEGER,
  notes TEXT,
  children JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signups_email ON signups(email);
CREATE INDEX IF NOT EXISTS idx_signups_role ON signups(role);

-- RLS: insert-only for anonymous, select for authenticated
ALTER TABLE signups ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous inserts' AND tablename = 'signups') THEN
    CREATE POLICY "Allow anonymous inserts" ON signups FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated select' AND tablename = 'signups') THEN
    CREATE POLICY "Allow authenticated select" ON signups FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
