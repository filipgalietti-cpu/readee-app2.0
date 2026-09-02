# Placement bank: veto table for Jennifer

This folder is the fixed content behind Luna's reading placement (graded word
lists, the 60-second cold-read passages, their comprehension questions, and the
K-1 foundations stage). Shape and validator: `lib/placement/bank.ts`. Ladder
rules: `lib/placement/ladder.ts`. Text only, authored Sep 2026, original and
reserved for placement. Nothing here is generated live, which is what makes the
numbers citable.

How to use this table: strike any word, sentence, question, or option. After
edits, run `npx tsx scripts/placement-bank-qc.ts` (it reprints this table and
exits 1 on any rule break) and `npx tsc --noEmit --incremental false -p tsconfig.json`.

Design notes the rows assume:
- Word lists: 10 per band, easiest first, every word unique across all bands,
  lowercase letters only. A list fails on the 3rd miss (SDQA rule).
- Passages: at least the band minimum (1st 140, 2nd 170, 3rd 190, 4th 210,
  5th 230) and at most minimum plus 40, so the fastest reader at the band still
  has text left at 60 seconds. Counted like `countWords`: whitespace tokens,
  punctuation stripped. Numbers are words, no numerals, hyphens, or dashes.
  At most two short quoted lines. First sentence deliberately easy.
- Questions: two literal, then one inferential. 3 options at 1st and 2nd, 4 at
  3rd to 5th. The prompt is what Luna says and never contains the answer.
- Foundations: `clip` values are the phoneme audio ids that already exist
  (`audio/phonemes/{id}.mp3`, list in `scripts/phoneme-database.json`).
- Pattern tags use the app's phonics ids from `app/data/luna-phonics.json`
  where one exists (k-cvc-a, g1-digraphs, g2-r-controlled, g3-affixes,
  g4-morphology, ...) and descriptive tags elsewhere (sight, suffix-ous,
  greek-roots, four-syllable, ...). See "Judgment calls" at the bottom.

Every word, passage, and question below is in the exam exactly as printed. Strike anything and the QC script is rerun.

## Band 0 (K grade)

| # | word | pattern |
|---|---|---|
| 1 | cat | k-cvc-a |
| 2 | the | sight |
| 3 | pig | k-cvc-i |
| 4 | hot | k-cvc-o |
| 5 | and | sight |
| 6 | bug | k-cvc-u |
| 7 | ten | k-cvc-e |
| 8 | jam | k-cvc-a |
| 9 | leg | k-cvc-e |
| 10 | you | sight |

Passage: none. K children hear the listening story in Foundations instead.

## Band 1 (1st grade)

| # | word | pattern |
|---|---|---|
| 1 | ship | g1-digraphs |
| 2 | stop | g1-blends |
| 3 | cake | g1-magic-e |
| 4 | hand | g1-blends |
| 5 | chin | g1-digraphs |
| 6 | feet | g1-vowel-teams |
| 7 | ride | g1-magic-e |
| 8 | rain | g1-vowel-teams |
| 9 | said | sight |
| 10 | jumping | g2-suffixes |

### Passage: "Max and the Rain" (174 words; range 140 to 180)

> Sam has a pup. The pup is Max. Max is black with one white spot. He likes to run and dig.
>
> One day it rained and rained. Max sat on his rug. He was sad. He did not like the wet.
>
> "We can still play," said Sam. Sam got a big red ball. He hid it in a box.
>
> Max ran to the box. He sniffed and sniffed. Then he dug at the lid with his nose. The lid came off. Max got the ball! He ran back to Sam with it.
>
> Next, Sam hid the ball in his hat. Max got that one too.
>
> Then Sam hid the ball on the top shelf. Max sat and sat. He could not get it. He was not that big.
>
> Sam said, "Jump, Max!" Max did jump. He still did not get it.
>
> At last, Sam got the ball for him. Max was so glad. He gave Sam a big wet kiss.
>
> Then the sun came back. Sam and Max ran to play in the mud.

### Questions (3: two literal, one inferential)

1. (literal) What color is the spot on Max?
   - a) Black
   - b) White  <-- correct
   - c) Red
