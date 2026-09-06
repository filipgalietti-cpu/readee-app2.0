-- Forged classroom membership was a path into another family's child data.
--
-- The teacher policy checked only that you own the CLASSROOM. Any account can
-- create a classroom with itself as teacher, so the attack was: make a
-- classroom, insert a membership row pairing it with a victim child's UUID, and
-- `auth_is_teacher_of_child` then reports you as that child's teacher.
-- Downstream teacher policies hand over lesson and practice history, fluency
-- readings, learning paths, skill memory and IEP records, and /api/child-audio
-- signs private recordings on the same visibility test.
--
-- Owning a classroom is not authority over a child. The fix requires BOTH.
--
-- A teacher may only enrol a child they created themselves - exactly what the
-- real flow does: invite-actions.ts inserts roster children with
-- created_by_teacher set, then enrols those rows. All 8 existing memberships in
-- production are teacher-created and none parent-owned, so this matches real
-- usage. Parents enrol their own children through the separate policy.
--
-- SECURITY DEFINER helper, matching the existing ones: a policy querying
-- `children` inline would reintroduce the RLS recursion migration 024 fixed.

CREATE OR REPLACE FUNCTION public.auth_created_child(c_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM children
    WHERE id = c_id AND created_by_teacher = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.auth_created_child(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_created_child(uuid) TO authenticated;

DROP POLICY IF EXISTS "Teachers manage memberships in their classrooms" ON classroom_memberships;

CREATE POLICY "Teachers manage memberships in their classrooms"
  ON classroom_memberships FOR ALL
  USING (public.auth_is_classroom_teacher(classroom_id))
  WITH CHECK (
    public.auth_is_classroom_teacher(classroom_id)
    AND (public.auth_created_child(child_id) OR public.auth_owns_child(child_id))
  );
