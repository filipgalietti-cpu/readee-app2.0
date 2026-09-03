/**
 * Reader levels — the lifetime carrot ladder.
 *
 * Carrots earned across every lesson, practice session, story, and
 * daily question accumulate into a lifetime score. Hitting each
 * threshold below unlocks the next level. We use *lifetime carrots
 * earned*, NOT the current carrots balance, because parents/kids
 * spend carrots at /shop on cosmetics — a level system tied to the
 * balance would demote a kid the moment they buy a new background,
 * which would torpedo the incentive.
 *
 * The thresholds are tuned for the "average motivated K-2 reader":
 * ~10 carrots per session, ~3-5 sessions per week. Level 2 within a
 * first week, level 5 within roughly a month, level 10 as a
 * year-one moonshot. Adjust freely — every consumer surface reads
 * from this file.
 */

import type { FluentIconName } from "@/app/_components/FluentIcon";

export type ReaderLevel = {
  /** 1-indexed level number. */
  number: number;
  /** Kid-facing name. */
  name: string;
  /** Lifetime carrots required to *reach* this level. */
  threshold: number;
  /** Fluent Emoji name for the badge. */
  icon: FluentIconName;
  /** Tailwind class fragments — kept together so callers don't have to
   *  guess the colour family per level. */
  accent: {
    /** Background tint, e.g. solid badge fill. */
    bg: string;
    /** Foreground text colour pairing the bg. */
    fg: string;
    /** Soft pill / chip background. */
    soft: string;
    /** Gradient `from / to` pair for the big celebration overlay. */
    gradFrom: string;
    gradTo: string;
    /** Same colours as hex, for surfaces styled inline rather than with
     *  Tailwind (KidHome). Deep -> light is same-hue on purpose: a
     *  cross-hue fill is the look the anti-slop canon bans. */
    hexDeep: string;
    hex: string;
  };
};

/**
 * The first ten levels are hand-tuned milestones — each has a unique
 * name, icon, and color palette so reaching one *feels* different from
 * the level before it. Levels 11–1000 are extended programmatically:
 * the icon + accent palette cycle through these ten, and the name is
 * generic ("Level 42"). Every 10th level past 10 is a milestone
 * ("Level 50 — Master Reader") with a celebratory name.
 *
 * Thresholds preserve the original curve for L1–L10 exactly. Past
 * L10 we use a power curve so each level still feels reachable but
 * top-tier levels remain aspirational. Level 1000 is unreachable in
 * practice — the point of having 1000 rungs is that the *next* one
 * is always visible.
 */
const SEED_LEVELS: Omit<ReaderLevel, "number">[] = [
  {
    name: "Word Sprout",
    threshold: 0,
    icon: "seedling",
    accent: {
      bg: "bg-emerald-500",
      fg: "text-white",
      soft: "bg-emerald-50 text-emerald-800",
      gradFrom: "from-emerald-400",
      hexDeep: "#059669",
      hex: "#10b981",
      gradTo: "to-green-500",
    },
  },
  {
    name: "Page Turner",
    threshold: 50,
    icon: "leaf",
    accent: {
      bg: "bg-lime-500",
      fg: "text-white",
      soft: "bg-lime-50 text-lime-800",
      gradFrom: "from-lime-400",
      hexDeep: "#65a30d",
      hex: "#84cc16",
      gradTo: "to-emerald-500",
    },
  },
  {
    name: "Story Hunter",
    threshold: 150,
    icon: "blossom",
    accent: {
      bg: "bg-teal-500",
      fg: "text-white",
      soft: "bg-teal-50 text-teal-800",
      gradFrom: "from-teal-400",
      hexDeep: "#0d9488",
      hex: "#14b8a6",
      gradTo: "to-cyan-500",
    },
  },
  {
    name: "Book Buddy",
    threshold: 300,
    icon: "deciduous-tree",
    accent: {
      bg: "bg-sky-500",
      fg: "text-white",
      soft: "bg-sky-50 text-sky-800",
      gradFrom: "from-sky-400",
      hexDeep: "#0284c7",
      hex: "#0ea5e9",
      gradTo: "to-blue-500",
    },
  },
  {
    name: "Reading Star",
    threshold: 500,
    icon: "star",
    accent: {
      bg: "bg-indigo-500",
      fg: "text-white",
      soft: "bg-indigo-50 text-indigo-800",
      gradFrom: "from-indigo-400",
      hexDeep: "#4f46e5",
      hex: "#6366f1",
      gradTo: "to-violet-500",
    },
  },
  {
    name: "Library Hero",
    threshold: 800,
    icon: "sparkles",
    accent: {
      bg: "bg-violet-500",
      fg: "text-white",
      soft: "bg-violet-50 text-violet-800",
      gradFrom: "from-violet-400",
      hexDeep: "#7c3aed",
      hex: "#8b5cf6",
      gradTo: "to-purple-500",
    },
  },
  {
    name: "Word Wizard",
    threshold: 1200,
    icon: "wand",
    accent: {
      bg: "bg-purple-500",
      fg: "text-white",
      soft: "bg-purple-50 text-purple-800",
      gradFrom: "from-purple-400",
      hexDeep: "#9333ea",
      hex: "#a855f7",
      gradTo: "to-pink-500",
    },
  },
  {
    name: "Reading Master",
    threshold: 1700,
    icon: "trophy",
    accent: {
      bg: "bg-amber-500",
      fg: "text-white",
      soft: "bg-amber-50 text-amber-800",
      gradFrom: "from-amber-400",
      hexDeep: "#d97706",
      hex: "#f59e0b",
      gradTo: "to-orange-500",
    },
  },
  {
    name: "Story Legend",
    threshold: 2400,
    icon: "crown",
    accent: {
      bg: "bg-orange-500",
      fg: "text-white",
      soft: "bg-orange-50 text-orange-800",
      gradFrom: "from-orange-400",
      hexDeep: "#ea580c",
      hex: "#f97316",
      gradTo: "to-rose-500",
    },
  },
  {
    name: "Readee Champion",
    threshold: 3500,
    icon: "rocket",
    accent: {
      bg: "bg-rose-500",
      fg: "text-white",
      soft: "bg-rose-50 text-rose-800",
      gradFrom: "from-rose-400",
      hexDeep: "#e11d48",
      hex: "#f43f5e",
      gradTo: "to-fuchsia-500",
    },
  },
];

