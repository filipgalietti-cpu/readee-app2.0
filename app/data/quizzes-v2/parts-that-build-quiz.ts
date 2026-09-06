import type { QuizDef } from "@/lib/lesson-engine/quiz";

// Parts That Build QUIZ (RL.3.5) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Bands: easier(G2-bridge:
// the term for the part, which part comes first, which bit is a stanza, at
// 3 options w/ picture support) / core(on-grade G3: how chapter two builds
// on chapter one, point to the part with its term and number, Chapter/Scene/
// Stanza sort, a sequence of what each part added, how stanza two turns
// stanza one, a production speak) / harder(G4 transfer RL.4.5: the
// structural differences between prose, poems, and plays, paragraphs vs
// stanzas and rhyming lines vs cast, speaker labels, and stage directions,
// TAUGHT in h-1 first, then a Prose/Poem/Play sort, a stage-direction apply,
// and a production speak). ALL-FRESH second world, "The Music Box" (Zuri,
// cousin Teo, Great-Aunt Delphine, a music box with no key, an old
// photograph, the key inside a locket), told as three short chapters, a
// two-stanza poem, and a two-scene play, spoken INSIDE the questions so every
// Q is self-contained; nothing from the lesson story (Thea, Uncle Ansel, the
// scarecrow) is reused. Names + setting grep-swept vs lessons-v2 +
// quizzes-v2: Zuri, Teo, Delphine, music box, attic, locket all 0 hits.
// Quiz support images live in the lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/parts-that-build-quiz";
const IMG = (w: string) => `/images/lessons-v2/parts-that-build/${w.toLowerCase()}.png`;

