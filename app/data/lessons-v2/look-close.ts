import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./look-close-timings.json";

// Look Close! (RF.K.3d) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=look-close

const A = (id: string) => `/audio/lessons-v2/look-close/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/look-close/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/look-close/${w.toLowerCase()}.png`;

export const lookCloseImages: Record<string, string> = {
  "hat": "a red wide-brimmed sun hat",
  "hot": "a bright yellow sun with sweat drops",
  "sit": "a small child sitting on a chair",
  "cat": "a fluffy orange cat sitting calmly"
};

export const lookClose: LessonDef = {
  id: "look-close",
  title: "Look Close!",
  grade: "Kindergarten",
  standard: "RF.K.3d",
  archetype: "phonics",
  objective: "You will learn to look closely at words and find the letter that changes them.",
  concepts: ["spot the changed letter","read both words","minimal pairs"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You are an amazing word spotter! You looked closely at words and found the tiny letter that changed them. Keep spotting those sneaky letters!",
    "title": "You're a Word Spotter!",
    "body": "Great job finding all the sneaky letters and reading new words!"
  },
  scenes: [
    {
      id: "hook-word-spotter-mission",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "A Story About Two Friends",
      narration: { audio: A("hook-word-spotter-mission"), script: "Hello, super word spotter! I'm Jennifer, and we have a special mission today. We need to find the sneaky letter that changes words. Listen to this story about two friends!" },
      interaction: { type: "read-along", text: "A **hat** sat on a cat. It was very big. Then the cat felt **hot**! The hat fell off. Just one letter made a big change!", audio: A("hook-word-spotter-mission-sentence") },
    },
    {
      id: "model-hat-hot",
      purpose: "model",
      gate: "interaction",
      prompt: "Listen to these words.",
      narration: { audio: A("model-hat-hot"), script: "Hat. Hot. Did you hear how hat and hot sound different? Let's line them up so we can look closely. Tap hat first. Then tap hot." },
      interaction: { type: "sequence", items: [{ id: "hat", label: "HAT", audio: W("hat"), image: IMG("hat") }, { id: "hot", label: "HOT", audio: W("hot"), image: IMG("hot") }], order: ["hat","hot"], coachWrong: "Listen carefully to the sounds. Try again!" },
    },
    {
      id: "model-spot-difference",
      purpose: "model",
      gate: "none",
      prompt: "Spot the sneaky letter!",
      fx: {"text":"h**a**t and h**o**t","effect":"glow"},
      narration: { audio: A("model-spot-difference"), script: "Look closely at hat and hot. See how the middle letter changed? That's the sneaky letter that changed the word's sound and meaning!" },
    },
    {
      id: "guided-can-cap",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the word you hear!",
      narration: { audio: A("guided-can-cap"), script: "Now it's your turn. These two words look almost the same. Listen closely. Can. Tap the word can." },
      interaction: { type: "choose", options: [{ id: "can", label: "CAN", audio: W("can") }, { id: "cap", label: "CAP", audio: W("cap") }], correctId: "can", coachWrong: "Look at the last letter of each word. Listen to the ending sound. Try again!" },
    },
    {
      id: "guided-pin-pan",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tap the word you hear!",
      narration: { audio: A("guided-pin-pan"), script: "Excellent spotting! Let's try another pair. Listen closely. Pan. Tap the word pan." },
      interaction: { type: "choose", options: [{ id: "pin", label: "PIN", audio: W("pin") }, { id: "pan", label: "PAN", audio: W("pan") }], correctId: "pan", coachWrong: "Look at the middle letter of each word. Listen to the middle sound. Try again!" },
    },
    {
      id: "apply-bug-bag",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the word you hear!",
      narration: { audio: A("apply-bug-bag"), script: "Great spotting! Here is a new pair. Listen closely. Bug. Tap the word bug." },
      interaction: { type: "choose", options: [{ id: "bug", label: "BUG", audio: W("bug") }, { id: "bag", label: "BAG", audio: W("bag") }], correctId: "bug", coachWrong: "So close! Look at the middle letter of each word and listen to the middle sound. Try again!" },
    },
    {
      id: "apply-log-leg",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the word you hear!",
      narration: { audio: A("apply-log-leg"), script: "Fantastic work! Let's spot another sneaky letter. Listen closely. Leg. Tap the word leg." },
      interaction: { type: "choose", options: [{ id: "log", label: "LOG", audio: W("log") }, { id: "leg", label: "LEG", audio: W("leg") }], correctId: "leg", coachWrong: "Look at the middle letter of each word and listen again for the middle sound. Try again!" },
    },
    {
      id: "apply-read-hot",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read the word out loud!",
      fx: {"text":"**HOT**","effect":"glow"},
      narration: { audio: A("apply-read-hot"), script: "Now you get to read a word to me. Look closely at this word. Look at its middle letter. When you're ready, say the word out loud!" },
      interaction: { type: "speak", text: "hot" },
    },
    {
      id: "challenge-sit-set",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tap the word that matches the picture!",
      image: IMG("sit"),
      narration: { audio: A("challenge-sit-set"), script: "Here is a challenge. Look at the picture. What is the child doing? These two words look very alike. Look closely at the middle letter of each word, then tap the word that matches the picture." },
      interaction: { type: "choose", options: [{ id: "sit", label: "SIT", audio: W("sit") }, { id: "set", label: "SET", audio: W("set") }], correctId: "sit", coachWrong: "Look at the middle letter of each word. Listen to the middle sound. Try again!" },
    },
    {
      id: "challenge-cot-cat",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Tap the word that matches the picture!",
      image: IMG("cat"),
      narration: { audio: A("challenge-cot-cat"), script: "You found the sneaky letter! Try one more. Look at the picture. What animal do you see? Look closely at the middle letter of each word, then tap the word that matches the picture." },
      interaction: { type: "choose", options: [{ id: "cot", label: "COT", audio: W("cot") }, { id: "cat", label: "CAT", audio: W("cat") }], correctId: "cat", coachWrong: "You're so close! Look at the middle letter of each word and listen one more time. Try again!" },
    },
    {
      id: "celebrate-success",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are a Word Spotter!",
      fx: {"text":"You are a **SUPER WORD SPOTTER**!","effect":"burst"},
      narration: { audio: A("celebrate-success"), script: "You did it! You are an amazing word spotter. You looked closely at words and found the tiny letter that changed them. Keep spotting those sneaky letters!" },
    },
  ],
};
