import type { LessonDef } from "@/lib/lesson-engine/types";
import { longVowel, shortVowel } from "@/lib/lesson-engine/phonics";
import timings from "./silent-e-timings.json";

// Silent-E — RF.K.3b (long/short vowel sounds) → RF.1.3c (final-e convention).
// PURE DATA: no lesson-specific React anywhere. All subject knowledge (labels,
// notation marks, images, audio) lives HERE; the engine renders it.
// Assets: scripts/lesson-tts.ts / lesson-timings.py / lesson-images.ts --lesson=silent-e

const A = (id: string) => `/audio/lessons-v2/silent-e/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/silent-e/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/silent-e/${w.toLowerCase()}.png`;

/** Phonics teach-config for a VCe transform: ă→ā marks + silent/says-its-name labels. */
const teach = (vowel: string) => ({
  labels: { added: "silent", changed: "says its name!" },
  marks: { before: shortVowel(vowel.toUpperCase()), after: longVowel(vowel.toUpperCase()) },
});

/** Image manifest, consumed by scripts/lesson-images.ts (word → subject). */
export const silentEImages: Record<string, string> = {
  cap: "a blue baseball cap",
  cape: "a red superhero cape",
  kite: "a colorful diamond kite with a tail",
  tub: "a white bathtub full of bubbles",
  tube: "a squeeze tube of toothpaste",
  pin: "a single red push pin",
  pine: "a tall green pine tree",
  cub: "a cute brown baby bear cub",
  cube: "a clear sparkling ice cube",
  hat: "a straw sun hat",
  map: "a folded paper treasure map",
};

