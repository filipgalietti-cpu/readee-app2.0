#!/usr/bin/env node
/** L.1.5a — Sorting Words Into Groups (categories) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "L.1.5a",
  grade: "1st Grade",
  domain: "Language",
  title: "Sorting Words Into Groups",
  slides: [
    {
      type: "intro",
      heading: "Word Groups",
      imagePrompt: `A cheerful cartoon child organizing colorful toy animals into three friendly wooden bins, smiling proudly. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Many words belong to the same group.", displayText: "Words in groups", displayDelay: 2000 },
        { sub: "b", tts: "A group is a name for things that go together.", displayText: "Groups = go together", displayDelay: 2500 },
        { sub: "c", tts: "Let us sort some words!", displayText: "Let us sort", displayDelay: 1800 },
      ],
    },
    {
      type: "teach",
      heading: "Animals",
      imagePrompt: `Four cheerful cartoon animals in a friendly row, a cat, a dog, a goldfish, and a little songbird, each with big friendly eyes. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen. Cat. Dog. Fish. Bird.", displayText: "Cat, dog, fish, bird", displayDelay: 2500 },
        { sub: "b", tts: "What do they have in common?", displayText: "What is the same?", displayDelay: 2200 },
        { sub: "c", tts: "They are all animals! That is the group.", displayText: "Group: animals", displayDelay: 2500 },
      ],
    },
    {
      type: "example",
      heading: "Fruits",
      imagePrompt: `Four cheerful cartoon fruits in a row, a red apple, a banana, an orange, and a bunch of grapes, each with tiny smiling faces. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Apple. Banana. Orange. Grape.", displayText: "Apple, banana, orange, grape", displayDelay: 2500 },
        { sub: "b", tts: "What group? Fruits!", displayText: "Group: fruits", displayDelay: 2000 },
      ],
    },
    {
      type: "tip",
      heading: "Find What Is the Same",
      imagePrompt: `A cheerful cartoon owl with glasses pointing at three matching colorful shapes. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A grouping trick", displayDelay: 1500 },
        { sub: "b", tts: "Ask, what do these words all have in common? That is their group!", displayText: "What is in common?", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to sort words into groups!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["L.1.5a-Q1", "L.1.5a-Q2", "L.1.5a-Q3", "L.1.5a-Q4"],
});
