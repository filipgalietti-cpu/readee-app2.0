-- Repair `onboarding_complete` for everyone the dead write missed.
--
-- KidWelcomeFlow shipped on 2026-07-30 (477049cf) with the profiles update as
-- `void supabase.from(...).update(...)` and no .then(). A Supabase builder is a
-- lazy thenable - the fetch happens inside .then() - so the statement was built
-- and dropped without ever reaching the API. Nothing wrote the flag from that
-- day until the fix that accompanies this migration, and it failed silently,
-- because a request that is never sent cannot return an error.
--
-- The flag gates nothing (it is read only by the owner dashboard and a
-- schema-health route), so no user was ever blocked. What it did corrupt is
-- every funnel number derived from it.
--
-- This repairs 40 profiles, reaching back to 2026-02-15 - wider than the bug
-- itself. The earlier rows are parents who added a reader through onboarding
-- paths that predate KidWelcomeFlow and never set the flag either. Backfilling
-- all of them is deliberate: the column should mean "this parent has finished
-- setting up", not "this parent happened to use one particular code path
-- during one particular window".
--
-- Having a child IS the completion event this flag is meant to record - it is
-- exactly what KidWelcomeFlow does immediately before the line that failed - so
-- the child rows are a faithful source to rebuild from. The first child's
-- created_at is the closest honest timestamp we have for when onboarding
-- finished; coalesce keeps any real value already recorded.
update public.profiles p
   set onboarding_complete    = true,
       onboarding_completed_at = coalesce(p.onboarding_completed_at, c.first_child_at)
  from (
        select parent_id, min(created_at) as first_child_at
          from public.children
         group by parent_id
       ) c
 where c.parent_id = p.id
   and p.onboarding_complete = false;
