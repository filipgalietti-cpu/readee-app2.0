-- Classroom product, Week 1: classrooms, memberships, assignments, submissions.
-- Custom quiz tables will land in 023 with the Quiz Builder.
--
-- The existing profiles.role = 'educator' IS the teacher role. No new role column.
-- Classroom ownership = profiles.id where role = 'educator'.

-- ──────────────────────────────────────────────────────────────
-- classrooms
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade_level TEXT,                   -- 'K' | '1st' | '2nd' | '3rd' | '4th' | 'Mixed'
  join_code TEXT NOT NULL UNIQUE,     -- 6-char, uppercase, unique
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_join_code ON classrooms(join_code);

ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers manage their own classrooms' AND tablename = 'classrooms') THEN
    CREATE POLICY "Teachers manage their own classrooms"
      ON classrooms FOR ALL
      USING (teacher_id = auth.uid())
      WITH CHECK (teacher_id = auth.uid());
  END IF;
END $$;

-- The "Parents can view their children classrooms" policy references
-- classroom_memberships; we add it AFTER that table is created below.

-- ──────────────────────────────────────────────────────────────
-- classroom_memberships: which children are in which classroom
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classroom_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (classroom_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_classroom ON classroom_memberships(classroom_id);
CREATE INDEX IF NOT EXISTS idx_memberships_child ON classroom_memberships(child_id);

ALTER TABLE classroom_memberships ENABLE ROW LEVEL SECURITY;

-- Teachers can see + manage memberships in their own classrooms
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers manage memberships in their classrooms' AND tablename = 'classroom_memberships') THEN
    CREATE POLICY "Teachers manage memberships in their classrooms"
      ON classroom_memberships FOR ALL
      USING (classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid()))
      WITH CHECK (classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid()));
  END IF;
END $$;

-- Parents can see + manage memberships for their own children
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Parents manage memberships for their children' AND tablename = 'classroom_memberships') THEN
    CREATE POLICY "Parents manage memberships for their children"
      ON classroom_memberships FOR ALL
      USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()))
      WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
  END IF;
END $$;

-- Deferred-reference policy: now that classroom_memberships exists we can
-- safely add the parents-view-classrooms policy on classrooms.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Parents can view their children classrooms' AND tablename = 'classrooms') THEN
    CREATE POLICY "Parents can view their children classrooms"
      ON classrooms FOR SELECT
      USING (
        id IN (
          SELECT classroom_id FROM classroom_memberships
          WHERE child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
        )
      );
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────
-- assignments: teacher-assigned work (existing lesson for now)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,                 -- 'readee_lesson' | 'custom_quiz' (future)
  source_id TEXT NOT NULL,            -- lesson id for 'readee_lesson'
  title TEXT NOT NULL,                -- shown to kid + parent
  note TEXT,                          -- optional teacher instructions
  due_at TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT assignments_kind_check CHECK (kind IN ('readee_lesson', 'custom_quiz'))
);

CREATE INDEX IF NOT EXISTS idx_assignments_classroom ON assignments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_assignments_kind_source ON assignments(kind, source_id);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers manage assignments in their classrooms' AND tablename = 'assignments') THEN
    CREATE POLICY "Teachers manage assignments in their classrooms"
      ON assignments FOR ALL
      USING (classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid()))
      WITH CHECK (classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Parents can view assignments for their children classrooms' AND tablename = 'assignments') THEN
    CREATE POLICY "Parents can view assignments for their children classrooms"
      ON assignments FOR SELECT
      USING (
        classroom_id IN (
          SELECT classroom_id FROM classroom_memberships
          WHERE child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
        )
      );
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────
-- assignment_submissions: per-child progress on an assignment
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  score_percent NUMERIC(5,2),        -- 0–100
  carrots_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE (assignment_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_child ON assignment_submissions(child_id);

ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers view submissions for their assignments' AND tablename = 'assignment_submissions') THEN
    CREATE POLICY "Teachers view submissions for their assignments"
      ON assignment_submissions FOR SELECT
      USING (
        assignment_id IN (
          SELECT a.id FROM assignments a
          JOIN classrooms c ON c.id = a.classroom_id
          WHERE c.teacher_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Parents manage submissions for their children' AND tablename = 'assignment_submissions') THEN
    CREATE POLICY "Parents manage submissions for their children"
      ON assignment_submissions FOR ALL
      USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()))
      WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────
-- Touch trigger — keep classrooms.updated_at honest
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION tg_classrooms_touch() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS classrooms_touch ON classrooms;
CREATE TRIGGER classrooms_touch
  BEFORE UPDATE ON classrooms
  FOR EACH ROW EXECUTE FUNCTION tg_classrooms_touch();
