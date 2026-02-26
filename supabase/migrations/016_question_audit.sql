-- Question audit feedback table for collaborative review
CREATE TABLE IF NOT EXISTS question_audit_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating TEXT CHECK (rating IN ('up', 'down')),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, user_id)
);

ALTER TABLE question_audit_feedback ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read all feedback
CREATE POLICY "Anyone can read audit feedback"
  ON question_audit_feedback FOR SELECT TO authenticated
  USING (true);

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback"
  ON question_audit_feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own feedback
CREATE POLICY "Users can update own feedback"
  ON question_audit_feedback FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
