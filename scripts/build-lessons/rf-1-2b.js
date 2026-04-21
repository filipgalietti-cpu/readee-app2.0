#!/usr/bin/env node
/** RF.1.2b — Blending Sounds Into Words */
const build = require("./_lib");

const IMG_STYLE = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RF.1.2b",
  grade: "1st Grade",
  domain: "Foundational Skills",
  title: "Blending Sounds Into Words",
  slides: [
    {
      type: "intro",
      heading: "Blending Sounds",
      imagePrompt: `A cheerful cartoon child with big round headphones smiling and listening carefully, with colorful musical-note-like sound symbols floating around their head. Clean pastel background. ${IMG_STYLE}`,
      steps: [
        { sub: "a", tts: "Listen! Words are made of sounds pushed together.", displayText: "Sounds become words!", displayDelay: 2000 },
        { sub: "b", tts: "When we put the sounds together, we call that blending.", displayText: "Blending", displayDelay: 2000 },
        { sub: "c", tts: "Let us try it. It is like a fun puzzle!", displayText: "A sound puzzle", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "Three Sounds Make a Word",
      imagePrompt: `A friendly cartoon orange tabby cat sitting up and smiling, with three tiny colorful sound bubbles floating above its head. Clean pastel background. ${IMG_STYLE}`,
      steps: [
        { sub: "a", tts: "Listen to these three sounds.", interaction: "Three dashes shown." },
        { sub: "b", tts: "First sound.", afterPhonemes: ["c_hard"], displayDiagram: { letters: [{ text: "C" }, { text: "A" }, { text: "T" }], delay: 1200, revealCount: 1 }, phonemeLetterIndices: [0] },
        { sub: "c", tts: "Middle sound.", afterPhonemes: ["short_a"], displayDiagram: { letters: [{ text: "C" }, { text: "A" }, { text: "T" }], delay: 0, revealCount: 2 }, phonemeLetterIndices: [1] },
        { sub: "d", tts: "Last sound.", afterPhonemes: ["t"], displayDiagram: { letters: [{ text: "C" }, { text: "A" }, { text: "T" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [2] },
        { sub: "e", tts: "Push them all together. Cat!", displayText: "Cat!", displayDelay: 1500, displayDiagram: { letters: [{ text: "C" }, { text: "A" }, { text: "T" }], delay: 0, revealCount: 3 } },
      ],
    },
    {
      type: "example",
      heading: "Blend This One!",
      imagePrompt: `A cheerful cartoon yellow sun with a smiling face and friendly rays, shining brightly. Clean pastel background. ${IMG_STYLE}`,
      steps: [
        { sub: "a", tts: "Your turn. Listen to three sounds.", interaction: "Heading." },
        { sub: "b", tts: "First sound.", afterPhonemes: ["s"], displayDiagram: { letters: [{ text: "S" }, { text: "U" }, { text: "N" }], delay: 1200, revealCount: 1 }, phonemeLetterIndices: [0] },
        { sub: "c", tts: "Middle sound.", afterPhonemes: ["short_u"], displayDiagram: { letters: [{ text: "S" }, { text: "U" }, { text: "N" }], delay: 0, revealCount: 2 }, phonemeLetterIndices: [1] },
        { sub: "d", tts: "Last sound.", afterPhonemes: ["n"], displayDiagram: { letters: [{ text: "S" }, { text: "U" }, { text: "N" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [2] },
        { sub: "e", tts: "Blend them. Sun! You got it!", displayText: "Sun!", displayDelay: 1500, displayDiagram: { letters: [{ text: "S" }, { text: "U" }, { text: "N" }], delay: 0, revealCount: 3 } },
      ],
    },
    {
      type: "tip",
      heading: "A Blending Trick",
      imagePrompt: `A cheerful cartoon child with glasses pointing at a row of three colorful puzzle pieces fitting together. Clean pastel background. ${IMG_STYLE}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick for blending.", displayText: "A blending trick", displayDelay: 1500 },
        { sub: "b", tts: "Say each sound out loud. Then say them faster and faster until they snap together.", displayText: "Slow, then fast!", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to practice blending sounds!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RF.1.2b-Q1", "RF.1.2b-Q2", "RF.1.2b-Q3", "RF.1.2b-Q4", "RF.1.2b-Q5"],
});
