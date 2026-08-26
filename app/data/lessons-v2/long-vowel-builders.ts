import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./long-vowel-builders-timings.json";

// Long Vowel Builders (RF.2.3c) · FACTORY-AUTHORED (scripts/lesson-author.ts), Claude-judged.
// G2 two-syllable long-vowel decoding: word-breakers split rule (RF.1.3e) + known
// long-vowel patterns (silent e, vowel teams, NEW open syllable) meet in big words:
// cupcake, rainbow, tiger, sunshine, maybe, complete, sailboat, pony.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=long-vowel-builders

const A = (id: string) => `/audio/lessons-v2/long-vowel-builders/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/long-vowel-builders/${w.toLowerCase()}.png`;

export const longVowelBuildersImages: Record<string, string> = {
  "cupcake": "A delicious cupcake with swirled pink frosting and rainbow sprinkles in a paper liner, on a plain soft cream background, bright 2D cartoon illustration, bold clean outlines, no text anywhere, no letters anywhere",
  "rainbow": "A colorful rainbow arcing across a soft blue sky with two small white clouds, bright 2D cartoon illustration, bold clean outlines, no text anywhere, no letters anywhere",
  "tiger": "A friendly orange tiger with black stripes sitting on green grass, bright 2D cartoon illustration, bold clean outlines, no text anywhere, no letters anywhere"
};

