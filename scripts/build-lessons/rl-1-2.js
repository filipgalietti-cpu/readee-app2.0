#!/usr/bin/env node
/** RL.1.2 — Retelling Stories (with central message) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RL.1.2",
  grade: "1st Grade",
  domain: "Literature",
  title: "Retelling Stories",
  slides: [
    {
      type: "intro",
      heading: "Retell the Story",
      imagePrompt: `A small group of cheerful cartoon kids of different skin tones sitting in a circle, one child telling a story with animated hands while the others listen with big smiles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Retelling means telling a story in your own words.", displayText: "Tell it your way", displayDelay: 2200 },
        { sub: "b", tts: "You keep the most important parts.", displayText: "Keep the big parts", displayDelay: 2000 },
        { sub: "c", tts: "And you leave out the tiny details.", displayText: "Skip the tiny bits", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "Beginning, Middle, End",
      imagePrompt: `Three cheerful cartoon open books in a row, the first labeled with a sunrise icon, the middle with a little star, the last with a sunset icon, all colorful. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Every story has three big parts.", displayText: "Three big parts", displayDelay: 2000 },
        { sub: "b", tts: "The beginning. Who is in the story and what is happening?", displayText: "Beginning: who and what", displayDelay: 2500 },
        { sub: "c", tts: "The middle. What is the problem or the big event?", displayText: "Middle: the problem", displayDelay: 2500 },
        { sub: "d", tts: "The end. How does it all work out?", displayText: "End: how it works out", displayDelay: 2500 },
      ],
    },
    {
      type: "example",
      heading: "Retell Tom's Story",
      imagePrompt: `A cheerful cartoon boy with curly brown hair crossing a finish line with arms raised, a gold medal around his neck, bright confetti around him. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen. Tom wanted to win the race. He practiced every day. On race day, he came in first!", displayText: "Tom ran, practiced, won", displayDelay: 3500 },
        { sub: "b", tts: "Beginning. Tom wanted to win a race.", displayText: "Beginning", displayDelay: 1800 },
        { sub: "c", tts: "Middle. He practiced every single day.", displayText: "Middle", displayDelay: 1800 },
        { sub: "d", tts: "End. He won! The lesson? Practice helps!", displayText: "End: Practice helps!", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "The Story Lesson",
      imagePrompt: `A friendly cartoon owl wearing a small graduation cap, sitting on a stack of colorful books and smiling warmly. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Many stories teach a lesson.", displayText: "Stories teach lessons", displayDelay: 2000 },
        { sub: "b", tts: "Ask yourself, what did the character learn? That is the lesson.", displayText: "What did they learn?", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to practice retelling stories!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RL.1.2-Q1", "RL.1.2-Q2", "RL.1.2-Q3", "RL.1.2-Q4", "RL.1.2-Q5"],
});
