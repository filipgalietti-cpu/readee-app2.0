-- Approved Unit 1: private resumable state + atomic, once-per-release reward settlement.
create table public.approved_unit_sessions (
 child_id uuid not null references public.children(id) on delete cascade,
 release_id text not null,
 lesson_id text not null,
 revision integer not null default 0,
 state jsonb not null default '{}'::jsonb,
 completed boolean not null default false,
 result jsonb,
 carrots_awarded integer not null default 0,
 updated_at timestamptz not null default now(),
 primary key(child_id,release_id,lesson_id),
 check(octet_length(state::text)<=262144),
 check(carrots_awarded between 0 and 500)
);
alter table public.approved_unit_sessions enable row level security;
revoke all on public.approved_unit_sessions from anon,authenticated;
grant select on public.approved_unit_sessions to authenticated;
create policy parent_reads_approved_unit on public.approved_unit_sessions for select to authenticated
 using(exists(select 1 from public.children c where c.id=child_id and c.parent_id=(select auth.uid())));
-- All mutations come from the authenticated server after authored-answer validation.
create function public.save_approved_unit(p_parent uuid,p_child uuid,p_release text,p_lesson text,p_revision integer,p_state jsonb,p_completed boolean,p_result jsonb,p_carrots integer,p_standard text)
returns integer language plpgsql security invoker set search_path=public,pg_temp as $$
declare row_state public.approved_unit_sessions; next_revision integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_child::text||p_release||p_lesson,0));
 if not exists(select 1 from public.children where id=p_child and parent_id=p_parent) then raise exception 'child not found' using errcode='42501';end if;
 if p_carrots not between 0 and 500 or octet_length(p_state::text)>262144 then raise exception 'invalid state';end if;
 select * into row_state from public.approved_unit_sessions where child_id=p_child and release_id=p_release and lesson_id=p_lesson for update;
 if coalesce(row_state.revision,0)<>p_revision then
   -- Lost response retry is safe; a different stale writer must reload.
   if row_state.state=p_state then return row_state.revision;end if;
   raise exception 'revision conflict' using errcode='40001';
 end if;
 next_revision=p_revision+1;
 insert into public.approved_unit_sessions(child_id,release_id,lesson_id,revision,state,completed,result,carrots_awarded)
 values(p_child,p_release,p_lesson,next_revision,p_state,p_completed,p_result,case when p_completed then p_carrots else 0 end)
 on conflict(child_id,release_id,lesson_id) do update set revision=next_revision,state=p_state,
 completed=approved_unit_sessions.completed or p_completed,
 result=case when p_completed then p_result else approved_unit_sessions.result end,
 carrots_awarded=case when approved_unit_sessions.completed then approved_unit_sessions.carrots_awarded when p_completed then p_carrots else 0 end,updated_at=now();
 if p_completed and not coalesce(row_state.completed,false) then
   perform public.award_carrots(p_child,p_carrots,true);
   update public.children set last_lesson_at=now() where id=p_child;
   -- Store actual independent results; never inflate a score to satisfy legacy >=3.
   if p_standard is not null then
     insert into public.practice_results(child_id,standard_id,questions_attempted,questions_correct,carrots_earned)
     values(p_child,p_standard,(p_result->>'attempted')::integer,(p_result->>'correct')::integer,p_carrots);
   end if;
 end if;
 return next_revision;
end;$$;
revoke all on function public.save_approved_unit(uuid,uuid,text,text,integer,jsonb,boolean,jsonb,integer,text) from public,anon,authenticated;
grant execute on function public.save_approved_unit(uuid,uuid,text,text,integer,jsonb,boolean,jsonb,integer,text) to service_role;
-- Shared, atomic service-call budget; no speech, names or transcripts stored.
create table public.approved_unit_service_budget(parent_id uuid references auth.users(id) on delete cascade,window_start timestamptz,kind text,calls integer not null,primary key(parent_id,window_start,kind));
alter table public.approved_unit_service_budget enable row level security;
revoke all on public.approved_unit_service_budget from public,anon,authenticated;
create function public.reserve_unit_service(p_parent uuid,p_kind text,p_limit integer) returns boolean
language plpgsql security invoker set search_path=public,pg_temp as $$
declare n integer;
begin
 if p_kind not in ('speech','response') or p_limit not between 1 and 200 then return false;end if;
 insert into public.approved_unit_service_budget values(p_parent,date_trunc('hour',now()),p_kind,1)
 on conflict(parent_id,window_start,kind) do update set calls=approved_unit_service_budget.calls+1
 where approved_unit_service_budget.calls<p_limit returning calls into n;
 delete from public.approved_unit_service_budget where parent_id=p_parent and window_start<now()-interval '2 days';
 return n is not null;
end;$$;
revoke all on function public.reserve_unit_service(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.reserve_unit_service(uuid,text,integer) to service_role;

-- Explicit server grants; do not depend on project default privileges.
grant all on public.approved_unit_sessions,public.approved_unit_service_budget to service_role;
