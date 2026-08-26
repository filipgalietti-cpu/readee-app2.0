import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./letter-pairs-timings.json";

// Letter Pairs (RF.K.1d): every big letter has a little letter partner.
// Letters are UI-native tiles (no images needed). Hand-authored: the B vs b
// case distinction is the whole lesson, so labels preserve case.

const A = (id: string) => `/audio/lessons-v2/letter-pairs/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/letter-pairs/words/${w.toLowerCase()}.mp3`;

export const letterPairsImages: Record<string, string> = {};

export const letterPairs: LessonDef = {
  id: "letter-pairs",
  title: "Letter Pairs",
  grade: "Kindergarten",
  standard: "RF.K.1d",
  archetype: "print-concepts",
  objective: "Every big letter has a little letter partner, and you can match them!",
  concepts: ["uppercase letters", "lowercase letters", "letter matching"],
  timings: timings as LessonDef["timings"],
  completion: {
    script:
      "Wonderful work! You matched the big letters with their little letter partners. Big B goes with little b, big M goes with little m, and big S goes with little s. You know your letter pairs!",
    title: "You know your letter pairs!",
    body: "Big letters and little letters go together, like B and b. You matched them all!",
  },
  scenes: [
    {
      id: "hook",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "Meet the BIG letters! Tap each one.",
      narration: {
        audio: A("hook"),
        script: "Letters come in two sizes! These are the big letters. Tap each one to hear its name.",
      },
      interaction: {
        type: "listen",
        items: [
          { label: "B", audio: W("b") },
          { label: "M", audio: W("m") },
          { label: "S", audio: W("s") },
        ],
      },
    },
    {
      id: "meet-little",
      purpose: "hook",
      layout: "full",
      gate: "none",
      prompt: "Now meet the little letters!",
      narration: {
        audio: A("meet-little"),
        script: "And these are the little letters. They say the same names! Tap each one and listen.",
      },
      interaction: {
        type: "listen",
        items: [
          { label: "b", audio: W("b") },
          { label: "m", audio: W("m") },
          { label: "s", audio: W("s") },
        ],
      },
    },
    {
      id: "teach-pairs",
      purpose: "model",
      gate: "none",
      prompt: "Big B and little b are partners!",
      fx: { text: "**B** and **b** are partners!", effect: "bounce" },
      narration: {
        audio: A("teach-pairs"),
        script:
          "Here is the secret. Every big letter has a little partner. Big B goes with little b. They are the same letter in two sizes!",
      },
    },
    {
      id: "guided-b",
      purpose: "guided",
      gate: "interaction",
      prompt: "Find big B's little partner!",
      narration: { audio: A("guided-b"), script: "Your turn! Which one is big B's little partner? Tap it!" },
      interaction: {
        type: "choose",
        options: [
          { id: "b", label: "b", audio: W("b") },
          { id: "m", label: "m", audio: W("m") },
          { id: "s", label: "s", audio: W("s") },
        ],
        correctId: "b",
        coachWrong: "Look for the little letter that matches big B. Try again!",
      },
    },
    {
      id: "guided-m",
      purpose: "guided",
      gate: "interaction",
      prompt: "Find big M's little partner!",
      narration: { audio: A("guided-m"), script: "Great matching! Now find big M's little partner. Tap it!" },
      interaction: {
        type: "choose",
        options: [
          { id: "s", label: "s", audio: W("s") },
          { id: "b", label: "b", audio: W("b") },
          { id: "m", label: "m", audio: W("m") },
        ],
        correctId: "m",
        coachWrong: "Which little letter looks like it goes with big M? Try again!",
      },
    },
    {
      id: "sort-sizes",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the letters: big or little?",
      narration: {
        audio: A("sort-sizes"),
        script: "Now sort all the letters! Tap each letter, then tap its home. Is it a big letter or a little letter?",
      },
      interaction: {
        type: "sort",
        buckets: ["big letters", "little letters"],
        items: [
          { label: "B", bucket: "big letters", audio: W("b") },
          { label: "m", bucket: "little letters", audio: W("m") },
          { label: "S", bucket: "big letters", audio: W("s") },
          { label: "b", bucket: "little letters", audio: W("b") },
          { label: "M", bucket: "big letters", audio: W("m") },
          { label: "s", bucket: "little letters", audio: W("s") },
        ],
        coachWrong: "Look at its size. Is it big or little? Try again!",
      },
    },
    {
      id: "challenge",
      purpose: "challenge",
      gate: "interaction",
      prompt: "All by yourself: find this letter's partner!",
      narration: {
        audio: A("challenge"),
        script: "Last one, all by yourself. Big S needs its little partner. Tap it!",
      },
      interaction: {
        type: "choose",
        options: [
          { id: "m", label: "m", audio: W("m") },
          { id: "s", label: "s", audio: W("s") },
          { id: "b", label: "b", audio: W("b") },
        ],
        correctId: "s",
        coachWrong: "Which little letter matches big S? You can do it!",
      },
    },
    {
      id: "celebrate",
      purpose: "celebrate",
      gate: "none",
      prompt: "You matched every letter pair!",
      fx: { text: "**Bb** **Mm** **Ss** are partners!", effect: "burst" },
      narration: {
        audio: A("celebrate"),
        script: "You did it! Big and little letters are partners, and you matched them all. Amazing work!",
      },
    },
  ],
};
