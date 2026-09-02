/**
 * PLACEMENT BANK - band 3 (3rd grade).
 * Words: prefixes un- and re-, suffixes -ful, -ly, -tion, vowel patterns inside
 * longer words, three-syllable words, and one Fry 301-500 word.
 * Passage: 3rd-grade decodable (multisyllabic words, common affixes, ie/ew/ui,
 * kn), 60-second cold read. Original text, reserved for the placement exam only.
 */
import type { BandBank } from "@/lib/placement/bank";

export const G3_BANK: BandBank = {
  band: 3,
  words: [
    { word: "unhappy", pattern: "g3-affixes" },
    { word: "careful", pattern: "g3-affixes" },
    { word: "quickly", pattern: "g3-affixes" },
    { word: "return", pattern: "g3-affixes" },
    { word: "explain", pattern: "vowel-team-longer-word" },
    { word: "complete", pattern: "silent-e-longer-word" },
    { word: "umbrella", pattern: "g3-syllables" },
    { word: "remember", pattern: "g3-syllables" },
    { word: "several", pattern: "sight" },
    { word: "vacation", pattern: "g3-affixes" },
  ],
  passage: {
    id: "g3-passage",
    title: "The Lost Mitten",
    text: `Omar had a new pair of mittens. They were bright blue with white stripes. His grandmother had knitted them for the winter.

On the first snowy morning, Omar wore them to school. He built a snowman at recess. He threw snowballs with Lee. He even helped the little ones make snow angels.

When Omar got home, he unzipped his coat. Suddenly he stopped. He had only one mitten. The other one was gone.

Omar felt awful. He looked in his backpack. He looked in every pocket. He looked under the couch. Nothing.

"Think back to where you had both mittens," said his big sister, Kim.

Omar remembered. He had both at recess. He had both on the bus. He had both when he came inside and patted the puppy.

They hurried to the puppy's basket. There, under a soft blanket, was one bright blue mitten. It was a bit wet and a bit chewed, but it was his.

"You are a mitten thief," Omar told the puppy with a grin. The puppy wagged his tail and did not look sorry at all.

Omar hung the mittens by the heater to dry. From then on, he carefully checked for both mittens before he took off his coat.`,
    questions: [
      {
        id: "g3-q1",
        kind: "literal",
        prompt: "Who knitted Omar's mittens?",
        options: [
          { id: "a", label: "His grandmother" },
          { id: "b", label: "His sister Kim" },
          { id: "c", label: "His friend Lee" },
          { id: "d", label: "His mother" },
        ],
        correctId: "a",
      },
      {
        id: "g3-q2",
        kind: "literal",
        prompt: "Where did Omar find the missing mitten?",
        options: [
          { id: "a", label: "In his backpack" },
          { id: "b", label: "Under the couch" },
          { id: "c", label: "In the puppy's basket" },
          { id: "d", label: "On the bus" },
        ],
        correctId: "c",
      },
      {
        id: "g3-q3",
        kind: "inferential",
        prompt: "Why did Omar start checking for both mittens before taking off his coat?",
        options: [
          { id: "a", label: "Because Kim told him to" },
          { id: "b", label: "Because the puppy said so" },
          { id: "c", label: "To dry them faster" },
          { id: "d", label: "To avoid losing one again" },
        ],
        correctId: "d",
      },
    ],
  },
};
