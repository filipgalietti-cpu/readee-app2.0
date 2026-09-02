/**
 * PLACEMENT BANK - band 5 (the ceiling list, 5th-grade words).
 * Exists so an above-level 4th grader has somewhere to climb; nobody is placed
 * at band 5. Words: harder multisyllabic academic words a strong 4th grader
 * might still read. Passage: a topic a 4th grader can follow, with 5th-grade
 * vocabulary, 60-second cold read. Original text, reserved for the placement
 * exam only.
 */
import type { BandBank } from "@/lib/placement/bank";

export const G5_CEILING_BANK: BandBank = {
  band: 5,
  words: [
    { word: "adventure", pattern: "three-syllable" },
    { word: "develop", pattern: "three-syllable" },
    { word: "population", pattern: "four-syllable" },
    { word: "discovery", pattern: "four-syllable" },
    { word: "responsible", pattern: "suffix-ible" },
    { word: "mysterious", pattern: "suffix-ous" },
    { word: "independent", pattern: "g4-morphology" },
    { word: "communicate", pattern: "g4-morphology" },
    { word: "atmosphere", pattern: "greek-roots" },
    { word: "immediately", pattern: "five-syllable" },
  ],
  passage: {
    id: "g5-passage",
    title: "Lee's Bridge",
    text: `Lee wanted to build a bridge. Not a real one, of course. His school was holding a bridge building contest, and every entry had to be made from craft sticks and glue. The bridge that supported the most weight would win.

Lee began with research. He discovered that engineers rely on triangles because a triangle cannot change its shape without breaking. A square, on the other hand, will lean and collapse when it is pushed from the side.

His first design was a simple flat bridge. It held two books before it snapped in half. Lee was disappointed, but he examined the broken pieces and noticed that the sticks had bent where they were joined end to end.

For his second attempt, he constructed two long trusses, each made of triangles, and connected them with crossbeams. The structure looked awkward, but it was surprisingly sturdy.

On the day of the contest, the judges stacked books on top one by one. Lee's bridge creaked and trembled, but it held eleven books before it finally gave way.

Lee did not win. A girl named Rosa had built a bridge that held fifteen books. Instead of feeling jealous, Lee asked her how she had done it. Rosa showed him how she had doubled the sticks at the points where the weight pressed hardest.

Lee walked home with a notebook full of sketches. He was already imagining a bridge with double trusses and reinforced joints. Next year, he decided, he would need a great many more books.`,
    questions: [
      {
        id: "g5-q1",
        kind: "literal",
        prompt: "Which shape did Lee learn that engineers rely on?",
        options: [
          { id: "a", label: "Squares" },
          { id: "b", label: "Triangles" },
          { id: "c", label: "Circles" },
          { id: "d", label: "Crossbeams" },
        ],
        correctId: "b",
      },
      {
        id: "g5-q2",
        kind: "literal",
        prompt: "How many books did Lee's bridge hold at the contest?",
        options: [
          { id: "a", label: "Two" },
          { id: "b", label: "Fifteen" },
          { id: "c", label: "Twenty" },
          { id: "d", label: "Eleven" },
        ],
        correctId: "d",
      },
      {
        id: "g5-q3",
        kind: "inferential",
        prompt: "Why did Lee ask Rosa how she had built her bridge?",
        options: [
          { id: "a", label: "He was angry about losing" },
          { id: "b", label: "To trade bridges with her" },
          { id: "c", label: "To learn from her" },
          { id: "d", label: "To borrow her books" },
        ],
        correctId: "c",
      },
    ],
  },
};
