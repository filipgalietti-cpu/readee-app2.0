#!/usr/bin/env node
/** RI.1.5 — Parts of a Fact Book (text features) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RI.1.5",
  grade: "1st Grade",
  domain: "Informational",
  title: "Parts of a Fact Book",
  slides: [
    {
      type: "intro",
      heading: "Fact Book Parts",
      imagePrompt: `A cheerful cartoon open fact book with a table of contents on one page and friendly diagrams on the other, colorful bookmarks sticking out. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Fact books are built with special parts to help you find stuff.", displayText: "Special parts", displayDelay: 2200 },
        { sub: "b", tts: "Once you know the parts, finding facts is fast!", displayText: "Find facts fast", displayDelay: 2200 },
        { sub: "c", tts: "Let us meet them!", displayText: "Meet the parts", displayDelay: 1500 },
      ],
    },
    {
      type: "teach",
      heading: "Table of Contents",
      imagePrompt: `A cheerful cartoon open book with a colorful table of contents, each line a different bright color with tiny icons next to them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The table of contents is up front.", displayText: "Table of contents", displayDelay: 2000 },
        { sub: "b", tts: "It lists every chapter and what page it starts on.", displayText: "Chapters + pages", displayDelay: 2500 },
        { sub: "c", tts: "Want chapter three? Look here first!", displayText: "Look here first", displayDelay: 2200 },
      ],
    },
    {
      type: "teach",
      heading: "Headings and Labels",
      imagePrompt: `A cheerful cartoon fact book page with a big colorful heading at the top, a friendly diagram of a butterfly with tiny labeled parts pointed out with arrows. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "A heading is the big words at the top of a page.", displayText: "Heading = big words up top", displayDelay: 2800 },
        { sub: "b", tts: "It tells you what that page is about.", displayText: "Tells you about the page", displayDelay: 2500 },
        { sub: "c", tts: "Labels are little words that point to parts of a picture.", displayText: "Labels point at parts", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "Use the Helpers",
      imagePrompt: `A cheerful cartoon child holding an open fact book and pointing at a colorful heading, looking proud. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A book-parts trick", displayDelay: 1500 },
        { sub: "b", tts: "Before you read, look at the headings and pictures. They tell you what is coming!", displayText: "Peek first!", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to find facts using book parts!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RI.1.5-Q1", "RI.1.5-Q2", "RI.1.5-Q3", "RI.1.5-Q4", "RI.1.5-Q5"],
});
