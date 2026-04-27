-- Per-child interests + personalized stories — see DDL via MCP.

alter table public.children
  add column if not exists interests text[];

create table public.personalized_stories (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  parent_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  reading_level text,
  cover_image_url text,
  pages jsonb not null default '[]'::jsonb,
  qc_overall text not null default 'pass'
    check (qc_overall in ('pass','warn','fail')),
  qc_report jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index personalized_stories_child_idx
  on public.personalized_stories (child_id, updated_at desc);

alter table public.personalized_stories enable row level security;

create policy "Parents read their kids' stories"
  on public.personalized_stories for select to authenticated
  using (parent_id = auth.uid());

create policy "Parents create stories for their own kids"
  on public.personalized_stories for insert to authenticated
  with check (
    parent_id = auth.uid()
    and child_id in (select id from public.children where parent_id = auth.uid())
  );

create policy "Parents delete their kids' stories"
  on public.personalized_stories for delete to authenticated
  using (parent_id = auth.uid());

create or replace function public.touch_personalized_stories_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger personalized_stories_updated_at
  before update on public.personalized_stories
  for each row
  execute function public.touch_personalized_stories_updated_at();
