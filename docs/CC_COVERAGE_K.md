# Kindergarten — Common-Core Coverage & Asset Build-List

_Phase 0 deliverable. The master list of lessons / questions / assets we owe for **full** K coverage.
Built from an audit of `app/data/kindergarten-standards-questions.json` + `app/data/sample-lessons.json`
(Aug 2026). This is a spec to build against — not a regeneration of existing content, which stays until
its replacement is proven. Needs Jennifer sign-off before we generate anything._

## The current state (measured)
- **38 standards**, each with **exactly 1 lesson** and a handful of questions. 334 questions total.
- **333 / 334 questions are `multiple_choice`** (99.7%). One lone `missing_word` in K.L.2.
- The interactive components that **already exist in the codebase** — `sound_machine`, `category_sort`,
  `tap_to_pair`, `sentence_build`, `space_insertion`, `missing_word` — are used in **0** K questions.
- Several standards are covered by MCQ that should not be MCQ at all (read-aloud, phoneme manipulation,
  print tracking).

## What "full coverage" means for K
Three moves, per standard:
1. **Decompose** the standard into its real sub-skills (below).
2. **Assign each sub-skill the right archetype** (see `docs`/strategy artifact: 1 Phonics/PA · 2 Decoding/Fluency ·
   3 Story Elements · 4 Comprehension · 5 Vocabulary · 6 Print Concepts).
3. **Build the delta**: enough lessons + the *right* question types + assets to cover every sub-skill —
   not one lesson + 9 MCQ.

## Teaching order — Unit scope & sequence (the kid's path)
The standards below are **filed** by strand (RF/RL/RI/L). That is NOT the order a child learns them.
Real K instruction **interleaves** strands on a developmental build: foundational skills set the pace,
comprehension runs from day one via **read-aloud** (a child doesn't need to decode to understand a story
read *to* them), and big standards (letters, consonants) **thread across several units** rather than
one-and-done. Each unit ends in a **unit exam** (mixed item types).

> ⚠️ Sequencing is Jennifer's domain (reading specialist) — this is a proposed v1 for her to red-line.

| Unit | Foundational focus (drives the pace) | Comprehension (via read-aloud) | Language |
|---|---|---|---|
| **1 · How print works** | RF.K.1a–c tracking / words / spaces · RF.K.1d letters *(starts; spans all units)* · RF.K.2a rhyme | RL.K.1 key details · RL.K.5 story types · RL.K.6 author & illustrator | K.L.6 |
| **2 · Letters & their sounds** | RF.K.3a consonants *(spans units)* · RF.K.2b syllables | RL.K.3 character/setting/events · RI.K.5 parts of a book | K.L.1 |
| **3 · Blending sounds (CVC)** | RF.K.2c onset-rime · RF.K.2d isolate phonemes · RF.K.3b short vowels | RL.K.2 retell (beginning/middle/end) · RI.K.1 key details | K.L.5 |
| **4 · Vowel magic (silent-E)** | RF.K.3b long vowels / silent-E · RF.K.2e add/substitute phonemes | RL.K.7 illustrations · RI.K.2 main topic | K.L.4 |
| **5 · Real words + start reading** | RF.K.3c sight words · RF.K.3d look-alikes · RF.K.4 read aloud *(→ Luna/Azure)* | RL.K.4 / RI.K.4 unknown words | K.L.2 |
| **6 · Reading & understanding** | RF.K.4 fluency (Luna) | RL.K.9 compare characters · RI.K.3 connections · RI.K.7 illustrations→text · RI.K.8 reasons | reinforce |
| **7 · Putting it together** | RF.K.4 mastery | RI.K.9 compare two texts · RL.K.10 / RI.K.10 active engagement | review |

**Teaching order ≠ build order.** The kid's path is Unit 1→7 (above). The *production* order — which lessons
we build first as engineering proofs — is separate (see "Build priority" near the bottom); e.g. the silent-E
lesson is built early to prove the engine, but a child meets it in Unit 4.

## Reuse — do NOT rebuild (assets that already exist)
- **45 phoneme audio clips** + letter-sound audio → feed all RF phonics/PA interactions.
- **Interactive renderers** `sound_machine / category_sort / tap_to_pair / sentence_build / space_insertion /
  missing_word` → the interaction registry starter kit; wire them into K, don't write new ones.
- **Luna + Azure speech scoring** → the assessment engine for anything "read aloud" (RF.K.4, RF.K.3c, RL/RI.K.10).
- **901 K question images** style + Imagen pipeline → new instructional images only where UI-native (SVG/DOM) won't do.

