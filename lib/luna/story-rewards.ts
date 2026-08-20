/**
 * Carrot rewards for Luna Story Studio (kid create + publish loop).
 * One place to tune the economy. Amounts are deliberately small and
 * gated so the loop rewards real, approved creations — not spam.
 */
export const STORY_CARROTS = {
  /** Awarded once when a kid's story is submitted to the community. */
  post: 10,
  /** Awarded per unique reader (via the per-view RPC — see migration). */
  perRead: 2,
  /** Weekly "Storyteller of the Week" bonus for a top story. */
  weeklyTop: 50,
} as const;
