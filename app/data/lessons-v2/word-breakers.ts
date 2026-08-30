import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./word-breakers-timings.json";

// Word Breakers (RF.1.3e) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=word-breakers

const A = (id: string) => `/audio/lessons-v2/word-breakers/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/word-breakers/${w.toLowerCase()}.png`;

export const wordBreakersImages: Record<string, string> = {
  "muffin": "A tasty golden-brown blueberry muffin in a paper liner, on a small plate.",
  "cat": "A cute orange tabby cat sitting and smiling, tail curled around its paws."
};

export const wordBreakers: LessonDef = {
  id: "word-breakers",
  title: "Word Breakers",
  grade: "1st Grade",
  standard: "RF.1.3e",
  archetype: "phonics",
  objective: "I can break two-syllable words into chunks and read them!",
  concepts: ["find the vowels in a two-syllable word","split the word between the two middle consonants","read each chunk, then blend the chunks to read the whole word"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it! You can break big words into chunks and read them. Find the vowels, split between the consonants, read each chunk, and blend. Now you can read big words in every book!",
    "title": "You're a Word Breaker!",
    "body": "You split two-syllable words like muffin, pencil, and winter into chunks and read them."
  },
  scenes: [
    {
      id: "hook-read-the-rule",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read our word breaking plan with me.",
      narration: { audio: A("hook-read-the-rule"), script: "Hi, reader! Big words can look tricky. But every big word is made of small chunks called syllables. Today you will break big words into chunks and read them. Read our plan with me." },
      interaction: { type: "read-along", text: "Find the vowels. Split between the consonants. Read each chunk. Then blend the chunks together.", audio: A("hook-read-the-rule-sentence") },
    },
    {
      id: "model-split-muffin",
      purpose: "model",
      gate: "none",
      prompt: "Watch me split the word.",
      image: IMG("muffin"),
      fx: {"text":"muf**-**fin","effect":"glow"},
      narration: { audio: A("model-split-muffin"), script: "Watch me break this word. First I find the vowels. I see u and i. Next I look between the vowels and find two consonants in the middle, f and f. I split the word right between them. Muf. Fin." },
    },
    {
      id: "model-blend-muffin",
      purpose: "model",
      gate: "none",
      prompt: "Watch me read each chunk and blend.",
      image: IMG("muffin"),
      fx: {"text":"muf-fin is **muffin**","effect":"pop-words"},
      narration: { audio: A("model-blend-muffin"), script: "Now I read each chunk. Muf. Fin. Muf, fin. Then I blend the chunks together. Muffin! I broke a big word into chunks and read it. You can do this too." },
    },
    {
      id: "guided-sequence-muffin",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Put the chunks of muffin in reading order.",
      narration: { audio: A("guided-sequence-muffin"), script: "Your turn. Here are the chunks of our word, all mixed up. Drag them into reading order. First chunk, second chunk, then the whole word last." },
      interaction: { type: "sequence", items: [{ id: "muf", label: "muf" }, { id: "fin", label: "fin" }, { id: "muffin", label: "muffin" }], order: ["muf","fin","muffin"], coachWrong: "Read each chunk. Which chunk starts the word? Put the whole word at the end." },
    },
    {
      id: "guided-split-pencil",
      purpose: "guided",
      gate: "interaction",
      prompt: "Where does pencil break?",
      narration: { audio: A("guided-split-pencil"), script: "Here is a new word. Read it in your head. Find its two vowels. Then find the two consonants in the middle. Tap the split that breaks the word right between those consonants." },
      interaction: { type: "choose", options: [{ id: "pen-cil", label: "pen-cil" }, { id: "penc-il", label: "penc-il" }, { id: "pe-ncil", label: "pe-ncil" }], correctId: "pen-cil", coachWrong: "Find the two vowels first. Then find the two consonants between them. The split goes right between those two consonants." },
    },
    {
      id: "apply-split-rabbit",
      purpose: "apply",
      gate: "interaction",
      prompt: "Where does rabbit break?",
      narration: { audio: A("apply-split-rabbit"), script: "Try another one. Read this word in your head. Find the vowels, then find the two consonants in the middle. Tap the split that follows our rule." },
      interaction: { type: "choose", options: [{ id: "rab-bit", label: "rab-bit" }, { id: "ra-bbit", label: "ra-bbit" }, { id: "rabb-it", label: "rabb-it" }], correctId: "rab-bit", coachWrong: "Look between the two vowels. You will see two consonants side by side. Split the word right between them." },
    },
    {
      id: "apply-sequence-laptop",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put the chunks of laptop in reading order.",
      narration: { audio: A("apply-sequence-laptop"), script: "Break this word yourself. Read it in your head and split it between the middle consonants. Then drag the chunks into reading order, with the whole word last." },
      interaction: { type: "sequence", items: [{ id: "lap", label: "lap" }, { id: "top", label: "top" }, { id: "laptop", label: "laptop" }], order: ["lap","top","laptop"], coachWrong: "Say the word slowly in your head. Which chunk comes first? The whole word goes at the end." },
    },
    {
      id: "apply-match-winter",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which word is win-ter?",
      narration: { audio: A("apply-match-winter"), script: "Now read some chunks. Look at the split word at the top. Read each chunk, blend them in your head, and tap the whole word they make." },
      interaction: { type: "choose", options: [{ id: "winter", label: "winter" }, { id: "winner", label: "winner" }, { id: "printer", label: "printer" }], correctId: "winter", coachWrong: "Read the first chunk, then the second chunk. Blend them. Find the word with both chunks in order." },
    },
    {
      id: "apply-speak-puppet",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the word aloud: puppet",
      narration: { audio: A("apply-speak-puppet"), script: "Time to read a big word out loud, all by yourself. Break it in your head. Find the vowels, split between the consonants, read each chunk, then say the whole word into the mic." },
      interaction: { type: "speak", text: "puppet puppets" },
    },
    {
      id: "challenge-blend-chunks",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Blend the chunks and say the whole word.",
      narration: { audio: A("challenge-blend-chunks"), script: "Here is your challenge. I will say the chunks of a big word. Listen closely. Cac. Tus. Blend those chunks in your head, then say the whole word into the mic." },
      interaction: { type: "speak", text: "cactus cactuses" },
    },
    {
      id: "celebrate",
      purpose: "celebrate",
      gate: "none",
      prompt: "You're a Word Breaker!",
      fx: {"text":"You can **break** big words and **read** them!","effect":"fireworks"},
      narration: { audio: A("celebrate"), script: "You did it! You can break big words into chunks and read them. Find the vowels, split between the consonants, read each chunk, and blend. Now you can read big words in every book!" },
    },
  ],
};
