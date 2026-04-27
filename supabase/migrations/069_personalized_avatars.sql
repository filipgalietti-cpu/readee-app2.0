create table public.personalized_avatars (
  cache_key text primary key,
  child_id uuid not null references public.children(id) on delete cascade,
  mascot text not null,
  video_url text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index personalized_avatars_child_idx
  on public.personalized_avatars (child_id);

alter table public.personalized_avatars enable row level security;

create policy "Parents see their children's avatars"
  on public.personalized_avatars for select to authenticated
  using (
    exists (select 1 from public.children c
            where c.id = personalized_avatars.child_id
              and c.parent_id = auth.uid())
  );

create policy "Service role manages avatars"
  on public.personalized_avatars for all to service_role
  using (true) with check (true);
