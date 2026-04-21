#!/usr/bin/env node
/** L.1.4a — Sentence Clues (context clues) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "L.1.4a",
  grade: "1st Grade",
  domain: "Language",
  title: "Sentence Clues",
  slides: [
    {
      type: "intro",
      heading: "Clues Inside a Sentence",
      imagePrompt: `A cheerful cartoon detective child with a magnifying glass hovering over a sentence on an open page, tiny stars sparkling. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The sentence itself often hides clues about hard words.", displayText: "Clues hide in sentences", displayDelay: 2500 },
        { sub: "b", tts: "Those clues help you guess what the word means.", displayText: "Clues = meaning", displayDelay: 2200 },
        { sub: "c", tts: "Let us try it!", displayText: "Let us try", displayDelay: 1500 },
      ],
    },
    {
      type: "teach",
      heading: "The Clue in the Words",
      imagePrompt: `A cheerful cartoon child looking at a big fluffy orange cat curled up in a cozy blanket, warm and happy. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen. The fluffy cat curled up in the cozy blanket.", displayText: "The fluffy cat...", displayDelay: 2800 },
        { sub: "b", tts: "What does fluffy mean? Soft and puffy.", displayText: "Fluffy = soft + puffy", displayDelay: 2800 },
        { sub: "c", tts: "How did we know? The blanket and the cat. Those were clues!", displayText: "Words around = clues", displayDelay: 2800 },
      ],
    },
    {
      type: "example",
      heading: "Clue Hunt",
      imagePrompt: `A cheerful cartoon kid jumping on a giant trampoline in a backyard, smiling with joy, tiny arrows showing the bouncing. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen. The kid bounced high on the trampoline.", displayText: "Kid bounced high...", displayDelay: 2500 },
        { sub: "b", tts: "What does bounced mean? Jumped up and down!", displayText: "Bounced = jumped", displayDelay: 2500 },
        { sub: "c", tts: "The trampoline was the clue!", displayText: "Trampoline = clue", displayDelay: 2200 },
      ],
    },
    {
      type: "tip",
      heading: "Read All the Words",
      imagePrompt: `A cheerful cartoon owl with glasses holding a tiny magnifying glass over a page full of friendly sparkles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A clue trick", displayDelay: 1500 },
        { sub: "b", tts: "Read the whole sentence, not just the tricky word!", displayText: "Read it all", displayDelay: 2200 },
        { sub: "c", tts: "Now you are ready to use sentence clues!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["L.1.4a-Q1"],
});
