-- Performance pass: missing FK indexes + auth.uid() initplan rewrite.
--
-- Driven by the Supabase performance advisor sweep on May 6 2026.
-- Two classes of fix:
--
-- 1. Hot-path FK indexes. Six FK columns the parent dashboard /
--    teacher dashboard / live-quiz pages query on every render
--    weren't indexed. Without an index the planner scans the whole
--    table on each lookup.
--
-- 2. auth_rls_initplan rewrite. Postgres re-evaluates auth.uid()
--    once per row when it appears bare in a policy. Wrapping it in
--    (select auth.uid()) lets the planner cache the result for the
--    whole query. This is the single biggest win the advisor flagged
--    — every kid-dashboard fetch was paying per-row cost on parent
--    ownership checks. Functional behavior is identical; only the
--    planner sees a constant where it used to see a stable function.
--
-- Scoped to the highest-traffic tables. Lower-traffic tables (custom
-- lessons, fluency, etc.) can be migrated incrementally.

-- ── 1. Hot-path FK indexes ─────────────────────────────────────────

create index if not exists children_parent_idx
  on public.children (parent_id);

create index if not exists assessments_child_idx
  on public.assessments (child_id, completed_at desc);

create index if not exists community_passages_source_content_idx
  on public.community_passages (source_content_id);

create index if not exists live_quiz_answers_child_idx
  on public.live_quiz_answers (child_id);

create index if not exists live_quiz_participants_child_idx
  on public.live_quiz_participants (child_id);

create index if not exists fluency_readings_assignment_idx
  on public.fluency_readings (assignment_id) where assignment_id is not null;

-- ── 2. auth.uid() initplan rewrite ─────────────────────────────────

-- profiles
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles for select
  using ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  using ((select auth.uid()) = id);

-- children
drop policy if exists "Parents can view own children" on public.children;
create policy "Parents can view own children"
  on public.children for select
  using ((select auth.uid()) = parent_id);

drop policy if exists "Parents can insert own children" on public.children;
create policy "Parents can insert own children"
  on public.children for insert
  with check ((select auth.uid()) = parent_id);

drop policy if exists "Parents can update own children" on public.children;
create policy "Parents can update own children"
  on public.children for update
  using ((select auth.uid()) = parent_id);

-- child_ai_content
drop policy if exists "Parents manage their children's AI content" on public.child_ai_content;
create policy "Parents manage their children's AI content"
  on public.child_ai_content for all to authenticated
  using (parent_id = (select auth.uid()))
  with check (parent_id = (select auth.uid()));

-- kid_feedback (Phase 2 thumbs ledger)
drop policy if exists "Parents manage their kids' feedback" on public.kid_feedback;
create policy "Parents manage their kids' feedback"
  on public.kid_feedback for all to authenticated
  using (parent_id = (select auth.uid()))
  with check (parent_id = (select auth.uid()));

-- lessons_progress
drop policy if exists "Parents can view their children's lesson progress" on public.lessons_progress;
create policy "Parents can view their children's lesson progress"
  on public.lessons_progress for select
  using (
    child_id in (select id from public.children where parent_id = (select auth.uid()))
  );

drop policy if exists "Parents can insert their children's lesson progress" on public.lessons_progress;
create policy "Parents can insert their children's lesson progress"
  on public.lessons_progress for insert
  with check (
    child_id in (select id from public.children where parent_id = (select auth.uid()))
  );

-- practice_results
drop policy if exists "Parents can view their children's practice results" on public.practice_results;
create policy "Parents can view their children's practice results"
  on public.practice_results for select
  using (
    child_id in (select id from public.children where parent_id = (select auth.uid()))
  );

drop policy if exists "Parents can insert their children's practice results" on public.practice_results;
create policy "Parents can insert their children's practice results"
  on public.practice_results for insert
  with check (
    child_id in (select id from public.children where parent_id = (select auth.uid()))
  );
