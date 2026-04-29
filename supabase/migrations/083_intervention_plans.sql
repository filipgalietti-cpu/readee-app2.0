-- AI-drafted intervention plans tied to a specific IEP goal. Each
-- row is one teacher-authored 2-week plan. Plans persist so case
-- managers can revisit, copy, and iterate on what worked.

create table if not exists intervention_plans (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  teacher_id uuid not null references profiles(id) on delete cascade,
  goal_id uuid references student_iep_goals(id) on delete set null,
  plan_json jsonb not null,
  status text not null default 'draft' check (
    status in ('draft', 'active', 'completed', 'archived')
  ),
  start_date date,
  end_date date,
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists intervention_plans_child_idx
  on intervention_plans (child_id, generated_at desc);
create index if not exists intervention_plans_teacher_idx
  on intervention_plans (teacher_id, generated_at desc);
create index if not exists intervention_plans_goal_idx
  on intervention_plans (goal_id) where goal_id is not null;

alter table intervention_plans enable row level security;

create policy intervention_plans_classroom_select
  on intervention_plans for select
  using (
    teacher_id = auth.uid()
    or exists (
      select 1
      from classroom_memberships cm
      join classrooms c on c.id = cm.classroom_id
      where cm.child_id = intervention_plans.child_id
        and c.teacher_id = auth.uid()
    )
  );

create policy intervention_plans_owner_insert
  on intervention_plans for insert
  with check (teacher_id = auth.uid());

create policy intervention_plans_owner_update
  on intervention_plans for update
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy intervention_plans_owner_delete
  on intervention_plans for delete
  using (teacher_id = auth.uid());

create or replace function tg_intervention_plans_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger intervention_plans_updated_at
  before update on intervention_plans
  for each row execute function tg_intervention_plans_updated_at();
