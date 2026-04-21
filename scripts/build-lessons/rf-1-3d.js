#!/usr/bin/env node
/** RF.1.3d — Counting Syllables */
const addMCQs = require("./_mcq");
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

addMCQs({
  standardId: "RF.1.3d",
  grade: "1st Grade",
  domain: "Foundational Skills",
  description: "Use knowledge that every syllable must have a vowel sound to determine the number of syllables in a printed word",
  parentTip: "Clap along with words! Each clap is one syllable.",
  questions: [
    { type: "multiple_choice", prompt: "How many syllables are in the word **cat**?", choices: ["1", "2", "3", "4"], correct: "1", hint: "Clap it out: cat! Just one clap.", difficulty: 1, imagePrompt: `A cheerful cartoon cat with one bright smile and one tiny clap emoji next to it. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "How many syllables are in **rabbit**? Clap it out: rab-bit!", choices: ["2", "1", "3", "4"], correct: "2", hint: "Rab... bit. Two claps!", difficulty: 1, imagePrompt: `A cheerful cartoon gray rabbit with big floppy ears, smiling with two tiny claps next to it. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "How many syllables: **but-ter-fly**?", choices: ["3", "2", "1", "4"], correct: "3", hint: "But-ter-fly. Three claps!", difficulty: 2, imagePrompt: `A cheerful cartoon butterfly with colorful wings and a smiling face. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Every syllable must have at least one of what?", choices: ["a vowel sound", "a letter B", "a period", "a word"], correct: "a vowel sound", hint: "A, E, I, O, U! Every syllable needs one.", difficulty: 2, imagePrompt: `Five cheerful cartoon vowel letters A, E, I, O, U holding hands in a friendly row. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "How many syllables in **apple**?", choices: ["2", "1", "3", "4"], correct: "2", hint: "Ap-ple. Two parts, two claps!", difficulty: 1, imagePrompt: `A cheerful cartoon shiny red apple with a green leaf and two tiny clap emojis next to it. Clean pastel background. ${IMG}` },
  ],
});

build({
  standardId: "RF.1.3d",
  grade: "1st Grade",
  domain: "Foundational Skills",
  title: "Counting Syllables",
  slides: [
    {
      type: "intro",
      heading: "Clap Out the Beats",
      imagePrompt: `A cheerful cartoon child clapping happily with sparkles flying out of their hands, a musical note floating nearby. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Every word has beats inside it. We call them syllables.", displayText: "Beats = syllables", displayDelay: 2500 },
        { sub: "b", tts: "You can clap a word to find the beats!", displayText: "Clap it out", displayDelay: 2000 },
        { sub: "c", tts: "Let us try some together.", displayText: "Let us clap", displayDelay: 1500 },
      ],
    },
    {
      type: "teach",
      heading: "Cat Is One Beat",
      imagePrompt: `A cheerful cartoon cat sitting up with one big clap emoji next to it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen. Cat.", displayText: "Cat", displayDelay: 1500, sfxClaps: [{ delay: 1800 }] },
        { sub: "b", tts: "One clap! Cat has one beat. One syllable.", displayText: "1 syllable", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "Rabbit Is Two Beats",
      imagePrompt: `A cheerful cartoon rabbit with big floppy ears standing tall, with two clap emojis next to it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen. Rab-bit.", displayText: "Rab-bit", displayDelay: 1500, sfxClaps: [{ delay: 1800 }, { delay: 2400 }] },
        { sub: "b", tts: "Two claps! Rabbit has two beats. Two syllables.", displayText: "2 syllables", displayDelay: 2500 },
        { sub: "c", tts: "Every syllable needs a vowel. Rabbit has A and I. Two vowels, two syllables.", displayText: "Vowel in each beat", displayDelay: 3000 },
      ],
    },
    {
      type: "tip",
      heading: "Your Hand Knows",
      imagePrompt: `A cheerful cartoon hand character with a smile, clapping to a beat. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A syllable trick", displayDelay: 1500 },
        { sub: "b", tts: "Put your hand under your chin. Each time your chin drops, that is one syllable!", displayText: "Chin drops = syllable", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to count syllables!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RF.1.3d-Q1", "RF.1.3d-Q2", "RF.1.3d-Q3", "RF.1.3d-Q4", "RF.1.3d-Q5"],
});
