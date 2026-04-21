#!/usr/bin/env node
/** L.1.4b — Word Beginnings and Endings (affixes) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "L.1.4b",
  grade: "1st Grade",
  domain: "Language",
  title: "Word Beginnings and Endings",
  slides: [
    {
      type: "intro",
      heading: "Little Word Parts",
      imagePrompt: `A cheerful cartoon child holding three colorful word-tile pieces like puzzle blocks, smiling as they fit together. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Little word parts can change what a word means.", displayText: "Little parts, big change", displayDelay: 2500 },
        { sub: "b", tts: "They stick on the beginning or the end.", displayText: "Front or back", displayDelay: 2000 },
        { sub: "c", tts: "Let us meet a few!", displayText: "Meet the parts", displayDelay: 1500 },
      ],
    },
    {
      type: "teach",
      heading: "The ER Ending",
      imagePrompt: `A cheerful cartoon teacher with glasses and a clipboard, smiling warmly in a bright classroom, one small chalkboard nearby. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The ending E R can mean one who does.", displayText: "ER = one who does", displayDelay: 2500 },
        { sub: "b", tts: "Teacher? One who teaches!", displayText: "Teacher = one who teaches", displayDelay: 2500 },
        { sub: "c", tts: "Runner? One who runs!", displayText: "Runner = one who runs", displayDelay: 2500 },
      ],
    },
    {
      type: "teach",
      heading: "The UN Beginning",
      imagePrompt: `A cheerful cartoon happy face character on the left with a line between it and a sad face on the right, connected by a tiny arrow. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The beginning U N means not.", displayText: "UN = not", displayDelay: 2200 },
        { sub: "b", tts: "Unhappy? Not happy!", displayText: "Unhappy = not happy", displayDelay: 2500 },
        { sub: "c", tts: "Unlock? Not locked!", displayText: "Unlock = not locked", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Check the Ends",
      imagePrompt: `A cheerful cartoon magnifying glass character examining a colorful word, zooming in on the ends. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A word-part trick", displayDelay: 1500 },
        { sub: "b", tts: "When you see a long word, look at the ends. The little parts give you meaning!", displayText: "Little parts = clues", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to read word beginnings and endings!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["L.1.4b-Q1", "L.1.4b-Q2"],
});
