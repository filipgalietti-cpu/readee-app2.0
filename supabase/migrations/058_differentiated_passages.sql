-- Differentiated reading passages — see DDL applied via MCP.

create table public.differentiated_passages (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  topic text not null,
  base_grade text,
  shared_image_url text,
  versions jsonb not null default '[]'::jsonb,
  qc_overall text not null default 'pass'
    check (qc_overall in ('pass','warn','fail')),
  qc_report jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index differentiated_passages_teacher_idx
  on public.differentiated_passages (teacher_id, updated_at desc);

alter table public.differentiated_passages enable row level security;

create policy "Teachers manage their own leveled passages"
  on public.differentiated_passages for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "Admins read all leveled passages"
  on public.differentiated_passages for select to authenticated
  using (exists (select 1 from public.admin_memberships am where am.profile_id = auth.uid()));

create or replace function public.touch_differentiated_passages_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger differentiated_passages_updated_at
  before update on public.differentiated_passages
  for each row
  execute function public.touch_differentiated_passages_updated_at();
