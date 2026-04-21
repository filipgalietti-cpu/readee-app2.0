#!/usr/bin/env node
/** L.1.4c — Root Word Magic (inflectional forms) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "L.1.4c",
  grade: "1st Grade",
  domain: "Language",
  title: "Root Word Magic",
  slides: [
    {
      type: "intro",
      heading: "The Root Word",
      imagePrompt: `A cheerful cartoon tree with colorful roots visible below the ground, each root glowing softly with little friendly letters around it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "A root word is the main part of a word.", displayText: "The main part", displayDelay: 2000 },
        { sub: "b", tts: "Other parts can stick on to it.", displayText: "Parts stick on", displayDelay: 2000 },
        { sub: "c", tts: "But the root stays the same.", displayText: "Root stays", displayDelay: 1800 },
      ],
    },
    {
      type: "teach",
      heading: "Jumping and Jumped",
      imagePrompt: `A cheerful cartoon bunny with big floppy ears jumping over a tiny tree stump, with motion arrows showing the jump. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Look at these words.", displayText: "Jumping, Jumped, Jumps", displayDelay: 2200 },
        { sub: "b", tts: "What is the same in all three?", displayText: "What is the same?", displayDelay: 2000 },
        { sub: "c", tts: "Jump! That is the root word.", displayText: "Root: jump", displayDelay: 2200 },
        { sub: "d", tts: "I N G, E D, and S are the extra parts.", displayText: "-ing, -ed, -s", displayDelay: 2500 },
      ],
    },
    {
      type: "example",
      heading: "Play Play Play",
      imagePrompt: `A cheerful cartoon child bouncing a bright red ball in the sunshine, smiling widely, soft grass below. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Playing. Played. Plays.", displayText: "Playing, Played, Plays", displayDelay: 2200 },
        { sub: "b", tts: "What is the root word? Play!", displayText: "Root: play", displayDelay: 2200 },
        { sub: "c", tts: "The endings change, but play stays!", displayText: "Play stays", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Find the Root",
      imagePrompt: `A cheerful cartoon magnifying glass character zooming in on a shiny root word at the center of a word tree. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A root trick", displayDelay: 1500 },
        { sub: "b", tts: "Cover up the ending. What is left? That is the root!", displayText: "Cover the end", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to find root words!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["L.1.4c-Q1", "L.1.4c-Q2", "L.1.4c-Q3", "L.1.4c-Q4", "L.1.4c-Q5"],
});
