"use client";

import { Glyph } from "@/app/_components/Glyph";
import { getSessionStreakTier } from "@/lib/carrots/multipliers";
import "./streak-fire.css";

/** The practice screen's Fluent flame, flicker and embers, shared with lessons.
 * This only displays the streak; the saved reward ledger determines carrots. */
export function StreakFire({ consecutiveCorrect }: { consecutiveCorrect: number }) {
  const { multiplier } = getSessionStreakTier(consecutiveCorrect);
  if (consecutiveCorrect < 2) return null;
  const lit = multiplier > 1;
  return (
    <div
      key={multiplier}
      className={`readee-streak ${lit ? "is-lit" : ""}`}
      data-multiplier={multiplier}
      role="status"
      aria-label={`${consecutiveCorrect} in a row${lit ? `. ${multiplier}x carrots` : ""}`}
      title={
        lit
          ? `${multiplier}x carrot streak - keep it going!`
          : "Answer questions in a row to light the streak!"
      }
    >
      {lit && (
        <span className="readee-streak-embers" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
      <span className="readee-streak-flame" aria-hidden="true">
        <Glyph name="flame" size={18} />
      </span>
      <span className="readee-streak-count">{consecutiveCorrect} in a row</span>
      {lit && <span className="readee-streak-multiplier">{multiplier}x</span>}
    </div>
  );
}
