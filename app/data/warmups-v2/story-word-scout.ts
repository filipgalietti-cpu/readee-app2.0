import type { WarmupDef } from "@/lib/warmup-engine/types";

// Warm-up for two-ways-to-see (RL.2.6) · recipe: belongs-in-the-story (rule mode).
// Schema activation: the kid warms up their knowledge of the story's WORLD
// (a storm) by judging what belongs in it. Decidable by meaning; the voice
// names each catch to pre-teach the word.
// PURE DATA. Audio: scripts/warmup-tts.ts --warmup=story-word-scout

const A = (id: string) => `/audio/warmups-v2/story-word-scout/${id}.mp3`;

export const storyWordScout: WarmupDef = {
  id: "story-word-scout",
  lessonId: "two-ways-to-see",
  title: "Storm Catch",
  recipe: "topic-scout",
  mode: "rule",
  playPrompt: "Catch what belongs in a storm!",
  intro: {
    audio: A("intro"),
    script:
      "Today's story has a big storm in it! Look at each word. If it belongs in a storm, catch it. If it does not belong, let it float away. Ready? Go!",
    cardText: "Storm",
  },
  playSeconds: 45,
  waves: [
    {
      tiles: [
        { word: "thunder", isMatch: true, audio: A("w-thunder") },
        { word: "cupcake", isMatch: false },
        { word: "rain", isMatch: true, audio: A("w-rain") },
        { word: "sock", isMatch: false },
      ],
    },
    {
      tiles: [
        { word: "wind", isMatch: true, audio: A("w-wind") },
        { word: "pillow", isMatch: false },
        { word: "cloud", isMatch: true, audio: A("w-cloud") },
        { word: "spoon", isMatch: false },
      ],
    },
    {
      tiles: [
        { word: "flash", isMatch: true, audio: A("w-flash") },
        { word: "crayon", isMatch: false },
        { word: "puddle", isMatch: true, audio: A("w-puddle") },
        { word: "teddy", isMatch: false },
      ],
    },
  ],
  celebrate: {
    audio: A("celebrate"),
    script:
      "You caught the storm! Thunder, rain, wind, and clouds. A big storm is coming in today's story, and now you know just what it brings. Let's go read it!",
  },
  celebrateZero: {
    audio: A("celebrate-zero"),
    script:
      "Good warm up! Storms bring thunder, rain, and wind. Watch for them in today's story. You will spot them, I know it.",
  },
  carrots: 2,
};
