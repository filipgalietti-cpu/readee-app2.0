import type { WarmupDef } from "@/lib/warmup-engine/types";

// Warm-up for same-and-opposite (L.2.5) · recipe: word-catch (rule mode).
// Opposite blast: ONE anchor from the lesson's antonym pair (loud/quiet)
// keeps the rule decidable — catch every word that means the opposite of
// loud. Decoys mix loud-family words with neutral nouns. The voice names
// each catch to pre-teach the word.
// PURE DATA. Audio: scripts/warmup-tts.ts --warmup=opposite-blast

const A = (id: string) => `/audio/warmups-v2/opposite-blast/${id}.mp3`;

export const oppositeBlast: WarmupDef = {
  id: "opposite-blast",
  lessonId: "same-and-opposite",
  title: "Opposite Blast",
  recipe: "word-catch",
  mode: "rule",
  playPrompt: "Catch the opposites of loud!",
  intro: {
    audio: A("intro"),
    script:
      "Opposites sit on opposite ends, like on and off. Today's word is loud. Catch every word that means the opposite of loud. If a word is not an opposite, let it go. Ready? Go!",
    cardText: "loud",
  },
  playSeconds: 45,
  waves: [
    {
      tiles: [
        { word: "quiet", isMatch: true, audio: A("w-quiet") },
        { word: "noisy", isMatch: false },
        { word: "soft", isMatch: true, audio: A("w-soft") },
        { word: "chair", isMatch: false },
        { word: "shout", isMatch: false },
      ],
    },
    {
      tiles: [
        { word: "hushed", isMatch: true, audio: A("w-hushed") },
        { word: "yell", isMatch: false },
        { word: "calm", isMatch: true, audio: A("w-calm") },
        { word: "big", isMatch: false },
        { word: "bed", isMatch: false },
      ],
    },
  ],
  celebrate: {
    audio: A("celebrate"),
    script:
      "Blast off! Quiet, soft, hushed, and calm. Every one means the opposite of loud. You flipped that word all the way around. Let's flip more word pairs in today's lesson.",
  },
  celebrateZero: {
    audio: A("celebrate-zero"),
    script:
      "Good warm up! Opposites can be tricky. Loud flips to quiet, like a light switching off. Watch for opposite pairs in today's lesson. You will catch them.",
  },
  carrots: 2,
};