---

# Build detail by standard (reference)
_The per-standard spec: sub-skills · archetype · today's coverage · what to build. Filed by strand for
reference — see the Unit table above for the order a child actually experiences them._

## RF — Reading Foundational (14) · HIGHEST PRIORITY
_This is where depth matters most and where the existing interactive components + phoneme audio pay off._

| Standard | Sub-skills (full scope) | Archetype | Today | Build delta |
|---|---|---|---|---|
| **RF.K.1a** directionality | L→R · return sweep · top→bottom · page order · 1:1 tracking | 6 Print | 1 lesson / 12 MCQ | Tap-to-track interactions; ~1–2 lessons; drop pure MCQ |
| **RF.K.1b** words=letters | words are made of letters · order matters · spoken↔written | 6 Print | 1 / 8 MCQ | build-the-word (tap tiles); reuse `sentence_build` idea at letter level |
| **RF.K.1c** word spaces | find word boundaries · count words in a sentence | 6 Print | 1 / 5 MCQ | **`space_insertion`** (currently unused, perfect fit); several items |
| **RF.K.1d** name all letters | **52 forms**: 26 upper + 26 lower · match upper↔lower | 6 Print / 1 | 1 / 9 MCQ | Big gap. Letter-ID + upper/lower `tap_to_pair`; letter audio; many items |
| **RF.K.2a** rhyme | recognize rhyme · produce rhyme · rhyme families | 1 Phonics | 1 / 6 MCQ | listen-choose + rhyme `tap_to_pair` |
| **RF.K.2b** syllables | count · blend · segment syllables | 1 Phonics | 1 / 10 MCQ | clap/count + blend interactions |
| **RF.K.2c** onset-rime | blend onset+rime · segment | 1 Phonics | 1 / 5 MCQ | blend interactions (`sound_machine`) |
| **RF.K.2d** isolate phonemes | initial · medial · final phoneme in CVC | 1 Phonics | 1 / 9 MCQ | **`sound_machine`** per position; phoneme audio |
| **RF.K.2e** manipulate phonemes | add phoneme · substitute initial/medial/final | 1 Phonics | 1 / 8 MCQ | manipulate/build (the silent-E mechanic generalizes here) |
| **RF.K.3a** consonant sounds | **21 consonants** letter→sound | 1 Phonics | 1 / 9 MCQ | Big gap (21 sounds). Letter+phoneme interactions; reuse audio |
| **RF.K.3b** vowels | **5 short + 5 long** vowels · silent-E | 1 Phonics | 1 / 10 MCQ | **Silent-E prototype lives here**; per-vowel build/manipulate |
| **RF.K.3c** sight words | the K high-frequency word list (~40) | 1 / 2 | 1 / 5 MCQ (hard) | sight-word recognition, many; some read-aloud (Azure) |
| **RF.K.3d** look-alike words | distinguish words differing by 1 letter/sound | 1 Phonics | 1 / 7 MCQ | contrast interactions |
| **RF.K.4** read emergent texts | decode connected text · read for purpose | **2 Decoding/Fluency** | 1 / 9 MCQ | **→ Luna read-aloud + Azure scoring**, not MCQ |

## RL — Reading Literature (9)

