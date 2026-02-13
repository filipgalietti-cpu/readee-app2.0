-- ═══════════════════════════════════════════════════════════
-- Readee Seed Data
-- Run this AFTER the learning content migration
-- This creates sample units, lessons, items, and stories
-- ═══════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────
-- 1. CONTENT UNITS (3 units)
-- ────────────────────────────────────────────────────────────

INSERT INTO content_units (id, title, description, order_index, icon_emoji) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Short Vowels', 'Learn short vowel sounds: a, e, i, o, u', 1, '🅰️'),
  ('22222222-2222-2222-2222-222222222222', 'Consonant Blends', 'Master common consonant blends like bl, cr, st', 2, '🔤'),
  ('33333333-3333-3333-3333-333333333333', 'Long Vowels', 'Discover long vowel patterns with silent e', 3, '📖');

-- ────────────────────────────────────────────────────────────
-- 2. CONTENT LESSONS (10 lessons total, distributed across units)
-- ────────────────────────────────────────────────────────────

-- Unit 1: Short Vowels (4 lessons)
INSERT INTO content_lessons (id, unit_id, title, description, order_index, duration_minutes) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Letter A', 'Short A sound as in "cat"', 1, 5),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Letter E', 'Short E sound as in "bed"', 2, 5),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Letter I', 'Short I sound as in "sit"', 3, 6),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Letter O', 'Short O sound as in "hot"', 4, 5);

-- Unit 2: Consonant Blends (3 lessons)
INSERT INTO content_lessons (id, unit_id, title, description, order_index, duration_minutes) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'L-Blends', 'Blends with L: bl, cl, fl, gl', 1, 7),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'R-Blends', 'Blends with R: br, cr, dr, gr', 2, 7),
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', '22222222-2222-2222-2222-222222222222', 'S-Blends', 'Blends with S: st, sp, sk, sm', 3, 8);

-- Unit 3: Long Vowels (3 lessons)
INSERT INTO content_lessons (id, unit_id, title, description, order_index, duration_minutes) VALUES
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '33333333-3333-3333-3333-333333333333', 'Silent E (A)', 'Long A with silent E: make, cake, name', 1, 6),
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '33333333-3333-3333-3333-333333333333', 'Silent E (I)', 'Long I with silent E: bike, kite, time', 2, 6),
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', '33333333-3333-3333-3333-333333333333', 'Silent E (O)', 'Long O with silent E: home, bone, rope', 3, 7);

-- ────────────────────────────────────────────────────────────
-- 3. CONTENT ITEMS (30+ items across lessons)
-- ────────────────────────────────────────────────────────────

-- Lesson 1: Letter A (Short A) - 3 items
INSERT INTO content_items (lesson_id, item_type, order_index, prompt, correct_answer, options, difficulty) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'phoneme-tap', 1, 'Tap when you hear the /a/ sound in "cat"', 'a', NULL, 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'word-build', 2, 'Build the word: c_t', 'cat', '["a", "e", "i", "o"]'::jsonb, 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'multiple-choice', 3, 'Which word has the short A sound?', 'hat', '["hat", "eat", "hit", "hot"]'::jsonb, 1);

-- Lesson 2: Letter E (Short E) - 3 items
INSERT INTO content_items (lesson_id, item_type, order_index, prompt, correct_answer, options, difficulty) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'phoneme-tap', 1, 'Tap when you hear the /e/ sound in "bed"', 'e', NULL, 1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'word-build', 2, 'Build the word: b_d', 'bed', '["a", "e", "i", "o"]'::jsonb, 1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'multiple-choice', 3, 'Which word has the short E sound?', 'pen', '["pan", "pen", "pin", "pun"]'::jsonb, 1);

-- Lesson 3: Letter I (Short I) - 3 items
INSERT INTO content_items (lesson_id, item_type, order_index, prompt, correct_answer, options, difficulty) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'phoneme-tap', 1, 'Tap when you hear the /i/ sound in "sit"', 'i', NULL, 1),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'word-build', 2, 'Build the word: s_t', 'sit', '["a", "e", "i", "o"]'::jsonb, 1),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'multiple-choice', 3, 'Which word has the short I sound?', 'big', '["bag", "beg", "big", "bug"]'::jsonb, 1);

-- Lesson 4: Letter O (Short O) - 3 items
INSERT INTO content_items (lesson_id, item_type, order_index, prompt, correct_answer, options, difficulty) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'phoneme-tap', 1, 'Tap when you hear the /o/ sound in "hot"', 'o', NULL, 1),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'word-build', 2, 'Build the word: h_t', 'hot', '["a", "e", "i", "o"]'::jsonb, 1),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'comprehension', 3, 'The dog sat on a ___. Which word makes sense?', 'log', '["lag", "leg", "lig", "log"]'::jsonb, 2);

