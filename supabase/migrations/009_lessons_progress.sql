CREATE TABLE IF NOT EXISTS lessons_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('learn', 'practice', 'read')),
  score INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_progress_child ON lessons_progress(child_id);
ALTER TABLE lessons_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Parents can view their children''s lesson progress' AND tablename = 'lessons_progress') THEN
    CREATE POLICY "Parents can view their children's lesson progress"
      ON lessons_progress FOR SELECT
      USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Parents can insert their children''s lesson progress' AND tablename = 'lessons_progress') THEN
    CREATE POLICY "Parents can insert their children's lesson progress"
      ON lessons_progress FOR INSERT
      WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
  END IF;
END $$;
