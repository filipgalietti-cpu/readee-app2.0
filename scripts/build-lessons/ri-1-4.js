#!/usr/bin/env node
/** RI.1.4 — Figuring Out New Words (context + questions) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RI.1.4",
  grade: "1st Grade",
  domain: "Informational",
  title: "Figuring Out New Words",
  slides: [
    {
      type: "intro",
      heading: "New Word? No Problem",
      imagePrompt: `A cheerful cartoon child shrugging with a tiny lightbulb turning on above their head, looking curiously at an open fact book. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Fact books sometimes have new words you do not know.", displayText: "New words? Okay!", displayDelay: 2200 },
        { sub: "b", tts: "That is totally fine. Good readers are curious.", displayText: "Be curious", displayDelay: 2000 },
        { sub: "c", tts: "Let us learn how to figure them out!", displayText: "Figure it out", displayDelay: 1800 },
      ],
    },
    {
      type: "teach",
      heading: "Look for Clues",
      imagePrompt: `A cheerful cartoon detective child with a magnifying glass pointing at a sentence on a page, a tiny question mark above their head. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "When you meet a new word, look at the words around it.", displayText: "Look around", displayDelay: 2200 },
        { sub: "b", tts: "The other words give you clues about what it means.", displayText: "Other words = clues", displayDelay: 2500 },
        { sub: "c", tts: "Sometimes the book will even tell you!", displayText: "Sometimes it tells you!", displayDelay: 2500 },
      ],
    },
    {
      type: "example",
      heading: "What Is a Habitat?",
      imagePrompt: `A cheerful cartoon blue fish swimming happily in clear water with friendly underwater plants and a tiny bubble trail. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen. The habitat is the place where an animal lives.", displayText: "Habitat = where it lives", displayDelay: 2800 },
        { sub: "b", tts: "A fish habitat is water.", displayText: "Fish -> water", displayDelay: 2200 },
        { sub: "c", tts: "What is a habitat? The place where an animal lives! The book told us right in the sentence.", displayText: "The book told us!", displayDelay: 3000 },
      ],
    },
    {
      type: "tip",
      heading: "Ask Questions",
      imagePrompt: `A cheerful cartoon owl wearing big round glasses, holding a tiny dictionary with a question mark floating nearby. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A word trick", displayDelay: 1500 },
        { sub: "b", tts: "If you still do not know the word, ask someone or check a dictionary!", displayText: "Ask or look it up", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to figure out new words!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RI.1.4-Q1", "RI.1.4-Q2", "RI.1.4-Q3", "RI.1.4-Q4", "RI.1.4-Q5"],
});
