-- Break RLS recursion between classrooms <-> classroom_memberships.
--
-- Original policies formed a loop:
--   classrooms (SELECT)       -> queries classroom_memberships
--   classroom_memberships (*) -> queries classrooms
-- so a single SELECT on classrooms re-entered classroom_memberships'
-- policy evaluator, which re-entered classrooms'... → infinite recursion.
--
-- Fix: move the teacher-ownership and parent-ownership lookups into
-- SECURITY DEFINER functions. Those functions run with the definer's
-- privileges and SKIP the caller's RLS, so policies no longer cross-
-- reference each other through RLS.

-- Helper 1: does the current auth user own this classroom as teacher?
CREATE OR REPLACE FUNCTION public.auth_is_classroom_teacher(cls_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM classrooms
    WHERE id = cls_id AND teacher_id = auth.uid()
  );
$$;

-- Helper 2: does the current auth user own this child as parent?
CREATE OR REPLACE FUNCTION public.auth_owns_child(c_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM children
    WHERE id = c_id AND parent_id = auth.uid()
  );
$$;

-- Helper 3: list of classroom_ids the current auth user's children belong to
CREATE OR REPLACE FUNCTION public.auth_children_classroom_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT cm.classroom_id
  FROM classroom_memberships cm
  JOIN children c ON c.id = cm.child_id
  WHERE c.parent_id = auth.uid();
$$;

-- Lock the helpers down: callers can EXECUTE but the function body runs
-- as the definer. Revoke from PUBLIC just to be safe.
REVOKE ALL ON FUNCTION public.auth_is_classroom_teacher(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_owns_child(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_children_classroom_ids() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.auth_is_classroom_teacher(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_owns_child(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_children_classroom_ids() TO authenticated;

-- ──────────────────────────────────────────────────────────────
-- classrooms: drop + rebuild policies using helpers
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Teachers manage their own classrooms" ON classrooms;
DROP POLICY IF EXISTS "Parents can view their children classrooms" ON classrooms;

CREATE POLICY "Teachers manage their own classrooms"
  ON classrooms FOR ALL
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Parents can view their children classrooms"
  ON classrooms FOR SELECT
  USING (id IN (SELECT public.auth_children_classroom_ids()));

-- ──────────────────────────────────────────────────────────────
-- classroom_memberships: drop + rebuild policies using helpers
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Teachers manage memberships in their classrooms" ON classroom_memberships;
DROP POLICY IF EXISTS "Parents manage memberships for their children" ON classroom_memberships;

CREATE POLICY "Teachers manage memberships in their classrooms"
  ON classroom_memberships FOR ALL
  USING (public.auth_is_classroom_teacher(classroom_id))
  WITH CHECK (public.auth_is_classroom_teacher(classroom_id));

CREATE POLICY "Parents manage memberships for their children"
  ON classroom_memberships FOR ALL
  USING (public.auth_owns_child(child_id))
  WITH CHECK (public.auth_owns_child(child_id));

-- ──────────────────────────────────────────────────────────────
-- assignments: same fix — its policies also cross-reference
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Teachers manage assignments in their classrooms" ON assignments;
DROP POLICY IF EXISTS "Parents can view assignments for their children classrooms" ON assignments;

CREATE POLICY "Teachers manage assignments in their classrooms"
  ON assignments FOR ALL
  USING (public.auth_is_classroom_teacher(classroom_id))
  WITH CHECK (public.auth_is_classroom_teacher(classroom_id));

CREATE POLICY "Parents can view assignments for their children classrooms"
  ON assignments FOR SELECT
  USING (classroom_id IN (SELECT public.auth_children_classroom_ids()));

-- ──────────────────────────────────────────────────────────────
-- assignment_submissions: rebuild with helpers
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Teachers view submissions for their assignments" ON assignment_submissions;
DROP POLICY IF EXISTS "Parents manage submissions for their children" ON assignment_submissions;

CREATE POLICY "Teachers view submissions for their assignments"
  ON assignment_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      WHERE a.id = assignment_submissions.assignment_id
        AND public.auth_is_classroom_teacher(a.classroom_id)
    )
  );

CREATE POLICY "Parents manage submissions for their children"
  ON assignment_submissions FOR ALL
  USING (public.auth_owns_child(child_id))
  WITH CHECK (public.auth_owns_child(child_id));
