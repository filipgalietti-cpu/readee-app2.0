-- Real photographs from Wikimedia arrive under CC BY / CC BY-SA, which require
-- credit. The daily row had nowhere to put it, so serving one would have been a
-- licence violation on a commercial product. Nullable: AI-generated images and
-- imageless days leave it null, and the UI only renders a credit when set.
alter table public.daily_questions
  add column if not exists image_attribution text;
