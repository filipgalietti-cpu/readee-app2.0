-- Teacher-facing audio toggles per assignment. When enabled, the
-- student runner autoplays the question audio (if available on the
-- prompt) and enables tap-to-preview audio on choices (where the
-- question bank has choices_audio_urls populated, like phoneme
-- questions).
--
-- Defaults: prompt audio ON (matches current behavior), choice audio
-- OFF (currently always on for phoneme questions via a separate path;
-- this toggle makes it configurable per assignment).

alter table public.assignments
  add column audio_prompt_enabled boolean not null default true,
  add column audio_choices_enabled boolean not null default false;
