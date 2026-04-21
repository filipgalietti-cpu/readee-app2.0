#!/usr/bin/env node
/** RI.1.1 — Asking Fact Questions */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RI.1.1",
  grade: "1st Grade",
  domain: "Informational",
  title: "Asking Fact Questions",
  slides: [
    {
      type: "intro",
      heading: "Fact Finders",
      imagePrompt: `A cheerful cartoon child in a small explorer hat holding a clipboard, looking curiously at a friendly cartoon penguin waddling on snow. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Fact books are full of real information.", displayText: "Real information", displayDelay: 2000 },
        { sub: "b", tts: "Great readers ask questions and find the answers in the words.", displayText: "Ask and find", displayDelay: 2500 },
        { sub: "c", tts: "Let us learn to be fact finders!", displayText: "Fact finders!", displayDelay: 1500 },
      ],
    },
    {
      type: "teach",
      heading: "Five Big Questions",
      imagePrompt: `Five cheerful cartoon question mark characters in a friendly row, each a different bright color, with little smiling faces. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Fact finders ask five big questions.", displayText: "Five big questions", displayDelay: 2000 },
        { sub: "b", tts: "Who is it about?", displayText: "Who?", displayDelay: 1500 },
        { sub: "c", tts: "What is happening?", displayText: "What?", displayDelay: 1500 },
        { sub: "d", tts: "Where? And when?", displayText: "Where? When?", displayDelay: 1800 },
        { sub: "e", tts: "And why does it happen?", displayText: "Why?", displayDelay: 1500 },
      ],
    },
    {
      type: "example",
      heading: "Penguins Live Where?",
      imagePrompt: `A cheerful cartoon penguin with bright orange feet sliding happily on soft snowy ice, bright blue sky and a tiny iceberg behind. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen to this fact.", displayText: "Listen...", displayDelay: 1500 },
        { sub: "b", tts: "Penguins live in very cold places. They cannot fly, but they are great swimmers.", displayText: "Penguins live in cold places", displayDelay: 3500 },
        { sub: "c", tts: "Where do penguins live? Very cold places!", displayText: "Cold places", displayDelay: 2200 },
        { sub: "d", tts: "Can penguins fly? No. But they swim great!", displayText: "They swim!", displayDelay: 2200 },
      ],
    },
    {
      type: "tip",
      heading: "Look Back for the Answer",
      imagePrompt: `A friendly cartoon magnifying glass character with a big smile sweeping over an open fact book with diagrams. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A fact finder trick", displayDelay: 1500 },
        { sub: "b", tts: "If you are not sure, look back at the words. The answer is hiding there.", displayText: "Look back at the words", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to answer fact questions!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RI.1.1-Q1", "RI.1.1-Q2", "RI.1.1-Q3", "RI.1.1-Q4", "RI.1.1-Q5"],
});
