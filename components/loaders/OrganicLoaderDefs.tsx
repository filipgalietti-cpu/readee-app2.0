"use client";

/**
 * Shared SVG <defs> for OrganicLoader. Mount once near the root of any
 * page that uses goo/gradient-driven variants (the 0-sized SVG is invisible).
 * Variants 2, 5, 6, 8, 10, 11, 13, 14, 16, 18, 19 reference filter/gradient IDs
 * defined here.
 */
export function OrganicLoaderDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute", pointerEvents: "none" }}
      aria-hidden="true"
    >
      <defs>
        <filter id="oloader-goo-02">
          <feGaussianBlur stdDeviation="6" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
        </filter>
        <filter id="oloader-goo-05">
          <feGaussianBlur stdDeviation="6" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
        </filter>
        <filter id="oloader-goo-06">
          <feGaussianBlur stdDeviation="7" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
        </filter>
        <filter id="oloader-goo-10">
          <feGaussianBlur stdDeviation="7" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
        </filter>
        <filter id="oloader-goo-13">
          <feGaussianBlur stdDeviation="8" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
        </filter>
        <filter id="oloader-goo-14">
          <feGaussianBlur stdDeviation="6" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" />
        </filter>
        <filter id="oloader-goo-16">
          <feGaussianBlur stdDeviation="5" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -6" />
        </filter>
        <filter id="oloader-goo-18">
          <feGaussianBlur stdDeviation="7" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
        </filter>

        <linearGradient id="oloader-grad-08" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="oloader-grad-19" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <radialGradient id="oloader-grad-11" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="55%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </radialGradient>
      </defs>
    </svg>
  );
}
