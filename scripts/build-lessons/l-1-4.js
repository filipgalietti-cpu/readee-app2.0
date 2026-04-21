#!/usr/bin/env node
/** L.1.4 — Word Meaning Detective (multiple-meaning words) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "L.1.4",
  grade: "1st Grade",
  domain: "Language",
  title: "Word Meaning Detective",
  slides: [
    {
      type: "intro",
      heading: "One Word, Two Meanings",
      imagePrompt: `A cheerful cartoon baseball bat standing next to a tiny friendly cartoon bat animal with big eyes, both smiling at each other. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Some words have more than one meaning!", displayText: "One word, two meanings", displayDelay: 2200 },
        { sub: "b", tts: "The word bat can be a baseball bat, or a little flying animal.", displayText: "Bat = two things", displayDelay: 2800 },
        { sub: "c", tts: "Let us learn how to tell which meaning fits.", displayText: "Which one?", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "The Sentence Helps",
      imagePrompt: `A cheerful cartoon child swinging a baseball bat on a sunny day in a green park, smiling brightly. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Read the whole sentence. It gives you a clue.", displayText: "Read the whole sentence", displayDelay: 2500 },
        { sub: "b", tts: "The boy swung the bat at the ball.", displayText: "The boy swung the bat...", displayDelay: 2500 },
        { sub: "c", tts: "Which bat? The baseball bat!", displayText: "Baseball bat!", displayDelay: 2200 },
      ],
    },
    {
      type: "example",
      heading: "Try Another",
      imagePrompt: `A cheerful cartoon small brown bat animal flying under a friendly full moon, stars twinkling around it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen. The bat flew out of the cave at night.", displayText: "The bat flew...", displayDelay: 2500 },
        { sub: "b", tts: "Did a baseball bat fly? No!", displayText: "Baseball bat? No", displayDelay: 2500 },
        { sub: "c", tts: "This bat is the flying animal. The sentence gave us the clue.", displayText: "Animal bat!", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Be a Word Detective",
      imagePrompt: `A cheerful cartoon detective child with a magnifying glass looking at an open book, tiny question mark above their head. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A word trick", displayDelay: 1500 },
        { sub: "b", tts: "When a word could mean two things, read the whole sentence for clues.", displayText: "Read for clues", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to be a word meaning detective!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["L.1.4-Q1", "L.1.4-Q2"],
});
