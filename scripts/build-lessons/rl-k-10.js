#!/usr/bin/env node
/** RL.K.10 — Storytime All Year (K range/complexity) */
const addMCQs = require("./_mcq");
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

addMCQs({
  standardId: "RL.K.10",
  grade: "Kindergarten",
  domain: "Literature",
  description: "Actively engage in group reading activities with purpose and understanding",
  parentTip: "Read every day! Mix favorite books with new ones to keep reading exciting.",
  questions: [
    { type: "multiple_choice", prompt: "What helps your reading get stronger?", choices: ["reading every day", "reading once a year", "skipping books", "closing the book"], correct: "reading every day", hint: "A little reading every day adds up fast!", difficulty: 1, imagePrompt: `A cheerful cartoon child reading a colorful storybook on a cozy rug, smiling brightly. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "What should you do when a story gets tricky?", choices: ["ask for help", "give up", "stop reading forever", "throw the book"], correct: "ask for help", hint: "Asking for help is what smart readers do!", difficulty: 1, imagePrompt: `A cheerful cartoon child raising a hand to a smiling adult while holding an open book. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Why is it good to read different kinds of stories?", choices: ["learn new things", "make you tired", "use up books", "get bored"], correct: "learn new things", hint: "Different stories teach different things!", difficulty: 1, imagePrompt: `A cheerful cartoon child surrounded by different colorful books, eyes wide with wonder. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "When listening to a story, you should:", choices: ["pay attention", "talk to a friend", "look away", "fall asleep"], correct: "pay attention", hint: "Paying attention helps you enjoy the story!", difficulty: 1, imagePrompt: `A cheerful cartoon child sitting cross-legged listening attentively with a big smile. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "A great reader is someone who:", choices: ["keeps trying new books", "only reads one book", "never opens a book", "tears pages"], correct: "keeps trying new books", hint: "Great readers love trying new stories!", difficulty: 2, imagePrompt: `A cheerful cartoon child holding a stack of books with a proud smile. Clean pastel background. ${IMG}` },
  ],
});

build({
  standardId: "RL.K.10",
  grade: "Kindergarten",
  domain: "Literature",
  title: "Storytime All Year",
  slides: [
    {
      type: "intro",
      heading: "Stories Every Day",
      imagePrompt: `A cheerful cartoon calendar with a tiny smiling book on each month, a happy reader sitting beside it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Look! Reading stories every day is so much fun.", displayText: "Read every day!", displayDelay: 2200 },
        { sub: "b", tts: "Each story takes you on a new adventure.", displayText: "New adventures", displayDelay: 2500 },
        { sub: "c", tts: "Let us see how to enjoy stories all year long.", displayText: "All year long!", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "Try Different Stories",
      imagePrompt: `A cheerful cartoon bookshelf with many colorful books, a small smiling child picking one out. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "There are so many kinds of stories!", displayText: "So many kinds!", displayDelay: 2000 },
        { sub: "b", tts: "Funny ones. Brave ones. Silly ones. Sweet ones.", displayText: "Funny, brave, silly, sweet", displayDelay: 2800 },
        { sub: "c", tts: "Try a new kind every week. You will find favorites!", displayText: "Find favorites", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "Listen and Look",
      imagePrompt: `A cheerful cartoon child listening attentively to a smiling adult reading from a picture book. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "When someone reads to you, listen closely.", displayText: "Listen closely", displayDelay: 2200 },
        { sub: "b", tts: "Look at the pictures. They are part of the story too!", displayText: "Look at pictures", displayDelay: 2500 },
        { sub: "c", tts: "Ask questions if something is tricky.", displayText: "Ask questions", displayDelay: 2200 },
      ],
    },
    {
      type: "tip",
      heading: "Make a Reading Spot",
      imagePrompt: `A cheerful cartoon cozy reading nook with pillows, a soft blanket, and a small lamp glowing warmly. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A reading trick", displayDelay: 1500 },
        { sub: "b", tts: "Pick a cozy spot just for reading. Curl up there every day.", displayText: "Cozy spot daily", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to enjoy stories all year long!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RL.K.10-Q1", "RL.K.10-Q2", "RL.K.10-Q3", "RL.K.10-Q4", "RL.K.10-Q5"],
});