-- Lesson 5: L-Blends - 3 items
INSERT INTO content_items (lesson_id, item_type, order_index, prompt, correct_answer, options, difficulty) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'phoneme-tap', 1, 'Tap the blend in "blue"', 'bl', NULL, 2),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'word-build', 2, 'Build the word: __ag (with fl)', 'flag', '["fl", "cl", "bl", "gl"]'::jsonb, 2),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'multiple-choice', 3, 'Which word starts with a blend?', 'clap', '["cap", "clap", "lap", "tap"]'::jsonb, 2);

-- Lesson 6: R-Blends - 3 items
INSERT INTO content_items (lesson_id, item_type, order_index, prompt, correct_answer, options, difficulty) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'phoneme-tap', 1, 'Tap the blend in "crab"', 'cr', NULL, 2),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'word-build', 2, 'Build the word: __own (with br)', 'brown', '["br", "cr", "dr", "gr"]'::jsonb, 2),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'multiple-choice', 3, 'Which word has an R-blend?', 'grill', '["gill", "grill", "girl", "gall"]'::jsonb, 2);

-- Lesson 7: S-Blends - 3 items
INSERT INTO content_items (lesson_id, item_type, order_index, prompt, correct_answer, options, difficulty) VALUES
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'phoneme-tap', 1, 'Tap the blend in "stop"', 'st', NULL, 2),
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'word-build', 2, 'Build the word: __ill (with sp)', 'spill', '["st", "sp", "sk", "sm"]'::jsonb, 2),
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'comprehension', 3, 'She can ___ very fast. Pick the S-blend word:', 'skip', '["sip", "skip", "kip", "ship"]'::jsonb, 2);

-- Lesson 8: Silent E (A) - 3 items
INSERT INTO content_items (lesson_id, item_type, order_index, prompt, correct_answer, options, difficulty) VALUES
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'multiple-choice', 1, 'Which has a long A sound?', 'cake', '["cap", "cat", "cake", "can"]'::jsonb, 3),
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'word-build', 2, 'Add silent E to make: nam_', 'name', '["e", "no letter"]'::jsonb, 3),
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'comprehension', 3, 'I will ___ a cake. Which word fits?', 'bake', '["bak", "bake", "back", "bike"]'::jsonb, 3);

-- Lesson 9: Silent E (I) - 3 items
INSERT INTO content_items (lesson_id, item_type, order_index, prompt, correct_answer, options, difficulty) VALUES
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'multiple-choice', 1, 'Which has a long I sound?', 'kite', '["kit", "kite", "bit", "sit"]'::jsonb, 3),
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'word-build', 2, 'Add silent E to make: tim_', 'time', '["e", "no letter"]'::jsonb, 3),
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'comprehension', 3, 'The sun is so ___! Which word fits?', 'bright', '["brit", "brite", "bright", "bit"]'::jsonb, 3);

-- Lesson 10: Silent E (O) - 3 items
INSERT INTO content_items (lesson_id, item_type, order_index, prompt, correct_answer, options, difficulty) VALUES
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'multiple-choice', 1, 'Which has a long O sound?', 'home', '["hop", "home", "hot", "him"]'::jsonb, 3),
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'word-build', 2, 'Add silent E to make: bon_', 'bone', '["e", "no letter"]'::jsonb, 3),
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'comprehension', 3, 'The ___ helps you get home. Which word?', 'phone', '["phon", "phone", "fond", "tone"]'::jsonb, 3);

-- ────────────────────────────────────────────────────────────
-- 4. STORIES (5 decodable stories)
-- ────────────────────────────────────────────────────────────

INSERT INTO stories (id, title, description, grade_level, unlock_after_unit_id) VALUES
  ('s1111111-1111-1111-1111-111111111111', 'The Cat and the Hat', 'A simple story about a cat who finds a hat', 'K-1', NULL),
  ('s2222222-2222-2222-2222-222222222222', 'Pets at Play', 'Short vowel story about pets playing together', 'K-1', '11111111-1111-1111-1111-111111111111'),
  ('s3333333-3333-3333-3333-333333333333', 'The Blue Crab', 'A story with consonant blends about a crab', '1-2', '22222222-2222-2222-2222-222222222222'),
  ('s4444444-4444-4444-4444-444444444444', 'The Brave Snake', 'Long vowel story about a brave snake', '1-2', '33333333-3333-3333-3333-333333333333'),
  ('s5555555-5555-5555-5555-555555555555', 'A Day at Home', 'Reading comprehension story about a day at home', '2-3', '33333333-3333-3333-3333-333333333333');