2. (literal) Where did Sam hide the ball first?
   - a) In a box  <-- correct
   - b) In his hat
   - c) On the shelf
3. (inferential) Why did Max sniff at the box?
   - a) To take a nap
   - b) To eat a snack
   - c) To find the ball  <-- correct

## Band 2 (2nd grade)

| # | word | pattern |
|---|---|---|
| 1 | farm | g2-r-controlled |
| 2 | corn | g2-r-controlled |
| 3 | coin | g2-diphthongs |
| 4 | bird | g2-r-controlled |
| 5 | town | g2-diphthongs |
| 6 | cloud | g2-diphthongs |
| 7 | rabbit | g3-syllables |
| 8 | planted | g2-suffixes |
| 9 | tiger | g3-syllables |
| 10 | because | sight |

### Passage: "Rosa's Seeds" (176 words; range 170 to 210)

> Rosa had a cup of seeds. Her grandpa gave them to her. "These sunflower seeds will grow taller than you," he said.
>
> Rosa did not think so. The seeds were tiny and dry. Still, she found a sunny spot by the fence.
>
> She dug six little holes in the dirt. She dropped a seed in each hole and patted the dirt on top. Then she gave them a long drink of water.
>
> Each morning, Rosa ran outside to check. Nothing. She checked after lunch. Still nothing. After a week, she was about to give up.
>
> "Give them time. Seeds are slow," her grandpa said.
>
> On the tenth day, Rosa saw a tiny green sprout. Then two. Then six! She jumped and shouted for her grandpa.
>
> All summer, the sunflowers grew and grew. By the end of summer they were taller than Rosa. They were even taller than her grandpa.
>
> Their big yellow faces turned to follow the sun. A little brown bird came to eat the seeds.
>
> Rosa saved a cup of seeds for next spring.

### Questions (3: two literal, one inferential)

1. (literal) How many seeds did Rosa plant?
   - a) Two
   - b) Ten
   - c) Six  <-- correct
2. (literal) Who gave Rosa the seeds?
   - a) Her grandpa  <-- correct
   - b) A brown bird
   - c) Her teacher
3. (inferential) How did Rosa feel when she saw the first sprout?
   - a) Sleepy
   - b) Excited  <-- correct
   - c) Sad

## Band 3 (3rd grade)

| # | word | pattern |
|---|---|---|
| 1 | unhappy | g3-affixes |
| 2 | careful | g3-affixes |
| 3 | quickly | g3-affixes |
| 4 | return | g3-affixes |
| 5 | explain | vowel-team-longer-word |
| 6 | complete | silent-e-longer-word |
| 7 | umbrella | g3-syllables |
| 8 | remember | g3-syllables |
| 9 | several | sight |
| 10 | vacation | g3-affixes |

### Passage: "The Lost Mitten" (206 words; range 190 to 230)

> Omar had a new pair of mittens. They were bright blue with white stripes. His grandmother had knitted them for the winter.
>
> On the first snowy morning, Omar wore them to school. He built a snowman at recess. He threw snowballs with Lee. He even helped the little ones make snow angels.
>
> When Omar got home, he unzipped his coat. Suddenly he stopped. He had only one mitten. The other one was gone.
>
> Omar felt awful. He looked in his backpack. He looked in every pocket. He looked under the couch. Nothing.
>
> "Think back to where you had both mittens," said his big sister, Kim.
>
> Omar remembered. He had both at recess. He had both on the bus. He had both when he came inside and patted the puppy.
>
> They hurried to the puppy's basket. There, under a soft blanket, was one bright blue mitten. It was a bit wet and a bit chewed, but it was his.
>
> "You are a mitten thief," Omar told the puppy with a grin. The puppy wagged his tail and did not look sorry at all.
>
> Omar hung the mittens by the heater to dry. From then on, he carefully checked for both mittens before he took off his coat.

### Questions (3: two literal, one inferential)

1. (literal) Who knitted Omar's mittens?
   - a) His grandmother  <-- correct
   - b) His sister Kim
   - c) His friend Lee
   - d) His mother
2. (literal) Where did Omar find the missing mitten?
   - a) In his backpack
   - b) Under the couch
   - c) In the puppy's basket  <-- correct
   - d) On the bus
