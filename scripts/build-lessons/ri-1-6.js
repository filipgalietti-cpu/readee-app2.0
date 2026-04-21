#!/usr/bin/env node
/** RI.1.6 — Pictures vs Words (what each gives us) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RI.1.6",
  grade: "1st Grade",
  domain: "Informational",
  title: "Pictures vs Words",
  slides: [
    {
      type: "intro",
      heading: "Two Kinds of Clues",
      imagePrompt: `A cheerful cartoon child looking at an open fact book, with one speech bubble showing a tiny photo and another showing tiny words. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Fact books give us two kinds of clues.", displayText: "Two kinds of clues", displayDelay: 2200 },
        { sub: "b", tts: "The words tell us facts.", displayText: "Words = facts", displayDelay: 2000 },
        { sub: "c", tts: "The pictures show us how it looks.", displayText: "Pictures = how it looks", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "Words Tell, Pictures Show",
      imagePrompt: `A cheerful cartoon red ladybug with black spots sitting on a bright green leaf, smiling. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen. The text says ladybugs are small insects.", displayText: "Words: small insect", displayDelay: 2500 },
        { sub: "b", tts: "The picture shows a ladybug on a green leaf.", displayText: "Picture: red, black spots, leaf", displayDelay: 3000 },
        { sub: "c", tts: "The picture shows us the colors, size, and shape. The words told us what kind of bug.", displayText: "Both together = whole story", displayDelay: 3000 },
      ],
    },
    {
      type: "teach",
      heading: "What Only Pictures Can Show",
      imagePrompt: `A cheerful cartoon giraffe with bright yellow fur and brown spots, smiling with a long neck reaching for a leaf. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Some things are hard to tell in words.", displayText: "Hard in words", displayDelay: 2000 },
        { sub: "b", tts: "The exact color of an animal.", displayText: "Exact colors", displayDelay: 2000 },
        { sub: "c", tts: "The shape of its spots. How tall it is.", displayText: "Shape, size", displayDelay: 2500 },
        { sub: "d", tts: "Pictures show us those right away!", displayText: "Pictures show it fast", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Use Both",
      imagePrompt: `A cheerful cartoon child with a smiling face looking at an open fact book, eyes sparkling, two tiny thought bubbles over their head, one with words, one with a picture. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A fact-book trick", displayDelay: 1500 },
        { sub: "b", tts: "Read the words and look at the pictures. Together, they give you the whole story.", displayText: "Read + look", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to use both pictures and words!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RI.1.6-Q1", "RI.1.6-Q2", "RI.1.6-Q3", "RI.1.6-Q4", "RI.1.6-Q5"],
});
