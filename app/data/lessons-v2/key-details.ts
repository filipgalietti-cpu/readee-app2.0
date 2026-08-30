import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./key-details-timings.json";

// What Happened? (RL.K.1) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=key-details

const A = (id: string) => `/audio/lessons-v2/key-details/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/key-details/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/key-details/${w.toLowerCase()}.png`;

export const keyDetailsImages: Record<string, string> = {
  "pip": "a small, cute blue bird with big eyes, looking curious",
  "bug": "a small, shiny red ladybug with black spots",
  "tree": "a very large, green oak tree with a wide trunk",
  "fly": "a blue bird with wings spread, mid-flight, facing right",
  "eat": "a blue bird happily pecking at a small red bug on a branch",
  "hide": "a blue bird peeking from behind a thick tree trunk",
  "sing": "a blue bird with an open beak, musical notes floating around it",
  "run": "a blue bird with tiny legs, running quickly across grass",
  "park": "a green park with a swing set and a slide, no people",
  "nest": "a bird's nest made of twigs, with three small blue eggs inside",
  "bush": "a round, green leafy bush with small red berries",
  "road": "a gray asphalt road winding through green grass and a few small rocks",
  "sun": "a bright yellow sun with a smiling face in the sky",
  "rock": "a smooth, round gray rock sitting on green grass"
};

