#!/usr/bin/env node
/** RL.1.1 — Asking Story Questions */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RL.1.1",
  grade: "1st Grade",
  domain: "Literature",
  title: "Asking Story Questions",
  slides: [
    {
      type: "intro",
      heading: "Story Detectives",
      imagePrompt: `A cheerful cartoon child detective with a tiny deerstalker hat and a magnifying glass, sitting next to an open picture book, smiling curiously. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Great readers are like detectives. They look for clues in a story.", displayText: "Readers = detectives", displayDelay: 2200 },
        { sub: "b", tts: "They ask questions and hunt for answers in the words.", displayText: "Ask, then find", displayDelay: 2000 },
        { sub: "c", tts: "Let us learn some detective questions to ask!", displayText: "Let us ask!", displayDelay: 1500 },
      ],
    },
    {
      type: "teach",
      heading: "Five Big Questions",
      imagePrompt: `Five cheerful cartoon question mark characters in different colors standing in a friendly row, each with a happy face. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Good detectives ask five big questions.", displayText: "Five big questions", displayDelay: 2000 },
        { sub: "b", tts: "Who is the story about?", displayText: "Who?", displayDelay: 1500 },
        { sub: "c", tts: "What are they doing?", displayText: "What?", displayDelay: 1500 },
        { sub: "d", tts: "Where are they? And when?", displayText: "Where? When?", displayDelay: 1800 },
        { sub: "e", tts: "And why did it happen?", displayText: "Why?", displayDelay: 1500 },
      ],
    },
    {
      type: "example",
      heading: "Let Us Try One",
      imagePrompt: `A cheerful cartoon girl with brown skin and two braided pigtails, holding a basket with three red apples, standing near a green apple tree. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen to this little story.", displayText: "Listen...", displayDelay: 1500 },
        { sub: "b", tts: "Bella picked three red apples from the tree. She put them in her basket.", displayText: "Bella picked 3 apples.", displayDelay: 3000 },
        { sub: "c", tts: "Who is the story about? Bella!", displayText: "Who? Bella", displayDelay: 2500 },
        { sub: "d", tts: "What did she do? She picked apples.", displayText: "What? Picked apples", displayDelay: 2500 },
        { sub: "e", tts: "How many apples? Three. We found the answer in the words!", displayText: "How many? 3", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "A Detective Trick",
      imagePrompt: `A friendly cartoon magnifying glass character with a smiling face, a tiny detective hat, and sparkles around it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A detective trick", displayDelay: 1500 },
        { sub: "b", tts: "When you finish reading, go back and find the answer in the words.", displayText: "Find it in the words", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to practice answering story questions!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RL.1.1-Q1", "RL.1.1-Q2", "RL.1.1-Q3", "RL.1.1-Q4", "RL.1.1-Q5"],
});