3. (inferential) Why did Omar start checking for both mittens before taking off his coat?
   - a) Because Kim told him to
   - b) Because the puppy said so
   - c) To dry them faster
   - d) To avoid losing one again  <-- correct

## Band 4 (4th grade)

| # | word | pattern |
|---|---|---|
| 1 | transport | g4-morphology |
| 2 | predict | g4-morphology |
| 3 | enormous | suffix-ous |
| 4 | photograph | greek-roots |
| 5 | invisible | g4-morphology |
| 6 | remarkable | suffix-able |
| 7 | information | four-syllable |
| 8 | experiment | academic-vocabulary |
| 9 | necessary | academic-vocabulary |
| 10 | thermometer | greek-roots |

### Passage: "Nia and the Bean Plants" (233 words; range 210 to 250)

> Nia loved asking questions. She loved finding the answers even more.
>
> When her class announced a science fair, Nia knew exactly what to do. She wanted to find out whether bean plants grow faster in sunlight or under a lamp.
>
> First, she made a prediction. She predicted that the sunny window would win. Then she planted six beans in six identical cups. She placed three cups on the windowsill and three under a desk lamp. She gave every cup the same amount of water each morning.
>
> For two weeks, Nia observed the plants carefully. She measured each sprout with a ruler and recorded the information in a notebook. Her brother Ben helped her make a chart.
>
> The results surprised her. The plants under the lamp grew taller, but they were pale and thin. The plants in the window were shorter, but their leaves were dark green and strong.
>
> Nia was confused at first. Then she remembered something from her reading. Plants stretch toward light when they do not get enough of it. The lamp plants were not healthier. They were reaching.
>
> At the fair, a judge asked Nia what she had learned. "My prediction was wrong, and that was the most interesting part," she said. The judge smiled and wrote something on her clipboard.
>
> Nia did not win a ribbon that year. She did not mind. She was already planning her next experiment.

### Questions (3: two literal, one inferential)

1. (literal) Which plants did Nia predict would grow faster?
   - a) The plants under the lamp
   - b) The plants in the dark
   - c) The plants with no water
   - d) The plants in the window  <-- correct
2. (literal) How long did Nia observe the plants?
   - a) Six days
   - b) Two weeks  <-- correct
   - c) Three months
   - d) One year
3. (inferential) Why were the plants under the lamp pale and thin?
   - a) They needed more light  <-- correct
   - b) They got too much water
   - c) Ben forgot to measure them
   - d) Their cups were too small

## Band 5 (5th-grade ceiling list)

| # | word | pattern |
|---|---|---|
| 1 | adventure | three-syllable |
| 2 | develop | three-syllable |
| 3 | population | four-syllable |
| 4 | discovery | four-syllable |
| 5 | responsible | suffix-ible |
| 6 | mysterious | suffix-ous |
| 7 | independent | g4-morphology |
| 8 | communicate | g4-morphology |
| 9 | atmosphere | greek-roots |
| 10 | immediately | five-syllable |

### Passage: "Lee's Bridge" (253 words; range 230 to 270)

> Lee wanted to build a bridge. Not a real one, of course. His school was holding a bridge building contest, and every entry had to be made from craft sticks and glue. The bridge that supported the most weight would win.
>
> Lee began with research. He discovered that engineers rely on triangles because a triangle cannot change its shape without breaking. A square, on the other hand, will lean and collapse when it is pushed from the side.
>
> His first design was a simple flat bridge. It held two books before it snapped in half. Lee was disappointed, but he examined the broken pieces and noticed that the sticks had bent where they were joined end to end.
>
> For his second attempt, he constructed two long trusses, each made of triangles, and connected them with crossbeams. The structure looked awkward, but it was surprisingly sturdy.
>
> On the day of the contest, the judges stacked books on top one by one. Lee's bridge creaked and trembled, but it held eleven books before it finally gave way.
>
> Lee did not win. A girl named Rosa had built a bridge that held fifteen books. Instead of feeling jealous, Lee asked her how she had done it. Rosa showed him how she had doubled the sticks at the points where the weight pressed hardest.
>
> Lee walked home with a notebook full of sketches. He was already imagining a bridge with double trusses and reinforced joints. Next year, he decided, he would need a great many more books.

