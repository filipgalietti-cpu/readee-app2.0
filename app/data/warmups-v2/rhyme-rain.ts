import type { WarmupDef } from "@/lib/warmup-engine/types";

// Warm-up for rhyme-time (RF.K.2a) · recipe: sound-hunt (rule mode, sky skin).
// Rhyme rain: -at family rhymes drift down as balloons among non-rhyming
// K-decodable decoys pulled from the lesson's own word set. The voice names
// each catch so the ear hears the shared ending.
// PURE DATA. Audio: scripts/warmup-tts.ts --warmup=rhyme-rain

const A = (id: string) => `/audio/warmups-v2/rhyme-rain/${id}.mp3`;

export const rhymeRain: WarmupDef = {
  id: "rhyme-rain",
  lessonId: "rhyme-time",
  title: "Rhyme Rain",
  recipe: "sound-hunt",
  mode: "rule",
  playPrompt: "Catch everything that rhymes with cat!",
  intro: {
    audio: A("intro"),
    script:
      "Rhyming words sound the same at the end, like cat and hat. Word balloons are floating down. Catch every word that rhymes with cat. Ready? Go!",
    cardText: "cat",
  },
  playSeconds: 45,
  waves: [
    {
      tiles: [
        { word: "hat", isMatch: true, audio: A("w-hat") },
        { word: "dog", isMatch: false },
        { word: "bat", isMatch: true, audio: A("w-bat") },
        { word: "sun", isMatch: false },
      ],
    },
    {
      tiles: [
        { word: "mat", isMatch: true, audio: A("w-mat") },
        { word: "cup", isMatch: false },
        { word: "sat", isMatch: true, audio: A("w-sat") },
        { word: "pig", isMatch: false },
      ],
    },
    {
      tiles: [
        { word: "rat", isMatch: true, audio: A("w-rat") },
        { word: "bug", isMatch: false },
        { word: "pat", isMatch: true, audio: A("w-pat") },
        { word: "pen", isMatch: false },
      ],
    },
  ],
  celebrate: {
    audio: A("celebrate"),
    script:
      "Hat, bat, mat, sat! You caught the rhymes. Rhyming words sound the same at the end, just like cat. Now let's make even more rhymes in today's lesson.",
  },
  celebrateZero: {
    audio: A("celebrate-zero"),
    script:
      "Good warm up! Rhymes can be sneaky. Listen for words that end like cat, like hat and bat, in today's lesson. Your ears will catch them, I know it.",
  },
  carrots: 2,
};