| Standard | Sub-skills | Archetype | Today | Build delta |
|---|---|---|---|---|
| **RL.K.1** key details | identify key details · ask who/what/where/when/why/how · answer with evidence · prompting→independent | 4 Comp / 3 | 1 / 10 MCQ | evidence-**highlight** interactions over short passages |
| **RL.K.2** retell | beginning/middle/end · sequence events · retell | 3 / 4 | 1 / 9 MCQ | **`sentence_build`/sequence** events |
| **RL.K.3** story elements | identify character · setting · major events | 3 Story | 1 / 10 MCQ | tap-in-story + **`category_sort`** character/setting |
| **RL.K.4** unknown words | word meaning in story context | 5 Vocab | 1 / 10 MCQ | context-clue interactions |
| **RL.K.5** text types | story vs poem vs informational | 3 Story | 1 / 9 MCQ | `category_sort` by text type _(Jennifer's "Types of Stories" lesson)_ |
| **RL.K.6** author/illustrator | who writes · who draws · their roles | 3 Story | 1 / 9 MCQ | role-match; fix copy _(Jennifer flagged)_ |
| **RL.K.7** illustrations↔story | match picture to story moment | 3 / 4 | 1 / 9 MCQ | tap/match picture-to-text |
| **RL.K.9** compare characters | compare characters' experiences/adventures | 4 Comp | 1 / 9 MCQ | compare interactions |
| **RL.K.10** group reading | active engagement w/ literature | 2 / 3 | 1 / 9 MCQ | read-aloud + light response (Azure) |

## RI — Reading Informational (10)

| Standard | Sub-skills | Archetype | Today | Build delta |
|---|---|---|---|---|
| **RI.K.1** key details (info) | identify details · ask/answer · with evidence | 4 Comp | 1 / 9 MCQ | evidence-highlight over info text |
| **RI.K.2** main topic | main topic · key details · retell | 4 Comp | 1 / 10 MCQ | main-idea vs detail `category_sort` |
| **RI.K.3** connections | connect individuals/events/ideas/steps | 4 Comp | 1 / 9 MCQ | connect/sequence interactions |
| **RI.K.4** unknown words (info) | word meaning in info context | 5 Vocab | 1 / 8 MCQ | context-clue interactions |
| **RI.K.5** parts of a book | front cover · back cover · title page | 6 / 3 | 1 / 11 MCQ | tap-the-part interactions |
| **RI.K.6** author/illustrator (info) | roles in info text | 3 Story | 1 / 10 MCQ | role-match |
| **RI.K.7** illustrations↔text | what a picture teaches | 4 Comp | 1 / 10 MCQ | tap/match picture-to-fact |
| **RI.K.8** reasons | identify reasons author gives to support points | 4 Comp | 1 / 10 MCQ | point↔reason `tap_to_pair` |
| **RI.K.9** compare two texts | similarities/differences, same topic | 4 Comp | 1 / 8 MCQ | compare interactions |
| **RI.K.10** group reading (info) | active engagement w/ info text | 2 | 1 / 9 MCQ | read-aloud + light response (Azure) |

## L — Language (5) · IDs stored as `K.L.n`

| Standard | Sub-skills | Archetype | Today | Build delta |
|---|---|---|---|---|
| **K.L.1** grammar | print upper/lowercase · nouns · verbs · plurals · question words · prepositions | 5 / own | 1 / 9 MCQ | Broad — several sub-lessons; `category_sort` (noun/verb), build-a-sentence |
| **K.L.2** conventions | capitalize first word + "I" · end punctuation · spell phonetically | 5 Vocab | 1 / 7 MCQ + 1 missing_word | `space_insertion` + `sentence_build`; expand the one non-MCQ approach |
| **K.L.4** word meaning | inflections (-s, -ed) · meaning from context | 5 Vocab | 1 / 10 MCQ | affix/context interactions |
| **K.L.5** word relationships | categories · opposites · real-life links · verb shades of meaning | 5 Vocab | 1 / 9 MCQ | `category_sort` + antonym `tap_to_pair` |
| **K.L.6** use new words | apply newly learned words/phrases | 5 Vocab | 1 / 10 MCQ | use-in-sentence construction |

---

## Build priority (recommended order)
1. **RF.K.3b (vowels) — the silent-E anchor.** First 11/10 exemplar; proves the Phonics archetype + engine.
2. **Rest of RF phonics/PA** (RF.K.2*, RF.K.3a/c/d) — biggest depth gap, best payoff from existing phoneme audio + components.
3. **RF.K.4 → Luna** — wire read-aloud/Azure as the fluency archetype (differentiator).
4. **RL/RI comprehension** (highlight + sequence + sort) — kills the MCQ monoculture where it's most visible.
5. **L (language)** — grammar/vocab via sort + build.

## What this implies for asset generation (credits — do AFTER approval)
- Most new *interactions* need **no image generation** — they're UI-native (letter tiles, phoneme chips, highlights, sort buckets). This keeps cost down.
- New **instructional images** only where a movable object is needed (a few per phonics lesson).
- New **audio**: mostly covered by existing phoneme/letter clips; new TTS only for new lesson narration + question prompts (offline batch, vetted).
- **Unit exams**: assemble from the per-standard question pool once types are diversified — no new generation needed beyond the items themselves.

## Next steps
1. **Jennifer red-lines** the Unit scope & sequence (order) + the sub-skill decomposition — sequencing is her call.
2. Lock the archetype→standard assignments + unit boundaries (each unit → a unit exam).
3. Build the RF.K.3b silent-E exemplar on the V2 engine → prove the bar → Claude Design polishes it into the template.
4. Roll the template across Unit 1→7; then extend this whole map to G1–G4 (same method).

_Note: the sheet fixes **scope & sequence** (what/how much/which interaction). Teaching **quality** = this sheet
+ the V2 engine (input-driven scenes) + Claude Design (polish). All three are needed for the 11/10 bar._
