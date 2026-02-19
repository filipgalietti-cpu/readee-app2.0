-- Create children table from scratch
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  grade TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  stories_read INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Parents can read their own children
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Parents can view own children' AND tablename = 'children') THEN
    CREATE POLICY "Parents can view own children" ON children FOR SELECT USING (auth.uid() = parent_id);
  END IF;
END $$;

-- Parents can insert their own children
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Parents can insert own children' AND tablename = 'children') THEN
    CREATE POLICY "Parents can insert own children" ON children FOR INSERT WITH CHECK (auth.uid() = parent_id);
  END IF;
END $$;

-- Parents can update their own children
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Parents can update own children' AND tablename = 'children') THEN
    CREATE POLICY "Parents can update own children" ON children FOR UPDATE USING (auth.uid() = parent_id);
  END IF;
END $$;

-- Allow service_role (admin client) full access (bypasses RLS by default)
