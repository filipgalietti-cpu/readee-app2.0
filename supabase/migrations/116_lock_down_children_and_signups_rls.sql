-- CHILDREN DATA PROTECTION
-- 1) Remove the anon INSERT hole on children. The "Service role can insert
--    children" policy was granted to the ANON role with WITH CHECK (true),
--    letting any UNAUTHENTICATED client create arbitrary children rows. Legit
--    creation is authenticated — parents (settings) via "Parents can insert
--    own children", teachers via the classroom policy — and the signup route
--    creates children with the service role, which bypasses RLS and never
--    needed this policy.
drop policy if exists "Service role can insert children" on public.children;

-- 2) signups stores child names/grades (jsonb). "Allow authenticated select"
--    used qual = true, so ANY logged-in user could read EVERY family's signup
--    (child names included). No browser code reads signups — owner/admin
--    surfaces use the service role — so drop the blanket authenticated read.
drop policy if exists "Allow authenticated select" on public.signups;
