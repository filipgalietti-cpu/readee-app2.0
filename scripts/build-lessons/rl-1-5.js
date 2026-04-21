#!/usr/bin/env node
/** RL.1.5 — Story Books vs Fact Books (only 3 qs exist) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RL.1.5",
  grade: "1st Grade",
  domain: "Literature",
  title: "Story Books vs Fact Books",
  slides: [
    {
      type: "intro",
      heading: "Two Kinds of Books",
      imagePrompt: `Two cheerful cartoon open books sitting side by side on a wooden shelf, one sparkling with a tiny dragon and a castle, the other showing a friendly diagram of the planets. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Did you know there are two big kinds of books?", displayText: "Two kinds of books", displayDelay: 2000 },
        { sub: "b", tts: "Story books tell made-up stories.", displayText: "Story = made up", displayDelay: 2000 },
        { sub: "c", tts: "Fact books give us real information.", displayText: "Fact = real", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "Story Books",
      imagePrompt: `A cheerful whimsical cartoon storybook open in a field of flowers, a tiny dragon peeking out of one page, a unicorn on the other, sparkles floating around. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Story books are full of adventures.", displayText: "Adventures!", displayDelay: 1800 },
        { sub: "b", tts: "They have characters, a setting, and events that someone imagined.", displayText: "Characters + events", displayDelay: 2800 },
        { sub: "c", tts: "Dragons, talking animals, magic. Anything goes in a story book!", displayText: "Anything goes", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "Fact Books",
      imagePrompt: `A cheerful cartoon nonfiction fact book open on a table, with friendly diagrams of planets, animals, and a tiny dinosaur illustration, a small magnifying glass on the page. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Fact books teach us about the real world.", displayText: "Real world facts", displayDelay: 2200 },
        { sub: "b", tts: "Animals, planets, weather, history. All true things!", displayText: "All true", displayDelay: 2200 },
        { sub: "c", tts: "Fact books often have photos, diagrams, and labels.", displayText: "Pictures + labels", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Which One?",
      imagePrompt: `A cheerful cartoon child holding one book in each hand, one labeled with a tiny dragon icon and the other with a tiny globe icon, smiling and looking back and forth. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A book trick", displayDelay: 1500 },
        { sub: "b", tts: "Could this really happen in real life? Fact book. Made up? Story book!", displayText: "Real? Or made up?", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to practice telling them apart!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RL.1.5-Q1", "RL.1.5-Q2", "RL.1.5-Q3"],
});
