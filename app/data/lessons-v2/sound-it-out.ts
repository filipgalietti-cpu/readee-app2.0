import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./sound-it-out-timings.json";

// Sound It Out (RF.1.3b) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=sound-it-out

const A = (id: string) => `/audio/lessons-v2/sound-it-out/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/sound-it-out/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/sound-it-out/${w.toLowerCase()}.png`;

export const soundItOutImages: Record<string, string> = {
  "new-word-reader": "A curious young child kneeling in green grass, leaning close over an open picture book, eyes wide with wonder."
};

export const soundItOut: LessonDef = {
  id: "sound-it-out",
  title: "Sound It Out",
  grade: "1st Grade",
  standard: "RF.1.3b",
  archetype: "phonics",
  objective: "I can read a brand new word by saying each sound in order and blending them together!",
  concepts: ["decode regularly spelled one-syllable words: see a new printed word, say each sound left to right, and blend the sounds into the word, for CVC words, blends, and digraph words"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it! You saw brand new words and read them all by yourself. You said each sound, left to right, and blended words like grip, plum, moth, and twig. No new word can stop you now. Sound it out, every time!",
    "title": "You can sound it out!",
    "body": "You read brand new words by saying each sound in order and blending them together."
  },
  scenes: [
    {
      id: "hook-new-word-tool",
      purpose: "hook",
      gate: "none",
      prompt: "You can read words you have never seen.",
      image: IMG("new-word-reader"),
      narration: { audio: A("hook-new-word-tool"), script: "Have you ever opened a book and seen a word you have never read before? You do not have to guess. Readers have a tool. Start at the left of the word. Say each sound in order. Then blend the sounds together, and the word pops out. Today you will use that tool to read brand new words all by yourself." },
    },
    {
      id: "model-sound-out-jet",
      purpose: "model",
      gate: "none",
      prompt: "Watch how to sound out a new word.",
      fx: {"text":"Juh. Eh. Tuh. **jet**!","effect":"pop-words"},
      narration: { audio: A("model-sound-out-jet"), script: "Look at this word. Maybe I have never read it before. I do not guess. I start at the left and say each sound in order. Juh. Eh. Tuh. Now I say the sounds faster and faster until they blend into one word. Jet! The word is jet, like a fast jet plane. I just read a brand new word, all by myself." },
    },
    {
      id: "model-sound-out-sled",
      purpose: "model",
      gate: "none",
      prompt: "Longer words work the same way.",
      fx: {"text":"Sss. Lll. Eh. Duh. **sled**!","effect":"pop-words"},
      narration: { audio: A("model-sound-out-sled"), script: "Here is a longer word. It hides four sounds, but the tool is the same. Start at the left. Say each sound in order. Sss. Lll. Eh. Duh. Two sounds sit stuck together at the start, and each one still gets its own turn. Now blend them fast. Sled! Left to right, sound by sound, every time." },
    },
    {
      id: "guided-sequence-plum",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sound out **plum**. Tap its sounds in order, then the word.",
      narration: { audio: A("guided-sequence-plum"), script: "Your turn. Look at the word at the top. It is a brand new word. Start at the left. Look at each letter and say its sound with your own voice. Drag the sound tiles into that same order, first sound to last, then the whole word at the end." },
      interaction: { type: "sequence", items: [{ id: "p", label: "puh", audio: W("puh") }, { id: "l", label: "lll", audio: W("lll") }, { id: "u", label: "uh", audio: W("uh") }, { id: "m", label: "mmm", audio: W("mmm") }, { id: "plum", label: "plum" }], order: ["p","l","u","m","plum"], coachWrong: "Start at the left of the word. Look at the very first letter and say its sound. Find that tile and put it first. Then keep going, one letter at a time, and put the whole word last." },
    },
    {
      id: "guided-choose-grip",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the word that means to hold on tight.",
      narration: { audio: A("guided-choose-grip"), script: "Now use the tool to read. These three words look almost the same, so your eyes have to work. Sound out each word, left to right, and blend it. One of these words means to hold something tight and not let go. Read all three, then tap that word." },
      interaction: { type: "choose", options: [{ id: "grip", label: "grip" }, { id: "grab", label: "grab" }, { id: "grin", label: "grin" }], correctId: "grip", coachWrong: "Sound out each word again, left to right, all the way to the last letter. Say each word and think about what it means. Tap the word that means to hold tight and not let go." },
    },
    {
      id: "apply-sequence-moth",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sound out **moth**. Tap its sounds in order, then the word.",
      narration: { audio: A("apply-sequence-moth"), script: "Here is a tricky new word. It has four letters, but only three sounds. The last two letters are a team. They work together to make just one sound, so they share one tile. Start at the left, say each sound in order, drag the sound tiles into that order, then the whole word at the end." },
      interaction: { type: "sequence", items: [{ id: "m", label: "mmm", audio: W("mmm") }, { id: "o", label: "aww", audio: W("aww") }, { id: "th", label: "thh", audio: W("thh") }, { id: "moth", label: "moth" }], order: ["m","o","th","moth"], coachWrong: "Start at the left. Say the first letter's sound and put that tile first. Remember, the two letters at the end are a team with one sound, so their tile comes last before the whole word." },
    },
    {
      id: "apply-choose-twig",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the word that names a small thin stick from a tree.",
      narration: { audio: A("apply-choose-twig"), script: "Read like this every time. Four words, and they look alike. Sound out each one, left to right, and blend it into a real word. One of these words names a small thin stick that falls from a tree. Read all four, then tap that word." },
      interaction: { type: "choose", options: [{ id: "twig", label: "twig" }, { id: "twin", label: "twin" }, { id: "wig", label: "wig" }, { id: "big", label: "big" }], correctId: "twig", coachWrong: "Sound out each word again, all the way to the last letter. Two of the words start with the same two sounds, so check every sound. Tap the word that names a small thin stick from a tree." },
    },
    {
      id: "apply-speak-blot",
      purpose: "apply",
      gate: "interaction",
      prompt: "Sound it out, then read it aloud: **blot**",
      narration: { audio: A("apply-speak-blot"), script: "Time to read out loud. This word may be brand new to you. Do not guess. Say each sound in your head, left to right, then blend the sounds into the word. When you are ready, tap the mic and read the word out loud." },
      interaction: { type: "speak", text: "blot blots blotted" },
    },
    {
      id: "apply-sort-middle-sounds",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read each word. Sort it by its middle sound.",
      narration: { audio: A("apply-sort-middle-sounds"), script: "Sort time. Each bucket shows a word you already sounded out. Grip has iii in the middle. Plum has uh in the middle. Blot has aww in the middle. Sound out each new word, listen for the sound in its middle, then drag it to the bucket with that same middle sound." },
      interaction: { type: "sort", buckets: ["Grip","Plum","Blot"], items: [{ label: "slim", bucket: "Grip" }, { label: "stub", bucket: "Plum" }, { label: "trot", bucket: "Blot" }, { label: "brim", bucket: "Grip" }, { label: "grub", bucket: "Plum" }, { label: "slot", bucket: "Blot" }], coachWrong: "Sound out the word again, left to right, and listen to the sound right in the middle. Say the bucket words too. Which one has that same middle sound? Drag it there." },
    },
    {
      id: "apply-speak-sentence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read it aloud: I grip my sled on the big hill.",
      narration: { audio: A("apply-speak-sentence"), script: "You can sound out one word, so now read a whole sentence. If a word is new, do not stop. Say its sounds, left to right, and blend them. Tap the mic and read the sentence out loud." },
      interaction: { type: "speak", text: "I grip my sled on the big hill" },
    },
    {
      id: "challenge-choose-crisp",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tap the word that means fresh and crunchy.",
      narration: { audio: A("challenge-choose-crisp"), script: "Challenge time. These words look very close, and some hide two sound teams. Sound out each word, left to right, all the way to the end. One of these words means fresh and crunchy, like a cold apple. Read all four, then tap that word." },
      interaction: { type: "choose", options: [{ id: "crisp", label: "crisp" }, { id: "crust", label: "crust" }, { id: "crib", label: "crib" }, { id: "crab", label: "crab" }], correctId: "crisp", coachWrong: "Sound out each word again, and do not stop early. The end of each word is different. Say each whole word, then tap the one that means fresh and crunchy, like a cold apple." },
    },
    {
      id: "challenge-speak-moth-sentence",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Read it aloud: A moth flaps up to the crisp twig.",
      narration: { audio: A("challenge-speak-moth-sentence"), script: "Last one. This sentence is full of words you sounded out today, plus a brand new one. Use your tool on every word. Left to right, sound by sound, then blend. Tap the mic and read the whole sentence out loud." },
      interaction: { type: "speak", text: "A moth flaps up to the crisp twig" },
    },
    {
      id: "celebrate-sound-it-out",
      purpose: "celebrate",
      gate: "none",
      prompt: "You can read brand new words!",
      fx: {"text":"You can **sound it out**!","effect":"fireworks"},
      narration: { audio: A("celebrate-sound-it-out"), script: "You did it! You saw brand new words and read them all by yourself. You said each sound, left to right, and blended words like grip, plum, moth, and twig. No new word can stop you now. Sound it out, every time!" },
    },
  ],
};
