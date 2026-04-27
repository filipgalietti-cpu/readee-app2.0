-- Teacher voice preferences for Readee.ai TTS.
--
-- voice_id        — Gemini prebuilt voice ("Autonoe", "Puck", "Kore", …)
-- voice_style     — free-text style direction ("warmly, unhurried, motherly")
-- voice_provider  — "gemini" or "elevenlabs"
-- voice_clone_id  — ElevenLabs voice id when cloning is set up
-- voice_sample_url — Supabase URL of the original sample they uploaded

alter table public.profiles
  add column if not exists voice_id text,
  add column if not exists voice_style text,
  add column if not exists voice_provider text default 'gemini'
    check (voice_provider in ('gemini','elevenlabs')),
  add column if not exists voice_clone_id text,
  add column if not exists voice_sample_url text;
