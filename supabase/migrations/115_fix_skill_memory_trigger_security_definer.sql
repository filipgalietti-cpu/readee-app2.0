-- CRITICAL FIX: practice completions stopped saving app-wide (~7 days).
--
-- apply_skill_memory_update() is an AFTER INSERT trigger on practice_results
-- that maintains the derived child_skill_memory table. It ran SECURITY INVOKER
-- (as the calling authenticated user). child_skill_memory has RLS enabled with
-- NO write policy (deny-all for clients — correct, since only this trigger
-- writes it), so the trigger's insert/update was denied and rolled back the
-- ENTIRE practice_results insert. supabase-js returns that as { error } (no
-- throw), and the app never checked it → every practice completion silently
-- failed to save (0 practice_results rows in the 7 days before this fix).
--
-- The table is only ever written by this trigger, so run it as owner.
alter function public.apply_skill_memory_update() security definer;
alter function public.apply_skill_memory_update() set search_path = public, pg_temp;
