#!/usr/bin/env node
/** RL.1.6 — Who's Telling the Story? (narrator / point of view) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RL.1.6",
  grade: "1st Grade",
  domain: "Literature",
  title: "Who's Telling the Story",
  slides: [
    {
      type: "intro",
      heading: "Who Is the Storyteller?",
      imagePrompt: `A cheerful cartoon child sitting in a small armchair, holding an open book, talking to an imaginary audience with friendly gestures. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Every story has a storyteller.", displayText: "Every story has one", displayDelay: 2000 },
        { sub: "b", tts: "Sometimes it is a character in the story. Sometimes it is a voice outside.", displayText: "Inside or outside?", displayDelay: 2800 },
        { sub: "c", tts: "Let us learn how to tell!", displayText: "How to tell", displayDelay: 1500 },
      ],
    },
    {
      type: "teach",
      heading: "The I Clue",
      imagePrompt: `A cheerful cartoon child pointing to themselves with a big smile, a tiny speech bubble containing a friendly capital I next to them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "If the story uses the word I, a character is telling it.", displayText: "I = character tells", displayDelay: 2500 },
        { sub: "b", tts: "Listen. I went to the store with my mom.", displayText: "I went to the store...", displayDelay: 2200 },
        { sub: "c", tts: "The person saying I is the one telling the story. We call that first person.", displayText: "First person", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "The He She They Clue",
      imagePrompt: `A cheerful cartoon narrator character in a small director's chair, gesturing at two cartoon characters in the distance, a friendly boy and a friendly girl playing together. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "If the story uses he, she, or they, a voice outside is telling it.", displayText: "He / she / they", displayDelay: 2500 },
        { sub: "b", tts: "Listen. Sam ran to the park. He played on the swings.", displayText: "Sam ran. He played.", displayDelay: 2500 },
        { sub: "c", tts: "Someone is watching Sam and telling us. That is the narrator.", displayText: "A narrator", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Listen for the Clue",
      imagePrompt: `A cheerful cartoon owl with one wing cupped to its ear, listening carefully, with a tiny word bubble showing a capital I nearby. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A storyteller trick", displayDelay: 1500 },
        { sub: "b", tts: "Look at the first sentence. Does it say I, or does it say he, she, or they?", displayText: "Look at the words!", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to spot the storyteller!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RL.1.6-Q1", "RL.1.6-Q2", "RL.1.6-Q3", "RL.1.6-Q4", "RL.1.6-Q5"],
});
