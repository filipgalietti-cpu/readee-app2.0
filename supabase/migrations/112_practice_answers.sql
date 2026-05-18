-- 112_practice_answers.sql
--
-- Per-answer fidelity for the adaptive review feature ("Sharpen Up").
-- Until now we only stored per-session aggregates in `practice_results`
-- ({attempted, correct, carrots}). That's enough for streaks + leaderboard
-- but blind to *which* standards / question types a kid keeps missing.
--
-- This table captures one row per answered question so we can rank
-- (standard_id, type) by miss rate and surface targeted practice.
--
-- Premium gate is enforced in the UI layer (Sharpen Up tile + practice
-- entry point); we still INSERT for every kid because the data itself
-- is also useful for content QC + content cap tuning regardless of plan.

CREATE TABLE IF NOT EXISTS practice_answers (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  question_id  text NOT NULL,
  standard_id  text NOT NULL,
  -- Mirrors question.type in the JSON content: "mcq" | "sentence_build"
  -- | "category_sort" | "tap_to_pair" | "sound_machine" | "missing_word"
  -- | "space_insertion". Stored as text so new types don't require a
  -- migration.
  type         text NOT NULL,
  was_correct  boolean NOT NULL,
  answered_at  timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Time-window queries on a kid's recent history are the hot path
-- (weak-spots rank looks at last 30 days). Composite index covers it.
CREATE INDEX IF NOT EXISTS practice_answers_child_time_idx
  ON practice_answers (child_id, answered_at DESC);

-- Secondary lookup by standard for content-QC pivots
-- ("how often is RL.K.3 missed across all kids this week").
CREATE INDEX IF NOT EXISTS practice_answers_standard_time_idx
  ON practice_answers (standard_id, answered_at DESC);

-- ──────────────────────────────────────────────────────────────────
-- RLS — parent (or the kid via the protected layout) sees only their
-- own children's rows. Service role bypasses RLS for analytics jobs.
-- ──────────────────────────────────────────────────────────────────
ALTER TABLE practice_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS practice_answers_select_own ON practice_answers;
CREATE POLICY practice_answers_select_own
  ON practice_answers
  FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS practice_answers_insert_own ON practice_answers;
CREATE POLICY practice_answers_insert_own
  ON practice_answers
  FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );
