-- Add 'lesson_enrichment' to content_review_queue.asset_kind so the
-- K-richness regen worker can drop proposals into the same review
-- queue the factory uses. Each row carries the diff between the
-- existing thin lesson and the proposed enriched JSON; ops merges
-- approved rows into app/data/sample-lessons.json.

alter table public.content_review_queue
  drop constraint if exists content_review_queue_asset_kind_check;

alter table public.content_review_queue
  add constraint content_review_queue_asset_kind_check
  check (asset_kind in (
    'leveled_passage',
    'calibrated_mcq',
    'decodable_book',
    'themed_story',
    'vocab_card',
    'multi_voice_audio',
    'lesson_enrichment'
  ));
