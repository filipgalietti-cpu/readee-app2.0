-- Cross-session memory for the Reading Buddy.
--
-- One row per buddy session. Stores a condensed summary, the words
-- the kid asked about, the CCSS standards that came up, the mood
-- signal, and session length. The next time the kid opens Buddy we
-- load the last few rows and prepend them to the system prompt so
-- Readee can say "last time we worked on the silent E words —
-- want to keep going?"

create table public.buddy_memories (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  summary text not null,
  words_asked jsonb not null default '[]'::jsonb,
  standards_touched jsonb not null default '[]'::jsonb,
  -- "engaged" | "frustrated" | "confident" | "neutral"
  mood text,
  session_minutes numeric,
  created_at timestamptz not null default now()
);

create index buddy_memories_child_idx
  on public.buddy_memories (child_id, created_at desc);

alter table public.buddy_memories enable row level security;

-- Parents see their own children's memories.
create policy "Parents see their children's buddy memories"
  on public.buddy_memories for select to authenticated
  using (
    exists (select 1 from public.children c
            where c.id = buddy_memories.child_id
              and c.parent_id = auth.uid())
  );

-- Service role manages writes (the summarizer runs server-side).
create policy "Service role manages buddy memories"
  on public.buddy_memories for all to service_role
  using (true) with check (true);
