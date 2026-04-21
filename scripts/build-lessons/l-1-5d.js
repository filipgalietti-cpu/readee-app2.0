#!/usr/bin/env node
/** L.1.5d — Strong vs Mild Words (shades of meaning) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "L.1.5d",
  grade: "1st Grade",
  domain: "Language",
  title: "Strong vs Mild Words",
  slides: [
    {
      type: "intro",
      heading: "Shades of Words",
      imagePrompt: `A cheerful cartoon paint color card with three shades of blue side by side, from light to very deep, each with a little happy face. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Some words mean almost the same thing. But one is stronger!", displayText: "Stronger or milder", displayDelay: 2500 },
        { sub: "b", tts: "Like paint colors. Some are soft. Some are super bright.", displayText: "Like paint shades", displayDelay: 2500 },
        { sub: "c", tts: "Words have shades too!", displayText: "Words = shades", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "Big and Huge",
      imagePrompt: `A cheerful cartoon elephant standing next to a tiny cartoon whale, the whale labeled in a way that makes it feel much bigger, with tiny sparkles around the whale. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Big means something is large.", displayText: "Big = large", displayDelay: 2000 },
        { sub: "b", tts: "Huge means even bigger than big!", displayText: "Huge = EVEN BIGGER", displayDelay: 2500 },
        { sub: "c", tts: "An elephant is big. A whale is huge!", displayText: "Elephant big, whale huge", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "Happy and Thrilled",
      imagePrompt: `A cheerful cartoon child smiling softly on the left and the same child jumping in the air with arms wide and a huge grin on the right. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Happy means you feel good.", displayText: "Happy = feel good", displayDelay: 2000 },
        { sub: "b", tts: "Thrilled means super, super happy!", displayText: "Thrilled = so happy", displayDelay: 2500 },
        { sub: "c", tts: "A little smile, or a big jumping cheer. Different shades!", displayText: "Different shades", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Pick the Right Shade",
      imagePrompt: `A cheerful cartoon child with a paint palette full of colorful paint blobs, considering which color to pick. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A shade trick", displayDelay: 1500 },
        { sub: "b", tts: "Strong words paint a stronger picture. Pick the shade that fits!", displayText: "Pick the right shade", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to pick between strong and mild words!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["L.1.5d-Q1", "L.1.5d-Q2", "L.1.5d-Q3", "L.1.5d-Q4", "L.1.5d-Q5"],
});
