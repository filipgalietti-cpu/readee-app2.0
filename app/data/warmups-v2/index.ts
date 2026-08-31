import type { WarmupDef } from "@/lib/warmup-engine/types";
import { soundSwitchHunt } from "./sound-switch-hunt";
import { storyWordScout } from "./story-word-scout";
import { wordBuilderCompounds } from "./word-builder-compounds";
import { snapWordDash } from "./snap-word-dash";
import { rhymeRain } from "./rhyme-rain";
import { oppositeBlast } from "./opposite-blast";
import { GEN_WARMUPS } from "./gen";

/** Hand-built pilot rounds — the gold templates. These always win over
 *  generated defs, both by warm-up id and by lesson. */
export const HAND_BUILT_WARMUPS: Record<string, WarmupDef> = {
  "sound-switch-hunt": soundSwitchHunt,
  "story-word-scout": storyWordScout,
  "word-builder-compounds": wordBuilderCompounds,
  "snap-word-dash": snapWordDash,
  "rhyme-rain": rhymeRain,
  "opposite-blast": oppositeBlast,
};

/** All Warm-Up Arcade rounds, keyed by warm-up id.
 *  Generated first, hand-built last: hand-built wins any collision. */
export const WARMUPS: Record<string, WarmupDef> = {
  ...GEN_WARMUPS,
  ...HAND_BUILT_WARMUPS,
};

/** Lookup by the lesson a warm-up feeds (journey: warmup → lesson → questions).
 *  Built generated-first so a hand-built round keeps its lesson even if a
 *  generated def ever targets the same lesson. */
export const WARMUP_BY_LESSON: Record<string, WarmupDef> = Object.fromEntries(
  [...Object.values(GEN_WARMUPS), ...Object.values(HAND_BUILT_WARMUPS)].map((w) => [w.lessonId, w]),
);
