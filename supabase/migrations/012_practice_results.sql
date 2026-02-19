-- Practice results: tracks each practice session on a standard
CREATE TABLE IF NOT EXISTS practice_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  standard_id TEXT NOT NULL,
  questions_attempted INTEGER NOT NULL DEFAULT 0,
  questions_correct INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_practice_results_child ON practice_results(child_id);
CREATE INDEX IF NOT EXISTS idx_practice_results_child_standard ON practice_results(child_id, standard_id);

ALTER TABLE practice_results ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Parents can view their children''s practice results' AND tablename = 'practice_results') THEN
    CREATE POLICY "Parents can view their children's practice results"
      ON practice_results FOR SELECT
      USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Parents can insert their children''s practice results' AND tablename = 'practice_results') THEN
    CREATE POLICY "Parents can insert their children's practice results"
      ON practice_results FOR INSERT
      WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
  END IF;
END $$;
