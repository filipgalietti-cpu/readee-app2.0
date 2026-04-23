-- Ensure 'educator' is an allowed value on profiles.role, while preserving
-- existing 'student' and 'child' rows that have accumulated in prod.
--
-- Live state at time of writing: profiles contains rows with role='student'.
-- The constraint had drifted to disallow 'educator', blocking the new
-- Classroom teacher product. This migration realigns the allowlist with
-- the values actually in use + the canonical enum in lib/db/types.ts.

DO $$
DECLARE
  con_name TEXT;
BEGIN
  SELECT conname INTO con_name
  FROM pg_constraint
  WHERE conrelid = 'public.profiles'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%role%';

  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE profiles DROP CONSTRAINT %I', con_name);
  END IF;

  ALTER TABLE profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('parent', 'child', 'student', 'educator'));
END $$;
