#!/usr/bin/env node
/** RF.1.3b — Sounding Out Short Words (CVC decoding) */
const addMCQs = require("./_mcq");
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

addMCQs({
  standardId: "RF.1.3b",
  grade: "1st Grade",
  domain: "Foundational Skills",
  description: "Decode regularly spelled one-syllable words",
  parentTip: "Three-letter words are the foundation. Stretch each sound, then snap them together.",
  questions: [
    { type: "multiple_choice", prompt: "Sound out this word: **c-a-t**. What word is it?", choices: ["cat", "cap", "cup", "cot"], correct: "cat", hint: "Blend the sounds together: kuh-ah-tuh!", difficulty: 1, imagePrompt: `A cheerful cartoon orange tabby cat sitting and smiling, tail curled. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "What three sounds are in the word **dog**?", choices: ["d-o-g", "d-u-g", "g-o-d", "d-a-g"], correct: "d-o-g", hint: "Stretch each letter out: duh...oh...guh.", difficulty: 1, imagePrompt: `A cheerful cartoon brown puppy dog with big eyes and floppy ears, sitting and smiling. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Sound out: **s-u-n**. What word is it?", choices: ["sun", "sit", "sum", "son"], correct: "sun", hint: "Blend: sss-uh-n. The big bright thing in the sky!", difficulty: 1, imagePrompt: `A cheerful cartoon bright yellow smiling sun with friendly rays. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Which word has these sounds: **b-i-g**?", choices: ["big", "bug", "bag", "beg"], correct: "big", hint: "Blend: buh-ih-guh.", difficulty: 2, imagePrompt: `A cheerful cartoon big friendly elephant with a trunk raised, smiling. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Sound out: **h-o-p**. What word is it?", choices: ["hop", "hip", "hat", "hug"], correct: "hop", hint: "Blend the sounds: huh-oh-puh!", difficulty: 2, imagePrompt: `A cheerful cartoon bunny hopping in mid-air, smiling, with motion arrows. Clean pastel background. ${IMG}` },
  ],
});

build({
  standardId: "RF.1.3b",
  grade: "1st Grade",
  domain: "Foundational Skills",
  title: "Sounding Out Short Words",
  slides: [
    {
      type: "intro",
      heading: "Sound It Out",
      imagePrompt: `A cheerful cartoon child with big headphones carefully reading a short word card, lightbulb above their head. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Short words are made of just a few sounds.", displayText: "Few sounds", displayDelay: 2000 },
        { sub: "b", tts: "When you sound them out, you read each one in order.", displayText: "One at a time", displayDelay: 2500 },
        { sub: "c", tts: "Then you blend them together. That is reading!", displayText: "Blend = reading", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "Read CAT",
      imagePrompt: `A cheerful cartoon orange cat sitting upright, smiling, tail curled. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Let us read this word.", displayText: "Read this", displayDelay: 1500, displayDiagram: { letters: [{ text: "C" }, { text: "A" }, { text: "T" }], delay: 1500, revealCount: 3 } },
        { sub: "b", tts: "First sound.", afterPhonemes: ["c_hard"], displayDiagram: { letters: [{ text: "C" }, { text: "A" }, { text: "T" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [0] },
        { sub: "c", tts: "Middle sound.", afterPhonemes: ["short_a"], displayDiagram: { letters: [{ text: "C" }, { text: "A" }, { text: "T" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [1] },
        { sub: "d", tts: "Last sound.", afterPhonemes: ["t"], displayDiagram: { letters: [{ text: "C" }, { text: "A" }, { text: "T" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [2] },
        { sub: "e", tts: "Now blend. Cat!", displayText: "Cat!", displayDelay: 1500, displayDiagram: { letters: [{ text: "C" }, { text: "A" }, { text: "T" }], delay: 0, revealCount: 3 } },
      ],
    },
    {
      type: "example",
      heading: "Your Turn: DOG",
      imagePrompt: `A cheerful cartoon brown dog with big eyes and floppy ears, sitting. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Your turn.", displayText: "Your turn!", displayDelay: 1500, displayDiagram: { letters: [{ text: "D" }, { text: "O" }, { text: "G" }], delay: 1500, revealCount: 3 } },
        { sub: "b", tts: "First.", afterPhonemes: ["d"], displayDiagram: { letters: [{ text: "D" }, { text: "O" }, { text: "G" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [0] },
        { sub: "c", tts: "Middle.", afterPhonemes: ["short_o"], displayDiagram: { letters: [{ text: "D" }, { text: "O" }, { text: "G" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [1] },
        { sub: "d", tts: "Last.", afterPhonemes: ["g"], displayDiagram: { letters: [{ text: "D" }, { text: "O" }, { text: "G" }], delay: 0, revealCount: 3 }, phonemeLetterIndices: [2] },
        { sub: "e", tts: "Blend! Dog!", displayText: "Dog!", displayDelay: 1500, displayDiagram: { letters: [{ text: "D" }, { text: "O" }, { text: "G" }], delay: 0, revealCount: 3 } },
      ],
    },
    {
      type: "tip",
      heading: "Stretch, Then Snap",
      imagePrompt: `A cheerful cartoon rubber band character stretching with a smile, then snapping back, with friendly motion lines. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A decoding trick", displayDelay: 1500 },
        { sub: "b", tts: "Say each sound slowly. Then say them faster and faster until they snap together!", displayText: "Slow, then snap", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to sound out short words!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RF.1.3b-Q1", "RF.1.3b-Q2", "RF.1.3b-Q3", "RF.1.3b-Q4", "RF.1.3b-Q5"],
});
