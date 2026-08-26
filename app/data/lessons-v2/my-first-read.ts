import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./my-first-read-timings.json";

// My First Read (RF.K.4) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=my-first-read

const A = (id: string) => `/audio/lessons-v2/my-first-read/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/my-first-read/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/my-first-read/${w.toLowerCase()}.png`;

export const myFirstReadImages: Record<string, string | { subject: string; ref?: string }> = {
  "readee": "A friendly white bunny with long ears, smiling and holding open a small red storybook.",
  "page-1": "An orange tabby cat sitting calmly on a sunny green hill.",
  "page-2": { subject: "A small brown puppy running toward the orange tabby cat, who is sitting on the sunny green hill.", ref: "page-1" },
  "page-3": { subject: "The small brown puppy sitting down right next to the orange tabby cat on the sunny green hill.", ref: "page-2" },
  "page-4": { subject: "The small brown puppy and the orange tabby cat sitting close together on the sunny green hill, smiling, best friends.", ref: "page-3" },
  "dog": { subject: "The small brown puppy standing and wagging its tail.", ref: "page-2" },
  "pig": "A round pink pig standing in a grassy field.",
  "hid": { subject: "The small brown puppy hiding behind a big cardboard box, only its ears peeking out.", ref: "page-2" },
  "dug": { subject: "The small brown puppy digging a hole in the dirt.", ref: "page-2" }
};

export const myFirstRead: LessonDef = {
  id: "my-first-read",
  title: "My First Read",
  grade: "Kindergarten",
  standard: "RF.K.4",
  archetype: "fluency",
  objective: "I can read a story and understand what happens!",
  concepts: ["fluency","decoding","comprehension"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Wow, you are an amazing story reader! You read a whole story all by yourself. Keep practicing reading new words and understanding what you read. Great job!",
    "title": "You're a Star Reader!",
    "body": "You read a whole story and understood what happened! Keep reading!"
  },
  scenes: [
    {
      id: "intro-hook",
      purpose: "hook",
      gate: "none",
      prompt: "Your very first book!",
      image: IMG("readee"),
      narration: { audio: A("intro-hook"), script: "Hello, super reader! Today is a very big day. You get to read your first little book, all by yourself. It is a tiny story about a cat. Let's open it!" },
    },
    {
      id: "model-page-1",
      purpose: "model",
      gate: "interaction",
      prompt: "Page 1. Listen as I read!",
      image: IMG("page-1"),
      narration: { audio: A("model-page-1"), script: "Here is page one. Watch the words light up while I read with my best reading voice. Follow along with your eyes!" },
      interaction: { type: "read-along", text: "The cat sat.", audio: A("model-page-1-sentence") },
    },
    {
      id: "guided-page-2",
      purpose: "guided",
      gate: "interaction",
      prompt: "A dog ran to the cat.",
      image: IMG("page-2"),
      narration: { audio: A("guided-page-2"), script: "You listened so well! Now it is your turn. Here is page two. Look at the picture, then read the words on the page out loud, nice and clear." },
      interaction: { type: "speak", text: "A dog ran to the cat" },
    },
    {
      id: "guided-page-3",
      purpose: "guided",
      gate: "interaction",
      prompt: "The dog sat.",
      image: IMG("page-3"),
      narration: { audio: A("guided-page-3"), script: "What great reading! Turn the page. Look at what the dog does now, then read page three out loud!" },
      interaction: { type: "speak", text: "The dog sat" },
    },
    {
      id: "apply-page-4",
      purpose: "apply",
      gate: "interaction",
      prompt: "The dog is a pal.",
      image: IMG("page-4"),
      narration: { audio: A("apply-page-4"), script: "One more page. This is the end of the story! Read it out loud with your best reading voice. You can do it!" },
      interaction: { type: "speak", text: "The dog is a pal" },
    },
    {
      id: "comprehension-who-ran",
      purpose: "apply",
      gate: "interaction",
      prompt: "Who ran to the cat?",
      narration: { audio: A("comprehension-who-ran"), script: "You read the whole book! Now let's show we understood the story. Think back. Who ran to the cat? Tap the picture." },
      interaction: { type: "choose", options: [{ id: "dog", label: "DOG", audio: W("dog"), image: IMG("dog") }, { id: "cat", label: "CAT", audio: W("cat"), image: IMG("page-1") }, { id: "pig", label: "PIG", audio: W("pig"), image: IMG("pig") }], correctId: "dog", coachWrong: "Think back to page two of our story. Someone came running to the cat. Look at each picture and try again!" },
    },
    {
      id: "challenge-what-dog-did",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Then what did the dog do?",
      narration: { audio: A("challenge-what-dog-did"), script: "Great remembering! Here is a trickier one. The dog ran to the cat. Then what did the dog do? Tap the picture that shows it." },
      interaction: { type: "choose", options: [{ id: "sat", label: "SAT", audio: W("sat"), image: IMG("page-3") }, { id: "hid", label: "HID", audio: W("hid"), image: IMG("hid") }, { id: "dug", label: "DUG", audio: W("dug"), image: IMG("dug") }], correctId: "sat", coachWrong: "Look at each picture. Which one shows what really happened in our story? Try again!" },
    },
    {
      id: "challenge-sequence",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Put the story in order!",
      narration: { audio: A("challenge-sequence"), script: "Last challenge, reader! Put the story pictures in order. Tap what happened first, then what happened next, then how the story ended." },
      interaction: { type: "sequence", items: [{ id: "cat", label: "CAT", audio: W("cat"), image: IMG("page-1") }, { id: "dog", label: "DOG", audio: W("dog"), image: IMG("page-2") }, { id: "pal", label: "PAL", audio: W("pal"), image: IMG("page-4") }], order: ["cat","dog","pal"], coachWrong: "Think back to how the book began. Which picture shows the very first page? Try again!" },
    },
    {
      id: "celebrate-finish",
      purpose: "celebrate",
      gate: "none",
      prompt: "You are a reader!",
      fx: {"text":"You read your **first book**!","effect":"fireworks"},
      narration: { audio: A("celebrate-finish"), script: "Amazing job, superstar! You read a whole book and understood it! The cat sat, the dog ran over, and they became pals. Keep reading every day. You are a real reader now!" },
    },
  ],
};
