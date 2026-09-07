-- Founder review of V2 lessons: a place to record how a lesson FEELS.
--
-- Everything the QC pipeline produces is mechanical - does the file exist, does
-- the duration match the script, is the correct answer the longest option. None
-- of it answers the question that actually decides whether a lesson ships: does
-- this sound right, does the art carry the idea, does the activity teach. That
-- judgement only exists in Filip's head, and until now there was nowhere to put
-- it, so it evaporated the moment he closed the tab.
--
-- One row per (lesson, scene, reviewer). `scene_id = ''` is the lesson-level
-- verdict rather than a nullable column, because Postgres treats NULLs as
-- distinct in a unique index and the upsert would silently duplicate.
--
-- `verdicts` is jsonb rather than columns because the categories are a product
-- question, not a schema one: today voice/words/art/activity/pace, tomorrow
-- whatever reviewing 183 lessons teaches us to look at. A migration per category
-- change would guarantee the categories never change.

-- ‼️ There is no is_platform_admin() in SQL - the gate lived only in TypeScript
-- (lib/auth/admin-gate.ts reads the platform_admins table). A policy cannot call
-- that, so it gets a SQL twin here. SECURITY DEFINER because a caller who is not
-- yet known to be an admin cannot be allowed to read platform_admins directly,
-- and STABLE so the planner calls it once per statement rather than per row.
create or replace function public.is_platform_admin(p_profile uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.platform_admins where profile_id = p_profile
  );
$$;

revoke all on function public.is_platform_admin(uuid) from public, anon;
grant execute on function public.is_platform_admin(uuid) to authenticated;

create table if not exists public.lesson_reviews (
  id           uuid primary key default gen_random_uuid(),
  lesson_slug  text not null,
  -- '' means the whole lesson. Any other value is a scene id within it.
  scene_id     text not null default '',
  reviewer_id  uuid not null references public.profiles(id) on delete cascade,
  -- {voice:"up"|"down", words:..., art:..., activity:..., pace:...} on a scene;
  -- {overall:"up"|"down"} on the lesson row.
  verdicts     jsonb not null default '{}'::jsonb,
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (lesson_slug, scene_id, reviewer_id)
);

create index if not exists lesson_reviews_slug_idx
  on public.lesson_reviews (lesson_slug);
-- The "what still needs my attention" query: lesson-level rows, newest first.
create index if not exists lesson_reviews_overall_idx
  on public.lesson_reviews (reviewer_id, updated_at desc)
  where scene_id = '';

alter table public.lesson_reviews enable row level security;

-- ‼️ Policies in the SAME migration as the enable. A table with RLS on and no
-- policy is invisible to everyone, which is how save reliability broke before.
--
-- Platform admins only. This is an internal tool: no child, parent or teacher
-- has any business reading or writing it, and the reviewer_id check means one
-- admin cannot overwrite another's judgement.
create policy lesson_reviews_admin_select on public.lesson_reviews
  for select using (public.is_platform_admin(auth.uid()));

create policy lesson_reviews_admin_insert on public.lesson_reviews
  for insert with check (
    public.is_platform_admin(auth.uid()) and reviewer_id = auth.uid()
  );

create policy lesson_reviews_admin_update on public.lesson_reviews
  for update using (
    public.is_platform_admin(auth.uid()) and reviewer_id = auth.uid()
  ) with check (
    public.is_platform_admin(auth.uid()) and reviewer_id = auth.uid()
  );

create policy lesson_reviews_admin_delete on public.lesson_reviews
  for delete using (
    public.is_platform_admin(auth.uid()) and reviewer_id = auth.uid()
  );

create or replace function public.touch_lesson_reviews_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists lesson_reviews_touch on public.lesson_reviews;
create trigger lesson_reviews_touch
  before update on public.lesson_reviews
  for each row execute function public.touch_lesson_reviews_updated_at();
