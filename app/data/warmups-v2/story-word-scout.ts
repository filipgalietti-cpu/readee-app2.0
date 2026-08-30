import type { WarmupDef } from "@/lib/warmup-engine/types";

// Warm-up for two-ways-to-see (RL.2.6) · recipe: story-scout (call mode).
// Pre-teaches anchor-story words so the read-along feels familiar.
// PURE DATA. Audio: scripts/warmup-tts.ts --warmup=story-word-scout

const A = (id: string) => `/audio/warmups-v2/story-word-scout/${id}.mp3`;

export const storyWordScout: WarmupDef = {
  id: "story-word-scout",
  lessonId: "two-ways-to-see",
  title: "Story Word Scout",
  recipe: "story-scout",
  mode: "call",
  playPrompt: "Catch the word you hear!",
  intro: {
    audio: A("intro"),
    script:
      "Today's story has some big weather words in it. When I call a word, find it and catch it. Listen close. Ready? Go!",
    cardText: "Story Words",
  },
  playSeconds: 45,
  waves: [
    {
      call: { audio: A("call-storm"), script: "First up. Catch storm! Storm." },
      callWord: "storm",
      tiles: [
        { word: "storm", isMatch: true },
        { word: "star", isMatch: false },
        { word: "stone", isMatch: false },
      ],
    },
    {
      call: { audio: A("call-thunder"), script: "Now catch thunder! Thunder." },
      callWord: "thunder",
      tiles: [
        { word: "thunder", isMatch: true },
        { word: "under", isMatch: false },
        { word: "hundred", isMatch: false },
      ],
    },
    {
      call: { audio: A("call-window"), script: "Find the word window! Window." },
      callWord: "window",
      tiles: [
        { word: "window", isMatch: true },
        { word: "winter", isMatch: false },
        { word: "wonder", isMatch: false },
      ],
    },
    {
      call: { audio: A("call-brave"), script: "Last one. Catch brave! Brave." },
      callWord: "brave",
      tiles: [
        { word: "brave", isMatch: true },
        { word: "brake", isMatch: false },
        { word: "bring", isMatch: false },
      ],
    },
  ],
  celebrate: {
    audio: A("celebrate"),
    script:
      "You caught every story word! Storm, thunder, window, brave. You already know the big words in today's story. Let's go read it.",
  },
  carrots: 2,
};
