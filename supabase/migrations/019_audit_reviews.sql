-- Universal audit reviews table (replaces localStorage in all audit pages)
CREATE TABLE audit_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('question', 'lesson_slide', 'phoneme', 'assessment')),
  item_id TEXT NOT NULL,
  grade TEXT,
  standard_id TEXT,
  status TEXT CHECK (status IN ('pass', 'fail', 'flag', 'up', 'down')),
  comment TEXT DEFAULT '',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_type, item_id, user_id)
);

ALTER TABLE audit_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_all" ON audit_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_own" ON audit_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own" ON audit_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
