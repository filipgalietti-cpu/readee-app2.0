-- 125: private bucket for child-generated audio (COPPA).
--
-- Child voice recordings (fluency/) and name-greeting TTS (greetings/) were
-- written to the PUBLIC `audio` bucket and served via getPublicUrl() — anyone
-- with the URL could retrieve a child's voice/name clip, forever. That bucket
-- must stay public (question/phoneme/story audio for logged-out visitors), so
-- child audio moves to this PRIVATE bucket, served only via short-TTL signed
-- URLs minted behind an ownership check (/api/child-audio). No anon/
-- authenticated policies: access is exclusively service-role (the signing
-- route) — deny-all by default. Existing 41 greeting objects migrated by
-- scripts/migrate-child-audio.ts.

insert into storage.buckets (id, name, public)
values ('child-audio', 'child-audio', false)
on conflict (id) do update set public = false;
