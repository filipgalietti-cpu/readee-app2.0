#!/usr/bin/env node
/** RI.K.10 — Fact Books All Year (K range/complexity) */
const addMCQs = require("./_mcq");
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

addMCQs({
  standardId: "RI.K.10",
  grade: "Kindergarten",
  domain: "Informational",
  description: "Actively engage in group reading activities with informational texts with purpose and understanding",
  parentTip: "Pick fact books about what your child loves — animals, weather, trucks, food.",
  questions: [
    { type: "multiple_choice", prompt: "Fact books teach you about:", choices: ["real things", "made up monsters", "fairy tales", "dreams"], correct: "real things", hint: "Fact = true. Fact books are about real things!", difficulty: 1, imagePrompt: `A cheerful cartoon globe character with a friendly smile and tiny continents. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "You love bugs! Which fact book should you pick?", choices: ["one about insects", "a fairy tale", "a comic", "a coloring book"], correct: "one about insects", hint: "Pick a fact book on what you love!", difficulty: 1, imagePrompt: `A cheerful cartoon ladybug, butterfly, and bee on a green leaf, all smiling. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "What helps you find facts in a book?", choices: ["headings and pictures", "shaking the book", "closing your eyes", "humming"], correct: "headings and pictures", hint: "Headings and pictures point you to facts!", difficulty: 1, imagePrompt: `A cheerful cartoon open fact book with a colorful heading and a small diagram. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "When you read a fact book, what should you do?", choices: ["look closely at pictures", "skip every page", "rip the pages", "throw the book"], correct: "look closely at pictures", hint: "Pictures teach you facts too!", difficulty: 1, imagePrompt: `A cheerful cartoon child pointing at a colorful diagram in a fact book, smiling. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Reading fact books helps you:", choices: ["learn about the world", "make loud noises", "go faster", "get bigger"], correct: "learn about the world", hint: "Every fact book teaches you something new!", difficulty: 2, imagePrompt: `A cheerful cartoon child standing on a stack of fact books, smiling proudly with a tiny lightbulb above their head. Clean pastel background. ${IMG}` },
  ],
});

build({
  standardId: "RI.K.10",
  grade: "Kindergarten",
  domain: "Informational",
  title: "Fact Books All Year",
  slides: [
    {
      type: "intro",
      heading: "Facts Are Fun",
      imagePrompt: `A cheerful cartoon child sitting cross-legged with several open fact books around them, eyes wide with wonder. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Look! Fact books are full of real, true things.", displayText: "Real things!", displayDelay: 2200 },
        { sub: "b", tts: "They can be about anything. Bugs, planets, food, weather.", displayText: "Anything!", displayDelay: 2800 },
        { sub: "c", tts: "Let us learn how to enjoy fact books all year.", displayText: "All year!", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "Pick What You Love",
      imagePrompt: `A cheerful cartoon child thinking, with three tiny thought bubbles showing a dinosaur, a planet, and a soccer ball. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Pick fact books about things you love.", displayText: "What you love!", displayDelay: 2200 },
        { sub: "b", tts: "Love dinosaurs? Read about dinosaurs! Love space? Read about space!", displayText: "Love it = read it", displayDelay: 2800 },
        { sub: "c", tts: "When you love the topic, learning is fun.", displayText: "Love = fun", displayDelay: 2200 },
      ],
    },
    {
      type: "teach",
      heading: "Look and Listen",
      imagePrompt: `A cheerful cartoon child pointing at a labeled diagram of a flower in a fact book. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Fact books have pictures, labels, and big words at the top.", displayText: "Pictures + labels", displayDelay: 2500 },
        { sub: "b", tts: "Slow down and look at each one.", displayText: "Slow + look", displayDelay: 2200 },
        { sub: "c", tts: "Pictures teach you facts the words might not say.", displayText: "Pictures teach too", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "A New Topic Each Week",
      imagePrompt: `A cheerful cartoon calendar with a different colorful sticker on each week, a smiling child reading next to it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A fact book trick", displayDelay: 1500 },
        { sub: "b", tts: "Pick a new topic each week. You will discover something cool!", displayText: "New topic weekly", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to read fact books all year!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RI.K.10-Q1", "RI.K.10-Q2", "RI.K.10-Q3", "RI.K.10-Q4", "RI.K.10-Q5"],
});
