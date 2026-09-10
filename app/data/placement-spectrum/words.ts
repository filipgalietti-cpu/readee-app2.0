/** Smaller instructional steps assembled from the existing placement banks.
 * Difficulty order is an authored routing policy, not a calibrated scale. */
import type { PlacedBand } from "@/lib/placement/ladder";
export const WORD_STEPS: { grade: PlacedBand; label: string; standard: string; words: string[] }[] = [
  { grade: 0, label: "First letter–sound connections", standard: "RF.K.3", words: ["m", "s", "t", "p", "n", "f"] },
  { grade: 0, label: "Kindergarten words", standard: "RF.K.3", words: ["cat", "pig", "hot", "bug", "ten", "jam"] },
  { grade: 1, label: "Blends and digraphs", standard: "RF.1.3", words: ["ship", "stop", "hand", "chin", "rush", "frog"] },
  { grade: 1, label: "Long vowels and endings", standard: "RF.1.3", words: ["cake", "feet", "ride", "rain", "said", "jumping"] },
  { grade: 2, label: "Vowel patterns", standard: "RF.2.3", words: ["farm", "corn", "coin", "bird", "town", "cloud"] },
  { grade: 2, label: "Two-syllable words", standard: "RF.2.3", words: ["rabbit", "planted", "tiger", "because", "picnic", "sunset"] },
  { grade: 3, label: "Prefixes and suffixes", standard: "RF.3.3", words: ["unhappy", "careful", "quickly", "return", "explain", "complete"] },
  { grade: 3, label: "Longer words and word parts", standard: "RF.3.3", words: ["umbrella", "remember", "several", "vacation", "discovery", "responsible"] },
  { grade: 4, label: "Multisyllabic words and roots", standard: "RF.4.3", words: ["transport", "predict", "enormous", "photograph", "invisible", "remarkable"] },
  { grade: 4, label: "Fourth-grade stretch", standard: "RF.4.3", words: ["information", "experiment", "necessary", "thermometer", "independent", "communicate"] },
];
export const WORD_STEP_MAX = WORD_STEPS.length - 1;
export const wordItemId = (step: number, index: number) => `sp-word-${step}-${index}`;
