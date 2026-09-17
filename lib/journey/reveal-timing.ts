export const JOURNEY_REVEAL_STEP_MS = 320;
export const JOURNEY_REVEAL_STEP_SECONDS = JOURNEY_REVEAL_STEP_MS / 1000;

/** Keep the map in its building state until its final landmark is visible. */
export function journeyRevealDurationMs(pointCount: number): number {
  return Math.max(3200, Math.max(0, pointCount - 1) * JOURNEY_REVEAL_STEP_MS + 700);
}