export const keyDetails: LessonDef = {
  id: "key-details",
  title: "What Happened?",
  grade: "Kindergarten",
  standard: "RL.K.1",
  archetype: "story-elements",
  objective: "You will ask and answer questions about who, what, and where in a story.",
  concepts: ["who the story is about","what happened","where it happened"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You are a super Story Detective! You learned to find out who a story is about. You also found out what happened and where it happened. Keep asking great questions when you listen to stories!",
    "title": "You're a Story Detective!",
    "body": "Great work finding all the clues!"
  },
  scenes: [
    {
      id: "hook-listen-story",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Listen to a fun story!",
      fx: {"text":"Let's be **Story Detectives**!","effect":"pop-words"},
      narration: { audio: A("hook-listen-story"), script: "Hello, Story Detectives! We have a mission today. We will find clues in a story. Listen carefully to this story!" },
      interaction: { type: "read-along", text: "Pip the bird flew to a big tree. Pip found a shiny red bug. Pip ate the bug! Yum!", audio: A("hook-listen-story-sentence") },
    },
    {
      id: "model-who",
      purpose: "model",
      gate: "interaction",
      prompt: "Who was in the story?",
      narration: { audio: A("model-who"), script: "Now, let's be detectives! I'll show you how to find a clue. Who was the story about? It was about Pip! See how I found Pip?" },
      interaction: { type: "choose", options: [{ id: "pip", label: "PIP", audio: W("pip"), image: IMG("pip") }, { id: "bug", label: "BUG", audio: W("bug"), image: IMG("bug") }, { id: "tree", label: "TREE", audio: W("tree"), image: IMG("tree") }], correctId: "pip", coachWrong: "Good try! Pip was the main one in our story." },
    },
    {
      id: "model-what",
      purpose: "model",
      gate: "interaction",
      prompt: "What did Pip do?",
      narration: { audio: A("model-what"), script: "Great job! Now, let's find another clue. What happened in the story? Pip ate a bug! I found what happened. Your turn next!" },
      interaction: { type: "choose", options: [{ id: "fly", label: "FLY", audio: W("fly"), image: IMG("fly") }, { id: "eat", label: "EAT", audio: W("eat"), image: IMG("eat") }, { id: "hide", label: "HIDE", audio: W("hide"), image: IMG("hide") }], correctId: "eat", coachWrong: "Almost! Pip ate the bug. That's what happened." },
    },
    {
      id: "model-where",
      purpose: "model",
      gate: "interaction",
      prompt: "Where was the story?",
      narration: { audio: A("model-where"), script: "You're doing great! One last clue. Where did the story happen? It happened in a big tree! I found where it happened. Now it's your turn to be a detective!" },
      interaction: { type: "choose", options: [{ id: "tree", label: "TREE", audio: W("tree"), image: IMG("tree") }, { id: "nest", label: "NEST", audio: W("nest"), image: IMG("nest") }, { id: "bush", label: "BUSH", audio: W("bush"), image: IMG("bush") }], correctId: "tree", coachWrong: "Not quite. The story happened in the big tree." },
    },
    {
      id: "guided-who",
      purpose: "guided",
      gate: "interaction",
      prompt: "Who was the story about?",
      narration: { audio: A("guided-who"), script: "Okay, Detective! Your turn to find who. Who was the story about? Tap the picture that shows who!" },
      interaction: { type: "choose", options: [{ id: "pip", label: "PIP", audio: W("pip"), image: IMG("pip") }, { id: "bug", label: "BUG", audio: W("bug"), image: IMG("bug") }, { id: "sun", label: "SUN", audio: W("sun"), image: IMG("sun") }], correctId: "pip", coachWrong: "Remember, Pip was the little bird in our story. Try again!" },
    },
    {
      id: "guided-what",
      purpose: "guided",
      gate: "interaction",
      prompt: "What happened in the story?",
      narration: { audio: A("guided-what"), script: "Fantastic! Now, let's find what happened. What did Pip do? Tap the picture that shows what happened!" },
      interaction: { type: "choose", options: [{ id: "sing", label: "SING", audio: W("sing"), image: IMG("sing") }, { id: "eat", label: "EAT", audio: W("eat"), image: IMG("eat") }, { id: "run", label: "RUN", audio: W("run"), image: IMG("run") }], correctId: "eat", coachWrong: "Pip ate the bug! That's what happened. Try again!" },
    },
    {
      id: "guided-where",
      purpose: "guided",
      gate: "interaction",
      prompt: "Where did it happen?",
      narration: { audio: A("guided-where"), script: "You're almost there! Now, find where the story happened. Where was Pip? Tap the picture that shows where!" },
      interaction: { type: "choose", options: [{ id: "park", label: "PARK", audio: W("park"), image: IMG("park") }, { id: "tree", label: "TREE", audio: W("tree"), image: IMG("tree") }, { id: "road", label: "ROAD", audio: W("road"), image: IMG("road") }], correctId: "tree", coachWrong: "Remember, Pip was in a big tree. Give it another try!" },
    },
    {
      id: "apply-sequence",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put the story in order!",
      narration: { audio: A("apply-sequence"), script: "Great detective work! Now, let's put the clues in order. What happened first, next, and last? Tap the pictures in story order!" },
      interaction: { type: "sequence", items: [{ id: "fly", label: "FLY", audio: W("fly"), image: IMG("fly") }, { id: "bug", label: "BUG", audio: W("bug"), image: IMG("bug") }, { id: "eat", label: "EAT", audio: W("eat"), image: IMG("eat") }], order: ["fly","bug","eat"], coachWrong: "Think about what Pip did first. Then what happened next? And last? Try again!" },
    },
    {
      id: "challenge-main-idea",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What was important here?",
      narration: { audio: A("challenge-main-idea"), script: "Amazing job, Story Detective! You've found all the clues. Now, pick the picture that was a big part of our story!" },
      interaction: { type: "choose", options: [{ id: "pip", label: "PIP", audio: W("pip"), image: IMG("pip") }, { id: "sun", label: "SUN", audio: W("sun"), image: IMG("sun") }, { id: "rock", label: "ROCK", audio: W("rock"), image: IMG("rock") }], correctId: "pip", coachWrong: "Think about who the story was all about. Try again!" },
    },
    {
      id: "celebrate-lesson-complete",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You did it!",
      fx: {"text":"You are a **Story Detective**!","effect":"burst"},
      narration: { audio: A("celebrate-lesson-complete"), script: "You are a super Story Detective! You found out who the story was about, what happened, and where it happened. Keep asking questions when you listen to stories!" },
    },
  ],
};
