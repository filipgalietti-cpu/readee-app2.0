#!/usr/bin/env node
/** RI.1.7 — Pictures Show Key Ideas */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RI.1.7",
  grade: "1st Grade",
  domain: "Informational",
  title: "Pictures Show Key Ideas",
  slides: [
    {
      type: "intro",
      heading: "Pictures Teach Us",
      imagePrompt: `A cheerful cartoon child looking at an open fact book, with big colorful illustrations leaping off the page with tiny sparkles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "In fact books, pictures are not just decoration.", displayText: "Not just decoration", displayDelay: 2200 },
        { sub: "b", tts: "They give us important information.", displayText: "Important info", displayDelay: 2000 },
        { sub: "c", tts: "Let us learn how to read a picture!", displayText: "Read pictures too", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "What Season?",
      imagePrompt: `A cheerful cartoon scene with bare tree branches, soft falling snow, and a little cartoon child in a bright puffy coat, mittens, and a cozy hat. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "A book about seasons shows this picture.", displayText: "Look at the picture", displayDelay: 2000 },
        { sub: "b", tts: "Bare trees. Snow on the ground. A kid in a coat and hat.", displayText: "Snow + coat + hat", displayDelay: 2800 },
        { sub: "c", tts: "What season is it? Winter!", displayText: "Winter!", displayDelay: 2000 },
        { sub: "d", tts: "The picture told us, even without any words.", displayText: "Picture told us", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "Healthy Food Picture",
      imagePrompt: `A cheerful cartoon plate divided into colorful sections showing fruits, vegetables, and grains arranged neatly, with a tiny smiley face. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "A book about healthy food shows a plate.", displayText: "A healthy plate", displayDelay: 2200 },
        { sub: "b", tts: "It has fruits, vegetables, and grains.", displayText: "Fruits + veggies + grains", displayDelay: 2500 },
        { sub: "c", tts: "The picture shows us what a balanced meal looks like.", displayText: "Balanced meal", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Slow Down and Look",
      imagePrompt: `A cheerful cartoon child with a magnifying glass peering at a colorful picture in a book, eyes wide with discovery. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A picture trick", displayDelay: 1500 },
        { sub: "b", tts: "Slow down on the pictures. Ask, what is this showing me?", displayText: "Ask: what is this?", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to use pictures to learn key ideas!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RI.1.7-Q1", "RI.1.7-Q2", "RI.1.7-Q3", "RI.1.7-Q4", "RI.1.7-Q5"],
});
