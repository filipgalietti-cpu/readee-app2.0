import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./story-parts-timings.json";

// Story Parts (RL.1.3) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=story-parts

const A = (id: string) => `/audio/lessons-v2/story-parts/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/story-parts/${w.toLowerCase()}.png`;

export const storyPartsImages: Record<string, string | { subject: string; ref?: string }> = {
  "meg-and-jax": "A smiling cartoon girl with dark hair in a yellow shirt holding a red kite on a string, standing beside a cartoon boy with curly black hair in a green shirt, on green grass in a sunny park with a hill, no text anywhere",
  "kite-in-tree": "A red kite with a long tail stuck high in the leafy branches of one tall green tree in a park, string dangling down, nobody around, no text anywhere",
  "jax-with-stick": { subject: "the same cartoon boy with curly black hair in a green shirt reaching a long wooden stick up toward a red kite stuck in a tall green tree, seen from the side in a park", ref: "meg-and-jax" }
};

export const storyParts: LessonDef = {
  id: "story-parts",
  title: "Story Parts",
  grade: "1st Grade",
  standard: "RL.1.3",
  archetype: "story-elements",
  objective: "I can describe a story's characters, setting, and major events using key details.",
  concepts: ["characters","character traits","setting","major events","key details"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "What a reader you are! You did more than find the story parts. You described them. You told what Meg and Jax are like from what they did. You told where and when the story happened. And you put the big events in order. Describe the parts of every story you read!",
    "title": "You Know Your Story Parts!",
    "body": "You described the characters, the setting, and the major events with key details."
  },
  scenes: [
    {
      id: "hook-meet-meg-and-jax",
      purpose: "hook",
      gate: "none",
      prompt: "Meet Meg and Jax.",
      image: IMG("meg-and-jax"),
      narration: { audio: A("hook-meet-meg-and-jax"), script: "Hello, reader! This is Meg, and this is her friend Jax. Every story has parts. Characters are who the story is about. The setting is where and when it happens. Major events are the big things that happen. Today you will read Meg and Jax's story and describe every part." },
    },
    {
      id: "hook-read-page-one",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read page one with me.",
      narration: { audio: A("hook-read-page-one"), script: "Here is page one of our story. Read along with me." },
      interaction: { type: "read-along", text: "One windy day, Meg and Jax went to the park. Meg ran fast up the hill with her new kite.", audio: A("hook-read-page-one-sentence") },
    },
    {
      id: "guided-choose-characters",
      purpose: "guided",
      gate: "interaction",
      prompt: "Who is this story about?",
      narration: { audio: A("guided-choose-characters"), script: "Characters are the people or animals a story is about. Who is this story about? Read each choice, then tap the answer." },
      interaction: { type: "choose", options: [{ id: "meg-and-jax", label: "Meg and Jax" }, { id: "meg-and-the-kite", label: "Meg and the kite" }, { id: "the-tree-and-the-kite", label: "the tree and the kite" }], correctId: "meg-and-jax", coachWrong: "A character must be a person or an animal. A kite and a tree are things, not characters." },
    },
    {
      id: "model-traits-from-actions",
      purpose: "model",
      gate: "none",
      prompt: "What a character does shows what they are like.",
      fx: {"text":"What a character **does** shows what they are **like**.","effect":"glow"},
      narration: { audio: A("model-traits-from-actions"), script: "Here is the first grade secret. Good readers do not just name the characters. They describe them. Watch me. Page one says Meg ran fast up the hill with her new kite. She did not walk. She ran. Those words show me Meg was excited. The story never said the word excited. Meg's actions showed me. What a character does shows what they are like." },
    },
    {
      id: "guided-choose-setting",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which choice tells the whole setting?",
      narration: { audio: A("guided-choose-setting"), script: "The setting tells where AND when a story happens. Some of these choices tell only part of the setting. Read each one, then tap the choice that tells the whole setting." },
      interaction: { type: "choose", options: [{ id: "park-windy-day", label: "the park on a windy day" }, { id: "just-park", label: "the park" }, { id: "just-windy", label: "a windy day" }], correctId: "park-windy-day", coachWrong: "That is only part of the setting. The whole setting tells where AND when." },
    },
    {
      id: "apply-speak-page-two",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page two aloud: The wind took the kite into a tall tree.",
      image: IMG("kite-in-tree"),
      narration: { audio: A("apply-speak-page-two"), script: "Oh no, look at page two! It is short, and it is all yours. Tap the mic and read page two out loud." },
      interaction: { type: "speak", text: "The wind took the kite into a tall tree" },
    },
    {
      id: "apply-read-page-three",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page three with me.",
      narration: { audio: A("apply-read-page-three"), script: "What will Meg and Jax do now? Page three tells us. Read it with me, and watch what each character does." },
      interaction: { type: "read-along", text: "Meg sat down and cried. But Jax did not give up. He found a long stick and set the kite free. Meg jumped up and gave him a big hug.", audio: A("apply-read-page-three-sentence") },
    },
    {
      id: "guided-trait-jax",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which word tells about Jax?",
      narration: { audio: A("guided-trait-jax"), script: "Time to describe a character. Think about what Jax did. The story says Jax did not give up. He found a long stick and set the kite free. Which word tells about Jax? Tap it." },
      interaction: { type: "choose", options: [{ id: "helpful", label: "helpful" }, { id: "sad", label: "sad" }, { id: "mean", label: "mean" }, { id: "slow", label: "slow" }], correctId: "helpful", coachWrong: "Think about what Jax did for Meg. He worked to get her kite back. Which word fits someone who does that?" },
    },
    {
      id: "apply-sort-story-parts",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the story parts.",
      narration: { audio: A("apply-sort-story-parts"), script: "Now sort the parts of our story. Is it a character, part of the setting, or a big event? Read each one and drag it to its bucket." },
      interaction: { type: "sort", buckets: ["Character","Setting","Event"], items: [{ label: "Meg", bucket: "Character" }, { label: "the park", bucket: "Setting" }, { label: "the kite got stuck", bucket: "Event" }, { label: "Jax", bucket: "Character" }, { label: "one windy day", bucket: "Setting" }, { label: "the big hug", bucket: "Event" }], coachWrong: "Ask yourself. Is it a who, is it a where or a when, or is it a big thing that happened?" },
    },
    {
      id: "apply-sequence-events",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put the major events in order.",
      narration: { audio: A("apply-sequence-events"), script: "Major events are the big things that happen, and they happen in order. Think about the story from start to end. Drag the events in order. What happened first, next, and last?" },
      interaction: { type: "sequence", items: [{ id: "jax-freed-kite", label: "Jax set the kite free" }, { id: "kite-got-stuck", label: "The kite got stuck" }, { id: "meg-hugged-jax", label: "Meg gave Jax a big hug" }], order: ["kite-got-stuck","jax-freed-kite","meg-hugged-jax"], coachWrong: "Say the story to yourself from the start. What went wrong first, who fixed it, and what happened at the very end?" },
    },
    {
      id: "challenge-trait-meg",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which word tells about Meg when the kite got stuck?",
      narration: { audio: A("challenge-trait-meg"), script: "Challenge time! Characters can be different from each other. When the kite flew into the tree, Meg sat down and cried. Which word tells about Meg at that moment? Tap it." },
      interaction: { type: "choose", options: [{ id: "upset", label: "upset" }, { id: "brave", label: "brave" }, { id: "sleepy", label: "sleepy" }, { id: "hungry", label: "hungry" }], correctId: "upset", coachWrong: "Look at what Meg did at that moment. She sat down and cried. Which word fits how she felt?" },
    },
    {
      id: "challenge-speak-describe",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Describe Jax out loud. What is he like?",
      image: IMG("jax-with-stick"),
      narration: { audio: A("challenge-speak-describe"), script: "Now describe a character like a real reader. Think about what Jax did in the story. Tap the mic and say a word that tells what Jax is like." },
      interaction: { type: "speak", text: "helpful kind brave nice good" },
    },
    {
      id: "celebrate-story-parts",
      purpose: "celebrate",
      gate: "none",
      prompt: "You described every story part!",
      fx: {"text":"**Who**, **where and when**, and the **big events**!","effect":"fireworks"},
      narration: { audio: A("celebrate-story-parts"), script: "You did it! You described the characters and what they are like. You told the whole setting, where and when. And you put the major events in order. You know your story parts!" },
    },
  ],
};
