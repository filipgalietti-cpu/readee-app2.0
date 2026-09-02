/**
 * PLACEMENT BANK - band 2 (2nd grade).
 * Words: r-controlled vowels, diphthongs oi/ow/ou, two-syllable words (closed
 * and open syllables), an -ed ending, and one Fry 101-300 sight word.
 * Passage: decodable at 2nd grade (adds r-controlled vowels, diphthongs, ew/ow/aw,
 * two-syllable words, -ed/-ing, soft c), 60-second cold read. Original text,
 * reserved for the placement exam only.
 */
import type { BandBank } from "@/lib/placement/bank";

export const G2_BANK: BandBank = {
  band: 2,
  words: [
    { word: "farm", pattern: "g2-r-controlled" },
    { word: "corn", pattern: "g2-r-controlled" },
    { word: "coin", pattern: "g2-diphthongs" },
    { word: "bird", pattern: "g2-r-controlled" },
    { word: "town", pattern: "g2-diphthongs" },
    { word: "cloud", pattern: "g2-diphthongs" },
    { word: "rabbit", pattern: "g3-syllables" },
    { word: "planted", pattern: "g2-suffixes" },
    { word: "tiger", pattern: "g3-syllables" },
    { word: "because", pattern: "sight" },
  ],
  passage: {
    id: "g2-passage",
    title: "Rosa's Seeds",
    text: `Rosa had a cup of seeds. Her grandpa gave them to her. "These sunflower seeds will grow taller than you," he said.

Rosa did not think so. The seeds were tiny and dry. Still, she found a sunny spot by the fence.

She dug six little holes in the dirt. She dropped a seed in each hole and patted the dirt on top. Then she gave them a long drink of water.

Each morning, Rosa ran outside to check. Nothing. She checked after lunch. Still nothing. After a week, she was about to give up.

"Give them time. Seeds are slow," her grandpa said.

On the tenth day, Rosa saw a tiny green sprout. Then two. Then six! She jumped and shouted for her grandpa.

All summer, the sunflowers grew and grew. By the end of summer they were taller than Rosa. They were even taller than her grandpa.

Their big yellow faces turned to follow the sun. A little brown bird came to eat the seeds.

Rosa saved a cup of seeds for next spring.`,
    questions: [
      {
        id: "g2-q1",
        kind: "literal",
        prompt: "How many seeds did Rosa plant?",
        options: [
          { id: "a", label: "Two" },
          { id: "b", label: "Ten" },
          { id: "c", label: "Six" },
        ],
        correctId: "c",
      },
      {
        id: "g2-q2",
        kind: "literal",
        prompt: "Who gave Rosa the seeds?",
        options: [
          { id: "a", label: "Her grandpa" },
          { id: "b", label: "A brown bird" },
          { id: "c", label: "Her teacher" },
        ],
        correctId: "a",
      },
      {
        id: "g2-q3",
        kind: "inferential",
        prompt: "How did Rosa feel when she saw the first sprout?",
        options: [
          { id: "a", label: "Sleepy" },
          { id: "b", label: "Excited" },
          { id: "c", label: "Sad" },
        ],
        correctId: "b",
      },
    ],
  },
};
