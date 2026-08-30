import type { WarmupDef } from "@/lib/warmup-engine/types";

// Warm-up for tricky-sound-switchers (RF.2.3e) · recipe: sound-hunt (rule mode).
// PURE DATA. Audio: scripts/warmup-tts.ts --warmup=sound-switch-hunt

const A = (id: string) => `/audio/warmups-v2/sound-switch-hunt/${id}.mp3`;

export const soundSwitchHunt: WarmupDef = {
  id: "sound-switch-hunt",
  lessonId: "tricky-sound-switchers",
  title: "Sound Switch Hunt",
  recipe: "sound-hunt",
  mode: "rule",
  playPrompt: "Pop the words that sound like cow!",
  intro: {
    audio: A("intro"),
    script:
      "Today's letters are o w. Sometimes o w sounds like it does in snow. Sometimes it sounds like it does in cow. Your job: pop every word where o w sounds like cow. Ready? Go!",
    cardText: "ow",
  },
  playSeconds: 45,
  waves: [
    {
      tiles: [
        { word: "gown", isMatch: true },
        { word: "snow", isMatch: false },
        { word: "now", isMatch: true },
        { word: "grow", isMatch: false },
      ],
    },
    {
      tiles: [
        { word: "town", isMatch: true },
        { word: "show", isMatch: false },
        { word: "owl", isMatch: true },
        { word: "slow", isMatch: false },
      ],
    },
    {
      tiles: [
        { word: "down", isMatch: true },
        { word: "glow", isMatch: false },
        { word: "how", isMatch: true },
        { word: "crow", isMatch: false },
      ],
    },
  ],
  celebrate: {
    audio: A("celebrate"),
    script:
      "Wow, your ears are warmed up! You heard the o w sound, like in cow, hiding in all those words. Now let's take those sharp ears into today's lesson.",
  },
  carrots: 2,
};
