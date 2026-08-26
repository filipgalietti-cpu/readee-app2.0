import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./digraph-detectives-timings.json";

// Digraph Detectives (RF.1.3a) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=digraph-detectives

const A = (id: string) => `/audio/lessons-v2/digraph-detectives/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/digraph-detectives/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/digraph-detectives/${w.toLowerCase()}.png`;

export const digraphDetectivesImages: Record<string, string> = {
  "magnifying-glass": "A shiny gold detective magnifying glass with a wooden handle, sparkling.",
  "whale": "A large friendly blue whale spouting water from its blowhole while swimming in the ocean."
};

export const digraphDetectives: LessonDef = {
  id: "digraph-detectives",
  title: "Digraph Detectives",
  grade: "1st Grade",
  standard: "RF.1.3a",
  archetype: "phonics",
  objective: "I can read words with two-letter teams like the ones in ship, chat, thin, and whale!",
  concepts: ["know the spelling-sound correspondences for common consonant digraphs: two letters that make one sound, as in ship, chat, thin, and whale"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Case closed, Digraph Detective! You found the letter teams and read words like ship, chat, thin, and whale. Two letters, one sound, every time. Keep spotting letter teams in every book you read!",
    "title": "You're a Digraph Detective!",
    "body": "You read words with the letter teams in ship, chat, thin, and whale."
  },
  scenes: [
    {
      id: "hook-mission-words",
      purpose: "hook",
      gate: "none",
      prompt: "Listen to our four mission words.",
      image: IMG("magnifying-glass"),
      narration: { audio: A("hook-mission-words"), script: "Hello, Digraph Detective! Some words hide a secret. Two letters team up and make just one sound. Your mission today is to spot these letter teams and read their words. Tap a tile to hear a mission word." },
      interaction: { type: "listen", items: [{ label: "ship", audio: W("ship") }, { label: "chat", audio: W("chat") }, { label: "thin", audio: W("thin") }, { label: "whale", audio: W("whale") }] },
    },
    {
      id: "model-sh-team",
      purpose: "model",
      gate: "none",
      prompt: "Two letters can make one sound.",
      fx: {"text":"**sh** in **ship**. Two letters, one sound. Shh!","effect":"glow"},
      narration: { audio: A("model-sh-team"), script: "Look at the word ship. The two letters at the front are a team. A letter team like this is called a digraph. Two letters, one sound. This team says shh. Listen. Shh. Iii. Puh. Ship. Say it with me. Shh. Ship." },
    },
    {
      id: "model-more-teams",
      purpose: "model",
      gate: "none",
      prompt: "Detectives know more letter teams.",
      fx: {"text":"**ch** says chh. **th** says thh. **wh** says wuh.","effect":"pop-words"},
      narration: { audio: A("model-more-teams"), script: "Detectives learn more teams. The team at the front of chat says chh. Chh. Aaa. Tuh. Chat. The team in thin says thh. Thh. Iii. Nnn. Thin. The team in whale says wuh. Wuh. Whale. Every team is two letters that make one sound." },
    },
    {
      id: "guided-build-fish",
      purpose: "guided",
      gate: "interaction",
      prompt: "Build the word fish.",
      narration: { audio: A("guided-build-fish"), script: "Time to build a word. The word is fish. Say it slowly. Fff. Iii. Shh. Fish ends with shh. Tap the letter team that says shh and snap it on the end." },
      interaction: { type: "transform", base: "fi", add: "sh", result: "fish", changeIndex: 0, options: ["sh", "ch", "th"], successAudio: W("fish"), coachWrong: "That team makes a different sound. Say fish slowly. Fff. Iii. Shh. Tap the team that says shh." },
    },
    {
      id: "guided-build-bath",
      purpose: "guided",
      gate: "interaction",
      prompt: "Build the word bath.",
      narration: { audio: A("guided-build-bath"), script: "Build one more. The word is bath. Say it slowly. Buh. Aaa. Thh. Bath ends with thh. Tap the letter team that says thh and snap it on the end." },
      interaction: { type: "transform", base: "ba", add: "th", result: "bath", changeIndex: 0, options: ["th", "ch", "sh"], successAudio: W("bath"), coachWrong: "Say bath slowly. Buh. Aaa. Thh. Listen to the very last sound, then tap the team that says thh." },
    },
    {
      id: "guided-read-ship",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the word that says ship.",
      narration: { audio: A("guided-read-ship"), script: "Now read like a detective. One of these words says ship. Ship. Read each word in your head and make its letter team say one sound. Then tap the word ship." },
      interaction: { type: "choose", options: [{ id: "ship", label: "ship" }, { id: "chip", label: "chip" }, { id: "shin", label: "shin" }], correctId: "ship", coachWrong: "Look at the letter team at the front of each word. Say its sound, then read the rest. Find the word that says ship." },
    },
    {
      id: "apply-read-thin",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the word that says thin.",
      narration: { audio: A("apply-read-thin"), script: "Here is a tricky one. One of these words says thin. Thin. The word thin starts with thh. Read each word all the way to the end, then tap thin." },
      interaction: { type: "choose", options: [{ id: "thin", label: "thin" }, { id: "chin", label: "chin" }, { id: "shin", label: "shin" }, { id: "fin", label: "fin" }], correctId: "thin", coachWrong: "Say thh first, then read the rest of the word. Read each word again and find the one that says thin." },
    },
    {
      id: "apply-speak-sentence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read it aloud: A whale and a fish chat on the ship.",
      narration: { audio: A("apply-speak-sentence"), script: "Detective, you can read whole sentences with letter teams. Read this sentence out loud. Make every letter team say its one sound." },
      interaction: { type: "speak", text: "A whale and a fish chat on the ship" },
    },
    {
      id: "apply-sort-teams",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each word into its sound bucket.",
      narration: { audio: A("apply-sort-teams"), script: "Sort time. The ship bucket collects words with shh. The chat bucket collects words with chh. The thin bucket collects words with thh. The team can hide at the start or the end of a word. Read each word, then drag it to its bucket." },
      interaction: { type: "sort", buckets: ["Ship","Chat","Thin"], items: [{ label: "shop", bucket: "Ship" }, { label: "chin", bucket: "Chat" }, { label: "bath", bucket: "Thin" }, { label: "fish", bucket: "Ship" }, { label: "chop", bucket: "Chat" }, { label: "math", bucket: "Thin" }], coachWrong: "Read the word again and listen for its team sound. Does it say shh, chh, or thh? Drag it to the bucket with that same sound." },
    },
    {
      id: "challenge-read-whale",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tap the word that names the picture.",
      image: IMG("whale"),
      narration: { audio: A("challenge-read-whale"), script: "Challenge time. Look at the picture. Read each word carefully. Two of the words start with the same letter team, so read all the way to the end. Tap the word that names the picture." },
      interaction: { type: "choose", options: [{ id: "whale", label: "whale" }, { id: "wheel", label: "wheel" }, { id: "well", label: "well" }], correctId: "whale", coachWrong: "Say wuh, then keep reading to the very end of the word. Check every letter before you tap." },
    },
    {
      id: "challenge-speak-shop",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Blend the sounds. Say the word out loud!",
      narration: { audio: A("challenge-speak-shop"), script: "Last mission, Detective. Listen to the sounds. Shh. Aww. Puh. Blend them together and say the whole word into the mic." },
      interaction: { type: "speak", text: "shop shops shopping" },
    },
    {
      id: "celebrate-digraph-detective",
      purpose: "celebrate",
      gate: "none",
      prompt: "Case closed, Digraph Detective!",
      fx: {"text":"You are a **Digraph Detective**!","effect":"fireworks"},
      narration: { audio: A("celebrate-digraph-detective"), script: "Case closed, Digraph Detective! You found the letter teams and read words like ship, chat, thin, and whale. Two letters, one sound, every time. Keep spotting letter teams in every book you read!" },
    },
  ],
};
