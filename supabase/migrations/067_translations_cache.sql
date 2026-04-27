-- Cache for Gemini translations. Keyed on sha256(text + target_lang)
-- so identical translation requests are free after the first.

create table public.translations_cache (
  hash_key text primary key,
  source_text text not null,
  target_lang text not null,
  translated_text text not null,
  created_at timestamptz not null default now()
);

create index translations_cache_lang_idx
  on public.translations_cache (target_lang, created_at desc);

alter table public.translations_cache enable row level security;

-- Reads are wide-open to authenticated users (translations are not
-- sensitive — they're public content rendered in different languages).
create policy "Authenticated read translations"
  on public.translations_cache for select to authenticated using (true);

-- Writes only via service role.
create policy "Service role manages translations"
  on public.translations_cache for all to service_role
  using (true) with check (true);
