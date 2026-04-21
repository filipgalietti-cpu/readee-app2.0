#!/usr/bin/env node
/** RL.1.7 — Pictures and Stories Together */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RL.1.7",
  grade: "1st Grade",
  domain: "Literature",
  title: "Pictures and Stories Together",
  slides: [
    {
      type: "intro",
      heading: "Pictures Tell Stories Too",
      imagePrompt: `A cheerful cartoon child holding an open picture book with colorful illustrations that seem to leap off the page, small sparkles around the book. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Pictures in a book are not just decoration.", displayText: "Not just decoration", displayDelay: 2200 },
        { sub: "b", tts: "They give us clues about characters, places, and feelings!", displayText: "Pictures give clues", displayDelay: 2500 },
        { sub: "c", tts: "Let us learn what to look for.", displayText: "Look for clues", displayDelay: 1500 },
      ],
    },
    {
      type: "teach",
      heading: "A Happy Face Tells a Lot",
      imagePrompt: `A cheerful cartoon girl with warm brown skin, two pigtails, holding a shiny gold trophy, beaming with a big smile, sparkles around the trophy. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Look at this picture.", displayText: "Look closely", displayDelay: 1500 },
        { sub: "b", tts: "A girl with a big smile, holding a trophy.", displayText: "Big smile + trophy", displayDelay: 2500 },
        { sub: "c", tts: "How does she probably feel? Happy! Proud!", displayText: "Happy! Proud!", displayDelay: 2200 },
        { sub: "d", tts: "The picture told us. We did not even need words.", displayText: "No words needed!", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "Pictures Show the Setting",
      imagePrompt: `A cozy cartoon winter scene with kids in bright puffy coats and hats building a snowman on soft white snow, pine trees nearby. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Pictures also show us where and when.", displayText: "Where and when", displayDelay: 2000 },
        { sub: "b", tts: "Snow on the ground. Kids in coats and hats. What season is it?", displayText: "What season?", displayDelay: 2500 },
        { sub: "c", tts: "Winter! The picture showed us.", displayText: "Winter!", displayDelay: 2000 },
      ],
    },
    {
      type: "tip",
      heading: "Look and Read Together",
      imagePrompt: `A cheerful cartoon child reading a book while their eyes sparkle, two thought clouds above them, one showing words and one showing a picture. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A picture trick", displayDelay: 1500 },
        { sub: "b", tts: "Look at the picture and read the words. Both tell the story together.", displayText: "Look + read", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to practice using pictures as clues!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RL.1.7-Q1", "RL.1.7-Q2", "RL.1.7-Q3", "RL.1.7-Q4", "RL.1.7-Q5"],
});
