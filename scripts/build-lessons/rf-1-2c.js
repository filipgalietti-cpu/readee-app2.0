#!/usr/bin/env node
/** RF.1.2c — First, Middle, and Last Sounds */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RF.1.2c",
  grade: "1st Grade",
  domain: "Foundational Skills",
  title: "First, Middle, and Last Sounds",
  slides: [
    {
      type: "intro",
      heading: "Sounds Have a Place",
      imagePrompt: `A cheerful cartoon child wearing big round headphones, smiling and pointing to a row of three colorful glowing sound bubbles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen! Every word has sounds in a special order.", displayText: "Sounds in order", displayDelay: 2000 },
        { sub: "b", tts: "A first sound, a middle sound, and a last sound.", displayText: "First, middle, last", displayDelay: 2500 },
        { sub: "c", tts: "Let us find each one!", displayText: "Find the sounds", displayDelay: 1500 },
      ],
    },
    {
      type: "teach",
      heading: "Meet MAP",
      imagePrompt: `A friendly cartoon open treasure map on a wooden table, with a curly red path and a small gold star marking a spot. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is the word map.", displayText: "Map", displayDelay: 1500, displayDiagram: { letters: [{ text: "M" }, { text: "A" }, { text: "P" }], delay: 1800, revealCount: 3 } },
        { sub: "b", tts: "The first sound is at the beginning.", afterPhonemes: ["m"], displayDiagram: { letters: [{ text: "M" }, { text: "A" }, { text: "P" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [0] },
        { sub: "c", tts: "The middle sound is in the middle.", afterPhonemes: ["short_a"], displayDiagram: { letters: [{ text: "M" }, { text: "A" }, { text: "P" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [1] },
        { sub: "d", tts: "And the last sound is at the end.", afterPhonemes: ["p"], displayDiagram: { letters: [{ text: "M" }, { text: "A" }, { text: "P" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [2] },
      ],
    },
    {
      type: "example",
      heading: "Try This One",
      imagePrompt: `A cheerful cartoon orange sun with a smiling face and friendly rays. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Your turn. The word is sun.", displayText: "Sun", displayDelay: 1500, displayDiagram: { letters: [{ text: "S" }, { text: "U" }, { text: "N" }], delay: 1800, revealCount: 3 } },
        { sub: "b", tts: "First sound.", afterPhonemes: ["s"], displayDiagram: { letters: [{ text: "S" }, { text: "U" }, { text: "N" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [0] },
        { sub: "c", tts: "Middle sound.", afterPhonemes: ["short_u"], displayDiagram: { letters: [{ text: "S" }, { text: "U" }, { text: "N" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [1] },
        { sub: "d", tts: "Last sound.", afterPhonemes: ["n"], displayDiagram: { letters: [{ text: "S" }, { text: "U" }, { text: "N" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [2] },
      ],
    },
    {
      type: "tip",
      heading: "A Listening Trick",
      imagePrompt: `A friendly cartoon fox cupping its paw to its ear, eyes closed, listening carefully with small sound waves around it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A listening trick", displayDelay: 1500 },
        { sub: "b", tts: "Say the word slowly. Stretch each sound out.", displayText: "Stretch it out!", displayDelay: 2200 },
        { sub: "c", tts: "Now you are ready to find first, middle, and last sounds!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RF.1.2c-Q1", "RF.1.2c-Q2", "RF.1.2c-Q3", "RF.1.2c-Q4", "RF.1.2c-Q5"],
});
