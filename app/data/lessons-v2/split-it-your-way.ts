import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./split-it-your-way-timings.json";

// Split It Your Way (RF.4.3a) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=split-it-your-way
// G4-U2 lesson 1, the SYLLABLE-DIVISION PATTERNS tier of RF.4.3a. Sibling
// split: long-words-full-speed RF.4.3 (the intake room) owns the three-step
// self-check (edges, chunk by ear, say it and test it, flex a chunk), which is
// NAMED here in one line as the known move and never re-taught, and its
// thirteen targets are burned; chunk-by-chunk RF.3.3c (the diner) owns the
// G3 names vowel spots / Split Between / Split Before / open and closed chunk
// / the flex on two-syllable words, so every pattern here gets a FRESH G4 name
// (the wall, the swing, the tail, the soft chunk) and runs on three- to
// five-chunk words with parts on the ends; syllable-splitters / syllable-beats
// / word-breakers / decoding-champions / take-apart-any-word (machine and
// caboose, named once as known parts) / prefix-suffix-decoders / long-word-
// trains (the shun caboose, known) / meaning-machines: their words are burned
// and unused; greek-and-latin-roots L.4.4b + the-right-tool L.4.4 own root
// MEANING, so no part is explained here and none of their roots (phon, graph,
// spect, dict, chron, ject, mal, pro) sit inside any target; words-from-the-
// myths RL.4.4 untouched. THIS lesson owns: (1) the wall, two consonants
// between two vowels, split between them and the first vowel stays short
// (trum-pet, per-cus-sion); (2) the swing, one consonant between two vowels,
// swing it forward first so the vowel says its name (ca-dence), and if that
// is not a word, swing it back so the vowel is shut in and short (mel-o-dy);
// (3) the tail, consonant plus l, e is its own last chunk (as-sem-ble); (4)
// the soft chunk, one chunk of every long word is said softly and its vowel
// turns into a quick uh (schwa, spelled once on a carrier); and the combined
// move, parts you know first, a pattern on the rest, say it with one soft
// chunk, test it in the sentence, in context and OUT of context (bare words
// on the screen). ONE true-to-life anchor, "Uniform Day": Declan, eleven, the
// newest cymbal player in the town youth marching band, and Quincy, the drum
// major, on fitting day and show day (every fact true: wool marching jackets
// fasten with snaps, hems are pinned with safety pins and sewn later, the tall
// hat holds a plume, a tassel hangs from its cord, uniforms travel in garment
// bags, brass is polished before a show, cymbals hang from leather straps over
// white gloves, the drumline plays a cadence, the steady pattern a band
// marches to, and a ceremony opens the show). 2 dense read-alongs of 5
// complex sentences (pages 1/3, ref-chained images, relative pronouns where /
// who / which / that, past perfect, action-beat dialogue, no digits, no
// contractions) + 2 accept-mode child-read pages (2/4 at 54/45 tokens, no
// " my ") + a closing production sentence nobody narrates. Planted targets,
// all 0-hit in every lessons-v2 + quizzes-v2 file before writing: percussion,
// cadence, melody, assembled, auditorium (p1), tassel, polish, bugle,
// scramble, ceremony (p3), reassembled (closer); sort words trumpet (only a
// trumpet flower in one image prompt), trombone, tenor, tassel, cadence,
// polish. Burned and avoided: tuba (chunk-by-chunk quiz), whistle, attention,
// major, baton, parade, signal, banner, tangle, wobble, trophy, rehearsal,
// uniform as a target (form root), velvet / basket / cabin / robot / rabbit
// and every other lower-grade split word. Chunk carriers are spoken inside
// sentences ("Trum, and pet") and kept few; each one is flagged for an ear in
// the run log. Keys prefixed quiz- are picture supports for the quiz's fresh
// second text (a glassblowing studio).

const A = (id: string) => `/audio/lessons-v2/split-it-your-way/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/split-it-your-way/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/split-it-your-way/${w.toLowerCase()}.png`;

