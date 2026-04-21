#!/usr/bin/env node
/** L.1.2 — Capitals and Periods (capitalization, punctuation, spelling) */
const addMCQs = require("./_mcq");
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

addMCQs({
  standardId: "L.1.2",
  grade: "1st Grade",
  domain: "Language",
  description: "Demonstrate command of the conventions of standard English capitalization, punctuation, and spelling when writing",
  parentTip: "Two simple rules: sentences start with a capital and end with a mark. People's names always capital.",
  questions: [
    { type: "multiple_choice", prompt: "Which sentence is written correctly?", choices: ["The dog runs fast.", "the dog runs fast.", "The dog runs fast", "the dog runs fast"], correct: "The dog runs fast.", hint: "Look for the capital letter at the start AND the period at the end.", difficulty: 1, imagePrompt: `A cheerful cartoon dog running fast with motion lines, smiling. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "What does every sentence need at the end?", choices: ["a mark like . ? or !", "a number", "a color", "a letter"], correct: "a mark like . ? or !", hint: "Sentences always end with punctuation!", difficulty: 1, imagePrompt: `Three cheerful cartoon punctuation mark characters in a row, a period, a question mark, and an exclamation mark. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Which name is written correctly?", choices: ["Maya", "maya", "MAYA", "mAyA"], correct: "Maya", hint: "Names always start with a capital letter!", difficulty: 1, imagePrompt: `A cheerful cartoon girl with warm brown skin and two braided pigtails waving happily. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "What ending mark do you use for a question?", choices: ["?", ".", "!", ","], correct: "?", hint: "Questions end with a question mark!", difficulty: 1, imagePrompt: `A cheerful cartoon question mark character with big eyes, smiling curiously. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Fix this: **ben and maya play.** What is wrong?", choices: ["Names need capitals", "It needs a number", "It has too many words", "Nothing is wrong"], correct: "Names need capitals", hint: "Ben and Maya are names. Start them with capitals!", difficulty: 2, imagePrompt: `A cheerful cartoon pair of friends, a boy with freckles and a girl with pigtails, both smiling and playing together. Clean pastel background. ${IMG}` },
  ],
});

build({
  standardId: "L.1.2",
  grade: "1st Grade",
  domain: "Language",
  title: "Capitals and Periods",
  slides: [
    {
      type: "intro",
      heading: "Writing Rules",
      imagePrompt: `A cheerful cartoon child writing on a sheet of paper with a big yellow pencil, smiling, stars floating above the paper. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "When we write, we follow a few important rules.", displayText: "Writing rules", displayDelay: 2500 },
        { sub: "b", tts: "The rules help our readers understand us.", displayText: "Help readers", displayDelay: 2000 },
        { sub: "c", tts: "Let us learn two big ones.", displayText: "Two big rules", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "Rule 1: Start Big",
      imagePrompt: `A cheerful cartoon capital letter T character wearing a small gold crown, standing at the front of a line of lowercase letters. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Every sentence starts with a capital letter.", displayText: "Start with a capital", displayDelay: 2500 },
        { sub: "b", tts: "The dog runs. See the big T?", displayText: "The dog runs.", displayDelay: 2200 },
        { sub: "c", tts: "Names also start with capitals. Maya, not maya.", displayText: "Names too!", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "Rule 2: End With a Mark",
      imagePrompt: `Three cheerful cartoon punctuation mark characters in a row, a period, a question mark, and an exclamation mark, all waving. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Every sentence ends with a mark.", displayText: "End with a mark", displayDelay: 2200 },
        { sub: "b", tts: "A period for telling. A question mark for asking. An exclamation mark for excited.", displayDiagram: { letters: [{ text: "." }, { text: "?" }, { text: "!" }], delay: 1500, revealCount: 3 } },
        { sub: "c", tts: "Pick the mark that fits your sentence!", displayText: "Pick the right mark", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Check Both Ends",
      imagePrompt: `A cheerful cartoon sentence card with a capital letter glowing at the start and a period glowing at the end, tiny sparkles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A writing trick", displayDelay: 1500 },
        { sub: "b", tts: "When you write, check the start and the end of every sentence.", displayText: "Check start + end", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to use capitals and periods!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["L.1.2-Q1", "L.1.2-Q2", "L.1.2-Q3", "L.1.2-Q4", "L.1.2-Q5"],
});
