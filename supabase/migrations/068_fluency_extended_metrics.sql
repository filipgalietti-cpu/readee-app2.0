alter table public.fluency_readings
  add column if not exists prosody_score integer check (prosody_score is null or prosody_score between 1 and 4),
  add column if not exists prosody_note text,
  add column if not exists phrasing_score integer check (phrasing_score is null or phrasing_score between 1 and 4),
  add column if not exists phrasing_note text,
  add column if not exists self_correction_count integer default 0,
  add column if not exists target_patterns jsonb default '[]'::jsonb;
