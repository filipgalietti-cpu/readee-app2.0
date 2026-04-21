#!/usr/bin/env node
/** RF.1.4c — Using Clues to Read (context self-correction) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RF.1.4c",
  grade: "1st Grade",
  domain: "Foundational Skills",
  title: "Using Clues to Read",
  slides: [
    {
      type: "intro",
      heading: "Does It Make Sense?",
      imagePrompt: `A cheerful cartoon detective child wearing a little deerstalker hat and holding a magnifying glass, looking thoughtful and curious. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Good readers are a little like detectives.", displayText: "Readers = detectives!", displayDelay: 2000 },
        { sub: "b", tts: "When a sentence does not make sense, they look for clues.", displayText: "Look for clues", displayDelay: 2500 },
        { sub: "c", tts: "Then they try the word again. Let us see how!", displayText: "Try again", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "Stop, Think, Try Again",
      imagePrompt: `A cheerful cartoon child with a thought bubble above their head containing a tiny lightbulb, looking down at a book thoughtfully. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here are three steps for when a word does not make sense.", displayText: "Three steps", displayDelay: 2000 },
        { sub: "b", tts: "Step one. Stop.", displayText: "Step 1: Stop", displayDelay: 1500 },
        { sub: "c", tts: "Step two. Think. Does that word fit the rest of the sentence?", displayText: "Step 2: Think", displayDelay: 2500 },
        { sub: "d", tts: "Step three. Try again with a word that makes sense.", displayText: "Step 3: Try again", displayDelay: 2500 },
      ],
    },
    {
      type: "example",
      heading: "Spot the Mix-Up",
      imagePrompt: `A cheerful cartoon orange tabby cat sitting on a soft green rug in a cozy living room. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen. You read, the cat sat on the mat.", displayText: "The cat sat on the mat.", displayDelay: 1500 },
        { sub: "b", tts: "But you said, the cat sat on the map. Uh oh!", displayText: "...on the map? Uh oh.", displayDelay: 2500 },
        { sub: "c", tts: "Does a cat sit on a map? Stop. Think. That does not make sense.", displayText: "That does not fit", displayDelay: 2500 },
        { sub: "d", tts: "Try again. The cat sat on the mat. That makes sense!", displayText: "Mat! That makes sense", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Always Ask",
      imagePrompt: `A friendly cartoon owl wearing round glasses, tilting its head as if asking a question, with a tiny thought bubble containing a question mark. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A reader's trick", displayDelay: 1500 },
        { sub: "b", tts: "After every sentence, ask yourself, did that make sense?", displayText: "Did that make sense?", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to practice using clues to read!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RF.1.4c-Q1", "RF.1.4c-Q2", "RF.1.4c-Q3", "RF.1.4c-Q4", "RF.1.4c-Q5"],
});