/** Decade-milestone names sprinkled across the extended ladder so
 *  every L20, L30, L50, L100, L500, L1000 still feels special. */
const MILESTONE_NAMES: Record<number, string> = {
  20: "Bookworm",
  30: "Page Voyager",
  40: "Story Captain",
  50: "Master Reader",
  60: "Chapter Champion",
  70: "Library Sage",
  80: "Word Sovereign",
  90: "Legend in Training",
  100: "Reading Legend",
  150: "Mythic Reader",
  200: "Grandmaster",
  250: "Sage of Stories",
  300: "Reading Oracle",
  400: "Tome Keeper",
  500: "Reading Mythic",
  600: "Word Titan",
  700: "Story Demigod",
  800: "Lore Master",
  900: "Reading Ascendant",
  1000: "Reading Eternal",
};

/**
 * Every milestone gets its own icon and colour.
 *
 * They used to share one: the generated levels cycled the ten seed palettes
 * with `(n - 1) % 10`, and every milestone is a multiple of 10, so 20 through
 * 1000 ALL landed on index 9 — the same rocket in the same rose. The /levels
 * page renders every milestone, so it read as a wall of identical rockets.
 */
const MILESTONE_STYLE: Record<number, { icon: FluentIconName; accent: ReaderLevel["accent"] }> = {
  20: { icon: "books", accent: { bg: "bg-teal-500", fg: "text-white", soft: "bg-teal-50 text-teal-800", gradFrom: "from-teal-400", hexDeep: "#0d9488", hex: "#14b8a6", gradTo: "to-teal-500" } },
  30: { icon: "ship", accent: { bg: "bg-sky-500", fg: "text-white", soft: "bg-sky-50 text-sky-800", gradFrom: "from-sky-400", hexDeep: "#0284c7", hex: "#0ea5e9", gradTo: "to-sky-500" } },
  40: { icon: "shield", accent: { bg: "bg-blue-500", fg: "text-white", soft: "bg-blue-50 text-blue-800", gradFrom: "from-blue-400", hexDeep: "#2563eb", hex: "#3b82f6", gradTo: "to-blue-500" } },
  50: { icon: "graduation-cap", accent: { bg: "bg-indigo-500", fg: "text-white", soft: "bg-indigo-50 text-indigo-800", gradFrom: "from-indigo-400", hexDeep: "#4f46e5", hex: "#6366f1", gradTo: "to-indigo-500" } },
  60: { icon: "bullseye", accent: { bg: "bg-violet-500", fg: "text-white", soft: "bg-violet-50 text-violet-800", gradFrom: "from-violet-400", hexDeep: "#7c3aed", hex: "#8b5cf6", gradTo: "to-violet-500" } },
  70: { icon: "feather", accent: { bg: "bg-purple-500", fg: "text-white", soft: "bg-purple-50 text-purple-800", gradFrom: "from-purple-400", hexDeep: "#9333ea", hex: "#a855f7", gradTo: "to-purple-500" } },
  80: { icon: "castle", accent: { bg: "bg-fuchsia-500", fg: "text-white", soft: "bg-fuchsia-50 text-fuchsia-800", gradFrom: "from-fuchsia-400", hexDeep: "#c026d3", hex: "#d946ef", gradTo: "to-fuchsia-500" } },
  90: { icon: "fire", accent: { bg: "bg-orange-500", fg: "text-white", soft: "bg-orange-50 text-orange-800", gradFrom: "from-orange-400", hexDeep: "#ea580c", hex: "#f97316", gradTo: "to-orange-500" } },
  100: { icon: "glowing-star", accent: { bg: "bg-amber-500", fg: "text-white", soft: "bg-amber-50 text-amber-800", gradFrom: "from-amber-400", hexDeep: "#d97706", hex: "#f59e0b", gradTo: "to-amber-500" } },
  150: { icon: "rainbow", accent: { bg: "bg-pink-500", fg: "text-white", soft: "bg-pink-50 text-pink-800", gradFrom: "from-pink-400", hexDeep: "#db2777", hex: "#ec4899", gradTo: "to-pink-500" } },
  200: { icon: "gem", accent: { bg: "bg-cyan-500", fg: "text-white", soft: "bg-cyan-50 text-cyan-800", gradFrom: "from-cyan-400", hexDeep: "#0891b2", hex: "#06b6d4", gradTo: "to-cyan-500" } },
  250: { icon: "telescope", accent: { bg: "bg-teal-500", fg: "text-white", soft: "bg-teal-50 text-teal-800", gradFrom: "from-teal-400", hexDeep: "#0d9488", hex: "#14b8a6", gradTo: "to-teal-500" } },
  300: { icon: "globe", accent: { bg: "bg-green-500", fg: "text-white", soft: "bg-green-50 text-green-800", gradFrom: "from-green-400", hexDeep: "#16a34a", hex: "#22c55e", gradTo: "to-green-500" } },
  400: { icon: "memo", accent: { bg: "bg-lime-500", fg: "text-white", soft: "bg-lime-50 text-lime-800", gradFrom: "from-lime-400", hexDeep: "#65a30d", hex: "#84cc16", gradTo: "to-lime-500" } },
  500: { icon: "ringed-planet", accent: { bg: "bg-indigo-500", fg: "text-white", soft: "bg-indigo-50 text-indigo-800", gradFrom: "from-indigo-400", hexDeep: "#4f46e5", hex: "#6366f1", gradTo: "to-indigo-500" } },
  600: { icon: "mountain", accent: { bg: "bg-emerald-500", fg: "text-white", soft: "bg-emerald-50 text-emerald-800", gradFrom: "from-emerald-400", hexDeep: "#059669", hex: "#10b981", gradTo: "to-emerald-500" } },
  700: { icon: "sun-face", accent: { bg: "bg-amber-500", fg: "text-white", soft: "bg-amber-50 text-amber-800", gradFrom: "from-amber-400", hexDeep: "#d97706", hex: "#f59e0b", gradTo: "to-amber-500" } },
  800: { icon: "satellite", accent: { bg: "bg-sky-500", fg: "text-white", soft: "bg-sky-50 text-sky-800", gradFrom: "from-sky-400", hexDeep: "#0284c7", hex: "#0ea5e9", gradTo: "to-sky-500" } },
  900: { icon: "sunrise", accent: { bg: "bg-rose-500", fg: "text-white", soft: "bg-rose-50 text-rose-800", gradFrom: "from-rose-400", hexDeep: "#e11d48", hex: "#f43f5e", gradTo: "to-rose-500" } },
  1000: { icon: "snow-mountain", accent: { bg: "bg-violet-500", fg: "text-white", soft: "bg-violet-50 text-violet-800", gradFrom: "from-violet-400", hexDeep: "#7c3aed", hex: "#8b5cf6", gradTo: "to-violet-500" } },
};

