/**
 * PLACEMENT BANK - foundations stage (K-1, or older children whose word lists
 * land at K). Letter sounds by tap, blending by tap, nonsense words by voice,
 * and the listening story that stands in for the K passage.
 *
 * `sound` and `sounds` are PHONEME AUDIO IDS from scripts/phoneme-database.json
 * (the 45 clips already live at audio/phonemes/{id}.mp3), so Luna plays the
 * existing clip and no new phoneme audio is needed. Consonant ids are the
 * letter itself; short vowels are short_a, short_e, short_i, short_o, short_u.
 * Modeled on the CORE Phonics Survey and DIBELS NWF. Reserved for the
 * placement exam only.
 */
import type { FoundationsBank } from "@/lib/placement/bank";

export const FOUNDATIONS: FoundationsBank = {
  letterSounds: [
    { id: "ls-1", sound: "m", letters: ["m", "s", "t", "b"], correct: "m" },
    { id: "ls-2", sound: "s", letters: ["t", "s", "z", "p"], correct: "s" },
    { id: "ls-3", sound: "t", letters: ["t", "d", "f", "m"], correct: "t" },
    { id: "ls-4", sound: "p", letters: ["b", "p", "s", "n"], correct: "p" },
    { id: "ls-5", sound: "n", letters: ["m", "t", "n", "s"], correct: "n" },
    { id: "ls-6", sound: "f", letters: ["f", "v", "p", "t"], correct: "f" },
    { id: "ls-7", sound: "short_a", letters: ["o", "a", "e", "m"], correct: "a" },
    { id: "ls-8", sound: "short_o", letters: ["a", "u", "o", "p"], correct: "o" },
  ],
  blending: [
    { id: "bl-1", sounds: ["short_a", "t"], options: ["at", "it", "an"], correct: "at" },
    { id: "bl-2", sounds: ["m", "short_a", "p"], options: ["map", "mop", "mat"], correct: "map" },
    { id: "bl-3", sounds: ["s", "short_i", "t"], options: ["sat", "sit", "six"], correct: "sit" },
    { id: "bl-4", sounds: ["t", "short_o", "p"], options: ["tap", "tip", "top"], correct: "top" },
    { id: "bl-5", sounds: ["n", "short_u", "t"], options: ["net", "nut", "not"], correct: "nut" },
    { id: "bl-6", sounds: ["f", "short_e", "d"], options: ["fed", "bed", "fun"], correct: "fed" },
  ],
  nonsenseWords: ["vop", "pem", "zab", "mub", "plig", "snad"],
  listening: {
    text: `Ben had a red kite. It was a windy day, so Ben took his kite to the park. He ran and ran. The kite went up, up, up. Then the string slipped out of his hand. The kite flew into a tall tree. Ben was sad. A big girl saw him. She climbed the tree and got the kite down. Ben said thank you. Then he held the string very tight.`,
    questions: [
      {
        id: "k-listen-q1",
        kind: "literal",
        prompt: "Where did the kite go?",
        options: [
          { id: "a", label: "Into a tall tree" },
          { id: "b", label: "Into a pond" },
          { id: "c", label: "Into a bush" },
        ],
        correctId: "a",
      },
      {
        id: "k-listen-q2",
        kind: "inferential",
        prompt: "Why did Ben hold the string very tight at the end?",
        options: [
          { id: "a", label: "To climb the tree" },
          { id: "b", label: "To keep the kite safe" },
          { id: "c", label: "To go home fast" },
        ],
        correctId: "b",
      },
    ],
  },
};
