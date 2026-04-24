-- Spaced-repetition practice engine.
--
-- Per child per standard, we track a simple SM-2-style model:
--   ease_factor : multiplier applied to interval after a correct answer
--   interval_days : current spacing between reviews
--   next_due : when the child should see this standard again
--   consecutive_correct : run length (reset to 0 on a wrong answer)
--
-- Updates happen on every practice_results insert via a trigger. No
-- application-level bookkeeping needed — the child does practice as
-- usual, the table stays current.
--
-- A new "Today's review" page reads rows where next_due <= now() and
-- orders by oldest-due-first, so the most-overdue standards surface
-- first. We cap the daily review to ~15 items so kids aren't
-- overwhelmed.

create table if not exists public.child_skill_memory (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  standard_id text not null,

  -- SM-2-lite state.
  ease_factor real not null default 2.5 check (ease_factor >= 1.3),
  interval_days real not null default 1 check (interval_days >= 0),
  consecutive_correct integer not null default 0,
  next_due timestamptz not null default now(),

  -- Rollup stats so the review UI can prioritize struggling skills
  -- without doing per-review queries on practice_results.
  total_correct integer not null default 0,
  total_attempted integer not null default 0,
  last_practiced_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint child_skill_memory_unique unique (child_id, standard_id)
);

create index child_skill_memory_next_due_idx
  on public.child_skill_memory (child_id, next_due)
  where next_due is not null;

alter table public.child_skill_memory enable row level security;

-- Parents see their children's skill state (via children.parent_id).
create policy "Parents see child skill memory"
  on public.child_skill_memory for select to authenticated
  using (
    exists (
      select 1 from public.children c
      where c.id = child_skill_memory.child_id
        and c.parent_id = auth.uid()
    )
  );

-- Teachers see classroom-owned students' skill state.
create policy "Teachers see classroom skill memory"
  on public.child_skill_memory for select to authenticated
  using (
    exists (
      select 1 from public.children c
      join public.classrooms cl on cl.id = c.owner_classroom_id
      where c.id = child_skill_memory.child_id
        and c.owner_type = 'classroom'
        and cl.teacher_id = auth.uid()
    )
  );

-- updated_at trigger
create or replace function public.tg_child_skill_memory_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_child_skill_memory_updated_at on public.child_skill_memory;
create trigger set_child_skill_memory_updated_at
  before update on public.child_skill_memory
  for each row execute function public.tg_child_skill_memory_updated_at();

-- Core SRS update — called by trigger on practice_results insert.
--
-- Quality model per row:
--   accuracy >= 0.9  → easy      (ease +0.1, interval x ease)
--   accuracy >= 0.6  → good      (interval x ease)
--   accuracy >= 0.3  → hard      (ease -0.15, interval x 1.2)
--   accuracy <  0.3  → fail      (ease -0.25, interval reset to 1, run broken)
--
-- First review after adding a standard: interval = 1 day.
-- Second correct: interval = ease (≈2.5 days).
-- Third correct: interval = prev * ease (≈6 days).
-- And so on. Wrong answer drops run to 0 and resets interval.
create or replace function public.apply_skill_memory_update()
returns trigger
language plpgsql
as $$
declare
  v_accuracy real;
  v_attempted integer := coalesce(new.questions_attempted, 0);
  v_correct integer := coalesce(new.questions_correct, 0);
  v_existing record;
  v_new_ease real;
  v_new_interval real;
  v_new_streak integer;
begin
  if v_attempted = 0 then
    return new;
  end if;
  v_accuracy := v_correct::real / v_attempted::real;

  select *
  into v_existing
  from public.child_skill_memory
  where child_id = new.child_id and standard_id = new.standard_id
  for update;

  if not found then
    -- First time this child has seen this standard — seed a row.
    insert into public.child_skill_memory (
      child_id, standard_id, ease_factor, interval_days,
      consecutive_correct, next_due,
      total_correct, total_attempted, last_practiced_at
    ) values (
      new.child_id, new.standard_id,
      case when v_accuracy >= 0.9 then 2.6 else 2.5 end,
      case when v_accuracy < 0.3 then 1 else 2 end,
      case when v_accuracy >= 0.6 then 1 else 0 end,
      now() + make_interval(days => case when v_accuracy < 0.3 then 1 else 2 end),
      v_correct, v_attempted, now()
    );
    return new;
  end if;

  if v_accuracy < 0.3 then
    v_new_ease := greatest(1.3, v_existing.ease_factor - 0.25);
    v_new_interval := 1;
    v_new_streak := 0;
  elsif v_accuracy < 0.6 then
    v_new_ease := greatest(1.3, v_existing.ease_factor - 0.15);
    v_new_interval := greatest(1, v_existing.interval_days * 1.2);
    v_new_streak := 0;
  elsif v_accuracy < 0.9 then
    v_new_ease := v_existing.ease_factor;
    v_new_interval := v_existing.interval_days * v_existing.ease_factor;
    v_new_streak := v_existing.consecutive_correct + 1;
  else
    v_new_ease := v_existing.ease_factor + 0.1;
    v_new_interval := v_existing.interval_days * v_existing.ease_factor;
    v_new_streak := v_existing.consecutive_correct + 1;
  end if;

  -- Clamp the interval so we don't schedule reviews 50 years out.
  v_new_interval := least(v_new_interval, 180);

  update public.child_skill_memory
  set
    ease_factor = v_new_ease,
    interval_days = v_new_interval,
    consecutive_correct = v_new_streak,
    next_due = now() + make_interval(days => v_new_interval::integer),
    total_correct = v_existing.total_correct + v_correct,
    total_attempted = v_existing.total_attempted + v_attempted,
    last_practiced_at = now()
  where id = v_existing.id;

  return new;
end;
$$;

drop trigger if exists practice_results_skill_memory on public.practice_results;
create trigger practice_results_skill_memory
  after insert on public.practice_results
  for each row execute function public.apply_skill_memory_update();
