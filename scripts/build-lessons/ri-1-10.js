#!/usr/bin/env node
/** RI.1.10 — Fact Books All Year (range and complexity of nonfiction) */
const addMCQs = require("./_mcq");
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

addMCQs({
  standardId: "RI.1.10",
  grade: "1st Grade",
  domain: "Informational",
  description: "With prompting and support, read informational texts of appropriate complexity for grade 1",
  parentTip: "Mix in fact books about the child's interests — animals, weather, sports.",
  questions: [
    { type: "multiple_choice", prompt: "Fact books teach you about:", choices: ["the real world", "dragons and magic", "your dreams", "made-up animals"], correct: "the real world", hint: "Fact = true! Fact books are about real things.", difficulty: 1, imagePrompt: `A cheerful cartoon globe character with a friendly smile and tiny continents visible. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "You love bugs! Which fact book should you pick?", choices: ["a book about insects", "a cookbook", "a storybook about pirates", "a song book"], correct: "a book about insects", hint: "Pick a fact book on what you love!", difficulty: 1, imagePrompt: `A cheerful cartoon ladybug, butterfly, and bee on a bright green leaf, all smiling. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "What is a good way to find facts in a book?", choices: ["look at headings and pictures", "close your eyes", "eat a snack", "skip every page"], correct: "look at headings and pictures", hint: "Headings tell you what each part is about!", difficulty: 1, imagePrompt: `A cheerful cartoon open fact book with a colorful heading at the top and a small diagram. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Why might a fact book have tricky words?", choices: ["it teaches new words", "to trick you", "to slow you down", "to make you quit"], correct: "it teaches new words", hint: "Tricky words usually name new things you are learning about!", difficulty: 2, imagePrompt: `A cheerful cartoon child holding an open fact book, with a tiny lightbulb above their head. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Reading lots of different fact books helps you:", choices: ["learn about the world", "run faster", "grow taller", "make loud noises"], correct: "learn about the world", hint: "Every fact book teaches you something new!", difficulty: 2, imagePrompt: `A cheerful cartoon child on top of a tall stack of colorful fact books, smiling proudly. Clean pastel background. ${IMG}` },
  ],
});

build({
  standardId: "RI.1.10",
  grade: "1st Grade",
  domain: "Informational",
  title: "Fact Books All Year",
  slides: [
    {
      type: "intro",
      heading: "Facts Are Fun",
      imagePrompt: `A cheerful cartoon child standing on a colorful rug surrounded by different fact books, each open with a tiny diagram, smiling excitedly. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Fact books are full of real things from our world.", displayText: "Real things", displayDelay: 2000 },
        { sub: "b", tts: "They can be about anything! Animals, space, weather, food.", displayText: "Anything real", displayDelay: 2800 },
        { sub: "c", tts: "Let us learn how to read fact books all year.", displayText: "All year!", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "Pick What You Love",
      imagePrompt: `A cheerful cartoon child thinking, with three tiny thought bubbles around them showing a bug, a planet, and a sports ball. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Pick fact books about things you love.", displayText: "What do you love?", displayDelay: 2200 },
        { sub: "b", tts: "Love bugs? Read about insects. Love space? Read about planets.", displayText: "Bugs? Space? Anything!", displayDelay: 2800 },
        { sub: "c", tts: "You will have so much more fun when it is your favorite topic.", displayText: "More fun that way", displayDelay: 2800 },
      ],
    },
    {
      type: "teach",
      heading: "Use the Parts",
      imagePrompt: `A cheerful cartoon open fact book with a colorful heading, a friendly diagram of a plant with tiny labels, and a smiling caption. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Fact books have helpers built in.", displayText: "Fact book helpers", displayDelay: 2200 },
        { sub: "b", tts: "Headings. Pictures. Labels. Use them to find facts fast.", displayText: "Headings + pics + labels", displayDelay: 3000 },
        { sub: "c", tts: "They are like a roadmap through the book!", displayText: "Like a roadmap", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "New Topic Every Week",
      imagePrompt: `A cheerful cartoon calendar with tiny themed stickers on each week, a kid reading next to it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A fact book trick", displayDelay: 1500 },
        { sub: "b", tts: "Try a new topic each week. You will discover something you did not know!", displayText: "New topic, new facts", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to explore fact books all year!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RI.1.10-Q1", "RI.1.10-Q2", "RI.1.10-Q3", "RI.1.10-Q4", "RI.1.10-Q5"],
});
