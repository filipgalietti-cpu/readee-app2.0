/**
 * PLACEMENT BANK - band 1 (1st grade).
 * Words: consonant digraphs, initial and final blends, silent e, the common
 * vowel teams ee and ai, an -ing ending, and one Fry 26-100 sight word.
 * Passage: decodable at 1st grade (CVC, digraphs, blends, silent e, ai, plus
 * Fry 1-100 sight words), 60-second cold read. Original text, reserved for the
 * placement exam only.
 */
import type { BandBank } from "@/lib/placement/bank";

export const G1_BANK: BandBank = {
  band: 1,
  words: [
    { word: "ship", pattern: "g1-digraphs" },
    { word: "stop", pattern: "g1-blends" },
    { word: "cake", pattern: "g1-magic-e" },
    { word: "hand", pattern: "g1-blends" },
    { word: "chin", pattern: "g1-digraphs" },
    { word: "feet", pattern: "g1-vowel-teams" },
    { word: "ride", pattern: "g1-magic-e" },
    { word: "rain", pattern: "g1-vowel-teams" },
    { word: "said", pattern: "sight" },
    { word: "jumping", pattern: "g2-suffixes" },
  ],
  passage: {
    id: "g1-passage",
    title: "Max and the Rain",
    text: `Sam has a pup. The pup is Max. Max is black with one white spot. He likes to run and dig.

One day it rained and rained. Max sat on his rug. He was sad. He did not like the wet.

"We can still play," said Sam. Sam got a big red ball. He hid it in a box.

Max ran to the box. He sniffed and sniffed. Then he dug at the lid with his nose. The lid came off. Max got the ball! He ran back to Sam with it.

Next, Sam hid the ball in his hat. Max got that one too.

Then Sam hid the ball on the top shelf. Max sat and sat. He could not get it. He was not that big.

Sam said, "Jump, Max!" Max did jump. He still did not get it.

At last, Sam got the ball for him. Max was so glad. He gave Sam a big wet kiss.

Then the sun came back. Sam and Max ran to play in the mud.`,
    questions: [
      {
        id: "g1-q1",
        kind: "literal",
        prompt: "What color is the spot on Max?",
        options: [
          { id: "a", label: "Black" },
          { id: "b", label: "White" },
          { id: "c", label: "Red" },
        ],
        correctId: "b",
      },
      {
        id: "g1-q2",
        kind: "literal",
        prompt: "Where did Sam hide the ball first?",
        options: [
          { id: "a", label: "In a box" },
          { id: "b", label: "In his hat" },
          { id: "c", label: "On the shelf" },
        ],
        correctId: "a",
      },
      {
        id: "g1-q3",
        kind: "inferential",
        prompt: "Why did Max sniff at the box?",
        options: [
          { id: "a", label: "To take a nap" },
          { id: "b", label: "To eat a snack" },
          { id: "c", label: "To find the ball" },
        ],
        correctId: "c",
      },
    ],
  },
};
