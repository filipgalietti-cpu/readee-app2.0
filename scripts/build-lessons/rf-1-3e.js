#!/usr/bin/env node
/** RF.1.3e — Two-Syllable Words */
const addMCQs = require("./_mcq");
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

addMCQs({
  standardId: "RF.1.3e",
  grade: "1st Grade",
  domain: "Foundational Skills",
  description: "Decode two-syllable words following basic patterns by breaking the words into syllables",
  parentTip: "Split longer words between the two middle consonants: nap-kin, ham-ster.",
  questions: [
    { type: "multiple_choice", prompt: "How do you break **napkin** into syllables?", choices: ["nap-kin", "nap-ki-n", "na-pkin", "nap-k-in"], correct: "nap-kin", hint: "Split between the two middle consonants.", difficulty: 1, imagePrompt: `A cheerful cartoon folded white napkin on a small wooden table with a tiny smile. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "How do you break **rabbit** into syllables?", choices: ["rab-bit", "ra-bbit", "rabb-it", "rabbi-t"], correct: "rab-bit", hint: "Split between the two B's.", difficulty: 1, imagePrompt: `A cheerful cartoon white rabbit with pink ears, smiling. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Read each syllable separately: **pen-cil**. What word is this?", choices: ["pencil", "pencel", "penzil", "pansil"], correct: "pencil", hint: "Put the two syllables together!", difficulty: 1, imagePrompt: `A cheerful cartoon yellow pencil with a pink eraser, smiling with a happy face. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Which word has two syllables?", choices: ["mitten", "cat", "dog", "fish"], correct: "mitten", hint: "Clap it out! Mit-ten has two beats.", difficulty: 2, imagePrompt: `A pair of cheerful cartoon red mittens with tiny snowflakes around them. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Break the word **basket** into syllables.", choices: ["bas-ket", "ba-sket", "bask-et", "basket-"], correct: "bas-ket", hint: "Split between the S and K.", difficulty: 2, imagePrompt: `A cheerful cartoon wicker basket full of apples, a tiny ribbon on the handle. Clean pastel background. ${IMG}` },
  ],
});

build({
  standardId: "RF.1.3e",
  grade: "1st Grade",
  domain: "Foundational Skills",
  title: "Two-Syllable Words",
  slides: [
    {
      type: "intro",
      heading: "Bigger Words, Two Beats",
      imagePrompt: `A cheerful cartoon child looking at a long word on a card, two clap emojis around them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Some words have two beats. Two syllables.", displayText: "Two beats!", displayDelay: 2000 },
        { sub: "b", tts: "Long words can feel tricky. But we can split them into smaller pieces.", displayText: "Split them up", displayDelay: 2500 },
        { sub: "c", tts: "Then read each piece!", displayText: "Piece by piece", displayDelay: 1800 },
      ],
    },
    {
      type: "teach",
      heading: "Split Between the Letters",
      imagePrompt: `A cheerful cartoon pair of scissors cutting right between two letters on a word tile, tiny sparkles where it cuts. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "If there are two of the same consonants in the middle, split between them.", displayText: "Split the middle", displayDelay: 2800 },
        { sub: "b", tts: "Rabbit becomes rab and bit.", displayText: "rab | bit", displayDelay: 2500 },
        { sub: "c", tts: "Napkin becomes nap and kin.", displayText: "nap | kin", displayDelay: 2500 },
      ],
    },
    {
      type: "example",
      heading: "Read PENCIL",
      imagePrompt: `A cheerful cartoon yellow pencil with a smiling face, upright on a table. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Let us read pencil together.", displayText: "pencil", displayDelay: 1500 },
        { sub: "b", tts: "Split. Pen and cil.", displayText: "pen | cil", displayDelay: 2200 },
        { sub: "c", tts: "Read each piece. Pen. Cil.", displayText: "pen | cil", displayDelay: 2500 },
        { sub: "d", tts: "Now blend. Pencil!", displayText: "pencil!", displayDelay: 2200 },
      ],
    },
    {
      type: "tip",
      heading: "Two Pieces, One Word",
      imagePrompt: `Two cheerful cartoon puzzle pieces fitting together, with a word tile forming from them, tiny sparkles in the middle. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A two-syllable trick", displayDelay: 1500 },
        { sub: "b", tts: "Split the word. Read each piece. Then blend them back together!", displayText: "Split, read, blend", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to read two-syllable words!", displayText: "You got it!", displayDelay: 1500 },
      ],
    },
  ],
  mcqIds: ["RF.1.3e-Q1", "RF.1.3e-Q2", "RF.1.3e-Q3", "RF.1.3e-Q4", "RF.1.3e-Q5"],
});
