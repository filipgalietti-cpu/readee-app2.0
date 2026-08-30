import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./big-kid-words-timings.json";

// Big Kid Words (K.L.6) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=big-kid-words

const A = (id: string) => `/audio/lessons-v2/big-kid-words/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/big-kid-words/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/big-kid-words/${w.toLowerCase()}.png`;

export const bigKidWordsImages: Record<string, string> = {
  "squeaky": "A small, friendly, brown squirrel character with big eyes, holding a tiny backpack.",
  "nut": "A single, brown, oval-shaped acorn with a cap.",
  "log": "A short, thick, brown tree log lying horizontally on the grass.",
  "leaf": "A large, green, vibrant oak leaf on the ground.",
  "rock": "A smooth, grey, round river rock.",
  "box": "A simple, open, brown cardboard box.",
  "hat": "A small, colorful, striped knit hat.",
  "cup": "A bright yellow plastic cup.",
  "stool": "A small, red, round wooden stool.",
  "on": "A red apple resting on top of a green book.",
  "under": "A yellow duck hiding under a blue umbrella.",
  "next": "A small brown dog sitting right beside a tall green tree.",
  "nut-on-log": "A single acorn resting on top of a brown tree log.",
  "nut-next-log": "A single acorn placed right beside a brown tree log.",
  "nut-under-leaf": "A single acorn partially hidden under a large green leaf.",
  "nut-on-leaf": "A single acorn resting on top of a large green leaf.",
  "nut-next-rock": "A single acorn placed right beside a smooth grey rock.",
  "nut-on-rock": "A single acorn resting on top of a smooth grey rock.",
  "nut-on-box": "A single acorn resting on top of an open brown cardboard box.",
  "nut-under-hat": "A single acorn partially hidden under a colorful knit hat.",
  "nut-next-cup": "A single acorn placed right beside a bright yellow plastic cup.",
  "nut-under-box": "A single acorn partially hidden inside an open brown cardboard box.",
  "nut-on-stool": "A single acorn resting on top of a small red wooden stool.",
  "squeaky-happy": "The friendly squirrel character, Squeaky, looking very happy and holding many nuts."
};

