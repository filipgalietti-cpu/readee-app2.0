#!/usr/bin/env node
/** L.1.6 — Using Big Words (picking the right word) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "L.1.6",
  grade: "1st Grade",
  domain: "Language",
  title: "Using Big Words",
  slides: [
    {
      type: "intro",
      heading: "Pick the Right Word",
      imagePrompt: `A cheerful cartoon child choosing between two colorful word bubbles floating above their head, both smiling faces on them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Great readers and writers pick the just-right word.", displayText: "Just the right word", displayDelay: 2500 },
        { sub: "b", tts: "The right word makes a sentence clear!", displayText: "Clear + strong", displayDelay: 2200 },
        { sub: "c", tts: "Let us practice.", displayText: "Let us practice", displayDelay: 1500 },
      ],
    },
    {
      type: "teach",
      heading: "Match the Meaning",
      imagePrompt: `A cheerful cartoon child placing a word card into a matching empty slot on a sentence card, smiling proudly. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "When you read a sentence with a blank, think about what fits.", displayText: "What fits the blank?", displayDelay: 2800 },
        { sub: "b", tts: "The kids were hungry. They ate a ___.", displayText: "They ate a ___", displayDelay: 2500 },
        { sub: "c", tts: "A snack? Yes! A song? No!", displayText: "Snack? Yes!", displayDelay: 2200 },
      ],
    },
    {
      type: "example",
      heading: "Use New Words You Know",
      imagePrompt: `A cheerful cartoon owl wearing glasses and a small scholar hat, holding a fancy glowing word with sparkles around it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Every day, you learn new words from books and talks.", displayText: "New words every day", displayDelay: 2500 },
        { sub: "b", tts: "Try using them! The more you use a word, the better you know it.", displayText: "Use = remember", displayDelay: 2800 },
        { sub: "c", tts: "Big words make your ideas shine!", displayText: "Words make ideas shine", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Think, Then Pick",
      imagePrompt: `A friendly cartoon brain character with a graduation cap, holding a magnifying glass up to a word choice. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A word-picking trick", displayDelay: 1500 },
        { sub: "b", tts: "Ask, does this word fit the meaning of my sentence?", displayText: "Fit the meaning?", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to use big words!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["L.1.6-Q1", "L.1.6-Q2", "L.1.6-Q3", "L.1.6-Q4", "L.1.6-Q5"],
});