export const longVowelBuilders: LessonDef = {
  id: "long-vowel-builders",
  title: "Long Vowel Builders",
  grade: "2nd Grade",
  standard: "RF.2.3c",
  archetype: "phonics",
  objective: "I can split a two-syllable word, spot its long vowel patterns, and read it.",
  concepts: ["split two-syllable words into chunks","spot the long vowel pattern in each chunk: silent e, vowel team, open chunk","read the chunks, then blend the whole word"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You built every big word today. Cupcake. Rainbow. Tiger. Sunshine. You split each word into chunks, spotted the pattern that made the vowel say its name, and blended the whole word. Silent e, vowel teams, and open chunks are your building tools now. Use them on every big word you meet.",
    "title": "You're a Long Vowel Builder!",
    "body": "You split big words like cupcake, rainbow, and tiger into chunks, spotted silent e, vowel teams, and open chunks, and read every word."
  },
  scenes: [
    {
      id: "hook-building-plan",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read our word building plan with me.",
      narration: { audio: A("hook-building-plan"), script: "Hi, reader! You already know how to break big words into chunks. Today the chunks hide long vowels. You will split each word, spot the pattern that makes a vowel say its name, and read the whole word. Read our building plan with me." },
      interaction: { type: "read-along", text: "Split the word. Spot the long vowel pattern in each chunk. Read the chunks. Then blend the whole word.", audio: A("hook-building-plan-sentence") },
    },
    {
      id: "model-split-cupcake",
      purpose: "model",
      gate: "none",
      prompt: "Watch me split and spot.",
      image: IMG("cupcake"),
      fx: {"text":"cup**-**cake","effect":"glow"},
      narration: { audio: A("model-split-cupcake"), script: "Watch me build a big word. First I split it. I find the vowels, the u and the a. Then I find the two consonants between them, the p and the c. I split right between those consonants. Cup. Cake. Now I spot the pattern. Cake ends with a silent e, so the a says its name, ay. Cake. Cup has no pattern, so the u stays short. Cup. Now I blend. Cup. Cake. Cupcake." },
    },
    {
      id: "model-team-rainbow",
      purpose: "model",
      gate: "none",
      prompt: "Watch me spot the vowel teams.",
      image: IMG("rainbow"),
      fx: {"text":"r**ai**n-b**ow**","effect":"glow"},
      narration: { audio: A("model-team-rainbow"), script: "Here is another big word. I split it between the n and the b. Rain. Bow. Now I spot the patterns. In the first chunk, two vowels team up, the a and the i. The a does the talking and says its name, ay. Rain. In the second chunk, the o teams up with the w, and together they say oh. Bow. I blend the chunks. Rain. Bow. Rainbow." },
    },
    {
      id: "model-open-tiger",
      purpose: "model",
      gate: "none",
      prompt: "A new pattern: the open chunk.",
      image: IMG("tiger"),
      fx: {"text":"**ti**-ger","effect":"glow"},
      narration: { audio: A("model-open-tiger"), script: "This word hides a brand new pattern. Look between the vowels. There is only one consonant, the g, so I split before it. Ti. Ger. Look at the first chunk. It ends with its vowel. No consonant closes it in. That is an open chunk, and in an open chunk the vowel says its name, eye. Ti. Ger. Tiger. The open chunk says its name." },
    },
    {
      id: "guided-sequence-sunshine",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Put the chunks in reading order.",
      narration: { audio: A("guided-sequence-sunshine"), script: "Your turn to build a new word. Here are its chunks, all mixed up, and the whole word too. Read each tile in your head, then drag them into reading order. First chunk, second chunk, and the whole word last." },
      interaction: { type: "sequence", items: [{ id: "sun", label: "sun" }, { id: "shine", label: "shine" }, { id: "sunshine", label: "sunshine" }], order: ["sun","shine","sunshine"], coachWrong: "Read each chunk in your head. Which chunk starts the word? The whole word goes at the end." },
    },
    {
      id: "guided-pattern-shine",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which pattern makes the i in shine say its name?",
      narration: { audio: A("guided-pattern-shine"), script: "Look at the second chunk you just built. Shine. The i says its name, eye. Your job is to say why. Look closely at how shine is built, then tap the pattern that makes the i say its name." },
      interaction: { type: "choose", options: [{ id: "silent-e", label: "silent e" }, { id: "vowel-team", label: "vowel team" }, { id: "open-chunk", label: "open chunk" }, { id: "double-consonants", label: "double consonants" }], correctId: "silent-e", coachWrong: "Say shine. Now look at the very last letter of the chunk. Do you hear that letter when you say the word?" },
    },
    {
      id: "apply-sequence-maybe",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Build this word. Chunks first, whole word last.",
      narration: { audio: A("apply-sequence-maybe"), script: "Build this one yourself. Read the whole word tile in your head and find where it splits. One chunk has a vowel team, and one chunk is open. Drag the tiles into reading order, with the whole word last." },
      interaction: { type: "sequence", items: [{ id: "may", label: "may" }, { id: "be", label: "be" }, { id: "maybe", label: "maybe" }], order: ["may","be","maybe"], coachWrong: "Say the word slowly in your head. Which chunk do you hear first? The whole word goes at the end." },
    },
    {
      id: "apply-match-complete",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which word is com-plete?",
      narration: { audio: A("apply-match-complete"), script: "Now read some chunks. Look at the split word in the question. Read the first chunk, then the second chunk, and blend them in your head. Then tap the whole word they make. Read every choice all the way to its last letter." },
      interaction: { type: "choose", options: [{ id: "complete", label: "complete" }, { id: "compete", label: "compete" }, { id: "complain", label: "complain" }, { id: "compute", label: "compute" }], correctId: "complete", coachWrong: "Read the second chunk again. Blend the two chunks in your head. Find the word with both chunks in order." },
    },
    {
      id: "apply-sort-patterns",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each word by its long vowel pattern.",
      narration: { audio: A("apply-sort-patterns"), script: "Sort time. Read each word and find the chunk with the long vowel. If a silent e makes the vowel say its name, drag the word to silent e. If two vowels team up, drag it to vowel team. If the chunk ends with its vowel, drag it to open chunk." },
      interaction: { type: "sort", buckets: ["Silent E","Vowel Team","Open Chunk"], items: [{ label: "cupcake", bucket: "Silent E" }, { label: "rainbow", bucket: "Vowel Team" }, { label: "tiger", bucket: "Open Chunk" }, { label: "sunshine", bucket: "Silent E" }, { label: "sailboat", bucket: "Vowel Team" }, { label: "pony", bucket: "Open Chunk" }], coachWrong: "Find the chunk with the long vowel. Look at how that chunk is built, then drag the word to that pattern." },
    },
    {
      id: "apply-speak-sailboat",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the word out loud: sailboat",
      narration: { audio: A("apply-speak-sailboat"), script: "Time to read a big word out loud, all by yourself. Split it in your head, spot the long vowel pattern in each chunk, read the chunks, then say the whole word into the mic." },
      interaction: { type: "speak", text: "sailboat sailboats" },
    },
    {
      id: "challenge-speak-sentence",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Read the sentence: Maybe the tiger will sit in the sunshine.",
      narration: { audio: A("challenge-speak-sentence"), script: "Last challenge. This sentence is full of builder words. Read it with your eyes first and split the big words into chunks. Then tap the mic and read the whole sentence out loud in your best reading voice." },
      interaction: { type: "speak", text: "Maybe the tiger will sit in the sunshine" },
    },
    {
      id: "celebrate-long-vowel-builders",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You're a Long Vowel Builder!",
      fx: {"text":"**Split** it. **Spot** it. **Read** it!","effect":"fireworks"},
      narration: { audio: A("celebrate-long-vowel-builders"), script: "You did it. Cupcake, rainbow, tiger, sunshine. You split every big word into chunks, spotted silent e, vowel teams, and open chunks, and read them all. Split it, spot it, read it. Now every big word in your books is yours to build." },
    },
  ],
};
