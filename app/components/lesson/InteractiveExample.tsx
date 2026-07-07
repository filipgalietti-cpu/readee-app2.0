"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lightbulb } from "lucide-react";

/**
 * The "we do" of a lesson — a scaffolded, interactive example. The kid
 * TAPS the answer; this is a COACH, not a test:
 *   - right  → celebrate, then continue (onCorrect)
 *   - wrong  → grey the wrong choice + a HINT tied to the teaching, and
 *              let them try again. Never scored, never blocks for long.
 * Distinct from the end-of-lesson MCQ (which is the independent "you do").
 *
 * Skill-matched by the choices/prompt the example author supplies (tap an
 * answer, a word part, a sound — all render as tappable pills here).
 */
export function InteractiveExample({
  anchor,
  prompt,
  choices,
  correct,
  hint,
  onCorrect,
  onWrong,
}: {
  anchor?: string;
  prompt: string;
  choices: string[];
  correct: string;
  hint: string;
  /** Fired the instant the kid taps the right answer. The parent plays
   *  the affirmation clip and only then enables "Next". */
  onCorrect: () => void;
  /** Fired on a wrong tap. `isFirst` is true only on the FIRST miss — the
   *  parent plays the full spoken encouragement once, then just a soft
   *  buzz on repeat misses so the same sentence doesn't replay. */
  onWrong?: (isFirst: boolean) => void;
}) {
  const [wrong, setWrong] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);

  const norm = (s: string) => s.toLowerCase().trim();

  const pick = (c: string) => {
    if (solved || wrong.includes(c)) return;
    if (norm(c) === norm(correct)) {
      setSolved(true);
      setShowHint(false);
      onCorrect();
    } else {
      const isFirstMiss = wrong.length === 0;
      setWrong((w) => [...w, c]);
      setShowHint(true);
      onWrong?.(isFirstMiss);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-4 lg:gap-6 text-center">
      {anchor && (
        <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-base sm:text-lg font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
          {anchor}
        </span>
      )}
      <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight text-violet-800 dark:text-violet-200 [text-wrap:balance]">
        {prompt}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {choices.map((c) => {
          const isCorrect = solved && norm(c) === norm(correct);
          const isWrong = wrong.includes(c);
          return (
            <motion.button
              key={c}
              whileTap={{ scale: 0.94 }}
              onClick={() => pick(c)}
              disabled={solved || isWrong}
              animate={isCorrect ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.45 }}
              className={`rounded-2xl px-6 py-4 text-lg sm:text-xl lg:text-2xl font-bold shadow-sm transition-colors ${
                isCorrect
                  ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-200"
                  : isWrong
                    ? "bg-zinc-100 text-zinc-300 line-through dark:bg-zinc-800 dark:text-zinc-600"
                    : "bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-900/40 dark:text-violet-200"
              }`}
            >
              {c}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {solved ? (
          <motion.div
            key="win"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-300"
          >
            <Sparkles className="h-5 w-5" /> Yes! You got it!
          </motion.div>
        ) : showHint ? (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm sm:text-base font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-200 [text-wrap:balance]"
          >
            <Lightbulb className="h-5 w-5 flex-shrink-0" /> {hint} Try again!
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
