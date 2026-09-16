-- A flag keeps its AI re-review and its resolution, so the admin queue can show
-- flags instead of the team inbox being the only record of them.
alter table public.community_reports
  add column if not exists verdict text,
  add column if not exists removed boolean not null default false,
  add column if not exists reviewed_at timestamptz,
  add column if not exists resolved_at timestamptz,
  add column if not exists resolved_by uuid references public.profiles(id) on delete set null;
create index if not exists community_reports_open_idx
  on public.community_reports (created_at desc) where status = 'open';
