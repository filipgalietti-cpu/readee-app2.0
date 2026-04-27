-- Decodable books — see DDL applied via MCP.

create table public.custom_books (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  phonics_pattern text not null,
  pattern_label text not null,
  grade_level text,
  cover_image_url text,
  pages jsonb not null default '[]'::jsonb,
  qc_overall text not null default 'pass'
    check (qc_overall in ('pass','warn','fail')),
  qc_report jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index custom_books_teacher_idx
  on public.custom_books (teacher_id, updated_at desc);

alter table public.custom_books enable row level security;

create policy "Teachers manage their own books"
  on public.custom_books for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "Admins read all custom books"
  on public.custom_books for select to authenticated
  using (exists (select 1 from public.admin_memberships am where am.profile_id = auth.uid()));

create or replace function public.touch_custom_books_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger custom_books_updated_at
  before update on public.custom_books
  for each row
  execute function public.touch_custom_books_updated_at();
