#!/usr/bin/env node
/** RI.1.3 — Connecting Ideas in Facts (cause/effect, sequence) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RI.1.3",
  grade: "1st Grade",
  domain: "Informational",
  title: "Connecting Ideas in Facts",
  slides: [
    {
      type: "intro",
      heading: "Ideas Connect",
      imagePrompt: `Two cheerful cartoon puzzle pieces fitting together, each a different bright color, with tiny sparkles where they meet. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Facts in a book often connect to each other.", displayText: "Facts connect", displayDelay: 2000 },
        { sub: "b", tts: "One thing happens. Then another thing happens because of it.", displayText: "This... then that", displayDelay: 2500 },
        { sub: "c", tts: "Let us learn how to connect the dots!", displayText: "Connect the dots", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "Cause and Effect",
      imagePrompt: `A cheerful cartoon rain cloud pouring rain on a sunny patch of grass, with friendly puddles forming below. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen. It rained all day. The next morning, puddles were everywhere.", displayText: "Rain -> puddles", displayDelay: 3000 },
        { sub: "b", tts: "The rain caused the puddles. That is called cause and effect.", displayText: "Cause and effect", displayDelay: 2800 },
        { sub: "c", tts: "The cause is what happened first. The effect is what happened next.", displayText: "First, then next", displayDelay: 2800 },
      ],
    },
    {
      type: "example",
      heading: "Seeds and Sun",
      imagePrompt: `A cheerful cartoon farmer watering small green sprouts growing from brown soil, bright sunshine above and a tiny smiling sunflower. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Seeds need water and sunlight to grow.", displayText: "Seeds + water + sun", displayDelay: 2500 },
        { sub: "b", tts: "A farmer waters the seeds every day.", displayText: "Farmer waters", displayDelay: 2200 },
        { sub: "c", tts: "Soon, small plants appear!", displayText: "Plants grow!", displayDelay: 2000 },
        { sub: "d", tts: "What caused the plants? The water and sun! See the connection?", displayText: "Connection found!", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Ask Why",
      imagePrompt: `A friendly cartoon question mark character with a smiling face, surrounded by tiny arrows pointing between two colorful boxes. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A connection trick", displayDelay: 1500 },
        { sub: "b", tts: "Ask, why did this happen? The answer is usually the cause.", displayText: "Ask: why?", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to connect ideas in fact books!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RI.1.3-Q1", "RI.1.3-Q2", "RI.1.3-Q3", "RI.1.3-Q4", "RI.1.3-Q5"],
});
