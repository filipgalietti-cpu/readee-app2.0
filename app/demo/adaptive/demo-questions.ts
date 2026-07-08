/**
 * Demo content for the adaptive engine — ONE coherent skill (figuring out
 * what a word means from context) across FIVE difficulty buckets, from
 * super-easy to super-hard. Same subject throughout; only the difficulty
 * changes, so the engine can walk a child to exactly their level.
 *
 * This mirrors how production should tag content: each skill carries a
 * spectrum of items, and the engine moves the child along it.
 */

export type DemoLevel = "warmup" | "easy" | "onlevel" | "stretch" | "challenge";

export interface DemoQuestion {
  prompt: string;
  choices: string[];
  correct: string;
  level: DemoLevel;
}

export const DEMO_SKILL = "figuring out what a word means";

export const DEMO_LEVELS: { key: DemoLevel; label: string }[] = [
  { key: "warmup", label: "Warm-up" },
  { key: "easy", label: "Easier" },
  { key: "onlevel", label: "On level" },
  { key: "stretch", label: "Stretch" },
  { key: "challenge", label: "Challenge" },
];

export const DEMO_LADDER: DemoQuestion[] = [
  // ── Warm-up: common word, explicit clue ─────────────────────────────
  { level: "warmup", prompt: "Ben was sleepy, so he yawned and closed his eyes. What does sleepy mean?", choices: ["tired and ready to rest", "hungry for food", "very excited", "angry and upset"], correct: "tired and ready to rest" },
  { level: "warmup", prompt: "The dog was wet after the rain, so we dried it with a towel. What does wet mean?", choices: ["covered in water", "full of energy", "very hungry", "fast asleep"], correct: "covered in water" },
  { level: "warmup", prompt: "Mia felt glad and smiled big on her birthday. What does glad mean?", choices: ["happy", "scared", "bored", "sick"], correct: "happy" },

  // ── Easier: clear context clue ──────────────────────────────────────
  { level: "easy", prompt: "The soup was scalding, so Dad blew on it to cool it down. What does scalding mean?", choices: ["very hot", "very sweet", "very cold", "very old"], correct: "very hot" },
  { level: "easy", prompt: "The kitten was tiny next to the big dog. What does tiny mean?", choices: ["very small", "very loud", "very fast", "very tall"], correct: "very small" },
  { level: "easy", prompt: "Sam felt gloomy when his best friend moved away. What does gloomy mean?", choices: ["sad", "sleepy", "silly", "hungry"], correct: "sad" },

  // ── On level: moderate ──────────────────────────────────────────────
  { level: "onlevel", prompt: "The trail was narrow, so the hikers walked one behind the other. What does narrow mean?", choices: ["not wide", "very long", "very steep", "very muddy"], correct: "not wide" },
  { level: "onlevel", prompt: "The directions were simple, so everyone finished quickly. What does simple mean?", choices: ["easy to do", "hard to read", "very long", "brand new"], correct: "easy to do" },
  { level: "onlevel", prompt: "The crowd was silent, waiting for the show to begin. What does silent mean?", choices: ["making no sound", "moving fast", "very large", "brightly lit"], correct: "making no sound" },

  // ── Stretch: harder word, subtler clue ──────────────────────────────
  { level: "stretch", prompt: "The old porch was rickety and wobbled when we stepped on it. What does rickety mean?", choices: ["shaky and unsteady", "brand new", "brightly painted", "very tall"], correct: "shaky and unsteady" },
  { level: "stretch", prompt: "She was reluctant to jump into the cold pool, so she waited. What does reluctant mean?", choices: ["unwilling", "excited", "tired", "confused"], correct: "unwilling" },
  { level: "stretch", prompt: "The detective was baffled and could not solve the case. What does baffled mean?", choices: ["confused", "delighted", "exhausted", "furious"], correct: "confused" },

  // ── Challenge: rare word, requires real reasoning ───────────────────
  { level: "challenge", prompt: "Her directions were so lucid that no one got lost. What does lucid mean?", choices: ["clear and easy to understand", "long and boring", "funny and silly", "loud and rushed"], correct: "clear and easy to understand" },
  { level: "challenge", prompt: "The two friends were inseparable and did everything together. What does inseparable mean?", choices: ["always together", "often fighting", "very different", "far apart"], correct: "always together" },
  { level: "challenge", prompt: "The king's decision was irrevocable and could not be changed. What does irrevocable mean?", choices: ["impossible to undo", "easy to forget", "open to a vote", "quickly made"], correct: "impossible to undo" },
];