/** Icons for the rungs between milestones. */
const GENERIC_ICONS: FluentIconName[] = [
  "bird", "cat", "dog", "rabbit", "chipmunk", "turtle",
  "fish", "snail", "paw-prints", "evergreen-tree", "palm-tree", "cherry-blossom",
  "lemon", "cherries", "sun", "moon", "cloud", "snowflake",
  "water-wave", "musical-note", "artist-palette", "framed-picture", "lightbulb", "brain",
  "magnifying-glass", "house", "tent", "robot", "video-game", "zap",
  "bell", "spiral-shell", "sheaf-of-rice", "ghost", "bug", "candy",
  "droplet", "grinning-face", "microphone", "newspaper", "open-book", "speaker",
  "sun-cloud", "sunset",
];

/** Colours for those rungs. A different length to the icon list on purpose. */
const GENERIC_ACCENTS: ReaderLevel["accent"][] = [
  { bg: "bg-emerald-500", fg: "text-white", soft: "bg-emerald-50 text-emerald-800", gradFrom: "from-emerald-400", hexDeep: "#059669", hex: "#10b981", gradTo: "to-emerald-500" },
  { bg: "bg-lime-500", fg: "text-white", soft: "bg-lime-50 text-lime-800", gradFrom: "from-lime-400", hexDeep: "#65a30d", hex: "#84cc16", gradTo: "to-lime-500" },
  { bg: "bg-teal-500", fg: "text-white", soft: "bg-teal-50 text-teal-800", gradFrom: "from-teal-400", hexDeep: "#0d9488", hex: "#14b8a6", gradTo: "to-teal-500" },
  { bg: "bg-sky-500", fg: "text-white", soft: "bg-sky-50 text-sky-800", gradFrom: "from-sky-400", hexDeep: "#0284c7", hex: "#0ea5e9", gradTo: "to-sky-500" },
  { bg: "bg-indigo-500", fg: "text-white", soft: "bg-indigo-50 text-indigo-800", gradFrom: "from-indigo-400", hexDeep: "#4f46e5", hex: "#6366f1", gradTo: "to-indigo-500" },
  { bg: "bg-violet-500", fg: "text-white", soft: "bg-violet-50 text-violet-800", gradFrom: "from-violet-400", hexDeep: "#7c3aed", hex: "#8b5cf6", gradTo: "to-violet-500" },
  { bg: "bg-purple-500", fg: "text-white", soft: "bg-purple-50 text-purple-800", gradFrom: "from-purple-400", hexDeep: "#9333ea", hex: "#a855f7", gradTo: "to-purple-500" },
  { bg: "bg-amber-500", fg: "text-white", soft: "bg-amber-50 text-amber-800", gradFrom: "from-amber-400", hexDeep: "#d97706", hex: "#f59e0b", gradTo: "to-amber-500" },
  { bg: "bg-orange-500", fg: "text-white", soft: "bg-orange-50 text-orange-800", gradFrom: "from-orange-400", hexDeep: "#ea580c", hex: "#f97316", gradTo: "to-orange-500" },
  { bg: "bg-rose-500", fg: "text-white", soft: "bg-rose-50 text-rose-800", gradFrom: "from-rose-400", hexDeep: "#e11d48", hex: "#f43f5e", gradTo: "to-rose-500" },
  { bg: "bg-cyan-500", fg: "text-white", soft: "bg-cyan-50 text-cyan-800", gradFrom: "from-cyan-400", hexDeep: "#0891b2", hex: "#06b6d4", gradTo: "to-cyan-500" },
  { bg: "bg-blue-500", fg: "text-white", soft: "bg-blue-50 text-blue-800", gradFrom: "from-blue-400", hexDeep: "#2563eb", hex: "#3b82f6", gradTo: "to-blue-500" },
  { bg: "bg-fuchsia-500", fg: "text-white", soft: "bg-fuchsia-50 text-fuchsia-800", gradFrom: "from-fuchsia-400", hexDeep: "#c026d3", hex: "#d946ef", gradTo: "to-fuchsia-500" },
  { bg: "bg-pink-500", fg: "text-white", soft: "bg-pink-50 text-pink-800", gradFrom: "from-pink-400", hexDeep: "#db2777", hex: "#ec4899", gradTo: "to-pink-500" },
  { bg: "bg-red-500", fg: "text-white", soft: "bg-red-50 text-red-800", gradFrom: "from-red-400", hexDeep: "#dc2626", hex: "#ef4444", gradTo: "to-red-500" },
  { bg: "bg-green-500", fg: "text-white", soft: "bg-green-50 text-green-800", gradFrom: "from-green-400", hexDeep: "#16a34a", hex: "#22c55e", gradTo: "to-green-500" },
];