export const bigKidWords: LessonDef = {
  id: "big-kid-words",
  title: "Big Kid Words",
  grade: "Kindergarten",
  standard: "K.L.6",
  archetype: "vocabulary",
  objective: "You will learn and use position words to tell where things are.",
  concepts: ["on","under","next to"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it! You helped Squeaky find all his nuts. You learned and used the big kid words on, under, and next to. Keep practicing these words to tell where things are!",
    "title": "You're a Position Word Pro!",
    "body": "Great job helping Squeaky and learning new words!"
  },
  scenes: [
    {
      id: "hook-squeaky-story",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "Meet Squeaky the Squirrel!",
      narration: { audio: A("hook-squeaky-story"), script: "Hello there, friend! This is Squeaky the Squirrel. He needs our help finding his yummy nuts. Let's listen to his story!" },
      interaction: { type: "read-along", text: "Squeaky the squirrel lost his favorite nuts! He needs a friend to help him find them. Can you help Squeaky?", audio: A("hook-squeaky-story-sentence") },
    },
    {
      id: "model-on",
      purpose: "model",
      gate: "interaction",
      prompt: "Find the nut **on** the log.",
      image: IMG("nut-on-log"),
      narration: { audio: A("model-on"), script: "Squeaky is looking for his nuts! Look at this nut. It is on the log. Tap the word that means on." },
      interaction: { type: "choose", options: [{ id: "on", label: "ON", audio: W("ON"), image: IMG("on") }, { id: "next", label: "NEXT", audio: W("NEXT"), image: IMG("next") }], correctId: "on", coachWrong: "Remember, on means it's sitting right on top! Try again." },
    },
    {
      id: "model-under",
      purpose: "model",
      gate: "interaction",
      prompt: "Find the nut **under** the leaf.",
      image: IMG("nut-under-leaf"),
      narration: { audio: A("model-under"), script: "Great job finding that nut! Now, look at this one. It is under the leaf. Tap the word that means under." },
      interaction: { type: "choose", options: [{ id: "under", label: "UNDER", audio: W("UNDER"), image: IMG("under") }, { id: "on", label: "ON", audio: W("ON"), image: IMG("on") }], correctId: "under", coachWrong: "Think about where the nut is hiding. Under means it's below something. Try again." },
    },
    {
      id: "model-next-to",
      purpose: "model",
      gate: "interaction",
      prompt: "Find the nut **next to** the rock.",
      image: IMG("nut-next-rock"),
      narration: { audio: A("model-next-to"), script: "You're a super helper! Here's another nut. It is next to the rock. Tap the word that means next to." },
      interaction: { type: "choose", options: [{ id: "next", label: "NEXT", audio: W("NEXT"), image: IMG("next") }, { id: "under", label: "UNDER", audio: W("UNDER"), image: IMG("under") }], correctId: "next", coachWrong: "Remember, next to means right beside something! Try again." },
    },
    {
      id: "guided-practice-1",
      purpose: "guided",
      gate: "interaction",
      prompt: "Where is the nut?",
      image: IMG("nut-on-box"),
      narration: { audio: A("guided-practice-1"), script: "Wow, you learned three new words! Let's help Squeaky find more nuts. Tap the word that tells where the nut is." },
      interaction: { type: "choose", options: [{ id: "on", label: "ON", audio: W("ON"), image: IMG("on") }, { id: "under", label: "UNDER", audio: W("UNDER"), image: IMG("under") }, { id: "next", label: "NEXT", audio: W("NEXT"), image: IMG("next") }], correctId: "on", coachWrong: "Look closely at the nut and the box. Is it on, under, or next to? You can do it!" },
    },
    {
      id: "guided-practice-2",
      purpose: "guided",
      gate: "interaction",
      prompt: "Where is the nut?",
      image: IMG("nut-under-hat"),
      narration: { audio: A("guided-practice-2"), script: "You're doing great! Squeaky is so happy. Let's find another nut for him. Tap the word that tells where this nut is." },
      interaction: { type: "choose", options: [{ id: "next", label: "NEXT", audio: W("NEXT"), image: IMG("next") }, { id: "on", label: "ON", audio: W("ON"), image: IMG("on") }, { id: "under", label: "UNDER", audio: W("UNDER"), image: IMG("under") }], correctId: "under", coachWrong: "Is the nut above, below, or beside the hat? Think about where it's hiding!" },
    },
    {
      id: "apply-practice-1",
      purpose: "apply",
      gate: "interaction",
      prompt: "Where is the nut now?",
      image: IMG("nut-next-cup"),
      narration: { audio: A("apply-practice-1"), script: "You are becoming a position word expert! Squeaky found another nut. Look at where it is. Tap the correct word." },
      interaction: { type: "choose", options: [{ id: "on", label: "ON", audio: W("ON"), image: IMG("on") }, { id: "next", label: "NEXT", audio: W("NEXT"), image: IMG("next") }, { id: "under", label: "UNDER", audio: W("UNDER"), image: IMG("under") }], correctId: "next", coachWrong: "You're so close! Is the nut on, under, or right beside the cup?" },
    },
    {
      id: "apply-practice-2",
      purpose: "apply",
      gate: "interaction",
      prompt: "Where is the nut now?",
      image: IMG("nut-under-box"),
      narration: { audio: A("apply-practice-2"), script: "Fantastic! You're almost done helping Squeaky. One more nut to find! Where is this one?" },
      interaction: { type: "choose", options: [{ id: "under", label: "UNDER", audio: W("UNDER"), image: IMG("under") }, { id: "on", label: "ON", audio: W("ON"), image: IMG("on") }, { id: "next", label: "NEXT", audio: W("NEXT"), image: IMG("next") }], correctId: "under", coachWrong: "Look carefully! Is the nut on top, below, or beside the box?" },
    },
    {
      id: "challenge-all-alone",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Where is Squeaky's nut?",
      image: IMG("nut-on-stool"),
      narration: { audio: A("challenge-all-alone"), script: "You are doing wonderful work! This is your chance to show what you know all by yourself. Tap the word that tells where the nut is!" },
      interaction: { type: "choose", options: [{ id: "next", label: "NEXT", audio: W("NEXT"), image: IMG("next") }, { id: "under", label: "UNDER", audio: W("UNDER"), image: IMG("under") }, { id: "on", label: "ON", audio: W("ON"), image: IMG("on") }], correctId: "on", coachWrong: "Keep trying! You know these words." },
    },
    {
      id: "celebrate-success",
      purpose: "celebrate",
      gate: "none",
      prompt: "You are a Big Kid Words master!",
      image: IMG("squeaky-happy"),
      fx: {"text":"You learned ON, UNDER, and NEXT TO!","effect":"rainbow"},
      narration: { audio: A("celebrate-success"), script: "Hooray! You helped Squeaky find all his nuts! You learned and used the words on, under, and next to to tell where things are. Keep using your big kid words!" },
    },
  ],
};
