#!/usr/bin/env node
/** RF.1.3a — Two-Letter Sounds (digraphs: sh, ch, th) — authors MCQs + lesson */
const addMCQs = require("./_mcq");
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

// 1. MCQs (no existing bank for this standard)
addMCQs({
  standardId: "RF.1.3a",
  grade: "1st Grade",
  domain: "Foundational Skills",
  description: "Know the spelling-sound correspondences for common consonant digraphs",
  parentTip: "Two letters can spell one sound! Point them out while reading ('look, sh says shhh!').",
  questions: [
    {
      type: "multiple_choice",
      prompt: "Which two letters make the \"shhh\" sound?",
      choices: ["sh", "ch", "th", "wh"],
      correct: "sh",
      hint: "Think of ship! Sh sh ship!",
      difficulty: 1,
      imagePrompt: `A cheerful cartoon friendly cloud with a finger over its mouth making a shh gesture, small sparkles around it. Clean pastel background. ${IMG}`,
    },
    {
      type: "multiple_choice",
      prompt: "Which two letters make the \"chh\" sound like in **chip**?",
      choices: ["ch", "sh", "th", "ph"],
      correct: "ch",
      hint: "Chip starts with the \"chh\" sound!",
      difficulty: 1,
      imagePrompt: `A cheerful cartoon potato chip character with a big smile, a tiny crinkled edge. Clean pastel background. ${IMG}`,
    },
    {
      type: "multiple_choice",
      prompt: "Which word starts with the **th** sound?",
      choices: ["thumb", "chimp", "shell", "what"],
      correct: "thumb",
      hint: "Put your tongue behind your teeth and say thuh!",
      difficulty: 1,
      imagePrompt: `A cheerful cartoon friendly thumb giving a thumbs-up gesture, with tiny sparkles around it. Clean pastel background. ${IMG}`,
    },
    {
      type: "multiple_choice",
      prompt: "Look at the word **ship**. What two letters spell one sound?",
      choices: ["sh", "hi", "ip", "si"],
      correct: "sh",
      hint: "The first two letters make the \"shhh\" sound together.",
      difficulty: 2,
      imagePrompt: `A cheerful cartoon red sailboat with a big white sail on calm blue water, smiling sun above. Clean pastel background. ${IMG}`,
    },
    {
      type: "multiple_choice",
      prompt: "Which word has the **ch** sound at the end?",
      choices: ["beach", "fish", "bath", "moth"],
      correct: "beach",
      hint: "Listen to the very last sound in each word.",
      difficulty: 2,
      imagePrompt: `A cheerful cartoon sandy beach with tiny blue waves, a small bright sun, a cartoon starfish, and a red bucket. Clean pastel background. ${IMG}`,
    },
  ],
});

// 2. Lesson
build({
  standardId: "RF.1.3a",
  grade: "1st Grade",
  domain: "Foundational Skills",
  title: "Two-Letter Sounds",
  slides: [
    {
      type: "intro",
      heading: "Two Letters, One Sound",
      imagePrompt: `A cheerful cartoon pair of colorful letter-tile characters holding hands, each smiling, tiny sparkles between them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Sometimes two letters team up to make just one sound!", displayText: "Two letters, one sound", displayDelay: 2500 },
        { sub: "b", tts: "The letters are not each saying their own sound anymore.", displayText: "Not by themselves", displayDelay: 2500 },
        { sub: "c", tts: "They make a brand new sound together!", displayText: "A new sound!", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "Meet SH",
      imagePrompt: `A cheerful cartoon red sailboat with a big smiling white sail floating on blue waves, a tiny sun in the sky. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "When S and H team up, they make the \"shhh\" sound.", displayDiagram: { letters: [{ text: "S" }, { text: "H" }], delay: 1500, revealCount: 2 } },
        { sub: "b", tts: "Like in the word ship. Sh-ip.", displayText: "ship", displayDelay: 1500 },
        { sub: "c", tts: "Or shell, shop, and shoe. All start with the \"shhh\" sound.", displayText: "shell, shop, shoe", displayDelay: 2800 },
      ],
    },
    {
      type: "teach",
      heading: "Meet CH and TH",
      imagePrompt: `Three cheerful cartoon friendly letter pair characters in a row, each a different bright color with happy faces. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "C and H together make the \"chh\" sound. Like in chip.", displayDiagram: { letters: [{ text: "C" }, { text: "H" }], delay: 1500, revealCount: 2 } },
        { sub: "b", tts: "Chip. Chop. Cheese. Hear the \"chh\"?", displayText: "chip, chop, cheese", displayDelay: 2800 },
        { sub: "c", tts: "And T and H make the \"thh\" sound. Like in thumb.", displayDiagram: { letters: [{ text: "T" }, { text: "H" }], delay: 1500, revealCount: 2 } },
        { sub: "d", tts: "Thumb. Thin. Think. Feel your tongue?", displayText: "thumb, thin, think", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Listen for Team Sounds",
      imagePrompt: `A cheerful cartoon ear character with small listening waves, a tiny smile, surrounded by tiny letter pairs floating. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A digraph trick", displayDelay: 1500 },
        { sub: "b", tts: "When you see S-H, C-H, or T-H together, they make one sound, not two.", displayText: "SH, CH, TH = one sound", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to spot two-letter sounds!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RF.1.3a-Q1", "RF.1.3a-Q2", "RF.1.3a-Q3", "RF.1.3a-Q4", "RF.1.3a-Q5"],
});
