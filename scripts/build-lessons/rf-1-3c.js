#!/usr/bin/env node
/** RF.1.3c — The Magic E (long vowels with silent E) */
const addMCQs = require("./_mcq");
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

addMCQs({
  standardId: "RF.1.3c",
  grade: "1st Grade",
  domain: "Foundational Skills",
  description: "Know final -e and common vowel team conventions for representing long vowel sounds",
  parentTip: "Magic E changes the vowel to say its name. Practice cap/cape, hop/hope, cub/cube.",
  questions: [
    { type: "multiple_choice", prompt: "Add an E to the end of **cap**. What word do you get?", choices: ["cape", "caps", "cop", "cup"], correct: "cape", hint: "The E makes the A say its name: AY!", difficulty: 1, imagePrompt: `A cheerful cartoon superhero child with a red cape flying behind them. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "What does **hop** become with a Magic E at the end?", choices: ["hope", "hops", "hope", "hot"], correct: "hope", hint: "Hop plus e = hope. The O says OH!", difficulty: 1, imagePrompt: `A cheerful cartoon rainbow over a small house with a heart floating above. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Which word has a Magic E?", choices: ["cake", "cat", "cup", "can"], correct: "cake", hint: "Magic E is at the end. It makes the vowel say its name!", difficulty: 1, imagePrompt: `A cheerful cartoon pink frosted birthday cake with one lit candle and colorful sprinkles. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "The word **kite** has which vowel sound?", choices: ["long I (eye)", "short i (ih)", "long E (ee)", "short a (ah)"], correct: "long I (eye)", hint: "Magic E makes I say its name: EYE!", difficulty: 2, imagePrompt: `A cheerful cartoon colorful diamond kite flying high in a blue sky with a long tail of bows. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "What happens to the E in a Magic E word?", choices: ["It is silent", "It is loud", "It changes to an A", "It disappears"], correct: "It is silent", hint: "Magic E does not make a sound. But it changes the vowel before it!", difficulty: 2, imagePrompt: `A cheerful cartoon letter E wearing a tall purple wizard hat with one finger on its lips in a shh gesture, small sparkles around it. Clean pastel background. ${IMG}` },
  ],
});

build({
  standardId: "RF.1.3c",
  grade: "1st Grade",
  domain: "Foundational Skills",
  title: "The Magic E",
  slides: [
    {
      type: "intro",
      heading: "Magic E",
      imagePrompt: `A cheerful cartoon letter E character wearing a tall wizard hat, holding a tiny wand with sparkles coming from the tip. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a magical trick in reading. It is called Magic E.", displayText: "Magic E!", displayDelay: 2000 },
        { sub: "b", tts: "Add an E to the end of a word, and something magical happens.", displayText: "Add an E", displayDelay: 2500 },
        { sub: "c", tts: "The vowel starts to say its name.", displayText: "Vowel says its name!", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "Cap Becomes Cape",
      imagePrompt: `A cheerful cartoon baseball cap next to a small red superhero cape, with a tiny letter E floating between them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The word cap has a short A sound.", displayDiagram: { letters: [{ text: "C" }, { text: "A" }, { text: "P" }], delay: 1500, revealCount: 3 }, afterPhonemes: ["short_a"], phonemeLetterIndices: [1] },
        { sub: "b", tts: "Watch. Add an E to the end. Cap becomes cape!", displayDiagram: { letters: [{ text: "C" }, { text: "A" }, { text: "P" }, { text: "E" }], delay: 2500, revealCount: 4 }, afterPhonemes: ["long_a"], phonemeLetterIndices: [1] },
        { sub: "c", tts: "The E is silent, but it makes the A say its name: AY!", displayText: "A says AY!", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "Kit Becomes Kite",
      imagePrompt: `A small cartoon toolkit next to a colorful flying kite with a ribbon tail, a tiny letter E floating between them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The word kit has a short I sound.", displayDiagram: { letters: [{ text: "K" }, { text: "I" }, { text: "T" }], delay: 1500, revealCount: 3 }, afterPhonemes: ["short_i"], phonemeLetterIndices: [1] },
        { sub: "b", tts: "Add a Magic E. Kit becomes kite!", displayDiagram: { letters: [{ text: "K" }, { text: "I" }, { text: "T" }, { text: "E" }], delay: 2500, revealCount: 4 }, afterPhonemes: ["long_i"], phonemeLetterIndices: [1] },
        { sub: "c", tts: "Now the I says its name: EYE!", displayText: "I says EYE!", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Silent but Powerful",
      imagePrompt: `A cheerful cartoon letter E with one finger on its lips making a shh gesture, tiny sparkles around it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A Magic E trick", displayDelay: 1500 },
        { sub: "b", tts: "The Magic E is silent. But it is super powerful. It changes the vowel!", displayText: "Silent but powerful", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to spot Magic E words!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RF.1.3c-Q1", "RF.1.3c-Q2", "RF.1.3c-Q3", "RF.1.3c-Q4", "RF.1.3c-Q5"],
});
