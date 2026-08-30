import type { WarmupDef } from "@/lib/warmup-engine/types";

// Warm-up for heart-words (RF.2.3f) · recipe: word-catch (rule mode).
// Sight-word dash: the lesson's seven heart words hide among regular
// decodable decoys, and the round gently SPEEDS UP as it goes (speedRamp).
// The voice names each catch to pre-teach the word by ear.
// PURE DATA. Audio: scripts/warmup-tts.ts --warmup=snap-word-dash

const A = (id: string) => `/audio/warmups-v2/snap-word-dash/${id}.mp3`;

export const snapWordDash: WarmupDef = {
  id: "snap-word-dash",
  lessonId: "heart-words",
  title: "Snap Word Dash",
  recipe: "word-catch",
  mode: "rule",
  playPrompt: "Catch the heart words!",
  intro: {
    audio: A("intro"),
    script:
      "Heart words are words you know by heart, like friend, people, and once. Today they are hiding in the garden. Catch every heart word you see. Careful, they speed up! Ready? Go!",
    cardText: "Heart Words",
  },
  playSeconds: 45,
  speedRamp: true,
  waves: [
    {
      tiles: [
        { word: "friend", isMatch: true, audio: A("w-friend") },
        { word: "jump", isMatch: false },
        { word: "people", isMatch: true, audio: A("w-people") },
        { word: "stop", isMatch: false },
        { word: "once", isMatch: true, audio: A("w-once") },
      ],
    },
    {
      tiles: [
        { word: "enough", isMatch: true, audio: A("w-enough") },
        { word: "hand", isMatch: false },
        { word: "busy", isMatch: true, audio: A("w-busy") },
        { word: "best", isMatch: false },
      ],
    },
    {
      tiles: [
        { word: "again", isMatch: true, audio: A("w-again") },
        { word: "plant", isMatch: false },
        { word: "pretty", isMatch: true, audio: A("w-pretty") },
        { word: "swim", isMatch: false },
      ],
    },
  ],
  celebrate: {
    audio: A("celebrate"),
    script:
      "Snap! You caught those heart words at top speed. Friend, people, again, and more. You know them by heart, and that is exactly how readers read them. Now let's meet them in today's lesson.",
  },
  celebrateZero: {
    audio: A("celebrate-zero"),
    script:
      "Good warm up! Heart words move fast. You will meet friend, people, and once again in today's lesson, nice and slow this time.",
  },
  carrots: 2,
};
