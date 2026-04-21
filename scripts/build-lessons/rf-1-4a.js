#!/usr/bin/env node
/** RF.1.4a — Reading with Purpose (similar to RF.K.4 but for G1) */
const addMCQs = require("./_mcq");
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

addMCQs({
  standardId: "RF.1.4a",
  grade: "1st Grade",
  domain: "Foundational Skills",
  description: "Read on-level text with purpose and understanding",
  parentTip: "Before reading, ask: why am I reading this? What do I want to know?",
  questions: [
    { type: "multiple_choice", prompt: "Why might you read a storybook?", choices: ["for fun", "to find your lost toy", "to buy groceries", "to build a house"], correct: "for fun", hint: "Storybooks tell adventures! We read them to enjoy.", difficulty: 1, imagePrompt: `A cheerful cartoon child snuggled under a blanket, reading a storybook with sparkles around it. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Why might you read a book about sharks?", choices: ["to learn about sharks", "to cook dinner", "to go to bed", "to brush teeth"], correct: "to learn about sharks", hint: "Fact books teach us real information.", difficulty: 1, imagePrompt: `A cheerful cartoon friendly shark with a smiling face, swimming in bright blue water. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Before you start reading, a smart reader asks:", choices: ["Why am I reading this?", "What time is it?", "What is for dinner?", "Is it cold outside?"], correct: "Why am I reading this?", hint: "Knowing why gives your reading a purpose!", difficulty: 2, imagePrompt: `A cheerful cartoon child with a thoughtful expression, a tiny question mark above their head. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Reading **with purpose** means:", choices: ["knowing why you are reading", "reading as fast as possible", "skipping every other word", "closing your eyes"], correct: "knowing why you are reading", hint: "Purpose = a reason or a goal!", difficulty: 2, imagePrompt: `A cheerful cartoon child pointing confidently at an open book with a tiny target icon above the page. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "You want to find out how butterflies fly. Which book is best?", choices: ["a fact book about butterflies", "a storybook about pirates", "a cookbook", "a song book"], correct: "a fact book about butterflies", hint: "Fact books teach real information!", difficulty: 1, imagePrompt: `A cheerful cartoon butterfly with colorful wings next to an open fact book about insects. Clean pastel background. ${IMG}` },
  ],
});

build({
  standardId: "RF.1.4a",
  grade: "1st Grade",
  domain: "Foundational Skills",
  title: "Reading with Purpose",
  slides: [
    {
      type: "intro",
      heading: "Know Why You Read",
      imagePrompt: `A cheerful cartoon child holding an open book with a tiny target or goal symbol floating above the page, smiling confidently. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Great readers think before they read.", displayText: "Think first", displayDelay: 2000 },
        { sub: "b", tts: "They ask, why am I reading this book?", displayText: "Why am I reading?", displayDelay: 2500 },
        { sub: "c", tts: "That question is called your purpose.", displayText: "Purpose = your why", displayDelay: 2200 },
      ],
    },
    {
      type: "teach",
      heading: "Two Big Reasons",
      imagePrompt: `Two cheerful cartoon open books side by side, one a whimsical storybook with a tiny dragon, one a fact book with a tiny globe. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "We read for two big reasons.", displayText: "Two big reasons", displayDelay: 2000 },
        { sub: "b", tts: "A storybook. We read it for fun!", displayText: "Storybook = fun", displayDelay: 2500 },
        { sub: "c", tts: "A fact book. We read it to learn!", displayText: "Fact book = learn", displayDelay: 2500 },
      ],
    },
    {
      type: "example",
      heading: "Picking a Book",
      imagePrompt: `A cheerful cartoon child looking at a bookshelf with many colorful books, pointing at one thoughtfully. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Imagine you want to learn how butterflies fly.", displayText: "Goal: learn about butterflies", displayDelay: 2800 },
        { sub: "b", tts: "Which book fits? A fact book about butterflies!", displayText: "Pick the fact book", displayDelay: 2500 },
        { sub: "c", tts: "Now imagine you want a bedtime story.", displayText: "Goal: a story", displayDelay: 2200 },
        { sub: "d", tts: "A storybook! Your purpose picks your book.", displayText: "Purpose picks the book", displayDelay: 2800 },
      ],
    },
    {
      type: "tip",
      heading: "Pause Before You Start",
      imagePrompt: `A cheerful cartoon child pausing with a finger on their chin, a tiny lightbulb blinking above their head. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A purpose trick", displayDelay: 1500 },
        { sub: "b", tts: "Before you open a book, ask yourself: what do I want from this book?", displayText: "What do I want?", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to read with purpose!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RF.1.4a-Q1", "RF.1.4a-Q2", "RF.1.4a-Q3", "RF.1.4a-Q4", "RF.1.4a-Q5"],
});
