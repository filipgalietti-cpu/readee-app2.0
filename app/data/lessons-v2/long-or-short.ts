import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./long-or-short-timings.json";

// Long or Short? (RF.2.3a) · FACTORY-AUTHORED (scripts/lesson-author.ts), Claude-judged.
// G2 discrimination drill: silent e is KNOWN (magic-teams, RF.1.3c) — this lesson
// drills fast long/short discrimination on minimal pairs (cap/cape, kit/kite,
// hop/hope, cub/cube, tap/tape, rob/robe).
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=long-or-short

const A = (id: string) => `/audio/lessons-v2/long-or-short/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/long-or-short/${w.toLowerCase()}.png`;

export const longOrShortImages: Record<string, string> = {
  "cap-and-cape": "A red baseball cap and a flowing red superhero cape displayed side by side on a plain soft cream background, bright 2D cartoon illustration, bold clean outlines, no text anywhere, no letters anywhere",
  // Quiz easier-band picture support (long-or-short-quiz e-1 / e-3):
  "cap": "A single red baseball cap on a plain soft cream background, bright 2D cartoon illustration, bold clean outlines, no text anywhere, no letters anywhere",
  "cub": "A cute fluffy brown baby bear cub sitting on soft green grass, bright 2D cartoon illustration, bold clean outlines, no text anywhere, no letters anywhere"
};

