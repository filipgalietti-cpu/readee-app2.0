-- Server-side backstop for the readers paywall (1 free / up to 2 full-access).
-- The settings UI already gates this, but a direct client insert bypassed it —
-- there was NO DB enforcement. This trigger enforces it at the row level.
--
-- Full access = paid plan OR inside the 7-day reverse trial (created_at < 7d),
-- matching lib/plan/access.ts. Classroom students (owner_type <> 'parent',
-- parent_id null) are exempt so roster import is unaffected. Idempotent.

create or replace function enforce_reader_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  p_plan text;
  p_created timestamptz;
  cnt int;
  max_readers int;
begin
  -- Only gate B2C parent-owned readers; classroom students are exempt.
  if coalesce(new.owner_type, 'parent') <> 'parent' or new.parent_id is null then
    return new;
  end if;

  select plan, created_at into p_plan, p_created
  from profiles where id = new.parent_id;

  if p_plan in ('premium', 'teacher_solo')
     or (p_created is not null and now() - p_created < interval '7 days') then
    max_readers := 2;
  else
    max_readers := 1;
  end if;

  select count(*) into cnt from children
  where parent_id = new.parent_id and coalesce(owner_type, 'parent') = 'parent';

  if cnt >= max_readers then
    raise exception 'reader_limit_exceeded (max % readers on this plan)', max_readers
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_reader_limit on children;
create trigger trg_enforce_reader_limit
  before insert on children
  for each row execute function enforce_reader_limit();
