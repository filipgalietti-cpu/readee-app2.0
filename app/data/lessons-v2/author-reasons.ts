import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./author-reasons-timings.json";

// Because... (RI.K.8) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=author-reasons

const A = (id: string) => `/audio/lessons-v2/author-reasons/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/author-reasons/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/author-reasons/${w.toLowerCase()}.png`;

export const authorReasonsImages: Record<string, string | { subject: string; ref?: string }> = {
  "bear": "A big brown bear standing on four legs in a green forest. Friendly nonfiction illustration, the bear looks and acts like a real bear, no smiling face, no clothes.",
  "sleep": { subject: "The big brown bear curled up asleep with eyes closed inside a cozy dark earthen den, soft dirt walls around it. No snow visible, no letters or symbols in the image.", ref: "bear" },
  "splash": { subject: "The big brown bear standing in a shallow blue river, splashing water with one front paw, water droplets flying. No fish visible anywhere in the image.", ref: "bear" },
  "climb": { subject: "A small brown bear cub climbing up the trunk of a tall tree, gripping the bark with its claws, green forest behind.", ref: "bear" },
  "fur": { subject: "The big brown bear standing in a forest showing its thick, shaggy, fluffy brown winter fur coat.", ref: "bear" },
  "safe": { subject: "A small brown bear cub tucked snug and calm against the side of its large mother bear in a green forest.", ref: "bear" },
  "cold": "A snowy winter forest with bare trees and snowflakes falling from a grey sky. No animals, no letters or symbols.",
  "hot": "A bright yellow sun with plain rays high over a dry green summer meadow. No face on the sun, no letters or symbols.",
  "fish": "A silver salmon fish leaping out of clear blue river water, water droplets around it. Friendly nonfiction illustration."
};

