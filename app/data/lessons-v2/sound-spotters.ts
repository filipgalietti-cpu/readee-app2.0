import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./sound-spotters-timings.json";

// Sound Spotters (RF.1.2c) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=sound-spotters

const A = (id: string) => `/audio/lessons-v2/sound-spotters/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/sound-spotters/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/sound-spotters/${w.toLowerCase()}.png`;

export const soundSpottersImages: Record<string, string> = {
  "detective-deedee": "A friendly cartoon girl detective with a magnifying glass held up to her ear, listening carefully.",
  "stem": "A vibrant green plant stem with a single leaf.",
  "brush": "A blue toothbrush with a blob of white toothpaste."
};

export const soundSpotters: LessonDef = {
  id: "sound-spotters",
  title: "Sound Spotters",
  grade: "1st Grade",
  standard: "RF.1.2c",
  archetype: "phonics",
  objective: "I can find the first, middle vowel, and last sounds in words, even words with blends!",
  concepts: ["isolate and pronounce the first, middle vowel, and last sounds in spoken single-syllable words, including words with consonant blends"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it, Sound Spotter! You found first sounds, middle vowel sounds, and last sounds, even in tricky blend words like grab and stem. Detective DeeDee is proud of you. Keep spotting sounds in the words you hear!",
    "title": "You're a Sound Spotter!",
    "body": "You found the first, middle vowel, and last sounds in words with blends."
  },
  scenes: [
    {
      id: "hook-listen-sound-mission",
      purpose: "hook",
      gate: "none",
      prompt: "Listen to our three mission words.",
      image: IMG("detective-deedee"),
      narration: { audio: A("hook-listen-sound-mission"), script: "Hello, Sound Spotter! This is Detective DeeDee. Every word is made of little sounds, and every sound lives somewhere. At the start, in the middle, or at the end. Today we find where sounds live. Tap a tile to hear a mission word." },
      interaction: { type: "listen", items: [{ label: "ship", audio: W("ship") }, { label: "lunch", audio: W("lunch") }, { label: "stem", audio: W("stem") }] },
    },
    {
      id: "model-first-sound-ship",
      purpose: "model",
      gate: "none",
      prompt: "Watch DeeDee spot the first sound in ship.",
      fx: {"text":"Shh. Iii. Puh. The first sound in **ship** is shh.","effect":"glow"},
      narration: { audio: A("model-first-sound-ship"), script: "Watch Detective DeeDee spot a sound. The word is ship. Say it slowly. Shh. Iii. Puh. The very first sound is shh. Two letters can team up to make one sound, and shh is one sound. Shh. Ship." },
    },
    {
      id: "guided-choose-first-chat",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the first sound in chat.",
      narration: { audio: A("guided-choose-first-chat"), script: "Your turn. The word is chat. Say it slowly. Chh. Aaa. Tuh. Which sound comes very first in chat? Tap that sound." },
      interaction: { type: "choose", options: [{ id: "chh", label: "chh", audio: W("chh") }, { id: "aaa", label: "aaa", audio: W("aaa") }, { id: "tuh", label: "tuh", audio: W("tuh") }], correctId: "chh", coachWrong: "Say chat slowly. Chh. Aaa. Tuh. Listen for the sound that comes before all the others, then tap it." },
    },
    {
      id: "model-blend-trap-flat",
      purpose: "model",
      gate: "none",
      prompt: "Watch out for sounds that stick together!",
      fx: {"text":"Fff. Lll. Aaa. Tuh. The first sound in **flat** is only fff.","effect":"pop-words"},
      narration: { audio: A("model-blend-trap-flat"), script: "Here is a detective trick. In the word flat, two consonant sounds stick together at the start. Listen. Fff. Lll. Aaa. Tuh. The sounds fff and lll stick together, but the first sound is only fff. Fff. Flat." },
    },
    {
      id: "guided-choose-first-grab",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap only the very first sound in grab.",
      narration: { audio: A("guided-choose-first-grab"), script: "Now you spot it. The word is grab. Say it slowly. Guh. Rrr. Aaa. Buh. Two sounds stick together at the start, but tap only the very first sound." },
      interaction: { type: "choose", options: [{ id: "guh", label: "guh", audio: W("guh") }, { id: "grr", label: "grr", audio: W("grr") }, { id: "rrr", label: "rrr", audio: W("rrr") }], correctId: "guh", coachWrong: "Say grab slowly. Guh. Rrr. Aaa. Buh. Listen for the one little sound at the very front, before all the others. Tap just that one." },
    },
    {
      id: "guided-speak-starts-shh",
      purpose: "guided",
      gate: "interaction",
      prompt: "Say the word that starts with shh.",
      narration: { audio: A("guided-speak-starts-shh"), script: "Sound Spotter, listen to three words. Ship. Chat. Flat. One of them starts with shh. Tap the mic and say that whole word." },
      interaction: { type: "speak", text: "ship ships" },
    },
    {
      id: "model-middle-vowel-lunch",
      purpose: "model",
      gate: "none",
      prompt: "Watch DeeDee find the middle vowel sound.",
      fx: {"text":"Lll. Uh. Nnn. Chh. The middle vowel sound in **lunch** is uh.","effect":"glow"},
      narration: { audio: A("model-middle-vowel-lunch"), script: "Every word has a vowel sound living inside it. Listen to lunch. Lll. Uh. Nnn. Chh. The vowel sound uh lives in the middle of lunch. Uh. Lunch." },
    },
    {
      id: "apply-choose-middle-stem",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the middle vowel sound in stem.",
      image: IMG("stem"),
      narration: { audio: A("apply-choose-middle-stem"), script: "Find the middle vowel sound in stem. Say it slowly. Sss. Tuh. Eh. Mmm. Which vowel sound lives in the middle? Tap it." },
      interaction: { type: "choose", options: [{ id: "sss", label: "sss", audio: W("sss") }, { id: "eh", label: "eh", audio: W("eh") }, { id: "mmm", label: "mmm", audio: W("mmm") }], correctId: "eh", coachWrong: "Say stem slowly. Sss. Tuh. Eh. Mmm. Skip past the sounds at the start and the end. Listen for the vowel sound in the middle, then tap it." },
    },
    {
      id: "apply-choose-last-swim",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the very last sound in swim.",
      narration: { audio: A("apply-choose-last-swim"), script: "Now spot a last sound. The word is swim. Say it slowly. Sss. Wuh. Iii. Mmm. Which sound comes at the very end? Tap it." },
      interaction: { type: "choose", options: [{ id: "mmm", label: "mmm", audio: W("mmm") }, { id: "sss", label: "sss", audio: W("sss") }, { id: "wuh", label: "wuh", audio: W("wuh") }], correctId: "mmm", coachWrong: "Say swim slowly and listen all the way to the end. Sss. Wuh. Iii. Mmm. Tap the sound that finishes the word." },
    },
    {
      id: "apply-read-along-mission-words",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the sentence with Detective DeeDee.",
      narration: { audio: A("apply-read-along-mission-words"), script: "You can spot sounds in spoken words. Now read some of our mission words inside a real sentence. Read along with me." },
      interaction: { type: "read-along", text: "We grab lunch on the big ship.", audio: A("apply-read-along-mission-words-sentence") },
    },
    {
      id: "apply-sequence-flat",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Drag the sounds of flat into order.",
      narration: { audio: A("apply-sequence-flat"), script: "The sounds in flat fell out of order! Say flat slowly. Fff. Lll. Aaa. Tuh. Drag the first sound first, then the next sound, the middle vowel, and the last sound." },
      interaction: { type: "sequence", items: [{ id: "f", label: "fff", audio: W("fff") }, { id: "l", label: "lll", audio: W("lll") }, { id: "a", label: "aaa", audio: W("aaa") }, { id: "t", label: "tuh", audio: W("tuh") }], order: ["f","l","a","t"], coachWrong: "Say flat slowly. Fff. Lll. Aaa. Tuh. Which sound do you hear very first? Start with that one, then add each sound in order." },
    },
    {
      id: "challenge-choose-where-brush",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Where does the shh sound live in brush?",
      image: IMG("brush"),
      narration: { audio: A("challenge-choose-where-brush"), script: "Challenge time! The word is brush. Say it slowly. Buh. Rrr. Uh. Shh. Where does the shh sound live in brush? Tap the spot where it lives." },
      interaction: { type: "choose", options: [{ id: "beginning", label: "beginning", audio: W("beginning") }, { id: "middle", label: "middle", audio: W("middle") }, { id: "end", label: "end", audio: W("end") }], correctId: "end", coachWrong: "Say brush slowly. Buh. Rrr. Uh. Shh. Listen for the shh sound. Tap the spot in the word where you hear it." },
    },
    {
      id: "challenge-speak-ends-chh",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the word that ends with chh.",
      narration: { audio: A("challenge-speak-ends-chh"), script: "Last one, Sound Spotter. Listen to three words. Stem. Lunch. Grab. One of them ends with chh. Tap the mic and say that whole word." },
      interaction: { type: "speak", text: "lunch lunches" },
    },
    {
      id: "celebrate-sound-spotter",
      purpose: "celebrate",
      gate: "none",
      prompt: "You are a master Sound Spotter!",
      fx: {"text":"You are a master **Sound Spotter**!","effect":"fireworks"},
      narration: { audio: A("celebrate-sound-spotter"), script: "You did it, Sound Spotter! You found first sounds, middle vowel sounds, and last sounds, even in tricky blend words like grab and stem. Detective DeeDee is proud of you. Keep spotting sounds in the words you hear!" },
    },
  ],
};