export const longOrShort: LessonDef = {
  id: "long-or-short",
  title: "Long or Short?",
  grade: "2nd Grade",
  standard: "RF.2.3a",
  archetype: "phonics",
  objective: "I can hear and see whether a vowel is long or short and read look-alike words correctly.",
  concepts: ["long vowels","short vowels","minimal pairs"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read every look-alike pair today. Cap and cape. Cub and cube. Hop and hope. Your eyes checked the last letter, your ears checked the vowel, and you picked the right word every time. When two words look almost the same, read all the way to the end. The vowel will tell you which word it is.",
    "title": "Long or Short? You Know!",
    "body": "A short vowel says its sound. A long vowel says its name. You read cap and cape, cub and cube, hop and hope, and picked the right one every time."
  },
  scenes: [
    {
      id: "hook-hear-the-switch",
      purpose: "hook",
      gate: "none",
      prompt: "One small vowel change makes a whole new word.",
      image: IMG("cap-and-cape"),
      narration: { audio: A("hook-hear-the-switch"), script: "Listen to these two words. Cap. Cape. Almost the same letters, but they are two different things. In cap, the a makes its short sound. In cape, the a says its name, ay. Words like these are look-alike pairs, and second grade books are full of them. Today your eyes and your ears work together to tell them apart fast." },
    },
    {
      id: "model-hop-hope",
      purpose: "model",
      layout: "full",
      gate: "none",
      prompt: "Watch me read a look-alike pair.",
      fx: {"text":"**hop** + e = **hope**","effect":"glow"},
      narration: { audio: A("model-hop-hope"), script: "Watch me read a pair. H, o, p. No silent e at the end, so the o makes its short sound. Hop. A frog can hop. Now the same letters with an e on the end. H, o, p, e. You know this trick from first grade. The silent e makes the o say its name, oh. Hope. I hope we win. That is the whole game today. Read to the last letter. If you see the silent e, the vowel says its name. If not, the vowel says its sound." },
    },
    {
      id: "guided-hear-it-cube",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the spelling that says cube.",
      narration: { audio: A("guided-hear-it-cube"), script: "Now your ears lead the way. Listen. Cube. I put an ice cube in my drink. Cube. Say it in your head and listen to the u. Then read each spelling carefully and tap the one that says cube." },
      interaction: { type: "choose", options: [{ id: "cube", label: "cube" }, { id: "cub", label: "cub" }, { id: "tube", label: "tube" }, { id: "cob", label: "cob" }], correctId: "cube", coachWrong: "Say cube again in your head. Does the u say its sound or its name? Read each spelling all the way to the last letter, then tap the one that says cube." },
    },
    {
      id: "guided-hear-it-tap",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the spelling that says tap.",
      narration: { audio: A("guided-hear-it-tap"), script: "Listen again. Tap. I felt a tap on my shoulder. Tap. Listen to the a. Does it say its sound or its name? Read each spelling with your eyes, then tap the one that says tap." },
      interaction: { type: "choose", options: [{ id: "tape", label: "tape" }, { id: "tap", label: "tap" }, { id: "tip", label: "tip" }, { id: "top", label: "top" }], correctId: "tap", coachWrong: "Say tap slowly. The a makes its quick sound. Check the vowel in each spelling, and read every word to its very last letter before you tap." },
    },
    {
      id: "apply-sentence-cap",
      purpose: "apply",
      gate: "interaction",
      prompt: "Ben wore a ___ on his head. Tap the word the sentence needs.",
      narration: { audio: A("apply-sentence-cap"), script: "Reading time. This sentence has a blank. Ben wore a blank on his head. Two of these words look almost the same, so read carefully. Try each word in the blank, then tap the one the sentence needs." },
      interaction: { type: "choose", options: [{ id: "cap", label: "cap" }, { id: "cape", label: "cape" }, { id: "cup", label: "cup" }, { id: "cop", label: "cop" }], correctId: "cap", coachWrong: "Try each word in the blank. Ben wore a blank on his head. Read each word to its last letter and listen to the vowel. Then tap the word that fits." },
    },
    {
      id: "apply-sentence-kite",
      purpose: "apply",
      gate: "interaction",
      prompt: "We ran to fly the ___ in the wind. Tap the word the sentence needs.",
      narration: { audio: A("apply-sentence-kite"), script: "Here is another blank. We ran to fly the blank in the wind. Read all four words with your eyes. Two are a look-alike pair. Try each one in the blank, then tap the word that fits." },
      interaction: { type: "choose", options: [{ id: "kite", label: "kite" }, { id: "kit", label: "kit" }, { id: "bite", label: "bite" }, { id: "bit", label: "bit" }], correctId: "kite", coachWrong: "Try each word in the blank. Which one is something you can fly? Read all the way to the end of each word before you tap." },
    },
    {
      id: "apply-sort-vowels",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read each word. Sort it by its vowel sound.",
      narration: { audio: A("apply-sort-vowels"), script: "Sort time. Read each word and listen to its vowel in your head. If the vowel says its sound, drag it to short vowel. If the vowel says its name, drag it to long vowel. Watch out. These words come in look-alike pairs, so read every letter." },
      interaction: { type: "sort", buckets: ["Short Vowel","Long Vowel"], items: [{ label: "cub", bucket: "Short Vowel" }, { label: "cube", bucket: "Long Vowel" }, { label: "tap", bucket: "Short Vowel" }, { label: "tape", bucket: "Long Vowel" }, { label: "hop", bucket: "Short Vowel" }, { label: "hope", bucket: "Long Vowel" }], coachWrong: "Read the word again, all the way to the last letter. Does the vowel say its sound or its name? Then drag it to that bucket." },
    },
    {
      id: "apply-speak-cub-cube",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read it out loud: The cub sat by the cube.",
      narration: { audio: A("apply-speak-cub-cube"), script: "Now a look-alike pair shares one sentence. Read it with your eyes first. Make the short u and the long u sound different. Then tap the mic and read the whole sentence out loud." },
      interaction: { type: "speak", text: "The cub sat by the cube" },
    },
    {
      id: "challenge-sentence-robe",
      purpose: "challenge",
      gate: "interaction",
      prompt: "After the bath, Dad put on his soft ___. Tap the word the sentence needs.",
      narration: { audio: A("challenge-sentence-robe"), script: "Challenge round, with a brand new pair. After the bath, Dad put on his soft blank. Read all four words carefully. Say each one in your head and try it in the blank. Then tap the word the sentence needs." },
      interaction: { type: "choose", options: [{ id: "robe", label: "robe" }, { id: "rob", label: "rob" }, { id: "rub", label: "rub" }, { id: "rib", label: "rib" }], correctId: "robe", coachWrong: "Try each word in the blank. Which one is something soft you can wear? Read every letter of every word before you tap." },
    },
    {
      id: "challenge-speak-explain",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Tell me: how do you know the o in robe says its name?",
      narration: { audio: A("challenge-speak-explain"), script: "You picked robe. Now prove you know why. Tell me in your own words: how do you know the o in robe says its name, oh? Tap the mic and start with, the o says its name because." },
      interaction: { type: "speak", text: "silent quiet magic end ends ending last letter name long" },
    },
    {
      id: "challenge-speak-sentence",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Read the sentence: Sam put on his cap and hoped his kite would fly.",
      narration: { audio: A("challenge-speak-sentence"), script: "Last round. This sentence mixes short vowels and long vowels. Read it with your eyes first and check every vowel. Then tap the mic and read the whole sentence out loud in your best reading voice." },
      interaction: { type: "speak", text: "Sam put on his cap and hoped his kite would fly" },
    },
    {
      id: "celebrate-long-or-short",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You can tell long from short!",
      fx: {"text":"**Short** says its sound. **Long** says its name!","effect":"fireworks"},
      narration: { audio: A("celebrate-long-or-short"), script: "You did it. Cap and cape, cub and cube, hop and hope. You read every look-alike pair the right way, because you read to the last letter and listened to the vowel. Short says its sound. Long says its name. Keep your eyes sharp on every pair you meet in your books." },
    },
  ],
};
