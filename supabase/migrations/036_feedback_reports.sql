-- User-submitted bug / feature / question reports. Captured from any
-- authed page via a floating button in the protected layout. Filip
-- gets an email alert so issues don't rot in the DB.

create table public.feedback_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  user_role text,
  path text,
  message text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index feedback_reports_created_at_idx
  on public.feedback_reports (created_at desc);

alter table public.feedback_reports enable row level security;

create policy "Users see their own feedback"
  on public.feedback_reports for select to authenticated
  using (user_id = auth.uid());

create policy "Users insert their own feedback"
  on public.feedback_reports for insert to authenticated
  with check (user_id = auth.uid());
