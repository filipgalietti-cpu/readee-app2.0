import type { WarmupDef } from "@/lib/warmup-engine/types";
import { soundSwitchHunt } from "./sound-switch-hunt";
import { storyWordScout } from "./story-word-scout";

/** All Warm-Up Arcade rounds, keyed by warm-up id. */
export const WARMUPS: Record<string, WarmupDef> = {
  "sound-switch-hunt": soundSwitchHunt,
  "story-word-scout": storyWordScout,
};

/** Lookup by the lesson a warm-up feeds (journey: warmup → lesson → questions). */
export const WARMUP_BY_LESSON: Record<string, WarmupDef> = Object.fromEntries(
  Object.values(WARMUPS).map((w) => [w.lessonId, w]),
);