/** Smooth threshold curve for levels past 10. Power function tuned
 *  so L11 is a small step up from L10 (3500) and L1000 lands in the
 *  low millions of lifetime carrots — aspirational but well-defined. */
function thresholdAfter10(n: number): number {
  // base preserves continuity from L10 = 3500.
  // The exponent gives a gentle curve through mid-levels and a steeper
  // climb past L100 so high tiers stay aspirational.
  const offset = n - 10;
  return Math.round(3500 + 250 * Math.pow(offset, 1.85));
}

function buildLevels(): ReaderLevel[] {
  const out: ReaderLevel[] = SEED_LEVELS.map((seed, i) => ({ ...seed, number: i + 1 }));
  for (let n = SEED_LEVELS.length + 1; n <= 1000; n++) {
    const milestone = MILESTONE_STYLE[n];
    out.push({
      number: n,
      name: MILESTONE_NAMES[n] ?? `Level ${n}`,
      threshold: thresholdAfter10(n),
      icon: milestone?.icon ?? GENERIC_ICONS[n % GENERIC_ICONS.length],
      accent: milestone?.accent ?? GENERIC_ACCENTS[n % GENERIC_ACCENTS.length],
    });
  }
  return out;
}

/** True when a level has a bespoke name ("Word Wizard") rather than the
 *  generated "Level 19". Surfaces use this to avoid printing the number
 *  twice: "Lv 19 · Level 19" reads like a bug, because it is one. */