export const silentE: LessonDef = {
  id: "silent-e",
  title: "The Silent E",
  grade: "Kindergarten",
  standard: "RF.K.3b",
  archetype: "phonics",
  objective: "A silent E at the end is quiet, but it makes the vowel say its name.",
  concepts: ["silent-e", "long-vowel", "short-vowel"],
  timings: timings as LessonDef["timings"],
  completion: {
    script:
      "Great work today! You learned the silent E trick. The E stays quiet, and it makes the vowel say its name. You built cape, kite, tube, and more, all by yourself. Amazing reading!",
    title: "You know the Silent E trick!",
    body: "You built CAPE, KITE, TUBE, and MADE all by yourself. The silent E is quiet, but YOU made the vowels sing!",
  },
  scenes: [
    // ── WARM UP ──
    {
      id: "warmup",
      purpose: "hook",
      gate: "none",
      prompt: "Warm up! Tap each tile to hear it.",
      narration: {
        audio: A("warmup"),
        script:
          "Let's warm up our ears. Tap each tile to hear the word. Listen for that short a sound in the middle.",
      },
      interaction: {
        type: "listen",
        items: [
          { label: "CAP", audio: W("CAP"), image: IMG("cap") },
          { label: "MAP", audio: W("MAP"), image: IMG("map") },
          { label: "HAT", audio: W("HAT"), image: IMG("hat") },
        ],
      },
    },

    // ── HOOK ──
    {
      id: "hook",
      purpose: "hook",
      gate: "none",
      prompt: "This is CAP. Tap it to hear it!",
      narration: {
        audio: A("hook"),
        script: "Here is the word cap. A cap is something you wear on your head. Tap the tile to hear it.",
      },
      interaction: { type: "listen", items: [{ label: "CAP", audio: W("CAP"), image: IMG("cap") }] },
    },

    // ── I DO — the explanation ──
    {
      id: "teach-rule",
      purpose: "model",
      gate: "interaction",
      auto: true,
      prompt: "Watch the magic E!",
      narration: {
        audio: A("teach-rule"),
        script:
          "Watch the magic. This E is a silent E. We do not say it. But it has a special power. It makes the vowel say its name. Watch. Cap becomes... cape!",
      },
      cues: [{ at: "cape", do: { effect: "fire" } }],
      interaction: {
        type: "transform", base: "CAP", add: "E", result: "CAPE", changeIndex: 1,
        ...teach("a"), imageBefore: IMG("cap"), imageAfter: IMG("cape"),
      },
    },
    {
      id: "model-kite",
      purpose: "model",
      gate: "interaction",
      auto: true,
      prompt: "Again! KIT → KITE.",
      narration: {
        audio: A("model-kite"),
        script: "Let's try again. Kit... add the silent e... kite! The i says its name.",
      },
      cues: [{ at: "kite", do: { effect: "fire" } }],
      interaction: {
        type: "transform", base: "KIT", add: "E", result: "KITE", changeIndex: 1,
        ...teach("i"), emojiBefore: "📦", imageAfter: IMG("kite"),
      },
    },
    {
      id: "model-tube",
      purpose: "model",
      gate: "interaction",
      auto: true,
      prompt: "One more! TUB → TUBE.",
      narration: {
        audio: A("model-tube"),
        script: "One more. Tub... becomes... tube! Now the u says its name.",
      },
      cues: [{ at: "tube", do: { effect: "fire" } }],
      interaction: {
        type: "transform", base: "TUB", add: "E", result: "TUBE", changeIndex: 1,
        ...teach("u"), imageBefore: IMG("tub"), imageAfter: IMG("tube"),
      },
    },

    // ── RECAP ──
    {
      id: "recap",
      fx: { text: "Silent **E** makes the vowel say its name!", effect: "underline" },
      purpose: "model",
      gate: "none",
      prompt: "The rule: silent E makes the vowel say its name.",
      narration: {
        audio: A("recap"),
        script: "Here is our rule. A silent e makes the vowel say its name. Now you try!",
      },
    },

    // ── WE DO ──
    {
      id: "guided-kite",
      purpose: "guided",
      gate: "interaction",
      prompt: "Your turn! Add E to make KITE.",
      narration: { audio: A("guided-kite"), script: "Your turn. Add the silent e to make kite." },
      interaction: {
        type: "transform", base: "KIT", add: "E", result: "KITE", changeIndex: 1,
        options: ["E", "O", "S"], ...teach("i"), emojiBefore: "📦", imageAfter: IMG("kite"),
        successAudio: W("KITE"), coachWrong: "That one makes a different sound. Try the silent e!",
      },
    },
    {
      id: "guided-pine",
      purpose: "guided",
      gate: "interaction",
      prompt: "Now make PINE.",
      narration: { audio: A("guided-pine"), script: "Now you make this one. Add the silent e to turn pin into pine." },
      interaction: {
        type: "transform", base: "PIN", add: "E", result: "PINE", changeIndex: 1,
        options: ["A", "E", "P"], ...teach("i"), imageBefore: IMG("pin"), imageAfter: IMG("pine"),
        successAudio: W("PINE"), coachWrong: "Almost! The silent e is the magic one.",
      },
    },

    // ── CHECK — fix a mistake ──
    {
      id: "fix",
      purpose: "guided",
      gate: "interaction",
      prompt: "Oops! Fix Bunny's word.",
      narration: {
        audio: A("fix"),
        script:
          "Uh oh. Bunny wanted to write cube, an ice cube, but Bunny wrote cub, like a baby bear. Can you fix it? Add the silent e to make cube.",
      },
      interaction: {
        type: "transform", base: "CUB", add: "E", result: "CUBE", changeIndex: 1,
        options: ["E", "B", "U"], ...teach("u"), imageBefore: IMG("cub"), imageAfter: IMG("cube"),
        successAudio: W("CUBE"), coachWrong: "The silent e will fix it!",
      },
    },

    // ── APPLY IN CONTEXT — karaoke read-along ──
    {
      id: "context",
      purpose: "apply",
      gate: "interaction",
      prompt: "Follow along as I read!",
      narration: {
        audio: A("context"),
        script:
          "Now let's read our new word in a real sentence. Watch each word light up as I read. Then you read it too!",
      },
      interaction: { type: "read-along", text: "I like my kite.", audio: A("context-sentence") },
    },

    // ── SAY IT (Azure in production; no-reveal) ──
    {
      id: "say-it",
      purpose: "guided",
      gate: "interaction",
      prompt: "Now YOU read the sentence out loud!",
      narration: { audio: A("say-it"), script: "Now it's your turn to read. Tap the mic and read the sentence out loud." },
      interaction: { type: "speak", text: "I like my kite" },
    },

    // ── APPLY — sort by sound ──
    {
      id: "sort",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Short or long? Sort each word.",
      narration: {
        audio: A("sort"),
        script:
          "Time to sort! Say each word out loud. If the vowel says its name, it goes with the long vowels. If it makes its short sound, it goes with the short vowels.",
      },
      interaction: {
        type: "sort",
        buckets: ["short vowel", "long vowel"],
        items: [
          { label: "CAP", bucket: "short vowel", audio: W("CAP") },
          { label: "CAPE", bucket: "long vowel", audio: W("CAPE") },
          { label: "KIT", bucket: "short vowel", audio: W("KIT") },
          { label: "KITE", bucket: "long vowel", audio: W("KITE") },
          { label: "TUB", bucket: "short vowel", audio: W("TUB") },
          { label: "TUBE", bucket: "long vowel", audio: W("TUBE") },
        ],
        coachWrong: "Say it out loud. Does the vowel say its name?",
      },
    },

    // ── YOU DO — independent, no reveal ──
    {
      id: "challenge",
      purpose: "challenge",
      gate: "interaction",
      // No-reveal rule: independent challenges never name the answer — a kid
      // could copy it. Teaching/guided scenes may; challenges stay generic.
      prompt: "All by yourself! Pick the letter that makes the vowel say its name.",
      narration: { audio: A("challenge"), script: "Last challenge, all by yourself. Pick the letter that makes the vowel say its name." },
      interaction: {
        type: "transform", base: "MAD", add: "E", result: "MADE", changeIndex: 1,
        options: ["M", "E", "D"], successAudio: W("MADE"),
      },
    },

    // ── WRAP ──
    {
      id: "celebrate",
      fx: { text: "The **E** is quiet... the vowel says its **name**!", effect: "burst" },
      purpose: "celebrate",
      gate: "none",
      prompt: "You did it!",
      narration: {
        audio: A("celebrate"),
        script:
          "You did it! Remember our rule: a silent E at the end is quiet, but it makes the vowel say its name. Great reading!",
      },
    },
  ],
};
