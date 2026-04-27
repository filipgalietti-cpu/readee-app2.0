-- Embeddings index for semantic search across all Readee content.
-- Powers "find similar," recommendation rails, duplicate detection,
-- and natural-language search across the question/lesson/book library.

create extension if not exists vector;

-- One row per (content_type, content_id) pair. Polymorphic by design
-- so we don't need a join table per content kind.
--
-- text_hash = a stable hash of the embedded text. Lets us skip re-
-- embedding when nothing changed. We use sha256 over the source text.
create table public.content_embeddings (
  id uuid primary key default gen_random_uuid(),
  content_type text not null
    check (content_type in (
      'sample_lesson','sample_question','story',
      'custom_lesson','custom_book','custom_quiz',
      'leveled_passage'
    )),
  content_id text not null,
  teacher_id uuid references public.profiles(id) on delete cascade,
  text_hash text not null,
  embedding vector(768) not null,
  metadata jsonb not null default '{}'::jsonb,
  source_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_type, content_id)
);

-- HNSW index for fast cosine similarity. m=16 ef_construction=64 are
-- the standard pgvector defaults; tune later if recall drops.
create index content_embeddings_vec_idx
  on public.content_embeddings
  using hnsw (embedding vector_cosine_ops);

create index content_embeddings_type_idx
  on public.content_embeddings (content_type);

create index content_embeddings_teacher_idx
  on public.content_embeddings (teacher_id)
  where teacher_id is not null;

alter table public.content_embeddings enable row level security;

-- Anyone authenticated can read Readee-built content embeddings
-- (teacher_id IS NULL). Teacher-owned content is owner-only. Admins
-- read all.
create policy "Read public Readee embeddings"
  on public.content_embeddings for select to authenticated
  using (teacher_id is null);

create policy "Read own teacher embeddings"
  on public.content_embeddings for select to authenticated
  using (teacher_id = auth.uid());

create policy "Admins read all embeddings"
  on public.content_embeddings for select to authenticated
  using (exists (select 1 from public.admin_memberships am where am.profile_id = auth.uid()));

-- Inserts/updates only via service role (server-side embedding writes).
create policy "Service role manages embeddings"
  on public.content_embeddings for all to service_role
  using (true) with check (true);

-- Cosine-similarity match RPC. Callers pass a normalized 768-dim
-- embedding and get the top N hits with similarity score.
create or replace function public.match_content_embeddings(
  query_embedding vector(768),
  match_threshold float default 0.55,
  match_count int default 20,
  filter_types text[] default null,
  filter_teacher uuid default null
)
returns table (
  id uuid,
  content_type text,
  content_id text,
  teacher_id uuid,
  metadata jsonb,
  similarity float
)
language sql
stable
as $$
  select
    e.id,
    e.content_type,
    e.content_id,
    e.teacher_id,
    e.metadata,
    1 - (e.embedding <=> query_embedding) as similarity
  from public.content_embeddings e
  where (filter_types is null or e.content_type = any(filter_types))
    and (
      filter_teacher is null
      or e.teacher_id = filter_teacher
      or e.teacher_id is null  -- public Readee content
    )
    and 1 - (e.embedding <=> query_embedding) > match_threshold
  order by e.embedding <=> query_embedding
  limit match_count;
$$;