export function hasCustomName(l: ReaderLevel): boolean {
  return l.name !== `Level ${l.number}`;
}

export const READER_LEVELS: ReaderLevel[] = buildLevels();

export const MAX_LEVEL = READER_LEVELS[READER_LEVELS.length - 1].number;

/** Levels worth featuring in a condensed UI — the first 10 plus every
 *  named milestone. Useful for the /levels browse page so we don't
 *  render a 1000-row scroll. */
export const MILESTONE_LEVELS: ReaderLevel[] = READER_LEVELS.filter(
  (l) => l.number <= 10 || l.number in MILESTONE_NAMES,
);

export type LevelInfo = {
  /** Level the kid is currently at. */
  current: ReaderLevel;
  /** Next level above them, or null if they're maxed out. */
  next: ReaderLevel | null;
  /** Lifetime carrots the kid has, clamped at >= 0. */
  lifetimeCarrots: number;
  /** Carrots earned past the current level's threshold. */
  carrotsInCurrent: number;
  /** Carrots needed in this level to reach the next. */
  carrotsToNext: number;
  /** [0..1] progress toward the next level. 1 when maxed. */
  progress01: number;
};

/**
 * Pure function — given a lifetime carrot count, returns the kid's
 * current level + how far they are toward the next one.
 *
 * Always returns a level (defaults to L1 for zero/negative input).
 */
export function computeLevel(lifetimeCarrotsRaw: number): LevelInfo {
  const lifetimeCarrots = Math.max(0, Math.floor(lifetimeCarrotsRaw || 0));

  // Walk from the top down so the first match is the highest level
  // they qualify for.
  let current = READER_LEVELS[0];
  for (let i = READER_LEVELS.length - 1; i >= 0; i--) {
    if (lifetimeCarrots >= READER_LEVELS[i].threshold) {
      current = READER_LEVELS[i];
      break;
    }
  }
  const nextIdx = READER_LEVELS.findIndex((l) => l.number === current.number) + 1;
  const next = nextIdx < READER_LEVELS.length ? READER_LEVELS[nextIdx] : null;

  const carrotsInCurrent = lifetimeCarrots - current.threshold;
  const carrotsToNext = next ? next.threshold - current.threshold : 0;
  const progress01 = next
    ? Math.min(1, Math.max(0, carrotsInCurrent / Math.max(1, carrotsToNext)))
    : 1;

  return { current, next, lifetimeCarrots, carrotsInCurrent, carrotsToNext, progress01 };
}

/**
 * Did `prior` and `after` lifetime totals cross a level boundary?
 * Used by completion screens to celebrate the moment.
 */
export function didLevelUp(priorLifetime: number, afterLifetime: number): boolean {
  return computeLevel(priorLifetime).current.number < computeLevel(afterLifetime).current.number;
}

/**
 * Spendable-carrot BONUS granted for reaching a new reader level. Starts at
 * 50 (Filip's floor) and scales gently with the level, capped so late levels
 * don't balloon. Goes to the child's *spendable* balance only (never lifetime
 * carrots) so it can't cascade into another level-up.
 */
export function levelUpBonus(levelNumber: number): number {
  return Math.min(250, Math.max(50, 25 * levelNumber));
}
