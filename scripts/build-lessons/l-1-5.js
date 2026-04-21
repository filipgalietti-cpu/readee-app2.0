#!/usr/bin/env node
/** L.1.5 — How Words Connect (word relationships + opposites) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "L.1.5",
  grade: "1st Grade",
  domain: "Language",
  title: "How Words Connect",
  slides: [
    {
      type: "intro",
      heading: "Words Have Friends",
      imagePrompt: `Two cheerful cartoon word-tile characters holding hands, one with a big smile and another with a curious face, a tiny heart floating between them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Words are not all alone. They connect to other words.", displayText: "Words connect", displayDelay: 2200 },
        { sub: "b", tts: "Some words are opposites. Others mean almost the same thing.", displayText: "Opposites + alike", displayDelay: 2500 },
        { sub: "c", tts: "Let us explore!", displayText: "Let us explore", displayDelay: 1500 },
      ],
    },
    {
      type: "teach",
      heading: "Opposites",
      imagePrompt: `A cheerful cartoon hot sun character on one side and a friendly cold snowflake character on the other, connected by a tiny line with a lightning bolt between them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Opposites are words that mean very different things.", displayText: "Opposites = different", displayDelay: 2500 },
        { sub: "b", tts: "Hot and cold. Big and small. Fast and slow.", displayText: "Hot / cold. Big / small.", displayDelay: 3000 },
        { sub: "c", tts: "What is the opposite of hot? Cold!", displayText: "Hot -> cold", displayDelay: 2200 },
      ],
    },
    {
      type: "teach",
      heading: "Same Family Words",
      imagePrompt: `Three cheerful cartoon happy faces of different styles standing in a row, all smiling brightly, tiny hearts floating nearby. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Some words mean almost the same thing.", displayText: "Almost the same", displayDelay: 2200 },
        { sub: "b", tts: "Happy. Glad. Cheerful. All feel about the same!", displayText: "Happy = glad = cheerful", displayDelay: 2800 },
        { sub: "c", tts: "We call those same family words!", displayText: "Same family words", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Match and Mix",
      imagePrompt: `A cheerful cartoon child holding two word-tile cards and smiling, with one tile glowing. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A word trick", displayDelay: 1500 },
        { sub: "b", tts: "Ask, is this word the opposite, or is it close in meaning?", displayText: "Opposite or alike?", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to connect words!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["L.1.5-Q1", "L.1.5-Q2", "L.1.5-Q3", "L.1.5-Q4", "L.1.5-Q5"],
});
