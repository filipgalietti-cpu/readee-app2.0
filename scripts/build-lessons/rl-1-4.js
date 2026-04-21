#!/usr/bin/env node
/** RL.1.4 — Words That Show Feelings */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RL.1.4",
  grade: "1st Grade",
  domain: "Literature",
  title: "Words That Show Feelings",
  slides: [
    {
      type: "intro",
      heading: "Feeling Words",
      imagePrompt: `A cheerful cartoon child with a thought cloud above their head containing a tiny smiling sun, a tiny sad raincloud, and a tiny excited star. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Writers choose special words to make us feel something.", displayText: "Words make feelings", displayDelay: 2200 },
        { sub: "b", tts: "Some words help us hear, see, or touch a story in our mind.", displayText: "Feel the story", displayDelay: 2500 },
        { sub: "c", tts: "Let us find some feeling words!", displayText: "Find the feelings", displayDelay: 1500 },
      ],
    },
    {
      type: "teach",
      heading: "Sense-y Words",
      imagePrompt: `Four cheerful cartoon sensory icons arranged in a square, a small ear, a small eye, a tiny hand, and a tiny nose, each with a friendly face. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Some words help us use our senses.", displayText: "Use your senses", displayDelay: 2000 },
        { sub: "b", tts: "Warm, soft, bright. These help us feel and see.", displayText: "Warm. Soft. Bright.", displayDelay: 2800 },
        { sub: "c", tts: "Whisper, crash, boom. These help us hear.", displayText: "Whisper. Crash. Boom.", displayDelay: 2800 },
        { sub: "d", tts: "Listen for sense-y words as you read!", displayText: "Listen for them", displayDelay: 2000 },
      ],
    },
    {
      type: "example",
      heading: "Warm Sun",
      imagePrompt: `A cheerful cartoon girl with braided pigtails, warm brown skin, eyes closed, smiling with her face tilted up toward a bright smiling sun. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen. The bright sun warmed her face.", displayText: "The bright sun warmed her face.", displayDelay: 2800 },
        { sub: "b", tts: "Which word helps us feel the sun? Warmed!", displayText: "Warmed", displayDelay: 2200 },
        { sub: "c", tts: "That word makes us feel the sun on our own skin.", displayText: "We feel it too", displayDelay: 2200 },
      ],
    },
    {
      type: "tip",
      heading: "Read It and Feel It",
      imagePrompt: `A cheerful cartoon child with their hand over their heart, eyes closed, smiling gently. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A feelings trick", displayDelay: 1500 },
        { sub: "b", tts: "When you read a feeling word, stop and feel it for a moment.", displayText: "Pause and feel it", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to practice finding feeling words!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RL.1.4-Q1", "RL.1.4-Q2", "RL.1.4-Q3", "RL.1.4-Q4", "RL.1.4-Q5"],
});
