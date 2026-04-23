-- School join code — teachers enter this in classroom Settings to
-- link their class to a school without requiring admin privilege.
-- 6 alphanumeric chars, unique across schools. Backfilled for any
-- existing rows.

alter table public.schools
  add column join_code text;

update public.schools
  set join_code = upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6))
  where join_code is null;

alter table public.schools
  alter column join_code set not null;

create unique index schools_join_code_key on public.schools (join_code);
