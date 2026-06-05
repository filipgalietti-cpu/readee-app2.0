"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { TapToPair } from "../practice/TapToPair";
import { audioManager } from "@/lib/audio/audio-manager";

/**
 * The "match" flavour of the fork — pair each item with its mate (root→
 * meaning, prefix→meaning, word→vowel-team). Coach mode: a wrong pairing
 * bounces back (TapToPair's default reject-on-wrong), we surface a hint +
 * the spoken encouragement on the first miss, and the kid keeps trying.
 * When every pair lands, `onCorrect` fires the affirmation.
 *
 * Reuses the production TapToPair renderer — no rebuild. `assessmentMode`
 * is intentionally OFF so wrong matches are rejected (that IS the coach
 * loop), but it's never scored: the slide only ever advances on success.
 */
export function InteractiveMatch({
  anchor,
  prompt,
  leftItems,
  rightItems,
  correctPairs,
  hint,
  onCorrect,
  onWrong,
}: {
  anchor?: string;
  prompt: string;
  leftItems: string[];
  rightItems: string[];
  correctPairs: Record<string, string>;
  hint: string;
  onCorrect: () => void;
  onWrong?: (isFirst: boolean) => void;
}) {
  const [missed, setMissed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);

  // Scramble the right column so the correct pair is never straight across
  // from its mate (otherwise the kid just matches row-by-row without
  // thinking). Computed once per mount; falls back to a rotation that's a
  // guaranteed derangement if random shuffles keep landing aligned.
  const [displayRight] = useState(() => {
    const target = (l: string) => correctPairs[l];
    const aligned = (arr: string[]) => leftItems.some((l, i) => target(l) === arr[i]);
    let arr = [...rightItems];
    for (let t = 0; t < 30 && aligned(arr); t++) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    if (aligned(arr)) {
      const tg = leftItems.map(target);
      arr = tg.map((_, i) => tg[(i + 1) % tg.length]);
    }
    return arr;
  });

  return (
    <div className="flex w-full flex-col items-center gap-4 lg:gap-6 text-center">
      {anchor && (
        <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-base sm:text-lg font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
          {anchor}
        </span>
      )}

      {/* Render the instruction in our themed style — TapToPair's own h2 is
          black (text-zinc-900) which breaks the no-black-text rule + crowds
          the phone, so we pass it an empty prompt below. */}
      <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight text-violet-800 dark:text-violet-200 [text-wrap:balance]">
        {prompt}
      </p>

      <div className="w-full max-w-md">
        <TapToPair
          prompt=""
          leftItems={leftItems}
          rightItems={displayRight}
          correctPairs={correctPairs}
          answered={solved}
          // Don't fetch per-word audio (no /words/* clips for "un"/"not").
          onPlayItem={() => {}}
          onCorrectMatch={() => audioManager?.playCorrectChime?.()}
          onIncorrectMatch={() => {
            const isFirst = missed === 0;
            setMissed((m) => m + 1);
            setShowHint(true);
            onWrong?.(isFirst);
          }}
          onAnswer={(ok) => {
            if (ok) {
              setSolved(true);
              setShowHint(false);
              onCorrect();
            }
          }}
        />
      </div>

      <AnimatePresence>
        {showHint && !solved && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm sm:text-base font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-200 [text-wrap:balance]"
          >
            <Lightbulb className="h-5 w-5 flex-shrink-0" /> {hint}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
