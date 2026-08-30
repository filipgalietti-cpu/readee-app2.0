import type { WarmupDef } from "@/lib/warmup-engine/types";

// Warm-up for word-plus-word (L.2.4d) · recipe: word-catch (builder mode).
// The voice calls a compound word; the kid taps its two drifting parts into
// the bench slots and they fuse. Runs in WordBuilderArcade.
// Emblems are the picture hints from Filip's Claude Design "Word Builder"
// round: one small SVG per target, shown in the banner and the fuse bloom.
// PURE DATA. Audio: scripts/warmup-tts.ts --warmup=word-builder-compounds

const A = (id: string) => `/audio/warmups-v2/word-builder-compounds/${id}.mp3`;

const EMBLEMS: Record<string, string> = {
  sunset: `<svg viewBox="0 0 64 64" width="100%" height="100%"><rect x="4" y="4" width="56" height="56" rx="14" fill="#fef3c7"/><circle cx="32" cy="36" r="13" fill="#f59e0b"/><circle cx="32" cy="36" r="8" fill="#fbbf24"/><rect x="8" y="40" width="48" height="16" rx="6" fill="#8b5cf6"/><path d="M12 30 h8 M44 30 h8 M32 12 v8" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  raincoat: `<svg viewBox="0 0 64 64" width="100%" height="100%"><rect x="4" y="4" width="56" height="56" rx="14" fill="#e0f2fe"/><ellipse cx="30" cy="24" rx="16" ry="10" fill="#94a3b8"/><ellipse cx="42" cy="27" rx="12" ry="8" fill="#cbd5e1"/><path d="M20 40 l-3 8 M32 42 l-3 8 M44 40 l-3 8" stroke="#0284c7" stroke-width="4" stroke-linecap="round"/></svg>`,
  cupcake: `<svg viewBox="0 0 64 64" width="100%" height="100%"><rect x="4" y="4" width="56" height="56" rx="14" fill="#ffe4e6"/><path d="M18 34 h28 l-4 18 h-20 Z" fill="#a16207"/><path d="M18 34 c-2-14 30-14 28 0 Z" fill="#fda4af"/><circle cx="32" cy="18" r="4.5" fill="#f43f5e"/></svg>`,
  backpack: `<svg viewBox="0 0 64 64" width="100%" height="100%"><rect x="4" y="4" width="56" height="56" rx="14" fill="#ede9fe"/><rect x="16" y="16" width="32" height="36" rx="10" fill="#8b5cf6"/><rect x="22" y="34" width="20" height="14" rx="5" fill="#c4b5fd"/><path d="M24 16 c0-8 16-8 16 0" fill="none" stroke="#6d28d9" stroke-width="4" stroke-linecap="round"/></svg>`,
  footprint: `<svg viewBox="0 0 64 64" width="100%" height="100%"><rect x="4" y="4" width="56" height="56" rx="14" fill="#d1fae5"/><ellipse cx="32" cy="38" rx="11" ry="15" fill="#10b981"/><circle cx="20" cy="22" r="4" fill="#10b981"/><circle cx="29" cy="18" r="4.5" fill="#10b981"/><circle cx="39" cy="19" r="4" fill="#10b981"/><circle cx="47" cy="24" r="3.5" fill="#10b981"/></svg>`,
};

export const wordBuilderCompounds: WarmupDef = {
  id: "word-builder-compounds",
  lessonId: "word-plus-word",
  title: "Word Builder",
  recipe: "word-catch",
  mode: "builder",
  playPrompt: "Snap parts together to build words!",
  startPrompt: "Snap parts together to build words!",
  intro: {
    audio: A("intro"),
    script:
      "Word parts are floating by! Grab two parts and snap them together on the bench. If they make a real word, it goes on your shelf. Build as many words as you can! Ready? Go!",
    cardText: "sun + set",
  },
  playSeconds: 45,
  waves: [],
  builds: [
    {
      word: "sunset",
      parts: ["sun", "set"],
      call: { audio: A("c-sunset"), script: "Now build sunset! Sun. Set." },
      wordAudio: A("w-sunset"),
      emblem: EMBLEMS.sunset,
    },
    {
      word: "raincoat",
      parts: ["rain", "coat"],
      call: { audio: A("c-raincoat"), script: "Next up, build raincoat! Rain. Coat." },
      wordAudio: A("w-raincoat"),
      emblem: EMBLEMS.raincoat,
    },
    {
      word: "backpack",
      parts: ["back", "pack"],
      call: { audio: A("c-backpack"), script: "Now build backpack! Back. Pack." },
      wordAudio: A("w-backpack"),
      emblem: EMBLEMS.backpack,
    },
    {
      word: "cupcake",
      parts: ["cup", "cake"],
      call: { audio: A("c-cupcake"), script: "Next up, build cupcake! Cup. Cake." },
      wordAudio: A("w-cupcake"),
      emblem: EMBLEMS.cupcake,
    },
    {
      word: "footprint",
      parts: ["foot", "print"],
      call: { audio: A("c-footprint"), script: "Now build footprint! Foot. Print." },
      wordAudio: A("w-footprint"),
      emblem: EMBLEMS.footprint,
    },
    { word: "bedtime", parts: ["bed", "time"], wordAudio: A("w-bedtime") },
    { word: "doghouse", parts: ["dog", "house"], wordAudio: A("w-doghouse") },
    { word: "snowman", parts: ["snow", "man"], wordAudio: A("w-snowman") },
    { word: "starfish", parts: ["star", "fish"], wordAudio: A("w-starfish") },
    { word: "raindrop", parts: ["rain", "drop"], wordAudio: A("w-raindrop") },
    { word: "toothbrush", parts: ["tooth", "brush"], wordAudio: A("w-toothbrush") },
    { word: "campfire", parts: ["camp", "fire"], wordAudio: A("w-campfire") },
  ],
  decoyParts: ["tree", "jump", "sock", "lamp"],
  celebrate: {
    audio: A("celebrate"),
    script:
      "Wow, you snapped little words together and built big ones! That is just how compound words work. Let's take your word building power into today's lesson!",
  },
  celebrateZero: {
    audio: A("celebrate-zero"),
    script:
      "Good warm up! Two small words can make one big word, like sun and set make sunset. Watch for big words like that in today's lesson. You will build them, I know it.",
  },
  carrots: 2,
};
