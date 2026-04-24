-- Per-child content language preference.
--
-- The Hispanic K-4 market is ~25% of the US. Readee's existing content
-- bank (911 questions, 25 stories, 201 lessons) can be regenerated
-- bilingually via Gemini — no new content creation needed. This
-- migration adds the language-preference column so the practice page
-- / story reader / lesson player can serve the right locale based on
-- the child's profile.
--
-- Supported values for v1: 'en' (English, default) and 'es' (Spanish).
-- Add more only after we've actually generated the content files.

alter table public.children
  add column if not exists language text not null default 'en'
  check (language in ('en', 'es'));

-- Surface on the community_passages table too — parent-generated
-- content can be in either language, and /practice-hub/community can
-- filter by the viewing child's language.
alter table public.community_passages
  add column if not exists language text not null default 'en'
  check (language in ('en', 'es'));

alter table public.child_ai_content
  add column if not exists language text not null default 'en'
  check (language in ('en', 'es'));