-- ────────────────────────────────────────────────────────────
-- 5. STORY PAGES (Multiple pages per story)
-- ────────────────────────────────────────────────────────────

-- Story 1: The Cat and the Hat (3 pages)
INSERT INTO story_pages (story_id, page_number, content, word_timings) VALUES
  ('s1111111-1111-1111-1111-111111111111', 1, 'The cat sat.', '[{"word": "The", "start": 0.0, "end": 0.3}, {"word": "cat", "start": 0.4, "end": 0.8}, {"word": "sat", "start": 0.9, "end": 1.3}]'::jsonb),
  ('s1111111-1111-1111-1111-111111111111', 2, 'The cat has a hat.', '[{"word": "The", "start": 0.0, "end": 0.3}, {"word": "cat", "start": 0.4, "end": 0.8}, {"word": "has", "start": 0.9, "end": 1.2}, {"word": "a", "start": 1.3, "end": 1.4}, {"word": "hat", "start": 1.5, "end": 1.9}]'::jsonb),
  ('s1111111-1111-1111-1111-111111111111', 3, 'The cat and the hat.', '[{"word": "The", "start": 0.0, "end": 0.3}, {"word": "cat", "start": 0.4, "end": 0.8}, {"word": "and", "start": 0.9, "end": 1.2}, {"word": "the", "start": 1.3, "end": 1.5}, {"word": "hat", "start": 1.6, "end": 2.0}]'::jsonb);

-- Story 2: Pets at Play (4 pages)
INSERT INTO story_pages (story_id, page_number, content, word_timings) VALUES
  ('s2222222-2222-2222-2222-222222222222', 1, 'The dog can run.', '[{"word": "The", "start": 0.0, "end": 0.3}, {"word": "dog", "start": 0.4, "end": 0.8}, {"word": "can", "start": 0.9, "end": 1.2}, {"word": "run", "start": 1.3, "end": 1.7}]'::jsonb),
  ('s2222222-2222-2222-2222-222222222222', 2, 'The cat can nap.', '[{"word": "The", "start": 0.0, "end": 0.3}, {"word": "cat", "start": 0.4, "end": 0.8}, {"word": "can", "start": 0.9, "end": 1.2}, {"word": "nap", "start": 1.3, "end": 1.7}]'::jsonb),
  ('s2222222-2222-2222-2222-222222222222', 3, 'The pets sit and rest.', '[{"word": "The", "start": 0.0, "end": 0.3}, {"word": "pets", "start": 0.4, "end": 0.8}, {"word": "sit", "start": 0.9, "end": 1.2}, {"word": "and", "start": 1.3, "end": 1.5}, {"word": "rest", "start": 1.6, "end": 2.1}]'::jsonb),
  ('s2222222-2222-2222-2222-222222222222', 4, 'All the pets play!', '[{"word": "All", "start": 0.0, "end": 0.3}, {"word": "the", "start": 0.4, "end": 0.6}, {"word": "pets", "start": 0.7, "end": 1.1}, {"word": "play", "start": 1.2, "end": 1.7}]'::jsonb);

-- Story 3: The Blue Crab (3 pages)
INSERT INTO story_pages (story_id, page_number, content, word_timings) VALUES
  ('s3333333-3333-3333-3333-333333333333', 1, 'The blue crab crawls on the sand.', '[{"word": "The", "start": 0.0, "end": 0.3}, {"word": "blue", "start": 0.4, "end": 0.8}, {"word": "crab", "start": 0.9, "end": 1.3}, {"word": "crawls", "start": 1.4, "end": 1.9}, {"word": "on", "start": 2.0, "end": 2.2}, {"word": "the", "start": 2.3, "end": 2.5}, {"word": "sand", "start": 2.6, "end": 3.1}]'::jsonb),
  ('s3333333-3333-3333-3333-333333333333', 2, 'It finds a shell and grabs it.', '[{"word": "It", "start": 0.0, "end": 0.2}, {"word": "finds", "start": 0.3, "end": 0.8}, {"word": "a", "start": 0.9, "end": 1.0}, {"word": "shell", "start": 1.1, "end": 1.5}, {"word": "and", "start": 1.6, "end": 1.8}, {"word": "grabs", "start": 1.9, "end": 2.4}, {"word": "it", "start": 2.5, "end": 2.7}]'::jsonb),
  ('s3333333-3333-3333-3333-333333333333', 3, 'The crab is glad!', '[{"word": "The", "start": 0.0, "end": 0.3}, {"word": "crab", "start": 0.4, "end": 0.8}, {"word": "is", "start": 0.9, "end": 1.1}, {"word": "glad", "start": 1.2, "end": 1.7}]'::jsonb);

