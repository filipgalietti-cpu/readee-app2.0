#!/usr/bin/env node
/** RI.1.9 — Comparing Two Fact Books */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RI.1.9",
  grade: "1st Grade",
  domain: "Informational",
  title: "Comparing Two Fact Books",
  slides: [
    {
      type: "intro",
      heading: "Two Books, One Topic",
      imagePrompt: `Two cheerful cartoon open fact books sitting side by side, each with friendly diagrams, a tiny bridge of arrows between them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Two books can be about the same topic.", displayText: "Same topic", displayDelay: 2000 },
        { sub: "b", tts: "But they might share different facts!", displayText: "Different facts", displayDelay: 2000 },
        { sub: "c", tts: "Let us learn how to compare them.", displayText: "Let us compare", displayDelay: 1800 },
      ],
    },
    {
      type: "teach",
      heading: "Dogs in Two Books",
      imagePrompt: `A cheerful cartoon dog jogging happily on a leash held by a smiling child, a sunny park scene with a small ball nearby. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Book one says: dogs need walks.", displayText: "Book 1: walks", displayDelay: 2000 },
        { sub: "b", tts: "Book two says: dogs need exercise.", displayText: "Book 2: exercise", displayDelay: 2000 },
        { sub: "c", tts: "These books agree! Walks are one kind of exercise.", displayText: "They agree!", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "Two Books on the Sun",
      imagePrompt: `A cheerful cartoon smiling yellow sun shining brightly over a tiny Earth, soft rays of light extending outward. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Book one says: the sun is hot.", displayText: "Book 1: hot", displayDelay: 2000 },
        { sub: "b", tts: "Book two says: the sun gives Earth light.", displayText: "Book 2: gives light", displayDelay: 2200 },
        { sub: "c", tts: "Both books are about the sun!", displayText: "Same topic: sun", displayDelay: 2200 },
        { sub: "d", tts: "Together, we learn even more.", displayText: "Together = more info", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Same Topic, More Info",
      imagePrompt: `A friendly cartoon Venn diagram with two overlapping circles, tiny happy faces inside each, and a tiny star in the middle overlap. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A comparing trick", displayDelay: 1500 },
        { sub: "b", tts: "Reading two books on the same topic gives you more facts than just one!", displayText: "Two books = more facts", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to compare fact books!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RI.1.9-Q1", "RI.1.9-Q2", "RI.1.9-Q3", "RI.1.9-Q4", "RI.1.9-Q5"],
});