export const splitItYourWayImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A bright school band room with a high ceiling, plain cream walls, rows of black music stands with nothing on them, and a rack of navy blue garment bags along the back wall, an eleven year old boy with pale skin, short dark brown hair, and round glasses standing very still with his arms held straight out to the sides, wearing a plain navy blue wool marching band jacket with silver snaps down the front that is several sizes too big for him, its sleeves so long that they completely cover both of his hands and dangle empty past his fingertips, a pair of brass cymbals resting on a chair beside him, a fourteen year old girl with dark brown skin and black hair in two twists standing next to him in a plain white marching band jacket holding a tall white band hat with a plain red plume, and a kneeling woman with olive skin and gray hair in a bun wearing a green apron with a pincushion on her wrist, kneeling at the boy's side and pinning the cuff of the BOY's too-long navy sleeve with a safety pin, morning light from tall windows. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, plain jackets with no letters, no logos, no badges, no posters, no music on the stands, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "The same school band room on show day, the same eleven year old boy with pale skin, short dark brown hair, and round glasses now wearing the same plain navy blue wool marching band jacket that fits him exactly at the wrists, white gloves, and a tall white band hat with a plain red plume and a single gold tassel hanging from a gold cord on the hat, holding a pair of brass cymbals by their leather straps, the same fourteen year old girl with dark brown skin and black hair in two twists in a plain white marching band jacket tapping a completely blank white sheet of paper taped to a plain gray metal cabinet, and behind them two other children in navy jackets rubbing shiny brass trumpets with soft yellow cloths, a rack of open navy garment bags along the back wall. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, blank paper, plain jackets with no letters, no logos, no badges, no posters, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-studio": "The inside of a small glassblowing studio, a round brick furnace with a bright orange glowing opening at its center, an eleven year old boy with light brown skin and short curly black hair wearing dark safety glasses and a gray cotton shirt holding one end of a long thin steel pipe, and on the far end of the pipe a glowing orange blob of soft molten glass, a tall woman with pale skin and short silver hair in a leather apron and dark safety glasses standing behind him with one hand on the pipe, a steel bench with plain metal tongs and a wooden paddle on it, dark stone walls, warm orange light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-goblet": { subject: "A close view of a plain steel shelf in the same glassblowing studio, holding a row of finished glass goblets with tall thin stems in deep cobalt blue, one goblet standing alone on a small round wooden pedestal at the front of the shelf catching the warm orange furnace light, the same eleven year old boy with light brown skin and short curly black hair in dark safety glasses and a gray cotton shirt looking at it with his hands behind his back, the furnace glow blurred in the background. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-studio" }
};