### Questions (3: two literal, one inferential)

1. (literal) Which shape did Lee learn that engineers rely on?
   - a) Squares
   - b) Triangles  <-- correct
   - c) Circles
   - d) Crossbeams
2. (literal) How many books did Lee's bridge hold at the contest?
   - a) Two
   - b) Fifteen
   - c) Twenty
   - d) Eleven  <-- correct
3. (inferential) Why did Lee ask Rosa how she had built her bridge?
   - a) He was angry about losing
   - b) To trade bridges with her
   - c) To learn from her  <-- correct
   - d) To borrow her books

## Foundations (K and 1st, or an older child whose lists land at K)

### Letter sounds (Luna plays the phoneme clip, the child taps the letter)

| # | clip | choices | correct |
|---|---|---|---|
| 1 | m | m s t b | m |
| 2 | s | t s z p | s |
| 3 | t | t d f m | t |
| 4 | p | b p s n | p |
| 5 | n | m t n s | n |
| 6 | f | f v p t | f |
| 7 | short_a | o a e m | a |
| 8 | short_o | a u o p | o |

### Blending (Luna plays the sounds in order, the child taps the word)

| # | clips | choices | correct |
|---|---|---|---|
| 1 | short_a + t | at it an | at |
| 2 | m + short_a + p | map mop mat | map |
| 3 | s + short_i + t | sat sit six | sit |
| 4 | t + short_o + p | tap tip top | top |
| 5 | n + short_u + t | net nut not | nut |
| 6 | f + short_e + d | fed bed fun | fed |

### Nonsense words (the child reads them aloud)

1. vop  2. pem  3. zab  4. mub  5. plig  6. snad

### Listening story (71 words; range 40 to 80)

> Ben had a red kite. It was a windy day, so Ben took his kite to the park. He ran and ran. The kite went up, up, up. Then the string slipped out of his hand. The kite flew into a tall tree. Ben was sad. A big girl saw him. She climbed the tree and got the kite down. Ben said thank you. Then he held the string very tight.

### Listening questions (2: literal, then inferential)

1. (literal) Where did the kite go?
   - a) Into a tall tree  <-- correct
   - b) Into a pond
   - c) Into a bush
2. (inferential) Why did Ben hold the string very tight at the end?
   - a) To climb the tree
   - b) To keep the kite safe  <-- correct
   - c) To go home fast

## QC output (Sep 2 2026)

```
$ npx tsx scripts/placement-bank-qc.ts
... (veto table as above) ...
## QC result

validateBank + authoring rules: 0 errors (60 words, 5 passages, 17 questions, 20 foundations items).
exit code 0

$ npx tsc --noEmit --incremental false -p tsconfig.json
exit code 0, 0 errors (whole project)
```

The script runs `validateBank` and then the authoring rules the validator does
not encode: passage maximum length, no numerals or hyphens or dashes in passage
text, at most two quoted lines, first sentence at most eight words, forbidden
child-copy words in passage text, question kinds in order, option count per
band, option ids a to d in order, options one to five words, no "all of the
above", prompt never contains its correct option, correct position varied,
letter-sound clips match their letter, blending clips spell their word, and
nonsense words shaped CVC or CCVC and absent from the system dictionary.

## Judgment calls

1. Phoneme ids. The 45 existing clips are listed in `scripts/phoneme-database.json`
   and live at `public/audio/phonemes/*.mp3` and Supabase `audio/phonemes/{id}.mp3`.
   Consonant ids are the letter; vowels are `short_a`, `short_o`, and so on, so the
   blending items say `["m", "short_a", "p"]`, not `["m", "a", "p"]`. The type
   comment on `LetterSoundItem.sound` says "what Luna says, e.g. mmm"; here it is
   the clip id, and the runner should play `audio/phonemes/${sound}.mp3` rather
   than speak it. `c` maps to `c_hard`; no foundations item uses c, q, x, or y.
