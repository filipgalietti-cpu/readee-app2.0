"use client";

import { computeLevel } from "@/lib/levels/levels";

/**
 * Compact reader-level badge. Used in headers, sidebars, leaderboard
 * rows — anywhere we need to call out "what level is this kid at."
 *
 * Three sizes:
 *   - "sm" → 24px icon dot only, no name (e.g. nav avatars)
 *   - "md" → 32px icon + name as a pill (e.g. dashboard header)
 *   - "lg" → 56px icon + name + level number (e.g. completion screens)
 */
export default function LevelBadge({
  lifetimeCarrots,
  size = "md",
  showName = true,
}: {
  lifetimeCarrots: number;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}) {
  const { current } = computeLevel(lifetimeCarrots);
  const Icon = current.icon;

  if (size === "sm") {
    return (
      <span
        title={`Level ${current.number} — ${current.name}`}
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${current.accent.bg} ${current.accent.fg}`}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      </span>
    );
  }

  if (size === "lg") {
    return (
      <div className="inline-flex items-center gap-3">
        <span
          className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${current.accent.bg} ${current.accent.fg} shadow-lg`}
        >
          <Icon className="h-7 w-7" strokeWidth={2.2} />
        </span>
        {showName && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Level {current.number}
            </div>
            <div className="text-base font-extrabold text-zinc-900 dark:text-white">
              {current.name}
            </div>
          </div>
        )}
      </div>
    );
  }

  // size === "md"
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${current.accent.soft}`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      {showName ? (
        <span>
          <span className="font-mono">Lv {current.number}</span> · {current.name}
        </span>
      ) : (
        <span className="font-mono">Lv {current.number}</span>
      )}
    </span>
  );
}
