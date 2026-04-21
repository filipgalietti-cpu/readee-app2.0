#!/usr/bin/env node
/** RF.1.3g — Tricky Sight Words (irregularly spelled high-frequency words) */
const addMCQs = require("./_mcq");
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

addMCQs({
  standardId: "RF.1.3g",
  grade: "1st Grade",
  domain: "Foundational Skills",
  description: "Recognize and read grade-appropriate irregularly spelled words",
  parentTip: "Some words just can't be sounded out. Memorize 'said', 'was', 'were', 'have'.",
  questions: [
    { type: "multiple_choice", prompt: "The word **said** is tricky. How is it spelled?", choices: ["s-a-i-d", "s-e-d", "s-a-d", "s-i-d"], correct: "s-a-i-d", hint: "Four letters: s-a-i-d. But it sounds like \"sed\"!", difficulty: 1, imagePrompt: `A cheerful cartoon child with a speech bubble above their head, smiling. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Which tricky word means \"in the past\"?", choices: ["was", "is", "now", "do"], correct: "was", hint: "Yesterday I was happy. Was = past!", difficulty: 1, imagePrompt: `A cheerful cartoon calendar page with a tiny yesterday marker and a smile. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "How is the tricky word **have** spelled?", choices: ["h-a-v-e", "h-a-v", "h-a-f", "h-a-p-e"], correct: "h-a-v-e", hint: "Have ends with a silent E!", difficulty: 1, imagePrompt: `A cheerful cartoon child holding a colorful balloon with both hands, smiling proudly. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Which tricky word means \"more than one person was\"?", choices: ["were", "was", "are", "is"], correct: "were", hint: "We were here yesterday. Were = past for many!", difficulty: 2, imagePrompt: `A cheerful cartoon group of three friends standing together smiling. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Why are words like **said** and **have** called tricky?", choices: ["You cannot sound them out", "They have too many letters", "They are very long", "They mean nothing"], correct: "You cannot sound them out", hint: "Tricky words don't follow the usual sound rules. You just memorize them!", difficulty: 2, imagePrompt: `A cheerful cartoon owl wearing glasses and a small graduation cap, pointing to a word tile with a knowing smile. Clean pastel background. ${IMG}` },
  ],
});

build({
  standardId: "RF.1.3g",
  grade: "1st Grade",
  domain: "Foundational Skills",
  title: "Tricky Sight Words",
  slides: [
    {
      type: "intro",
      heading: "Words That Break the Rules",
      imagePrompt: `A cheerful cartoon child holding a colorful word card that has a tiny magical sparkle around it, looking puzzled but curious. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Most words you can sound out. But a few are tricky!", displayText: "Some words are tricky", displayDelay: 2500 },
        { sub: "b", tts: "These words do not follow the usual rules.", displayText: "No rules!", displayDelay: 2000 },
        { sub: "c", tts: "The best way? Memorize them by sight.", displayText: "Memorize them", displayDelay: 2200 },
      ],
    },
    {
      type: "teach",
      heading: "Said",
      imagePrompt: `A cheerful cartoon child with a speech bubble above their head containing a happy face. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Look at this word. Said.", displayText: "said", displayDelay: 2000 },
        { sub: "b", tts: "It is spelled S-A-I-D. But it sounds like sed!", displayDiagram: { letters: [{ text: "s" }, { text: "a" }, { text: "i" }, { text: "d" }], delay: 1800, revealCount: 4 } },
        { sub: "c", tts: "It breaks the rules! So we just memorize it.", displayText: "Just memorize", displayDelay: 2200 },
      ],
    },
    {
      type: "teach",
      heading: "Was, Were, Have",
      imagePrompt: `Three cheerful cartoon word tiles in a friendly row, each with a different color and a tiny smile. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Was. Were. Have.", displayText: "was, were, have", displayDelay: 2500 },
        { sub: "b", tts: "Was sounds like wuz, but it ends in s.", displayText: "was = sounds tricky", displayDelay: 2500 },
        { sub: "c", tts: "Were has a silent E that helps it end in R.", displayText: "were = silent E", displayDelay: 2500 },
        { sub: "d", tts: "Have ends in a silent E too. Tricky words stick together.", displayText: "have = silent E", displayDelay: 2500 },
      ],
    },
    {
      type: "tip",
      heading: "See Them Every Day",
      imagePrompt: `A cheerful cartoon word-flashcard character with a friendly smile, stars sparkling around it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A sight word trick", displayDelay: 1500 },
        { sub: "b", tts: "The more often you see a tricky word, the faster you know it. Flash cards help!", displayText: "Flash them often", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to read tricky sight words!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RF.1.3g-Q1", "RF.1.3g-Q2", "RF.1.3g-Q3", "RF.1.3g-Q4", "RF.1.3g-Q5"],
});
