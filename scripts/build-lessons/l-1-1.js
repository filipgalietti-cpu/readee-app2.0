#!/usr/bin/env node
/** L.1.1 — Grammar Power (conventions of grammar) */
const addMCQs = require("./_mcq");
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

addMCQs({
  standardId: "L.1.1",
  grade: "1st Grade",
  domain: "Language",
  description: "Demonstrate command of the conventions of standard English grammar and usage when writing or speaking",
  parentTip: "Nouns name things. Verbs show action. Point them out in everyday sentences.",
  questions: [
    { type: "multiple_choice", prompt: "Which word is a **noun** (a thing or person)?", choices: ["dog", "jumps", "fast", "happily"], correct: "dog", hint: "A noun is a person, place, or thing. Dog is a thing!", difficulty: 1, imagePrompt: `A cheerful cartoon dog with big friendly eyes, tongue out, tail wagging. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Which word is a **verb** (an action)?", choices: ["runs", "cat", "red", "tree"], correct: "runs", hint: "A verb shows action. Runs is something you do!", difficulty: 1, imagePrompt: `A cheerful cartoon child sprinting with motion lines, smiling brightly. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Which word fits: \"I ___ happy today.\"", choices: ["am", "is", "are", "be"], correct: "am", hint: "Use \"I am\" for yourself!", difficulty: 1, imagePrompt: `A cheerful cartoon child pointing at themselves with a big smile, sparkles around them. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Pick the right word: \"She ___ to school.\"", choices: ["walks", "walk", "walked", "walking"], correct: "walks", hint: "She walks. When it is one person doing it now, add an s!", difficulty: 2, imagePrompt: `A cheerful cartoon girl with brown skin and braided pigtails walking to school with a backpack, smiling. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Which word is an **adjective** (describes a thing)?", choices: ["fluffy", "cat", "jumps", "quickly"], correct: "fluffy", hint: "An adjective tells what something is like. Fluffy describes!", difficulty: 2, imagePrompt: `A cheerful cartoon fluffy white kitten with soft fur and big eyes. Clean pastel background. ${IMG}` },
  ],
});

build({
  standardId: "L.1.1",
  grade: "1st Grade",
  domain: "Language",
  title: "Grammar Power",
  slides: [
    {
      type: "intro",
      heading: "Word Jobs",
      imagePrompt: `A cheerful cartoon group of colorful word-tile characters standing in a friendly row, each with a different smiling face. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Every word in a sentence has a job.", displayText: "Every word has a job", displayDelay: 2500 },
        { sub: "b", tts: "Some words name things. Some show action. Some describe.", displayText: "Name. Do. Describe.", displayDelay: 2800 },
        { sub: "c", tts: "Knowing the jobs helps us talk and write clearly!", displayText: "Clear talking + writing", displayDelay: 2800 },
      ],
    },
    {
      type: "teach",
      heading: "Nouns Name Things",
      imagePrompt: `Three cheerful cartoon items in a friendly row, a smiling dog, a tree, and a small house. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "A noun names a person, place, or thing.", displayText: "Noun = name", displayDelay: 2500 },
        { sub: "b", tts: "Dog. Tree. School. Mom. All nouns!", displayText: "dog, tree, school, mom", displayDelay: 3000 },
        { sub: "c", tts: "If you can point to it, it is usually a noun.", displayText: "Point = noun", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "Verbs Show Action",
      imagePrompt: `Three cheerful cartoon action scenes in a row, a child running, a child jumping, and a child clapping. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "A verb shows action. What someone is doing.", displayText: "Verb = action", displayDelay: 2500 },
        { sub: "b", tts: "Run. Jump. Clap. Eat. All verbs!", displayText: "run, jump, clap, eat", displayDelay: 2800 },
        { sub: "c", tts: "Every sentence needs a verb to tell what is happening.", displayText: "Need a verb", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Spot the Jobs",
      imagePrompt: `A cheerful cartoon detective child with a magnifying glass hovering over a sentence card, tiny sparkles where they look. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A grammar trick", displayDelay: 1500 },
        { sub: "b", tts: "Ask: what names a thing? That is the noun. What shows action? That is the verb!", displayText: "Name vs action", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to spot grammar jobs!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["L.1.1-Q1", "L.1.1-Q2", "L.1.1-Q3", "L.1.1-Q4", "L.1.1-Q5"],
});