export const splitItYourWay: LessonDef = {
  id: "split-it-your-way",
  title: "Split It Your Way",
  grade: "4th Grade",
  standard: "RF.4.3a",
  archetype: "phonics",
  objective: "I can read an unfamiliar long word by finding the parts I know, choosing the pattern that splits the rest, saying it with one soft chunk, and testing it, inside a sentence or on its own.",
  concepts: [
    "find the parts you know first, a part at the front or a part at the end",
    "the wall: two consonants between two vowels, split between them, and the first vowel stays short",
    "the swing: one consonant between two vowels, swing it forward so the vowel says its name, and if that is not a word, swing it back",
    "the tail: a consonant plus l, e is its own last chunk",
    "the soft chunk: one chunk of every long word is said softly and its vowel turns into a quick uh",
    "say the whole word and test it in the sentence, or on its own",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read Uniform Day, and you chose the pattern for every long word in it. The wall, the swing, the tail, and one soft chunk. That is how a long word gets read on purpose, on a page or all by itself.",
    "title": "Split It Your Way",
    "body": "You found the parts you knew, chose the wall, the swing, or the tail for the rest, said each word with one soft chunk, and tested it, inside a sentence and on its own."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Uniform Day, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. Fourth grade words can run five chunks long, and today you learn to split them on purpose instead of by ear. You already know how to say a long word and test it. That move stays. Today you get three patterns that tell you where a long word splits, and one sound that hides inside almost every long word. Here is page one of Uniform Day. Read along with me, and notice the five long words. Each one follows a pattern you are about to learn." },
      interaction: { type: "read-along", text: "On the Saturday before the first show, Declan carried his cymbals into the band room behind the auditorium, where the youth marching band assembled every fall for uniform day. He was eleven, the newest member of the percussion section, and the wool jacket that the director handed him hung past his knuckles. Quincy, the drum major, who had marched for four seasons, showed him how the snaps ran up the front and how the tall hat held its plume. \"Every uniform gets pinned today and hemmed by Friday,\" she said, dropping a cold safety pin into his palm, \"so stand still.\" While a band parent pinned his sleeves, the drumline in the parking lot began a cadence, the steady drum pattern that a band marches to, and Declan felt the melody of the fight song rise over it.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-the-wall",
      purpose: "model",
      gate: "none",
      prompt: "Pattern one, the wall: two consonants between two vowels.",
      fx: {"text":"trum **pet**","effect":"pop-words"},
      narration: { audio: A("model-the-wall"), script: "Pattern one is the wall. The word is trumpet, spelled t, r, u, m, p, e, t. Find the vowels first, u and e. Between them stand two consonants, m and p, and two consonants side by side make a wall. Split the wall down the middle. Trum, and pet. The first chunk ends in a consonant, which shuts its vowel in and keeps it short, so u says the sound in cup. Trumpet. Now a longer word from page one, percussion, spelled p, e, r, c, u, s, s, i, o, n. The vowel u and the vowel i have a wall between them, s and s, so the split goes per, cus, sion. Say it and test it. Percussion, the drums. It fits. The two chunks of trumpet are under the sentence, and you can tap each one to hear it." },
      interaction: { type: "listen", items: [{ label: "trum", audio: W("trum") }, { label: "pet", audio: W("pet") }] },
    },
    {
      id: "model-the-swing",
      purpose: "model",
      gate: "none",
      prompt: "Pattern two, the swing: one consonant between two vowels.",
      fx: {"text":"ca **dence**, then mel **o** dy","effect":"word-swap"},
      narration: { audio: A("model-the-swing"), script: "Pattern two is the swing. When only one consonant stands between two vowels, that consonant can swing either way, and you try it forward first. The word is cadence, spelled c, a, d, e, n, c, e. One consonant, d, stands between a and e. Swing it forward, so the split comes before it. Ca, dence. Now the first chunk ends in its vowel, and a vowel at the end of a chunk says its name. Cadence, the drum pattern from page one. It passes the test. Now the word is melody, spelled m, e, l, o, d, y. One consonant, l, stands between e and o. Swing it forward. Me, lo, dy. That is not a word I have heard, so it fails. Swing the l back, so the split comes after it. Mel, o, dy. Now the e is shut in and short. Melody. It fits the page. Forward first, and if it fails, swing it back. Both tries are under the sentence." },
      interaction: { type: "listen", items: [{ label: "ca-dence", audio: W("ca-dence") }, { label: "mel-o-dy", audio: W("mel-o-dy") }] },
    },
    {
      id: "model-the-tail-and-the-soft-chunk",
      purpose: "model",
      gate: "none",
      prompt: "Pattern three, the tail, and the soft chunk.",
      fx: {"text":"as sem **ble**","effect":"pop-words"},
      narration: { audio: A("model-the-tail-and-the-soft-chunk"), script: "Pattern three is the tail. The word is assemble, spelled a, s, s, e, m, b, l, e. When a word ends in a consonant plus l, e, those three letters stick together as one last chunk, so count back three letters from the end and cut there. Ble. What is left is assem, and it has a wall, s and s, so it splits as, sem. As, sem, ble. Assemble. Now say it the way you would say it to a friend, and listen to the first chunk. It went soft, and its vowel turned into a quick uh. Every long word has one soft chunk like that, and the vowel in the soft chunk almost always says uh, no matter which letter it is. That sound has a name, schwa, spelled s, c, h, w, a. Say melody again, and the o goes soft. So here is the whole move. Find the parts you know first, a part at the front or a part at the end. Split what is left with the wall, the swing, or the tail. Say it with one soft chunk, and test it in the sentence." },
    },
    {
      id: "guided-choose-split-percussion",
      purpose: "guided",
      gate: "interaction",
      prompt: "Where does the split go? Tap the right split of percussion.",
      narration: { audio: A("guided-choose-split-percussion"), script: "Your turn on the wall. The word is percussion, from page one. Four splits are on your screen, and only one of them cuts the wall down the middle. Find the two vowels with a wall between them, split the wall, and tap that split." },
      interaction: { type: "choose", options: [{ id: "per-cus-sion", label: "per-cus-sion" }, { id: "perc-us-sion", label: "perc-us-sion" }, { id: "pe-rcus-sion", label: "pe-rcus-sion" }, { id: "per-cuss-ion", label: "per-cuss-ion" }], correctId: "per-cus-sion", coachWrong: "Find the two consonants that stand side by side between two vowels. The cut goes between those two letters, not before them and not after them." },
    },
    {
      id: "guided-choose-split-melody",
      purpose: "guided",
      gate: "interaction",
      prompt: "Where does the split go? Tap the right split of melody.",
      narration: { audio: A("guided-choose-split-melody"), script: "Now the swing. The word is melody. Four splits are on your screen. Swing the consonant forward first, say that split, and test it. If it is not a word you have heard, swing it back and test again. Tap the split that gives you the real word." },
      interaction: { type: "choose", options: [{ id: "mel-o-dy", label: "mel-o-dy" }, { id: "me-lo-dy", label: "me-lo-dy" }, { id: "mel-od-y", label: "mel-od-y" }, { id: "melo-dy", label: "melo-dy" }], correctId: "mel-o-dy", coachWrong: "Say that split out loud. Is it a word you have heard? If not, swing the consonant the other way and try again." },
    },
    {
      id: "guided-transform-reassemble",
      purpose: "guided",
      gate: "interaction",
      prompt: "Snap the split base onto re. Build reassemble.",
      narration: { audio: A("guided-transform-reassemble"), script: "Parts you know come first. On show day the band will reassemble on the field, and that word is the part re at the front, plus the base you split a minute ago. Three spellings of that base are on your screen. Only one of them carries the wall and the tail spelled right. Tap it, and snap it on." },
      interaction: { type: "transform", base: "re", add: "assemble", result: "reassemble", changeIndex: 1, options: ["assemble", "asemble", "assembel"], labels: { added: "the split base" }, successAudio: W("reassemble"), coachWrong: "Check the base against the patterns. A wall needs two consonants side by side, and the tail ends with l, then e." },
    },
    {
      id: "guided-sequence-auditorium",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Drag the five chunks of auditorium into order.",
      narration: { audio: A("guided-sequence-auditorium"), script: "Chunk a five-chunk word. The word is auditorium, the hall behind the band room on page one. Say it slowly and feel each chunk. The five chunks are on your screen, mixed up. Drag them into the order you say them, first chunk first." },
      interaction: { type: "sequence", items: [{ id: "au", label: "au" }, { id: "di", label: "di" }, { id: "to", label: "to" }, { id: "ri", label: "ri" }, { id: "um", label: "um" }], order: ["au","di","to","ri","um"], coachWrong: "Say auditorium slowly. Which chunk do you hear first? Start there, and add one chunk at a time." },
    },
    {
      id: "apply-sort-wall-swing",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Wall Split, or Swing Split?",
      narration: { audio: A("apply-sort-wall-swing"), script: "Six words are on your screen. Look at the first two vowels in each word and count the consonants between them. Two consonants make a wall, so drag that word to Wall Split. One consonant is a swing, so drag that word to Swing Split. Some of these words are new, and the count works the same on every one." },
      interaction: { type: "sort", buckets: ["Wall Split","Swing Split"], items: [{ label: "trumpet", bucket: "Wall Split" }, { label: "cadence", bucket: "Swing Split" }, { label: "tassel", bucket: "Wall Split" }, { label: "polish", bucket: "Swing Split" }, { label: "trombone", bucket: "Wall Split" }, { label: "tenor", bucket: "Swing Split" }], coachWrong: "Find the first two vowels in that word. Count the consonants between them. Two is a wall, and one is a swing." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Declan held still while the pins went in, and the percussion cadence outside kept him calm. Quincy told him that the melody would sit on top of the drums once the whole band assembled on the field. His jacket would come back hemmed on Friday, and the plume would stay in its tube until show day.",
      narration: { audio: A("page-2-read"), script: "Page two is yours, with four of today's words inside it. Read all three sentences out loud at a talking pace, and when a long word comes, choose its pattern and keep going." },
      interaction: { type: "speak", text: "Declan held still while the pins went in and the percussion cadence outside kept him calm Quincy told him that the melody would sit on top of the drums once the whole band assembled on the field His jacket would come back hemmed on Friday and the plume would stay in its tube until show day" },
    },
    {
      id: "page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page three, show day. Read along, and watch the long words.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Page three is show day. Read along with me. Five new long words are coming, and each one follows the wall, the swing, or the tail. Watch the splits happen at full speed." },
      interaction: { type: "read-along", text: "On Friday the uniforms came back in garment bags, and Declan found a gold tassel swinging from the cord of his hat, which he had not noticed under the pins. The jacket that had swallowed his hands on Saturday now stopped exactly at his wrists. The director sent the brass players off to polish their horns with soft cloths, because a dull bugle or trumpet under the stadium lights looks like a mistake, and she sent the percussion section to scramble for their white gloves. \"The ceremony before the show starts at seven,\" Quincy said, tapping the schedule taped to the cabinet, \"and nobody walks onto that field with a wrinkle.\" Declan buckled the leather straps of his cymbals over his gloves, and the drumline rolled a cadence that rattled the windows of the auditorium.", audio: A("page-3-read-sentence") },
    },
    {
      id: "apply-choose-soft-chunk",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which chunk of ceremony is the soft one?",
      narration: { audio: A("apply-choose-soft-chunk"), script: "Find the soft chunk. The word is ceremony, from page three, and its four chunks are on your screen. Say the word the way you would say it to a friend, and listen for the one chunk you barely hear, the chunk whose vowel turns into a quick uh. Tap that chunk." },
      interaction: { type: "choose", options: [{ id: "cer", label: "cer" }, { id: "e", label: "e" }, { id: "mo", label: "mo" }, { id: "ny", label: "ny" }], correctId: "e", coachWrong: "Say ceremony again, slowly and then fast. The soft chunk is the one that almost disappears, and its vowel says uh." },
    },
    {
      id: "apply-speak-bare-words",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read all three: tassel. bugle. melody.",
      narration: { audio: A("apply-speak-bare-words"), script: "Now the words with no sentence around them, the way they look in a word list. Three words are on your screen. Tap the mic, then read all three out loud, one after the other, and choose the pattern for each one on the way in." },
      interaction: { type: "speak", text: "tassel bugle melody tassels bugles melodies" },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: Declan tucked the tassel under his chin strap and checked his gloves twice. Across the room the brass section finished the polish on every bugle, and the trumpets gleamed like mirrors. Nobody had to scramble, because Quincy had counted every plume before the bus came.",
      narration: { audio: A("page-4-read"), script: "Page four is yours. Read all three sentences out loud, and keep them moving through the long words." },
      interaction: { type: "speak", text: "Declan tucked the tassel under his chin strap and checked his gloves twice Across the room the brass section finished the polish on every bugle and the trumpets gleamed like mirrors Nobody had to scramble because Quincy had counted every plume before the bus came" },
    },
    {
      id: "challenge-speak-last-sentence",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Read it: When the ceremony ended, the drum major lifted her arms, the drumline reassembled its cadence, and Declan crashed his cymbals on the first beat.",
      narration: { audio: A("challenge-speak-last-sentence"), script: "Last one, and nobody reads it for you. The closing sentence of Uniform Day is on your screen with long words inside it. Tap the mic, then read the whole sentence out loud at a talking pace. Split each long word as you reach it, and keep the sentence moving." },
      interaction: { type: "speak", text: "ceremony reassembled cadence ceremonies reassemble assembled cadences" },
    },
    {
      id: "celebrate-split-it-your-way",
      purpose: "celebrate",
      gate: "none",
      prompt: "The wall, the swing, the tail, and one soft chunk.",
      fx: {"text":"Split it **your way**","effect":"fireworks"},
      narration: { audio: A("celebrate-split-it-your-way"), script: "Today you chose the pattern for every long word. Two consonants between two vowels, and you split the wall. One consonant, and you swung it forward, tested it, and swung it back when it failed. A consonant plus l, e, and you kept it as the tail. Then you said each word with one soft chunk and tested it, on the page and all by itself. From now on, a long word is a split you choose, not a guess." },
    },
  ],
};
