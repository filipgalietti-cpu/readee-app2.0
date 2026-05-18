"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, RotateCcw, X } from "lucide-react";
import { useState } from "react";

/**
 * Interactive answer-choice block for the showcase practice page.
 * Renders the 4 choices as clickable buttons; on click, shows
 * green/red feedback, reveals the correct answer if the user
 * missed, plays a +10 carrots float on correct, and offers a
 * one-tap reset for repeat screen captures.
 */
const CHOICE_TINT = [
  "bg-rose-50 ring-rose-200 hover:bg-rose-100",
  "bg-violet-50 ring-violet-200 hover:bg-violet-100",
  "bg-amber-50 ring-amber-200 hover:bg-amber-100",
  "bg-sky-50 ring-sky-200 hover:bg-sky-100",
];

export default function InteractiveChoices({
  choices,
  correct,
}: {
  choices: string[];
  correct: string;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const answered = picked !== null;
  const gotIt = picked === correct;

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {choices.map((c, i) => {
          const isPicked = picked === c;
          const isCorrect = c === correct;
          const showAsCorrect = answered && isCorrect;
          const showAsWrong = isPicked && !isCorrect;
          const muted = answered && !isPicked && !isCorrect;

          return (
            <motion.button
              key={c}
              type="button"
              onClick={() => !answered && setPicked(c)}
              disabled={answered}
              animate={
                showAsWrong
                  ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                  : showAsCorrect && isPicked
                  ? { scale: [1, 1.04, 1] }
                  : { x: 0, scale: 1 }
              }
              transition={{ duration: showAsWrong ? 0.5 : 0.35 }}
              className={`flex min-h-[64px] items-center gap-3 rounded-2xl px-5 py-4 text-left text-base font-bold shadow-sm ring-2 transition ${
                showAsCorrect
                  ? "bg-emerald-500 text-white ring-emerald-600 shadow-md"
                  : showAsWrong
                  ? "bg-rose-500 text-white ring-rose-600"
                  : muted
                  ? "bg-zinc-50 text-zinc-400 ring-zinc-200 opacity-60"
                  : `text-zinc-800 ${CHOICE_TINT[i % CHOICE_TINT.length]}`
              }`}
            >
              {showAsCorrect && (
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-emerald-600">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
              )}
              {showAsWrong && (
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-rose-600">
                  <X className="h-4 w-4" strokeWidth={3} />
                </span>
              )}
              <span className="flex-1">{c}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Feedback strip — appears below the grid after a pick. */}
      <AnimatePresence>
        {answered && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="mt-8 flex flex-col items-center"
          >
            {gotIt ? (
              <>
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 px-6 py-3 text-white shadow-lg"
                >
                  <span className="text-2xl">🥕</span>
                  <span className="text-base font-extrabold">+10 carrots</span>
                </motion.div>
                {/* Floating carrots */}
                <div className="relative h-0">
                  {[0, 1, 2, 3].map((k) => (
                    <motion.div
                      key={k}
                      initial={{ y: 0, opacity: 0, x: -50 + k * 33 }}
                      animate={{ y: -110, opacity: [0, 1, 1, 0] }}
                      transition={{ delay: 0.1 + k * 0.1, duration: 1.6, ease: "easeOut" }}
                      className="absolute top-0 text-3xl"
                    >
                      🥕
                    </motion.div>
                  ))}
                </div>
                <p className="mt-4 text-base font-bold text-emerald-700">Nice work!</p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
                  Not quite — the answer was{" "}
                  <span className="ml-1 rounded-md bg-rose-600 px-2 py-0.5 text-white">
                    {correct}
                  </span>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setPicked(null)}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-zinc-900"
            >
              <RotateCcw className="h-4 w-4" />
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