2. Pattern tags. App ids are used where the feature matches: `k-cvc-*`,
   `g1-digraphs`, `g1-blends`, `g1-magic-e`, `g1-vowel-teams`, `g2-r-controlled`,
   `g2-diphthongs`, `g2-suffixes`, `g3-affixes`, `g3-syllables`, `g4-morphology`.
   Two grade-label mismatches are deliberate: "jumping" (1st list) carries
   `g2-suffixes` because that is the app's only id for inflectional endings, and
   "rabbit" and "tiger" (2nd list) carry `g3-syllables` because that is the app's
   multisyllabic id (its own examples include rabbit), even though they probe
   2nd-grade closed and open syllable division. Tags with no app id: `sight`,
   `vowel-team-longer-word`, `silent-e-longer-word`, `suffix-ous`, `suffix-able`,
   `suffix-ible`, `greek-roots`, `three-syllable`, `four-syllable`,
   `five-syllable`, `academic-vocabulary`. Rename freely; nothing in the code
   reads these strings (placement seeds are keyed by CCSS standard in
   `lib/placement/decide.ts`).
3. Fry ranks. "the", "and", "you" are Fry 1-25; "said" is Fry 26-100; "because"
   is Fry 101-300; "quickly", "remember", "explain", "complete", "several" are
   Fry 301-500 from memory. No printed Fry list was at hand for 4th and 5th, so
   those lists lean on academic vocabulary rather than a claimed Fry rank. Please
   confirm the ranks you care about.
4. Word choices that dodge the exclusion list: "hot" rather than "dog" or "log"
   (cot-caught merger), "remarkable" rather than "comfortable" and "experiment"
   rather than "temperature" (syllable-dropping variants), "immediately" rather
   than "extraordinary" (two accepted stress patterns). No homographs, proper
   nouns, numerals, or hyphenated words anywhere in the lists.
5. Nonsense words. The brief's examples included fut, dit, laz, and sib, which
   are all entries in the macOS dictionary (Webster's 2nd), so the final six are
   vop, pem, zab, mub, plig, snad: none in the dictionary, CVC or CCVC, checked
   by ear for homophones and rudeness. The script fails if any one is ever a
   dictionary word, a passage word, or a blending option.
6. Passage decodability. Band 1 uses CVC, digraphs, blends, silent e, ai, and
   Fry 1-100 sight words only (one, could, too, day, play, said, was, for);
   no r-controlled vowels, diphthongs, or oo. Band 2 adds r-controlled vowels,
   ou/ow/oi, ew/aw, two-syllable words, -ed/-ing, and soft c (faces, fence),
   which the app's pattern list does not name but RF.2.3 covers. Band 3 adds
   affixes (unzipped, awful, carefully, suddenly, remembered), three-syllable
   words, ie/ew/ui, and kn. Bands 4 and 5 are open vocabulary at grade.
7. Names. "grandpa" is lowercase throughout band 2 so a capitalized family name
   does not read as a proper noun. Lee is a friend in band 3 and the main
   character in band 5; Rosa is in bands 2 and 5; Ben is Nia's brother in band 4
   and the listening-story child. A child reads at most two passages, and never
   two that share a name in a confusing role.
8. Distractors not drawn from the passage but plausible: "Her teacher" (g2-q2),
   "The plants in the dark" and "The plants with no water" (g4-q1), "Into a pond"
   and "Into a bush" (listening q1). Every other distractor is a passage detail.
9. Child safety. The band 5 distractor was changed from an accusation
   ("He thought she cheated") to an emotion ("He was angry about losing").
   "jealous" stays in the band 5 passage because the sentence is about not
   acting on it.
10. Passage lengths sit at 174/180, 176/210, 206/230, 233/250, 253/270 (words
    used / band maximum). Band 1 is near its ceiling because 1st-grade sentences
    are short and the plot needed room; trim "He still did not get it." if you
    want slack.
11. Validator gaps covered only by the script, not by `validateBank`: passage
    maximum length, forbidden words inside passage text (the validator checks
    titles and questions only), option length, answer reveal, position variety,
    and the phoneme id check. If any of those should be hard rules, they belong
    in `lib/placement/bank.ts`.
12. Band 5 keeps one sentence fragment ("Not a real one, of course.") as natural
    narrative voice. "windy" in the listening story is a homograph, but that story
    is heard, never read.