-- Story 4: The Brave Snake (3 pages)
INSERT INTO story_pages (story_id, page_number, content, word_timings) VALUES
  ('s4444444-4444-4444-4444-444444444444', 1, 'A brave snake named Jake lives in a lake.', '[{"word": "A", "start": 0.0, "end": 0.2}, {"word": "brave", "start": 0.3, "end": 0.8}, {"word": "snake", "start": 0.9, "end": 1.4}, {"word": "named", "start": 1.5, "end": 1.9}, {"word": "Jake", "start": 2.0, "end": 2.4}, {"word": "lives", "start": 2.5, "end": 3.0}, {"word": "in", "start": 3.1, "end": 3.3}, {"word": "a", "start": 3.4, "end": 3.5}, {"word": "lake", "start": 3.6, "end": 4.1}]'::jsonb),
  ('s4444444-4444-4444-4444-444444444444', 2, 'One day Jake makes a long trip.', '[{"word": "One", "start": 0.0, "end": 0.3}, {"word": "day", "start": 0.4, "end": 0.7}, {"word": "Jake", "start": 0.8, "end": 1.2}, {"word": "makes", "start": 1.3, "end": 1.8}, {"word": "a", "start": 1.9, "end": 2.0}, {"word": "long", "start": 2.1, "end": 2.5}, {"word": "trip", "start": 2.6, "end": 3.1}]'::jsonb),
  ('s4444444-4444-4444-4444-444444444444', 3, 'Jake is safe at home.', '[{"word": "Jake", "start": 0.0, "end": 0.4}, {"word": "is", "start": 0.5, "end": 0.7}, {"word": "safe", "start": 0.8, "end": 1.2}, {"word": "at", "start": 1.3, "end": 1.5}, {"word": "home", "start": 1.6, "end": 2.1}]'::jsonb);

-- Story 5: A Day at Home (4 pages)
INSERT INTO story_pages (story_id, page_number, content, word_timings) VALUES
  ('s5555555-5555-5555-5555-555555555555', 1, 'It is time to wake up.', '[{"word": "It", "start": 0.0, "end": 0.2}, {"word": "is", "start": 0.3, "end": 0.5}, {"word": "time", "start": 0.6, "end": 1.0}, {"word": "to", "start": 1.1, "end": 1.3}, {"word": "wake", "start": 1.4, "end": 1.8}, {"word": "up", "start": 1.9, "end": 2.2}]'::jsonb),
  ('s5555555-5555-5555-5555-555555555555', 2, 'I like to eat at home.', '[{"word": "I", "start": 0.0, "end": 0.2}, {"word": "like", "start": 0.3, "end": 0.7}, {"word": "to", "start": 0.8, "end": 1.0}, {"word": "eat", "start": 1.1, "end": 1.4}, {"word": "at", "start": 1.5, "end": 1.7}, {"word": "home", "start": 1.8, "end": 2.3}]'::jsonb),
  ('s5555555-5555-5555-5555-555555555555', 3, 'I can play and make a kite.', '[{"word": "I", "start": 0.0, "end": 0.2}, {"word": "can", "start": 0.3, "end": 0.6}, {"word": "play", "start": 0.7, "end": 1.1}, {"word": "and", "start": 1.2, "end": 1.4}, {"word": "make", "start": 1.5, "end": 1.9}, {"word": "a", "start": 2.0, "end": 2.1}, {"word": "kite", "start": 2.2, "end": 2.7}]'::jsonb),
  ('s5555555-5555-5555-5555-555555555555', 4, 'Home is a nice place!', '[{"word": "Home", "start": 0.0, "end": 0.4}, {"word": "is", "start": 0.5, "end": 0.7}, {"word": "a", "start": 0.8, "end": 0.9}, {"word": "nice", "start": 1.0, "end": 1.4}, {"word": "place", "start": 1.5, "end": 2.0}]'::jsonb);

-- ═══════════════════════════════════════════════════════════
-- Done! Sample content has been seeded.
-- You now have:
-- - 3 Units with 10 Lessons
-- - 30 Practice Items
-- - 5 Stories with multiple pages
-- ═══════════════════════════════════════════════════════════
