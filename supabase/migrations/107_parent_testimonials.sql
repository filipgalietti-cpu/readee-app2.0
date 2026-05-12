-- Parent testimonial / quote capture.
--
-- The marketing site currently runs placeholder testimonials. We need
-- real ones the moment we launch. Rather than scrape support emails
-- later, we capture them at the moment of value — after a kid hits a
-- milestone, OR via a "share what's working" prompt in the parent
-- account page.
--
-- Distinct from feedback_reports (which is general triage / bug
-- reports / complaints). This table is specifically for marketing-
-- eligible positive quotes — kept clean so Jen + Filip can scan one
-- table to pull homepage testimonials.
--
-- Approval is manual — an admin reviews + flips approved=true. Only
-- approved + marketing_consent=true rows get pulled onto the site.

create table if not exists public.parent_testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  display_name text,            -- "Sarah M." — what we'd show on the site
  child_grade text,             -- "1st grader" — for the role line
  rating smallint check (rating between 1 and 5),
  quote text not null,
  marketing_consent boolean not null default false,
  approved boolean not null default false,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  rejected_reason text,
  source text,                  -- where in the app it came from
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists parent_testimonials_pending_idx
  on public.parent_testimonials (created_at desc)
  where approved = false and rejected_reason is null;

create index if not exists parent_testimonials_live_idx
  on public.parent_testimonials (approved_at desc)
  where approved = true and marketing_consent = true;

alter table public.parent_testimonials enable row level security;

-- Parents can submit their own testimonial and read their own row
-- (in case they want to revoke consent later). They can't see other
-- parents' testimonials.
create policy parent_testimonials_self_insert
  on public.parent_testimonials for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy parent_testimonials_self_select
  on public.parent_testimonials for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy parent_testimonials_self_update
  on public.parent_testimonials for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Admins (Filip / Jen) get full read/write for approval workflow.
create policy parent_testimonials_admin_all
  on public.parent_testimonials for all
  to authenticated
  using (
    exists (select 1 from public.admin_memberships am
            where am.profile_id = (select auth.uid()))
  )
  with check (
    exists (select 1 from public.admin_memberships am
            where am.profile_id = (select auth.uid()))
  );

create or replace function public.tg_parent_testimonials_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists parent_testimonials_updated_at on public.parent_testimonials;
create trigger parent_testimonials_updated_at
  before update on public.parent_testimonials
  for each row execute function public.tg_parent_testimonials_updated_at();
