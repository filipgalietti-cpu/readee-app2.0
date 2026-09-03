-- How the child's name is SAID (a respelling like "fee-LOOSH" for "Filus"),
-- used only as the spoken form in Luna's name clips and the placement
-- narration. The written name stays first_name. Set by the parent in Kid
-- Welcome or Settings, usually from a short recording that Gemini turns into
-- the respelling.
alter table public.children add column if not exists name_said_as text;
