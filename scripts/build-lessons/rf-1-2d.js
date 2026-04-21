#!/usr/bin/env node
/** RF.1.2d — Breaking Words Into Sounds (segmentation) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RF.1.2d",
  grade: "1st Grade",
  domain: "Foundational Skills",
  title: "Breaking Words Into Sounds",
  slides: [
    {
      type: "intro",
      heading: "Break It Apart",
      imagePrompt: `A cheerful cartoon child gently pulling apart a puzzle word shape into three colorful pieces, smiling. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Look! Words are built from smaller sounds.", displayText: "Words are built from sounds", displayDelay: 2000 },
        { sub: "b", tts: "When we take a word apart sound by sound, we call that breaking.", displayText: "Breaking a word", displayDelay: 2500 },
        { sub: "c", tts: "Let us break some words together!", displayText: "Let us break some!", displayDelay: 1500 },
      ],
    },
    {
      type: "teach",
      heading: "Break the Word CAT",
      imagePrompt: `A friendly cartoon orange tabby cat lifting its paw in a little wave, with three colorful sound bubbles floating above its head. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is the word cat.", displayText: "Cat", displayDelay: 1500, displayDiagram: { letters: [{ text: "C" }, { text: "A" }, { text: "T" }], delay: 1800, revealCount: 3 } },
        { sub: "b", tts: "Break it into three sounds.", displayDiagram: { letters: [{ text: "C" }, { text: "A" }, { text: "T" }], delay: 0, revealCount: 3 } },
        { sub: "c", tts: "The first.", afterPhonemes: ["c_hard"], displayDiagram: { letters: [{ text: "C" }, { text: "A" }, { text: "T" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [0] },
        { sub: "d", tts: "The middle.", afterPhonemes: ["short_a"], displayDiagram: { letters: [{ text: "C" }, { text: "A" }, { text: "T" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [1] },
        { sub: "e", tts: "And the last. Three sounds!", afterPhonemes: ["t"], displayDiagram: { letters: [{ text: "C" }, { text: "A" }, { text: "T" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [2] },
      ],
    },
    {
      type: "example",
      heading: "Count the Sounds",
      imagePrompt: `A cheerful cartoon smiling fish with big friendly eyes swimming next to three colorful counting bubbles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "How about the word fish?", displayText: "Fish", displayDelay: 1500, displayDiagram: { letters: [{ text: "F" }, { text: "I" }, { text: "SH" }], delay: 1800, revealCount: 3 } },
        { sub: "b", tts: "Let us break it.", displayDiagram: { letters: [{ text: "F" }, { text: "I" }, { text: "SH" }], delay: 0, revealCount: 3 } },
        { sub: "c", tts: "First.", afterPhonemes: ["f"], displayDiagram: { letters: [{ text: "F" }, { text: "I" }, { text: "SH" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [0] },
        { sub: "d", tts: "Middle.", afterPhonemes: ["short_i"], displayDiagram: { letters: [{ text: "F" }, { text: "I" }, { text: "SH" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [1] },
        { sub: "e", tts: "Last. Fish has three sounds, even though it has four letters!", afterPhonemes: ["sh"], displayDiagram: { letters: [{ text: "F" }, { text: "I" }, { text: "SH" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [2] },
      ],
    },
    {
      type: "tip",
      heading: "A Breaking Trick",
      imagePrompt: `A cheerful cartoon child carefully counting on three colorful fingers, smiling with eyes closed in concentration. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A breaking trick", displayDelay: 1500 },
        { sub: "b", tts: "Say the word slowly. Tap one finger for each sound you hear.", displayText: "Tap for each sound", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to break words into sounds!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RF.1.2d-Q1", "RF.1.2d-Q2", "RF.1.2d-Q3", "RF.1.2d-Q4", "RF.1.2d-Q5"],
});
