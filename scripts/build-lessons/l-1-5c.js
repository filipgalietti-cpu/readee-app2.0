#!/usr/bin/env node
/** L.1.5c — Real-Life Word Connections */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "L.1.5c",
  grade: "1st Grade",
  domain: "Language",
  title: "Real-Life Word Connections",
  slides: [
    {
      type: "intro",
      heading: "Words Live in Real Life",
      imagePrompt: `A cheerful cartoon child curled up on a cozy armchair with a blanket and a warm drink, smiling peacefully. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Words are not just in books. They live all around us!", displayText: "Words are everywhere", displayDelay: 2500 },
        { sub: "b", tts: "Good readers match words with real-life things they know.", displayText: "Match to real life", displayDelay: 2800 },
        { sub: "c", tts: "Let us make some connections!", displayText: "Make connections", displayDelay: 2000 },
      ],
    },
    {
      type: "teach",
      heading: "Cozy",
      imagePrompt: `A cheerful cartoon kitten curled up on a warm fluffy blanket by a softly glowing fireplace, eyes closed with a tiny smile. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The word cozy means warm and comfortable.", displayText: "Cozy = warm + comfy", displayDelay: 2500 },
        { sub: "b", tts: "What is cozy in real life?", displayText: "What is cozy?", displayDelay: 2200 },
        { sub: "c", tts: "A soft blanket. A warm fireplace. A snuggly bed.", displayText: "Blankets, fires, beds", displayDelay: 3000 },
      ],
    },
    {
      type: "example",
      heading: "Chilly",
      imagePrompt: `A cheerful cartoon child wearing a scarf and puffy coat, rubbing their hands together in the snow, breath making a small cloud. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Chilly means a little bit cold.", displayText: "Chilly = a bit cold", displayDelay: 2500 },
        { sub: "b", tts: "What feels chilly?", displayText: "What feels chilly?", displayDelay: 2200 },
        { sub: "c", tts: "Early morning air. A cool breeze. An ice cube!", displayText: "Morning, breeze, ice", displayDelay: 2800 },
      ],
    },
    {
      type: "tip",
      heading: "Picture It",
      imagePrompt: `A cheerful cartoon child with a thought bubble containing three tiny pictures of everyday life. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A real-life trick", displayDelay: 1500 },
        { sub: "b", tts: "When you meet a new word, picture a real thing that matches it!", displayText: "Picture a real thing", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to connect words to real life!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["L.1.5c-Q1", "L.1.5c-Q2", "L.1.5c-Q3", "L.1.5c-Q4", "L.1.5c-Q5"],
});
