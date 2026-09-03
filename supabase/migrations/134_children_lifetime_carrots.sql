-- Reader levels: give the ladder a monotonic "carrots ever earned" number.
--
-- Until now the level was SUM(practice_results.carrots_earned), a table only
-- lessons, practice and stories write. Luna, journey chests and the mystery
-- box credit children.carrots directly, so those carrots never moved the
-- ladder: one child had a 20,365 balance against a 935 ladder total, and seven
-- children with carrots had no practice rows at all, pinned at level 1.
-- Filip's call (Sep 3 2026): earning ANY carrot levels you up, spending never
-- demotes you. COD-style XP, with the wallet kept separate.
--
-- Backfill uses GREATEST(practice sum, current balance). The balance is itself
-- a valid LOWER BOUND on lifetime earned, because spending only ever reduces
-- it, so this cannot under-credit anyone.

alter table public.children
  add column if not exists lifetime_carrots integer not null default 0;

update public.children c
set lifetime_carrots = greatest(
  coalesce((
    select sum(coalesce(pr.carrots_earned, 0))
    from public.practice_results pr
    where pr.child_id = c.id
  ), 0),
  coalesce(c.carrots, 0)
)
where c.lifetime_carrots = 0;

-- Atomic award, replacing the read-modify-write every award site uses today
-- (`carrots: (row.carrots ?? 0) + n`), which silently loses an update when two
-- awards land together.
--
-- SECURITY INVOKER (the default) on purpose: the caller's own RLS decides which
-- children they may touch, so this grants no authority a direct UPDATE would
-- not already have. Server routes using the service-role client bypass RLS as
-- they already do.
--
-- p_count_toward_level exists for exactly one caller: the level-up BONUS. If
-- bonus carrots counted toward lifetime, a level-up would grant carrots that
-- trigger the next level-up, which grants more - a cascade. Spending (negative
-- amounts) never adds to lifetime either.
create or replace function public.award_carrots(
  p_child_id uuid,
  p_amount integer,
  p_count_toward_level boolean default true
)
returns table (new_carrots integer, new_lifetime integer)
language sql
as $$
  update public.children
  set carrots = coalesce(carrots, 0) + p_amount,
      lifetime_carrots = coalesce(lifetime_carrots, 0)
        + case when p_count_toward_level and p_amount > 0 then p_amount else 0 end
  where id = p_child_id
  returning carrots, lifetime_carrots;
$$;

grant execute on function public.award_carrots(uuid, integer, boolean) to authenticated, service_role;