export const authorReasons: LessonDef = {
  id: "author-reasons",
  title: "Because...",
  grade: "Kindergarten",
  standard: "RI.K.8",
  archetype: "inference",
  objective: "I can find the reasons an author gives in a fact book.",
  concepts: ["RI.K.8","inference","author's reasons","because","fact book"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You found the author's reasons! When a fact book tells you something, listen for the word because. The reason comes right after it.",
    "title": "Reason Finder!",
    "body": "You found the reasons the author gives in a fact book!"
  },
  scenes: [
    {
      id: "hook-bear-book",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "Let's read a bear fact book!",
      image: IMG("bear"),
      narration: { audio: A("hook-bear-book"), script: "Hello, fact finders! Today we will read a fact book about real bears. Authors of fact books do two jobs. They tell us something, and they tell us why it is true. Let's find out how!" },
    },
    {
      id: "model-because",
      purpose: "model",
      gate: "none",
      prompt: "Because tells us WHY.",
      fx: {"text":"Bears sleep all winter **because** it is cold.","effect":"glow"},
      narration: { audio: A("model-because"), script: "Watch me find a reason. The author says: bears sleep all winter. That is the author's point. Then the author tells WHY: because it is cold, and food is hard to find. Do you see the word because glowing? The word because tells us a reason is coming!" },
    },
    {
      id: "read-page-1",
      purpose: "guided",
      gate: "interaction",
      prompt: "Page 1. Listen and follow!",
      image: IMG("sleep"),
      narration: { audio: A("read-page-1"), script: "Here is page one of our bear book. Watch the words light up while I read. Listen for the word because!" },
      interaction: { type: "read-along", text: "Bears sleep all winter because it is cold.", audio: A("read-page-1-sentence") },
    },
    {
      id: "read-page-2",
      purpose: "guided",
      gate: "interaction",
      prompt: "Page 2. Read along!",
      image: IMG("splash"),
      narration: { audio: A("read-page-2"), script: "Here is page two. The author tells us another point, and another reason. Ears open for because!" },
      interaction: { type: "read-along", text: "Bears splash in the river because they want fish.", audio: A("read-page-2-sentence") },
    },
    {
      id: "read-page-3",
      purpose: "guided",
      gate: "interaction",
      prompt: "Page 3. One more page!",
      image: IMG("climb"),
      narration: { audio: A("read-page-3"), script: "One more page. Listen closely. What comes after because this time?" },
      interaction: { type: "read-along", text: "Bear cubs climb trees because they must stay safe.", audio: A("read-page-3-sentence") },
    },
    {
      id: "guided-why-sleep",
      purpose: "guided",
      gate: "interaction",
      prompt: "WHY do bears sleep all winter?",
      image: IMG("sleep"),
      narration: { audio: A("guided-why-sleep"), script: "Now you find a reason! Listen to page one again: Bears sleep all winter because it is cold. So, WHY do bears sleep all winter? Tap the picture that shows the reason." },
      interaction: { type: "choose", options: [{ id: "cold", label: "COLD", audio: W("cold"), image: IMG("cold") }, { id: "hot", label: "HOT", audio: W("hot"), image: IMG("hot") }, { id: "fish", label: "FISH", audio: W("fish"), image: IMG("fish") }], correctId: "cold", coachWrong: "Look back at page one. The reason comes right after the word because. Try again!" },
    },
    {
      id: "guided-why-splash",
      purpose: "guided",
      gate: "interaction",
      prompt: "WHY do bears splash?",
      image: IMG("splash"),
      narration: { audio: A("guided-why-splash"), script: "Great reason finding! Listen to page two again: Bears splash in the river because they want fish. So, WHY do bears splash in the river? Tap the reason." },
      interaction: { type: "choose", options: [{ id: "fish", label: "FISH", audio: W("fish"), image: IMG("fish") }, { id: "cold", label: "COLD", audio: W("cold"), image: IMG("cold") }, { id: "safe", label: "SAFE", audio: W("safe"), image: IMG("safe") }], correctId: "fish", coachWrong: "That is not this reason. Think about page two. What did the bears want in the river? Try again!" },
    },
    {
      id: "apply-reason-vs-fact",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which one tells WHY?",
      image: IMG("climb"),
      narration: { audio: A("apply-reason-vs-fact"), script: "Here is the tricky part. The author says: bear cubs climb trees. One choice tells WHY cubs climb. The other choice is true about bears, but it does not tell why. Think back to page three. Tap the reason." },
      interaction: { type: "choose", options: [{ id: "safe", label: "SAFE", audio: W("safe"), image: IMG("safe") }, { id: "fur", label: "FUR", audio: W("fur"), image: IMG("fur") }], correctId: "safe", coachWrong: "That is a true fact about bears, but it does not tell WHY cubs climb trees. Find the choice that answers why. Try again!" },
    },
    {
      id: "apply-say-why",
      purpose: "apply",
      gate: "interaction",
      prompt: "Say the reason!",
      fx: {"text":"**Why** do bears sleep all winter?","effect":"spotlight"},
      narration: { audio: A("apply-say-why"), script: "You found reasons with your eyes. Now say one with your voice! The author says bears sleep all winter. Tell me WHY. Press the mic and say the reason out loud. You can start with because!" },
      interaction: { type: "speak", text: "cold food" },
    },
    {
      id: "challenge-match-reasons",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Match each reason to its point!",
      narration: { audio: A("challenge-match-reasons"), script: "Last challenge, reason finders! Think back to our whole bear book. Bears sleep. Bears splash. Bear cubs climb. Each one has its own reason. Drag each reason picture to the point it goes with!" },
      interaction: { type: "sort", buckets: ["Sleep","Splash","Climb"], items: [{ label: "COLD", bucket: "Sleep", audio: W("cold"), image: IMG("cold") }, { label: "FISH", bucket: "Splash", audio: W("fish"), image: IMG("fish") }, { label: "SAFE", bucket: "Climb", audio: W("safe"), image: IMG("safe") }], coachWrong: "Think about the word because. Each page gave one reason for one point. Which point does this reason go with? Try again!" },
    },
    {
      id: "celebrate-reasons",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You found the reasons!",
      fx: {"text":"**Because** tells us why!","effect":"fireworks"},
      narration: { audio: A("celebrate-reasons"), script: "You did it! You found the author's points, and you found the reasons for them. Remember, when you hear the word because, a reason is coming. Keep listening for reasons in every fact book you read!" },
    },
  ],
};
