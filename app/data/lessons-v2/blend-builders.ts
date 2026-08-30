import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./blend-builders-timings.json";

// Blend Builders (RF.1.2b) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=blend-builders

const A = (id: string) => `/audio/lessons-v2/blend-builders/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/blend-builders/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/blend-builders/${w.toLowerCase()}.png`;

export const blendBuildersImages: Record<string, string> = {
  "robot": "A friendly, metallic robot with gears and lights."
};

export const blendBuilders: LessonDef = {
  id: "blend-builders",
  title: "Blend Builders",
  grade: "1st Grade",
  standard: "RF.1.2b",
  archetype: "phonics",
  objective: "I can blend sounds into whole words, even words with tricky blends!",
  concepts: ["orally blend three and four sounds into single-syllable words, including consonant blends like st, fl, sn, cl, tr, and sw"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it! You blended sounds into whole words, even words with tricky blends like stop, flag, and swim. Blendo is dancing because you are a true Blend Builder!",
    "title": "You're a Blend Builder!",
    "body": "You blended sounds into whole words, including tricky consonant blends."
  },
  scenes: [
    {
      id: "hook-listen-blendo-intro",
      purpose: "hook",
      gate: "none",
      prompt: "Listen to Blendo's sounds.",
      image: IMG("robot"),
      narration: { audio: A("hook-listen-blendo-intro"), script: "Welcome to the Sound Factory! This is Blendo, the blending robot. Blendo takes little sounds and blends them into whole words. Listen to Blendo's four sounds. Sss. Tuh. Aww. Puh. Tap a tile to hear a sound again." },
      interaction: { type: "listen", items: [{ label: "sss", audio: W("sss") }, { label: "tuh", audio: W("tuh") }, { label: "aww", audio: W("aww") }, { label: "puh", audio: W("puh") }] },
    },
    {
      id: "model-blend-stop",
      purpose: "model",
      gate: "none",
      prompt: "Watch Blendo blend four sounds.",
      fx: {"text":"Sss. Tuh. Aww. Puh. **Stop**!","effect":"pop-words"},
      narration: { audio: A("model-blend-stop"), script: "Watch Blendo work. Sss. Tuh. Aww. Puh. Blendo says the sounds faster and faster until they melt into one word. Stop! The word is stop. Did you hear how sss and tuh stick together at the start? Two consonant sounds that stick together are called a blend." },
    },
    {
      id: "guided-choose-flag",
      purpose: "guided",
      gate: "interaction",
      prompt: "Blend the sounds. Tap the word you made.",
      narration: { audio: A("guided-choose-flag"), script: "Now you try. Listen to the sounds. Fff. Lll. Aaa. Guh. Blend them together in your head. What word did you make? Read each tile, then tap your word." },
      interaction: { type: "choose", options: [{ id: "flat", label: "flat", audio: W("flat") }, { id: "flag", label: "flag", audio: W("flag") }, { id: "lag", label: "lag", audio: W("lag") }], correctId: "flag", coachWrong: "Say the sounds out loud. Fff. Lll. Aaa. Guh. Now say them fast, and listen for the word. Tap the word that matches." },
    },
    {
      id: "guided-sequence-snap",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Drag the sounds in order, then the word.",
      narration: { audio: A("guided-sequence-snap"), script: "Blendo's sounds fell out of order! The word is snap. Say it slowly. Sss. Nnn. Aaa. Puh. Drag the sound tiles into order, then the whole word at the end." },
      interaction: { type: "sequence", items: [{ id: "s", label: "sss", audio: W("sss") }, { id: "n", label: "nnn", audio: W("nnn") }, { id: "a", label: "aaa", audio: W("aaa") }, { id: "p", label: "puh", audio: W("puh") }, { id: "snap", label: "snap", audio: W("snap") }], order: ["s","n","a","p","snap"], coachWrong: "Say snap slowly. Sss. Nnn. Aaa. Puh. Which sound comes first? Put the sounds in that order, then the whole word last." },
    },
    {
      id: "apply-choose-trip",
      purpose: "apply",
      gate: "interaction",
      prompt: "Blend four sounds. Tap the word you made.",
      narration: { audio: A("apply-choose-trip"), script: "Ready for a trickier one? Listen. Tuh. Rrr. Iii. Puh. Blend the sounds in your head. Read every tile, then tap the word you made." },
      interaction: { type: "choose", options: [{ id: "trap", label: "trap", audio: W("trap") }, { id: "rip", label: "rip", audio: W("rip") }, { id: "trip", label: "trip", audio: W("trip") }, { id: "tip", label: "tip", audio: W("tip") }], correctId: "trip", coachWrong: "Listen again. Tuh. Rrr. Iii. Puh. Say the sounds fast and listen for the word. Check every tile before you tap." },
    },
    {
      id: "apply-speak-clap",
      purpose: "apply",
      gate: "interaction",
      prompt: "Blend the sounds. Say the word out loud!",
      narration: { audio: A("apply-speak-clap"), script: "Now say your word out loud! Listen to the sounds. Cuh. Lll. Aaa. Puh. Blend them together. Tap the mic and say the whole word." },
      interaction: { type: "speak", text: "clap claps clapping" },
    },
    {
      id: "apply-read-along-blends",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the sentence with Blendo.",
      narration: { audio: A("apply-read-along-blends"), script: "You can blend sounds into words. Now read blend words inside a real sentence. Read along with me." },
      interaction: { type: "read-along", text: "We stop and clap at the flag.", audio: A("apply-read-along-blends-sentence") },
    },
    {
      id: "challenge-speak-swim",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Blend the sounds. Say the word!",
      narration: { audio: A("challenge-speak-swim"), script: "Challenge time! Listen closely. Sss. Wuh. Iii. Mmm. Blend all the sounds together and say the whole word into the mic." },
      interaction: { type: "speak", text: "swim swims swimming" },
    },
    {
      id: "challenge-choose-grin",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tricky blend! Tap the word you made.",
      narration: { audio: A("challenge-choose-grin"), script: "Here is a tricky blend. Listen. Guh. Rrr. Iii. Nnn. Blend the sounds. Read all four words, then tap the one you made." },
      interaction: { type: "choose", options: [{ id: "grab", label: "grab", audio: W("grab") }, { id: "pin", label: "pin", audio: W("pin") }, { id: "grin", label: "grin", audio: W("grin") }, { id: "win", label: "win", audio: W("win") }], correctId: "grin", coachWrong: "Say the sounds again. Guh. Rrr. Iii. Nnn. Listen for the two sounds that stick together at the start, then tap the word." },
    },
    {
      id: "challenge-speak-drum",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Last one! Blend the sounds and say the word.",
      narration: { audio: A("challenge-speak-drum"), script: "Last one, Blend Builder! Listen very carefully. Duh. Rrr. Uh. Mmm. Blend the sounds and say the whole word out loud!" },
      interaction: { type: "speak", text: "drum drums drumming" },
    },
    {
      id: "celebrate-blend-builder",
      purpose: "celebrate",
      gate: "none",
      prompt: "You are a master Blend Builder!",
      fx: {"text":"You are a master **Blend Builder**!","effect":"fireworks"},
      narration: { audio: A("celebrate-blend-builder"), script: "You did it! You blended sounds into whole words, even words with tricky blends like stop, flag, and swim. Blendo is dancing because you are a true Blend Builder!" },
    },
  ],
};
