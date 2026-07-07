-- 113_learning_events.sql
-- Adaptive engine — Phase 0: the SENSE layer.
--
-- Readee already stores per-question OUTCOMES in practice_answers, but the
-- richest adaptive signals are thrown away as ephemeral UI state: how many
-- tries a child took on the interactive "Your Turn" fork, whether they
-- needed the hint, how long they took to answer, and which wrong choice
-- they picked. learning_events captures every interaction across all three
-- runtimes (in-lesson fork, in-lesson MCQ, standalone practice) so the
-- adaptive controller can decide, in real time, whether to hit the brakes
-- (re-teach / slow down) or pump the gas (skip / stretch / level up).
--
-- One row per graded interaction. High-write, append-only, read in short
-- rolling windows per session (+ aggregated between sessions).

CREATE TABLE IF NOT EXISTS learning_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  standard_id  text NOT NULL,

  -- which runtime produced the event
  surface      text NOT NULL CHECK (surface IN ('fork', 'lesson_mcq', 'practice')),

  -- the item, when known (mcqId / question id / fork slide id)
  item_id      text,
  item_type    text,                 -- mirrors question.type: mcq | match | tap | ...

  -- OUTCOME
  correct      boolean NOT NULL,
  attempts     integer NOT NULL DEFAULT 1 CHECK (attempts >= 1),  -- fork can be >1
  hint_used    boolean NOT NULL DEFAULT false,
  latency_ms   integer CHECK (latency_ms IS NULL OR latency_ms >= 0),

  -- distractor analysis: which choice the child actually picked
  chosen       text,

  -- grouping / context
  session_id   uuid,                 -- groups one practice/lesson sitting
  lesson_id    text,
  difficulty   integer,              -- item difficulty (1-3) when known

  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Rolling-window reads per child (the controller pulls the last N events).
CREATE INDEX IF NOT EXISTS learning_events_child_time_idx
  ON learning_events (child_id, created_at DESC);

-- Between-session aggregation by skill.
CREATE INDEX IF NOT EXISTS learning_events_child_standard_idx
  ON learning_events (child_id, standard_id, created_at DESC);

-- One session's stream.
CREATE INDEX IF NOT EXISTS learning_events_session_idx
  ON learning_events (session_id);

-- Store the placement test's 5-dimension profile (phonics / vocabulary /
-- literal / inferential / fluency), which the assessment already COMPUTES
-- but had no column to persist. The controller uses it to seed a child's
-- starting state per skill axis instead of adapting from cold.
ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS dimension_profile jsonb;

-- RLS — parent (or the kid via the protected layout) sees/writes only
-- their own children's rows. Service role bypasses RLS for the controller
-- and analytics jobs.
ALTER TABLE learning_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS learning_events_select_own ON learning_events;
CREATE POLICY learning_events_select_own
  ON learning_events FOR SELECT
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

DROP POLICY IF EXISTS learning_events_insert_own ON learning_events;
CREATE POLICY learning_events_insert_own
  ON learning_events FOR INSERT
  WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
