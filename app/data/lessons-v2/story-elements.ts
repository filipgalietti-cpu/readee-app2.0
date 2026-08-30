import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./story-elements-timings.json";

// Story Elements — RL.K.3 ("identify characters, settings, and major events").
// EXEMPLAR B: proves the engine scales. This file is PURE DATA — the entire
// lesson is composed from registry interactions (listen/choose/highlight/
// sequence/sort/speak). New engine code required for this lesson: the two
// budgeted registry entries (highlight, sequence). Nothing else.
// Assets: scripts/lesson-tts.ts / lesson-timings.py / lesson-images.ts --lesson=story-elements

const A = (id: string) => `/audio/lessons-v2/story-elements/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/story-elements/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/story-elements/${w.toLowerCase()}.png`;

/** Image manifest, consumed by scripts/lesson-images.ts (word → subject). */
export const storyElementsImages: Record<string, string | { subject: string; ref?: string }> = {
  max: "a happy brown puppy with floppy ears",
  pip: "a small cheerful yellow bird",
  yard: "a sunny green backyard with a wooden fence",
  tree: "a big leafy oak tree",
  ball: "a red bouncy ball",
  moon: "a crescent moon in a starry night sky",
  cave: "a dark rocky cave entrance",
  lost: { subject: "the same brown puppy looking sad, searching for something missing", ref: "max" },
  looked: { subject: "the same brown puppy and a small yellow bird searching around a backyard", ref: "max" },
  found: { subject: "the same brown puppy happily holding a red ball under a big tree", ref: "max" },
};

export const storyElements: LessonDef = {
  id: "story-elements",
  title: "Characters, Settings, and Events",
  grade: "Kindergarten",
  standard: "RL.K.3",
  archetype: "story-elements",
  objective: "Characters are WHO a story is about. The setting is WHERE it happens. Events happen in order.",
  concepts: ["characters", "setting", "events"],
  timings: timings as LessonDef["timings"],
  completion: {
    script:
      "Great work today! You found the characters, Max and Pip. You found the setting, the yard and the big tree. And you put the whole story in order. You are a real storyteller!",
    title: "You know your story!",
    body: "Characters like MAX and PIP, places like the YARD, and events in order. You are a real storyteller!",
  },
  scenes: [
    // ── STORY — meet the story (presentation + meaning) ──
    {
      id: "story",
      purpose: "hook",
      gate: "none",
      prompt: "Story time! Tap each picture to hear its word.",
      narration: {
        audio: A("story"),
        script:
          "Story time! Max the dog lost his red ball. His friend Pip the bird helped him look. They looked all around the yard. And they found the ball under the big tree! Tap each picture to hear its word.",
      },
      interaction: {
        type: "listen",
        items: [
          { label: "MAX", audio: W("MAX"), image: IMG("max") },
          { label: "PIP", audio: W("PIP"), image: IMG("pip") },
          { label: "YARD", audio: W("YARD"), image: IMG("yard") },
          { label: "TREE", audio: W("TREE"), image: IMG("tree") },
        ],
      },
    },

    // ── READ THE STORY — karaoke (words light up as read) ──
    {
      id: "read-story",
      purpose: "hook",
      gate: "interaction",
      prompt: "Follow along as I read the story!",
      image: IMG("found"),
      narration: {
        audio: A("read-story"),
        script: "Now let's read our story together. Watch each word light up as I read.",
      },
      interaction: {
        type: "read-along",
        text: "Max lost his red ball. Pip helped him look. They found it under the big tree!",
        audio: A("read-story-sentence"),
      },
    },

    // ── WHO — characters ──
    {
      id: "who",
      purpose: "guided",
      gate: "interaction",
      prompt: "A character is WHO the story is about. Who is this story about?",
      narration: {
        audio: A("who"),
        script:
          "Every story has characters. A character is WHO the story is about. Who is this story about? Tap the answer.",
      },
      interaction: {
        type: "choose",
        options: [
          { id: "max", label: "MAX", image: IMG("max"), audio: W("MAX") },
          { id: "ball", label: "BALL", image: IMG("ball"), audio: W("BALL") },
          { id: "tree", label: "TREE", image: IMG("tree"), audio: W("TREE") },
        ],
        correctId: "max",
        coachWrong: "That's a thing, not a character. Who is the story about?",
      },
    },

    // ── WHERE — setting ──
    {
      id: "where",
      purpose: "guided",
      gate: "interaction",
      prompt: "The setting is WHERE a story happens. Where did they look?",
      narration: {
        audio: A("where"),
        script:
          "The setting is WHERE a story happens. Where did Max and Pip look for the ball? Tap the answer.",
      },
      interaction: {
        type: "choose",
        options: [
          { id: "yard", label: "YARD", image: IMG("yard"), audio: W("YARD") },
          { id: "moon", label: "MOON", image: IMG("moon"), audio: W("MOON") },
          { id: "cave", label: "CAVE", image: IMG("cave"), audio: W("CAVE") },
        ],
        correctId: "yard",
        coachWrong: "Think back to the story. Where did they look?",
      },
    },

    // ── EVIDENCE — highlight it in the text ──
    {
      id: "evidence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Tap the word that tells WHERE they found the ball!",
      narration: {
        audio: A("evidence"),
        script: "Look at the sentence. Tap the word that tells where they found the ball.",
      },
      interaction: {
        type: "highlight",
        text: "They found the ball under the big tree.",
        targets: ["tree"],
        coachWrong: "That word doesn't tell WHERE. Try again!",
      },
    },

    // ── ORDER — events happen in order ──
    {
      id: "order",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "What happened first, next, and last? Tap the pictures in order.",
      narration: {
        audio: A("order"),
        script: "Stories happen in order. What happened first, next, and last? Tap the pictures in order.",
      },
      interaction: {
        type: "sequence",
        items: [
          { id: "lost", label: "LOST", image: IMG("lost"), audio: W("LOST") },
          { id: "looked", label: "LOOKED", image: IMG("looked"), audio: W("LOOKED") },
          { id: "found", label: "FOUND", image: IMG("found"), audio: W("FOUND") },
        ],
        order: ["lost", "looked", "found"],
        coachWrong: "Hmm, what happened before that?",
      },
    },

    // ── SORT — characters vs places ──
    {
      id: "sort",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Characters are WHO. Places are WHERE. Sort each one!",
      narration: {
        audio: A("sort"),
        script: "Characters are WHO. Places are WHERE. Sort each one into its box!",
      },
      interaction: {
        type: "sort",
        buckets: ["characters", "places"],
        items: [
          { label: "MAX", bucket: "characters", audio: W("MAX") },
          { label: "PIP", bucket: "characters", audio: W("PIP") },
          { label: "YARD", bucket: "places", audio: W("YARD") },
          { label: "TREE", bucket: "places", audio: W("TREE") },
        ],
        coachWrong: "Is that a WHO or a WHERE?",
      },
    },

    // ── RETELL — say it ──
    {
      id: "retell",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Now YOU tell the ending! Say it out loud.",
      narration: {
        audio: A("retell"),
        script: "Now you tell the story's ending. Tap the mic and say: Max found the ball.",
      },
      interaction: { type: "speak", text: "Max found the ball" },
    },

    // ── WRAP ──
    {
      id: "celebrate",
      fx: { text: "**Who**... **where**... and what **happened**!", effect: "pop-words" },
      purpose: "celebrate",
      gate: "none",
      prompt: "You did it!",
      narration: {
        audio: A("celebrate"),
        script:
          "You did it! Characters are who the story is about. The setting is where it happens. And events happen in order. Great reading!",
      },
    },
  ],
};
