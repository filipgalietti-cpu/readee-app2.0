#!/usr/bin/env node
/** RF.1.3f — Word Endings (inflectional endings: -s, -es, -ed, -ing) */
const addMCQs = require("./_mcq");
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

addMCQs({
  standardId: "RF.1.3f",
  grade: "1st Grade",
  domain: "Foundational Skills",
  description: "Read words with inflectional endings",
  parentTip: "-s makes it more than one. -ed means it already happened. -ing means it is happening now.",
  questions: [
    { type: "multiple_choice", prompt: "What does the **-s** at the end of **cats** mean?", choices: ["more than one", "it happened before", "it is happening now", "it is very small"], correct: "more than one", hint: "One cat. Two cats. The S means more than one!", difficulty: 1, imagePrompt: `Two cheerful cartoon cats sitting next to each other, both smiling. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "What ending means \"happening right now\"?", choices: ["-ing", "-ed", "-s", "-er"], correct: "-ing", hint: "Running, jumping, playing. All happening now!", difficulty: 1, imagePrompt: `A cheerful cartoon child running fast with motion lines, smiling brightly. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "**Jumped** has which ending?", choices: ["-ed", "-ing", "-s", "-ly"], correct: "-ed", hint: "The last two letters are e-d. That means it already happened.", difficulty: 1, imagePrompt: `A cheerful cartoon kid mid-jump over a small bench, arms raised. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "What is the root word in **playing**?", choices: ["play", "playi", "ing", "plays"], correct: "play", hint: "Take off the -ing. What is left?", difficulty: 2, imagePrompt: `A cheerful cartoon child bouncing a bright red ball in a park. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Add **-ed** to **walk**. What word do you get?", choices: ["walked", "walks", "walking", "walker"], correct: "walked", hint: "Walk plus e-d means you already did it!", difficulty: 2, imagePrompt: `A cheerful cartoon child walking down a garden path smiling, behind them tiny footprints. Clean pastel background. ${IMG}` },
  ],
});

build({
  standardId: "RF.1.3f",
  grade: "1st Grade",
  domain: "Foundational Skills",
  title: "Word Endings",
  slides: [
    {
      type: "intro",
      heading: "Little Endings Change Meaning",
      imagePrompt: `A cheerful cartoon word-tile character with three little ending tiles floating next to it, each a different color. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Little endings can change what a word means.", displayText: "Endings matter!", displayDelay: 2200 },
        { sub: "b", tts: "They tell us how many, or when.", displayText: "How many. When.", displayDelay: 2200 },
        { sub: "c", tts: "Let us meet three of the most common ones.", displayText: "Three big ones", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "The -s Ending",
      imagePrompt: `A cheerful cartoon single cat next to a cheerful group of three cats, a tiny plus-S symbol between them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The S ending means more than one.", displayText: "-s = more than 1", displayDelay: 2200 },
        { sub: "b", tts: "One cat. Two cats.", displayText: "cat -> cats", displayDelay: 2500 },
        { sub: "c", tts: "Dog becomes dogs. Apple becomes apples.", displayText: "dogs, apples", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "The -ed and -ing Endings",
      imagePrompt: `A cheerful cartoon clock with two arrows, one pointing left labeled with a small yesterday-sun, one pointing right labeled with a small now-star. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The ending E D means it already happened.", displayText: "-ed = before", displayDelay: 2500 },
        { sub: "b", tts: "Yesterday, I jumped. Already happened!", displayText: "jumped = past", displayDelay: 2500 },
        { sub: "c", tts: "The ending I N G means happening right now.", displayText: "-ing = now", displayDelay: 2500 },
        { sub: "d", tts: "I am jumping. Happening now!", displayText: "jumping = now", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Spot the Ending",
      imagePrompt: `A cheerful cartoon magnifying glass zooming in on the last two letters of a word tile, tiny sparkles around the ending. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "An endings trick", displayDelay: 1500 },
        { sub: "b", tts: "Look at the last letters. The ending tells you when or how many!", displayText: "Last letters = clue", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to read word endings!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RF.1.3f-Q1", "RF.1.3f-Q2", "RF.1.3f-Q3", "RF.1.3f-Q4", "RF.1.3f-Q5"],
});
