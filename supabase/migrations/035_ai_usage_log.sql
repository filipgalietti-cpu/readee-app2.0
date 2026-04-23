-- Rate limiting + audit log for Readee.ai teacher-facing generations.
-- Each AI call (quiz generation, image generation, TTS) records one row.
-- Used by server actions to enforce a simple per-teacher rolling-hour cap
-- before a future credit economy lands.

create table public.ai_usage_log (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('quiz_generation', 'image_generation', 'tts_generation', 'passage_generation')),
  model text,
  input_tokens integer,
  output_tokens integer,
  credits_used integer not null default 1,
  success boolean not null,
  error text,
  request_summary text,
  created_at timestamptz not null default now()
);

create index ai_usage_log_teacher_time_idx
  on public.ai_usage_log (teacher_id, created_at desc);

alter table public.ai_usage_log enable row level security;

create policy "Teachers see their own AI usage"
  on public.ai_usage_log for select to authenticated
  using (teacher_id = auth.uid());
