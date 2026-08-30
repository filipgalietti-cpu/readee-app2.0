-- Leveled Daily Readee: optional K-1 rendition of the day's article.
-- Shape mirrors the base columns: { passage_body, audio_url, question_prompt,
-- choices, correct, hint, extra_questions }. Null = no easy rendition (legacy days).
alter table public.daily_questions add column if not exists easy_variant jsonb;
