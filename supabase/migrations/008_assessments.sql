-- Add reading_level to children table
ALTER TABLE children ADD COLUMN IF NOT EXISTS reading_level TEXT;

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  grade_tested TEXT NOT NULL,
  score_percent INTEGER NOT NULL,
  reading_level_placed TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Parents can view assessments for their own children
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Parents can view own children assessments' AND tablename = 'assessments') THEN
    CREATE POLICY "Parents can view own children assessments"
      ON assessments FOR SELECT
      USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
  END IF;
END $$;

-- Parents can insert assessments for their own children
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Parents can insert own children assessments' AND tablename = 'assessments') THEN
    CREATE POLICY "Parents can insert own children assessments"
      ON assessments FOR INSERT
      WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
  END IF;
END $$;
