#!/usr/bin/env node
/** L.1.5b — Defining Words (category + attribute) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "L.1.5b",
  grade: "1st Grade",
  domain: "Language",
  title: "Defining Words",
  slides: [
    {
      type: "intro",
      heading: "What Is a Dog?",
      imagePrompt: `A cheerful cartoon golden retriever dog with big friendly eyes, smiling and panting, sitting on green grass. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "A good definition tells two things.", displayText: "Two things", displayDelay: 2000 },
        { sub: "b", tts: "What group is it in? And what is special about it?", displayText: "Group + special", displayDelay: 2500 },
        { sub: "c", tts: "Let us try defining a dog.", displayText: "What is a dog?", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "Group + Detail",
      imagePrompt: `A friendly cartoon dog next to a small thought bubble showing other animals, and another bubble showing the dog barking happily. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "A dog is an animal. That is its group.", displayText: "Group: animal", displayDelay: 2500 },
        { sub: "b", tts: "But not every animal is a dog.", displayText: "Not every animal", displayDelay: 2200 },
        { sub: "c", tts: "A dog is an animal that barks and wags its tail. That is special about dogs!", displayText: "Barks, wags tail", displayDelay: 3000 },
      ],
    },
    {
      type: "example",
      heading: "Define an Apple",
      imagePrompt: `A cheerful cartoon shiny red apple with a green leaf, on a small wooden table next to a tiny plate. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "An apple is a fruit. That is the group.", displayText: "Group: fruit", displayDelay: 2500 },
        { sub: "b", tts: "An apple is a fruit that is round and grows on a tree.", displayText: "Round, grows on tree", displayDelay: 2800 },
        { sub: "c", tts: "Now we have a clear definition!", displayText: "Clear definition!", displayDelay: 2200 },
      ],
    },
    {
      type: "tip",
      heading: "Two-Part Definition",
      imagePrompt: `A cheerful cartoon puzzle character with two pieces snapping together, a tiny group icon on one and a special-feature star on the other. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A definition trick", displayDelay: 1500 },
        { sub: "b", tts: "Give the group name, and one special thing. That is a great definition!", displayText: "Group + special", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to define words like a pro!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["L.1.5b-Q1", "L.1.5b-Q2", "L.1.5b-Q3", "L.1.5b-Q4", "L.1.5b-Q5"],
});
