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

import type { LucideIcon } from "lucide-react";
import {
  Sprout,
  Leaf,
  Flower,
  TreeDeciduous,
  Star,
  Sparkles,
  Wand2,
  Trophy,
  Crown,
  Rocket,
} from "lucide-react";

export type ReaderLevel = {
  /** 1-indexed level number. */
  number: number;
  /** Kid-facing name. */
  name: string;
  /** Lifetime carrots required to *reach* this level. */
  threshold: number;
  /** Lucide icon component for the badge. */
  icon: LucideIcon;
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
    icon: Sprout,
    accent: {
      bg: "bg-emerald-500",
      fg: "text-white",
      soft: "bg-emerald-50 text-emerald-800",
      gradFrom: "from-emerald-400",
      gradTo: "to-green-500",
    },
  },
  {
    name: "Page Turner",
    threshold: 50,
    icon: Leaf,
    accent: {
      bg: "bg-lime-500",
      fg: "text-white",
      soft: "bg-lime-50 text-lime-800",
      gradFrom: "from-lime-400",
      gradTo: "to-emerald-500",
    },
  },
  {
    name: "Story Hunter",
    threshold: 150,
    icon: Flower,
    accent: {
      bg: "bg-teal-500",
      fg: "text-white",
      soft: "bg-teal-50 text-teal-800",
      gradFrom: "from-teal-400",
      gradTo: "to-cyan-500",
    },
  },
  {
    name: "Book Buddy",
    threshold: 300,
    icon: TreeDeciduous,
    accent: {
      bg: "bg-sky-500",
      fg: "text-white",
      soft: "bg-sky-50 text-sky-800",
      gradFrom: "from-sky-400",
      gradTo: "to-blue-500",
    },
  },
  {
    name: "Reading Star",
    threshold: 500,
    icon: Star,
    accent: {
      bg: "bg-indigo-500",
      fg: "text-white",
      soft: "bg-indigo-50 text-indigo-800",
      gradFrom: "from-indigo-400",
      gradTo: "to-violet-500",
    },
  },
  {
    name: "Library Hero",
    threshold: 800,
    icon: Sparkles,
    accent: {
      bg: "bg-violet-500",
      fg: "text-white",
      soft: "bg-violet-50 text-violet-800",
      gradFrom: "from-violet-400",
      gradTo: "to-purple-500",
    },
  },
  {
    name: "Word Wizard",
    threshold: 1200,
    icon: Wand2,
    accent: {
      bg: "bg-purple-500",
      fg: "text-white",
      soft: "bg-purple-50 text-purple-800",
      gradFrom: "from-purple-400",
      gradTo: "to-pink-500",
    },
  },
  {
    name: "Reading Master",
    threshold: 1700,
    icon: Trophy,
    accent: {
      bg: "bg-amber-500",
      fg: "text-white",
      soft: "bg-amber-50 text-amber-800",
      gradFrom: "from-amber-400",
      gradTo: "to-orange-500",
    },
  },
  {
    name: "Story Legend",
    threshold: 2400,
    icon: Crown,
    accent: {
      bg: "bg-orange-500",
      fg: "text-white",
      soft: "bg-orange-50 text-orange-800",
      gradFrom: "from-orange-400",
      gradTo: "to-rose-500",
    },
  },
  {
    name: "Readee Champion",
    threshold: 3500,
    icon: Rocket,
    accent: {
      bg: "bg-rose-500",
      fg: "text-white",
      soft: "bg-rose-50 text-rose-800",
      gradFrom: "from-rose-400",
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
  const out: ReaderLevel[] = SEED_LEVELS.map((seed, i) => ({
    ...seed,
    number: i + 1,
  }));
  for (let n = SEED_LEVELS.length + 1; n <= 1000; n++) {
    const palette = SEED_LEVELS[(n - 1) % SEED_LEVELS.length];
    const name = MILESTONE_NAMES[n] ?? `Level ${n}`;
    out.push({
      number: n,
      name,
      threshold: thresholdAfter10(n),
      icon: palette.icon,
      accent: palette.accent,
    });
  }
  return out;
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
