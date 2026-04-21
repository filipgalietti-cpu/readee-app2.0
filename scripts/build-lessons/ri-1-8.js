#!/usr/bin/env node
/** RI.1.8 — Reasons the Author Gives */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RI.1.8",
  grade: "1st Grade",
  domain: "Informational",
  title: "Reasons the Author Gives",
  slides: [
    {
      type: "intro",
      heading: "Why Should I?",
      imagePrompt: `A cheerful cartoon child with a thought bubble containing a small smiling lightbulb, tilted head as if asking a question. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Authors sometimes try to convince us of something.", displayText: "Authors convince", displayDelay: 2200 },
        { sub: "b", tts: "They make a point, then give us reasons why.", displayText: "Point + reasons", displayDelay: 2200 },
        { sub: "c", tts: "Good readers spot the reasons!", displayText: "Spot the reasons", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "Drink Water",
      imagePrompt: `A cheerful cartoon glass of water with a smiling face, condensation drops around it, on a bright table. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen. You should drink water every day.", displayText: "Drink water daily", displayDelay: 2000 },
        { sub: "b", tts: "Water helps your body work well.", displayText: "Reason 1: body works well", displayDelay: 2500 },
        { sub: "c", tts: "And it keeps you from getting thirsty.", displayText: "Reason 2: no thirst", displayDelay: 2500 },
        { sub: "d", tts: "Two reasons! That is how authors back up their point.", displayText: "Two reasons found!", displayDelay: 2800 },
      ],
    },
    {
      type: "example",
      heading: "Great Pets",
      imagePrompt: `A cheerful cartoon golden retriever dog with a happy smile sitting next to a smiling child, both looking cheerful. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Dogs make great pets. Here is why.", displayText: "Dogs = great pets", displayDelay: 2000 },
        { sub: "b", tts: "They are loyal.", displayText: "Loyal", displayDelay: 1500 },
        { sub: "c", tts: "They are playful.", displayText: "Playful", displayDelay: 1500 },
        { sub: "d", tts: "And they love their owners.", displayText: "Loving", displayDelay: 1800 },
        { sub: "e", tts: "Three reasons that back up the point!", displayText: "Three reasons!", displayDelay: 2200 },
      ],
    },
    {
      type: "tip",
      heading: "Count the Reasons",
      imagePrompt: `A cheerful cartoon child counting on friendly fingers, smiling confidently, tiny stars floating around their hand. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A reasons trick", displayDelay: 1500 },
        { sub: "b", tts: "When the author says because, for example, or first and second, those are reasons!", displayText: "Listen for clue words", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to find author reasons!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RI.1.8-Q1", "RI.1.8-Q2", "RI.1.8-Q3", "RI.1.8-Q4", "RI.1.8-Q5"],
});
