/**
 * PLACEMENT BANK - band 0 (kindergarten).
 * Ten words, easiest first: CVC short-vowel words across all five vowels plus
 * three Fry 1-25 sight words. K has no passage; K children get the listening
 * story in foundations.ts instead. Reserved for the placement exam only.
 */
import type { BandBank } from "@/lib/placement/bank";

export const K_BANK: BandBank = {
  band: 0,
  words: [
    { word: "cat", pattern: "k-cvc-a" },
    { word: "the", pattern: "sight" },
    { word: "pig", pattern: "k-cvc-i" },
    { word: "hot", pattern: "k-cvc-o" },
    { word: "and", pattern: "sight" },
    { word: "bug", pattern: "k-cvc-u" },
    { word: "ten", pattern: "k-cvc-e" },
    { word: "jam", pattern: "k-cvc-a" },
    { word: "leg", pattern: "k-cvc-e" },
    { word: "you", pattern: "sight" },
  ],
  passage: null,
};
