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

export const READER_LEVELS: ReaderLevel[] = [
  {
    number: 1,
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
    number: 2,
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
    number: 3,
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
    number: 4,
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
    number: 5,
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
    number: 6,
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
    number: 7,
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
    number: 8,
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
    number: 9,
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
    number: 10,
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

export const MAX_LEVEL = READER_LEVELS[READER_LEVELS.length - 1].number;

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
