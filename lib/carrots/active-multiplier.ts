/**
 * Active carrot powerup (e.g. the mystery-box 2x), persisted on the child
 * row so it survives across devices/sessions and applies to EVERY carrot
 * award surface — practice, stories, lessons — not just the localStorage
 * flag the practice runner used before.
 *
 * Granted powerups run for a fixed window (POWERUP_WINDOW_MS) rather than
 * being consumed once, so the reward feels real everywhere for its
 * duration. Expiry is checked client-side against the stored timestamp.
 */
import type { Child } from "@/lib/db/types";

/** How long a granted powerup stays active. */
export const POWERUP_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

type MultiplierFields = Pick<
  Child,
  "active_multiplier" | "active_multiplier_expires_at"
>;

/**
 * The multiplier currently in effect for a child (>= 1). Returns 1 when
 * there's no powerup, it's <= 1, or it has expired.
 */
export function getActiveMultiplier(
  child: MultiplierFields | null | undefined,
): number {
  if (!child) return 1;
  const mult = child.active_multiplier ?? 1;
  if (!Number.isFinite(mult) || mult <= 1) return 1;
  const expiresAt = child.active_multiplier_expires_at;
  if (!expiresAt) return 1;
  if (new Date(expiresAt).getTime() <= Date.now()) return 1;
  return mult;
}

/**
 * The DB patch to grant a powerup that lasts POWERUP_WINDOW_MS from now.
 * Callers spread this into a `children` update and into local child state.
 */
export function grantPowerupFields(multiplier: number): {
  active_multiplier: number;
  active_multiplier_expires_at: string;
} {
  return {
    active_multiplier: multiplier,
    active_multiplier_expires_at: new Date(
      Date.now() + POWERUP_WINDOW_MS,
    ).toISOString(),
  };
}