export const partsThatBuildQuiz: QuizDef = {
  id: "parts-that-build-quiz",
  lessonId: "parts-that-build",
  title: "Parts That Build Quiz",
  standard: "RL.3.5",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-part-of-a-story",
      band: "easier",
      difficulty: 1,
      prompt: "A story is cut into parts. What is each part called?",
      image: IMG("quiz-attic-box"),
      narration: { audio: `${Q}/e-1-part-of-a-story.mp3`, script: "Here is the start of a new story called The Music Box. On the first rainy day of summer, Zuri climbed into Great-Aunt Delphine's attic and found a small wooden box under a sheet of dust. This story is cut into three parts, and each part of a story has a title. What is each part of a story called? Tap it." },
      hint: { audio: `${Q}/e-1-part-of-a-story-hint.mp3`, script: "Think about a long book you have read. When one part ends and a new title begins, what do you call that part?" },
      explain: { audio: `${Q}/e-1-part-of-a-story-explain.mp3`, script: "Each part of a story is a chapter. The Music Box has three chapters. Stanzas belong to poems, and scenes belong to plays." },
      interaction: { type: "choose", options: [{ id: "a-chapter", label: "a chapter" }, { id: "a-stanza", label: "a stanza" }, { id: "a-scene", label: "a scene" }], correctId: "a-chapter", coachWrong: "That word belongs to a poem or a play. Which word do you see at the top of each part of a long book?" },
    },
    {
      id: "e-2-which-comes-first",
      band: "easier",
      difficulty: 2,
      prompt: "Which of these happens first in the story?",
      image: IMG("quiz-old-photo"),
      narration: { audio: `${Q}/e-2-which-comes-first.mp3`, script: "The Music Box has three chapters. In chapter one, Zuri lifts the lid of the box, but nothing plays, because the little key is gone. In chapter two, her cousin Teo finds an old photograph of a girl wearing the key on a ribbon. In chapter three, the key turns up inside Great-Aunt Delphine's locket. Which of these happens first in the story? Tap it." },
      hint: { audio: `${Q}/e-2-which-comes-first-hint.mp3`, script: "First means chapter one. What did Zuri find out in chapter one, before anyone searched?" },
      explain: { audio: `${Q}/e-2-which-comes-first-explain.mp3`, script: "The box has no key happens first. That is chapter one. The photograph comes in chapter two, and the locket comes in chapter three." },
      interaction: { type: "choose", options: [{ id: "the-box-has-no-key", label: "the box has no key" }, { id: "teo-finds-a-photograph", label: "teo finds a photograph" }, { id: "the-key-is-in-the-locket", label: "the key is in the locket" }], correctId: "the-box-has-no-key", coachWrong: "That happens later in the story. Go back to chapter one. What did Zuri find out first?" },
    },
    {
      id: "e-3-which-bit-is-a-stanza",
      band: "easier",
      difficulty: 3,
      prompt: "Which bit comes from a stanza of a poem?",
      narration: { audio: `${Q}/e-3-which-bit-is-a-stanza.mp3`, script: "A poem is built from short lines that rhyme, in groups called stanzas. Listen to three bits about the same music box. One. Zuri lifted the lid, but nothing played. Two. A wooden box beneath the dust, a keyhole small and bare. Three. Teo says, open the locket. Which bit comes from a stanza of a poem? Tap it." },
      hint: { audio: `${Q}/e-3-which-bit-is-a-stanza-hint.mp3`, script: "Listen for the rhyme. A line in a stanza sounds like a song, with a beat, and its ending chimes with another line." },
      explain: { audio: `${Q}/e-3-which-bit-is-a-stanza-explain.mp3`, script: "A keyhole small and bare comes from the poem. It is a short line with a beat, and bare rhymes with the line that comes after it. The other two bits are a sentence from a chapter and a line from a play." },
      interaction: { type: "choose", options: [{ id: "a-keyhole-small-and-bare", label: "a keyhole small and bare" }, { id: "zuri-lifted-the-lid", label: "zuri lifted the lid" }, { id: "teo-open-the-locket", label: "teo: open the locket" }], correctId: "a-keyhole-small-and-bare", coachWrong: "That bit tells what happened or who is speaking. Find the short line that sounds like part of a song." },
    },
    {
      id: "e-4-part-of-a-play",
      band: "easier",
      difficulty: 4,
      prompt: "A play is cut into parts. What is each part called?",
      image: IMG("quiz-locket-key"),
      narration: { audio: `${Q}/e-4-part-of-a-play.mp3`, script: "Here is a bit of the same story written as a play. Zuri: Did you ever wear the key, Great-Aunt Delphine? Delphine: Only every day, until I forgot what it opened. A play is written to be acted out on a stage, and it is cut into parts. What is each part of a play called? Tap it." },
      hint: { audio: `${Q}/e-4-part-of-a-play-hint.mp3`, script: "Think about actors on a stage. When the curtain closes and opens on a new place, a new part begins. What is that part called?" },
      explain: { audio: `${Q}/e-4-part-of-a-play-explain.mp3`, script: "Each part of a play is a scene. Chapters belong to stories, and stanzas belong to poems." },
      interaction: { type: "choose", options: [{ id: "a-scene", label: "a scene" }, { id: "a-chapter", label: "a chapter" }, { id: "a-stanza", label: "a stanza" }], correctId: "a-scene", coachWrong: "That word belongs to a story or a poem. Which word goes with actors on a stage?" },
    },
    {
      id: "c-1-two-builds-on-one",
      band: "core",
      difficulty: 1,
      prompt: "How does chapter two build on chapter one?",
      narration: { audio: `${Q}/c-1-two-builds-on-one.mp3`, script: "Listen to the first two chapters of The Music Box. Chapter one, The Box. On the first rainy day of summer, Zuri climbed into Great-Aunt Delphine's attic and found a small wooden box under a sheet of dust. A tiny keyhole sat on its side, but when she lifted the lid, nothing played. The key is gone, said Zuri, and Great-Aunt Delphine called up the stairs, It has been lost since the day I got that box, when I was seven years old. Chapter two, The Search. Zuri's cousin Teo dug through every trunk in the attic while Zuri checked the boxes, because a key that small could hide anywhere. The dust made them sneeze, and the rain drummed on the roof. Then Teo held up an old photograph of a girl with the music box in her lap, and around her neck, on a ribbon, hung the key. Four things from chapter two are on your screen, and all four really happen. Tap the one that uses what chapter one set up." },
      hint: { audio: `${Q}/c-1-two-builds-on-one-hint.mp3`, script: "Ask what chapter one set up. Something was missing at the end of chapter one. Which thing in chapter two only happens because of that?" },
      explain: { audio: `${Q}/c-1-two-builds-on-one-explain.mp3`, script: "No key, so they search. Chapter one set up a box with no key, and chapter two builds on that by sending Zuri and Teo hunting for it. The sneezing, the rain, and the old photograph are all in chapter two, but they do not use what chapter one set up." },
      interaction: { type: "choose", options: [{ id: "no-key-so-they-search", label: "no key, so they search" }, { id: "the-dust-makes-them-sneeze", label: "the dust makes them sneeze" }, { id: "the-rain-drums-on-the-roof", label: "the rain drums on the roof" }, { id: "the-photograph-is-old", label: "the photograph is old" }], correctId: "no-key-so-they-search", coachWrong: "That really happens in chapter two, but it does not use what chapter one set up. What was missing at the end of chapter one?" },
    },
    {
      id: "c-2-point-to-the-part",
      band: "core",
      difficulty: 2,
      prompt: "Where does Delphine open the locket? Point to the part.",
      narration: { audio: `${Q}/c-2-point-to-the-part.mp3`, script: "Here is chapter three of The Music Box, The Locket. Downstairs, Great-Aunt Delphine touched the gold locket she had worn every day for sixty years, since she was small. She opened it slowly, and inside, on a faded scrap of ribbon, lay the key. Zuri turned it twice, and a tune the house had not heard in sixty years came spilling out of the box. Someone asks you, where in the story does Delphine open the locket? Answer with the right word for the form and the number of the part. Tap the one you would point to." },
      hint: { audio: `${Q}/c-2-point-to-the-part-hint.mp3`, script: "The question asks about the story, so the word is chapter. Then check the number. Was this the first chapter or the last?" },
      explain: { audio: `${Q}/c-2-point-to-the-part-explain.mp3`, script: "In chapter three. The story is cut into chapters, and the locket opens in the last one, chapter three. Stanzas and scenes are the words for a poem and a play." },
      interaction: { type: "choose", options: [{ id: "in-chapter-three", label: "in chapter three" }, { id: "in-chapter-one", label: "in chapter one" }, { id: "in-stanza-one", label: "in stanza one" }, { id: "in-scene-one", label: "in scene one" }], correctId: "in-chapter-three", coachWrong: "Check the form first. A story is cut into chapters. Then check the number. Did the locket open at the start of the story or at the end?" },
    },
    {
      id: "c-3-sort-chapter-scene-stanza",
      band: "core",
      difficulty: 3,
      prompt: "Sort it: Chapter, Scene, or Stanza?",
      narration: { audio: `${Q}/c-3-sort-chapter-scene-stanza.mp3`, script: "The Music Box was told three ways, as a story in chapters, as a play in scenes, and as a poem in stanzas. Six short bits are on your screen, two from each way. You can tell the form by how it is written. A bit from a chapter tells what happened in a sentence, and who said what. A bit from a scene starts with the name of the speaker. A bit from a stanza is one short line with a beat that rhymes with a line near it. Drag each bit to Chapter, Scene, or Stanza." },
      hint: { audio: `${Q}/c-3-sort-chapter-scene-stanza-hint.mp3`, script: "Look at the very start of the bit. A name and a colon means a speaker in a play. The word said means a storyteller. A short line that sounds like a song means a poem." },
      explain: { audio: `${Q}/c-3-sort-chapter-scene-stanza-explain.mp3`, script: "The bits with said and with Teo digging are sentences from a chapter. The bits that start with Zuri and Teo and a colon are lines from a scene. A keyhole small and bare and worn close for sixty years are lines from a stanza." },
      interaction: { type: "sort", buckets: ["Chapter","Scene","Stanza"], bucketAudio: { "Chapter": `${Q}/b-chapter.mp3`, "Scene": `${Q}/b-scene.mp3`, "Stanza": `${Q}/b-stanza.mp3` }, items: [{ label: "the key is gone, said zuri", bucket: "Chapter" }, { label: "zuri: the keyhole is empty", bucket: "Scene" }, { label: "a keyhole small and bare", bucket: "Stanza" }, { label: "teo dug through every trunk", bucket: "Chapter" }, { label: "teo: open the locket", bucket: "Scene" }, { label: "worn close for sixty years", bucket: "Stanza" }], coachWrong: "Look at how it is written. Does it start with a speaker's name and a colon? Does it sound like a line of a song? Or does it tell what happened, the way a chapter does?" },
    },
    {
      id: "c-4-sequence-what-each-part-added",
      band: "core",
      difficulty: 4,
      prompt: "Put what each part added in story order.",
      narration: { audio: `${Q}/c-4-sequence-what-each-part-added.mp3`, script: "Listen to the whole story of The Music Box once more, chapter by chapter. In chapter one, Zuri finds a wooden box in the attic, and when she lifts the lid, nothing plays. Great-Aunt Delphine calls up that the key has been lost since she was seven. In chapter two, Zuri and Teo search every trunk and box, until Teo holds up an old photograph of a girl wearing the key on a ribbon. In chapter three, Delphine opens the locket she has worn for sixty years, the key is inside, and the tune plays at last. Five things are on your screen, all mixed up. Drag them into the order the chapters tell them." },
      hint: { audio: `${Q}/c-4-sequence-what-each-part-added-hint.mp3`, script: "Start with chapter one, what Zuri found and what Delphine said. Then the search in chapter two. Then what Delphine did in chapter three, and what happened last of all." },
      explain: { audio: `${Q}/c-4-sequence-what-each-part-added-explain.mp3`, script: "First, Zuri finds the box. Next, Delphine says the key is gone. Then Teo finds the photograph. Then Delphine opens her locket. Last, the tune plays." },
      interaction: { type: "sequence", items: [{ id: "zuri-finds-the-box", label: "zuri finds the box" }, { id: "delphine-says-the-key-is-lost", label: "delphine says the key is gone" }, { id: "teo-finds-the-photograph", label: "teo finds the photograph" }, { id: "delphine-opens-her-locket", label: "delphine opens her locket" }, { id: "the-tune-plays-at-last", label: "the tune plays at last" }], order: ["zuri-finds-the-box","delphine-says-the-key-is-lost","teo-finds-the-photograph","delphine-opens-her-locket","the-tune-plays-at-last"], coachWrong: "Walk the chapters in order. What did Zuri find first, what did Delphine say about it, what turned up in the search, and how did it end?" },
    },
    {
      id: "c-5-stanza-two-turns",
      band: "core",
      difficulty: 5,
      prompt: "Which line in stanza two turns the last line of stanza one?",
      narration: { audio: `${Q}/c-5-stanza-two-turns.mp3`, script: "Here is The Music Box as a poem, in two stanzas. Stanza one. A wooden box beneath the dust, a keyhole small and bare. It cannot play without its key, and the key is not there. Stanza two. A golden locket on a chain, worn close for sixty years, holds one small key on faded thread. Now the whole house hears. Stanza one ends with, and the key is not there. Stanza two builds on that by turning it around. Four lines from stanza two are on your screen. Tap the line that turns the last line of stanza one." },
      hint: { audio: `${Q}/c-5-stanza-two-turns-hint.mp3`, script: "Stanza one says the key is not there. Which line in stanza two says where the key is?" },
      explain: { audio: `${Q}/c-5-stanza-two-turns-explain.mp3`, script: "Holds one small key on faded thread. Stanza one says the key is not there, and that line in stanza two turns it around, because the key was in the locket the whole time." },
      interaction: { type: "choose", options: [{ id: "holds-one-small-key", label: "holds one small key" }, { id: "a-golden-locket-on-a-chain", label: "a golden locket on a chain" }, { id: "worn-close-for-sixty-years", label: "worn close for sixty years" }, { id: "now-the-whole-house-hears", label: "now the whole house hears" }], correctId: "holds-one-small-key", coachWrong: "That line is in stanza two, but it does not answer where the key is. Find the line about the key itself." },
    },
    {
      id: "c-6-speak-point-and-build",
      band: "core",
      difficulty: 6,
      prompt: "Where does the tune finally play? Point to the part, then say what it builds on.",
      narration: { audio: `${Q}/c-6-speak-point-and-build.mp3`, script: "Now say it out loud. Listen to chapter three of The Music Box once more. Downstairs, Great-Aunt Delphine touched the gold locket she had worn every day for sixty years, since she was small. She opened it slowly, and inside, on a faded scrap of ribbon, lay the key. Zuri turned it twice, and a tune the house had not heard in sixty years came spilling out of the box. Where in the story does the tune finally play? Tap the mic. Point to that part with its name and its number, then say what it builds on from the chapter before it." },
      hint: { audio: `${Q}/c-6-speak-point-and-build-hint.mp3`, script: "Begin your answer the way the lesson did, with the name of the part and its number. Then tell what the earlier chapters had left missing." },
      explain: { audio: `${Q}/c-6-speak-point-and-build-explain.mp3`, script: "In chapter three. It builds on chapter two, where the photograph showed the key on a ribbon, and on chapter one, where the key was missing. Chapter three could only happen because of both." },
      interaction: { type: "speak", text: "chapter stanza scene three two third second last key locket found opened opens turned ribbon photograph photo search searched attic box plays tune music missing lost gone delphine" },
    },
    {
      id: "h-1-stage-direction-taught",
      band: "harder",
      difficulty: 1,
      prompt: "What kind of writing uses a note like that?",
      narration: { audio: `${Q}/h-1-stage-direction-taught.mp3`, script: "Here is a fourth grade step. Readers explain how the three forms are built differently. A story written in ordinary sentences and paragraphs is called prose, and it is cut into chapters. A poem is built from lines with a beat and rhyme, grouped into stanzas. A play is built from a cast list, speaker labels, and stage directions, which are notes in parentheses that tell the actors what to do. Watch me. Zuri, colon, the keyhole is empty. The name and the colon are a speaker label, so that is a play. Now you. Listen to this bit. In parentheses, Zuri lifts the lid. Nothing happens. What kind of writing uses a note like that? Tap it." },
      hint: { audio: `${Q}/h-1-stage-direction-taught-hint.mp3`, script: "The note is in parentheses, and it tells someone what to do on a stage. Which form is written to be acted out?" },
      explain: { audio: `${Q}/h-1-stage-direction-taught-explain.mp3`, script: "A play, with a stage direction. A note in parentheses telling the actor what to do belongs only to a play. Prose uses paragraphs, and a poem uses stanzas." },
      interaction: { type: "choose", options: [{ id: "a-play-a-stage-direction", label: "a play: a stage direction" }, { id: "a-poem-a-stanza-break", label: "a poem: a stanza break" }, { id: "prose-a-paragraph", label: "prose: a paragraph" }, { id: "a-poem-a-rhyming-line", label: "a poem: a rhyming line" }], correctId: "a-play-a-stage-direction", coachWrong: "That form does not tell anyone what to do. Which form is written for actors on a stage?" },
    },
    {
      id: "h-2-sort-prose-poem-play",
      band: "harder",
      difficulty: 2,
      prompt: "Sort the building blocks: Prose, Poem, or Play?",
      narration: { audio: `${Q}/h-2-sort-prose-poem-play.mp3`, script: "Each form is built from its own blocks. Prose, a story in ordinary sentences, is built from paragraphs inside chapters. A poem is built from lines with a beat and rhyme, grouped into stanzas. A play is built from a cast list, speaker labels, and stage directions. Six building blocks are on your screen. Drag each one to the form it belongs to, Prose, Poem, or Play." },
      hint: { audio: `${Q}/h-2-sort-prose-poem-play-hint.mp3`, script: "Ask where you would see that block. In a long book of sentences? In a song-like poem? Or a script for actors?" },
      explain: { audio: `${Q}/h-2-sort-prose-poem-play-explain.mp3`, script: "Paragraphs and chapters build prose. Stanzas and rhyming lines build a poem. A cast list and stage directions build a play." },
      interaction: { type: "sort", buckets: ["Prose","Poem","Play"], bucketAudio: { "Prose": `${Q}/b-prose.mp3`, "Poem": `${Q}/b-poem.mp3`, "Play": `${Q}/b-play.mp3` }, items: [{ label: "paragraphs", bucket: "Prose" }, { label: "stanzas", bucket: "Poem" }, { label: "a cast list", bucket: "Play" }, { label: "chapters", bucket: "Prose" }, { label: "rhyming lines", bucket: "Poem" }, { label: "stage directions", bucket: "Play" }], coachWrong: "Think about where that block lives. A book of sentences, a poem with a beat, or a script for the stage?" },
    },
    {
      id: "h-3-play-has-what-prose-lacks",
      band: "harder",
      difficulty: 3,
      prompt: "What does the play version have that the prose version does not?",
      narration: { audio: `${Q}/h-3-play-has-what-prose-lacks.mp3`, script: "Here is the same moment two ways. In prose, the story says, Delphine opened the locket, and a tiny key fell into her hand. In the play, the same moment begins with a note in parentheses, Delphine opens the locket, a key falls into her hand, and then Delphine gets a speaker label and says, Well. There it is. Compare the two versions. What does the play version have that the prose version does not? Tap it." },
      hint: { audio: `${Q}/h-3-play-has-what-prose-lacks-hint.mp3`, script: "Listen for the part in parentheses. It is a note for the actor, and prose never has one." },
      explain: { audio: `${Q}/h-3-play-has-what-prose-lacks-explain.mp3`, script: "A stage direction. The play puts the action in parentheses as a note for the actor, and then gives Delphine a speaker label. The prose version just tells it in a sentence." },
      interaction: { type: "choose", options: [{ id: "a-stage-direction", label: "a stage direction" }, { id: "a-paragraph", label: "a paragraph" }, { id: "a-rhyming-line", label: "a rhyming line" }, { id: "a-chapter-title", label: "a chapter title" }], correctId: "a-stage-direction", coachWrong: "That block belongs to prose or to a poem. Which block did you hear only in the play version?" },
    },
    {
      id: "h-4-speak-how-a-play-is-built",
      band: "harder",
      difficulty: 4,
      prompt: "Tell one way a play is built differently from a story in prose.",
      narration: { audio: `${Q}/h-4-speak-how-a-play-is-built.mp3`, script: "Last one, out loud. You have seen The Music Box as prose, as a poem, and as a play. Tap the mic. Tell one way a play is built differently from a story in prose. Name the block a play has, or the block prose has, and say which form it belongs to." },
      hint: { audio: `${Q}/h-4-speak-how-a-play-is-built-hint.mp3`, script: "Think about what you see on the page of a play that you never see in a chapter book. Names before lines, notes in parentheses, or the list of who is in it." },
      explain: { audio: `${Q}/h-4-speak-how-a-play-is-built-explain.mp3`, script: "A play is built from speaker labels, stage directions, and a cast list, and it is cut into scenes. Prose is built from sentences and paragraphs, and it is cut into chapters." },
      interaction: { type: "speak", text: "cast list speaker labels label names name colon stage directions direction parentheses actors actor acted stage lines scenes scene paragraphs paragraph sentences chapters chapter prose script" },
    },
  ],
};
