#!/usr/bin/env node
/** RF.1.4b — Reading Out Loud (fluency, expression, pacing) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RF.1.4b",
  grade: "1st Grade",
  domain: "Foundational Skills",
  title: "Reading Out Loud",
  slides: [
    {
      type: "intro",
      heading: "Read With Expression",
      imagePrompt: `A cheerful cartoon child standing on a small wooden stage, holding an open storybook and reading with a big happy expression, soft spotlight on them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Reading out loud is like telling a story.", displayText: "Tell the story!", displayDelay: 2000 },
        { sub: "b", tts: "Good readers use their voice to make the words come alive.", displayText: "Make it come alive", displayDelay: 2500 },
        { sub: "c", tts: "Let us learn a few tricks to read out loud like a star!", displayText: "Three reading tricks", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "Match the Mark",
      imagePrompt: `Three cheerful cartoon punctuation mark characters in a row, a period, a question mark, and an exclamation mark, each wearing a matching expressive face. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The ending mark tells your voice what to do.", displayText: "The mark is a clue!", displayDelay: 2000 },
        { sub: "b", tts: "A period means stop. Your voice comes down. The dog runs.", displayText: "Period. Voice down.", displayDelay: 2500 },
        { sub: "c", tts: "A question mark means your voice goes up. Is the dog fast?", displayText: "Question. Voice up!", displayDelay: 2500 },
        { sub: "d", tts: "An exclamation mark means excited! The dog is so fast!", displayText: "Exclaim. Feel excited!", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "Not Too Fast, Not Too Slow",
      imagePrompt: `A cheerful cartoon turtle and a cartoon rabbit reading books side by side, the turtle smiling calmly, the rabbit looking thoughtful. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Good readers read at just the right speed.", displayText: "Just right speed", displayDelay: 2000 },
        { sub: "b", tts: "Not too fast. The words get jumbled.", displayText: "Not too fast", displayDelay: 2000 },
        { sub: "c", tts: "Not too slow. The words lose their meaning.", displayText: "Not too slow", displayDelay: 2000 },
        { sub: "d", tts: "Nice and smooth, like talking to a friend.", displayText: "Smooth like talking", displayDelay: 2000 },
      ],
    },
    {
      type: "tip",
      heading: "Sound It Out Like a Star",
      imagePrompt: `A cheerful cartoon microphone character with a friendly face, sparkles shining around it as if on a stage. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A fluency trick", displayDelay: 1500 },
        { sub: "b", tts: "Pretend you are reading to someone you love. Use your voice!", displayText: "Read with feeling", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to practice reading out loud!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RF.1.4b-Q1", "RF.1.4b-Q2", "RF.1.4b-Q3", "RF.1.4b-Q4", "RF.1.4b-Q5"],
});
