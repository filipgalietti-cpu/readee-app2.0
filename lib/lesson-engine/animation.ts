// Semantic animation tokens — the single place motion values live.
// Components request meaning ("success burst", "snap spring"); this file owns
// the physical values. This is Claude Design's surface: polishing motion means
// editing THESE tokens, not hunting Framer values inside components.

export const MOTION = {
  /** Spring for a piece snapping into its slot. */
  snapSpring: { type: "spring" as const, stiffness: 260, damping: 16 },
  /** Spring for a meaning-image flip (old meaning → new meaning). */
  flipSpring: { type: "spring" as const, stiffness: 220, damping: 18 },
  /** The changed letter's emphasis beat (scale + glow) after a transform. */
  emphasis: {
    scale: [1, 1.45, 1] as number[],
    glow: [
      "0 0 0px rgba(16,185,129,0)",
      "0 0 26px rgba(16,185,129,.75)",
      "0 0 0px rgba(16,185,129,0)",
    ] as string[],
    duration: 0.6,
  },
  /** New-piece arrival (the E landing). */
  arrival: { scale: [0.2, 1.25, 1] as number[], rotate: [-25, 0] as number[], duration: 0.6 },
  /** Post-success hold before the lesson advances state (let the beat land). */
  successHoldMs: 900,
} as const;

/** correctBurst — deterministic sparkle field (no Math.random → stable SSR). */
export const SPARKLES = Array.from({ length: 14 }, (_, i) => ({
  i,
  angle: (i / 14) * Math.PI * 2,
  dist: 70 + (i % 3) * 22,
  delay: (i % 5) * 0.02,
  hue: ["#f59e0b", "#8b5cf6", "#10b981", "#4338ca", "#f43f5e"][i % 5],
}));
