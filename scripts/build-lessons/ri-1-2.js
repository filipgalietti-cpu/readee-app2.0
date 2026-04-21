#!/usr/bin/env node
/** RI.1.2 — Main Topic and Key Details */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RI.1.2",
  grade: "1st Grade",
  domain: "Informational",
  title: "Main Topic and Key Details",
  slides: [
    {
      type: "intro",
      heading: "The Big Idea",
      imagePrompt: `A cheerful cartoon tree with colorful apples, with a tiny bright sparkle around the main trunk, and a few apples fallen on the grass. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Every fact book is mostly about one big idea.", displayText: "One big idea", displayDelay: 2000 },
        { sub: "b", tts: "That big idea is called the main topic.", displayText: "Main topic", displayDelay: 2000 },
        { sub: "c", tts: "The smaller facts we learn are called key details.", displayText: "Key details", displayDelay: 2200 },
      ],
    },
    {
      type: "teach",
      heading: "Topic vs Detail",
      imagePrompt: `A cheerful cartoon big apple character with a smiling face on a pedestal, with three smaller colorful apples below it on a shelf. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen to this.", displayText: "Listen...", displayDelay: 1500 },
        { sub: "b", tts: "Apples can be red, green, or yellow. They grow on trees. Apples are a healthy snack.", displayText: "Apples can be many colors", displayDelay: 3800 },
        { sub: "c", tts: "What is the main topic? Apples!", displayText: "Main topic: apples", displayDelay: 2200 },
        { sub: "d", tts: "Key details? Colors, where they grow, and healthy.", displayText: "Details: colors, trees, healthy", displayDelay: 3000 },
      ],
    },
    {
      type: "example",
      heading: "Try This One",
      imagePrompt: `A cheerful cartoon firefighter with a friendly smile wearing a bright red helmet and yellow uniform, standing next to a small red fire truck. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen.", displayText: "Listen...", displayDelay: 1500 },
        { sub: "b", tts: "Firefighters wear special gear. They drive fire trucks. They put out fires and help people.", displayText: "Firefighters at work", displayDelay: 4000 },
        { sub: "c", tts: "Main topic? Firefighters!", displayText: "Main topic: firefighters", displayDelay: 2500 },
        { sub: "d", tts: "Key details? Gear, fire trucks, and helping.", displayText: "Details: gear, trucks, help", displayDelay: 2800 },
      ],
    },
    {
      type: "tip",
      heading: "Ask: What Is It About?",
      imagePrompt: `A cheerful cartoon owl with round glasses pointing at a book, with a thought bubble containing a tiny question mark. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A main-topic trick", displayDelay: 1500 },
        { sub: "b", tts: "Ask yourself: what word shows up the most? That is usually the main topic!", displayText: "What word repeats?", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to find the main topic and key details!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RI.1.2-Q1", "RI.1.2-Q2", "RI.1.2-Q3", "RI.1.2-Q4", "RI.1.2-Q5"],
});
