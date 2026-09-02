/**
 * PLACEMENT BANK - band 4 (4th grade).
 * Words: Latin and Greek roots, -ible/-able, -ous, four-syllable words, and
 * academic vocabulary.
 * Passage: 4th-grade text (academic vocabulary, -tion, four-syllable words,
 * longer sentences), 60-second cold read. Original text, reserved for the
 * placement exam only.
 */
import type { BandBank } from "@/lib/placement/bank";

export const G4_BANK: BandBank = {
  band: 4,
  words: [
    { word: "transport", pattern: "g4-morphology" },
    { word: "predict", pattern: "g4-morphology" },
    { word: "enormous", pattern: "suffix-ous" },
    { word: "photograph", pattern: "greek-roots" },
    { word: "invisible", pattern: "g4-morphology" },
    { word: "remarkable", pattern: "suffix-able" },
    { word: "information", pattern: "four-syllable" },
    { word: "experiment", pattern: "academic-vocabulary" },
    { word: "necessary", pattern: "academic-vocabulary" },
    { word: "thermometer", pattern: "greek-roots" },
  ],
  passage: {
    id: "g4-passage",
    title: "Nia and the Bean Plants",
    text: `Nia loved asking questions. She loved finding the answers even more.

When her class announced a science fair, Nia knew exactly what to do. She wanted to find out whether bean plants grow faster in sunlight or under a lamp.

First, she made a prediction. She predicted that the sunny window would win. Then she planted six beans in six identical cups. She placed three cups on the windowsill and three under a desk lamp. She gave every cup the same amount of water each morning.

For two weeks, Nia observed the plants carefully. She measured each sprout with a ruler and recorded the information in a notebook. Her brother Ben helped her make a chart.

The results surprised her. The plants under the lamp grew taller, but they were pale and thin. The plants in the window were shorter, but their leaves were dark green and strong.

Nia was confused at first. Then she remembered something from her reading. Plants stretch toward light when they do not get enough of it. The lamp plants were not healthier. They were reaching.

At the fair, a judge asked Nia what she had learned. "My prediction was wrong, and that was the most interesting part," she said. The judge smiled and wrote something on her clipboard.

Nia did not win a ribbon that year. She did not mind. She was already planning her next experiment.`,
    questions: [
      {
        id: "g4-q1",
        kind: "literal",
        prompt: "Which plants did Nia predict would grow faster?",
        options: [
          { id: "a", label: "The plants under the lamp" },
          { id: "b", label: "The plants in the dark" },
          { id: "c", label: "The plants with no water" },
          { id: "d", label: "The plants in the window" },
        ],
        correctId: "d",
      },
      {
        id: "g4-q2",
        kind: "literal",
        prompt: "How long did Nia observe the plants?",
        options: [
          { id: "a", label: "Six days" },
          { id: "b", label: "Two weeks" },
          { id: "c", label: "Three months" },
          { id: "d", label: "One year" },
        ],
        correctId: "b",
      },
      {
        id: "g4-q3",
        kind: "inferential",
        prompt: "Why were the plants under the lamp pale and thin?",
        options: [
          { id: "a", label: "They needed more light" },
          { id: "b", label: "They got too much water" },
          { id: "c", label: "Ben forgot to measure them" },
          { id: "d", label: "Their cups were too small" },
        ],
        correctId: "a",
      },
    ],
  },
};
