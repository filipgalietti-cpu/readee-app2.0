"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Howl } from "howler";

const SUPABASE_AUDIO_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio`
  : "";

interface SpaceInsertionProps {
  prompt: string;
  jumbled: string;        // e.g. "Mydogisbig."
  correctSentence: string; // e.g. "My dog is big."
  questionId?: string;
  answered: boolean;
  onAnswer: (isCorrect: boolean, result: string) => void;
}

/**
 * SpaceInsertion — kids tap between letters to insert spaces.
 *
 * Renders each character of the jumbled string. Between each pair of characters
 * is a tappable gap. Tapping inserts/removes a space at that position.
 * A "CHECK" button validates against the correct sentence.
 */
export function SpaceInsertion({
  prompt,
  jumbled,
  correctSentence,
  questionId,
  answered,
  onAnswer,
}: SpaceInsertionProps) {
  // Track which gaps have spaces inserted (gaps are between chars, so length = chars.length - 1)
  const chars = useMemo(() => jumbled.split(""), [jumbled]);
  const [spaces, setSpaces] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [shaking, setShaking] = useState(false);

  const toggleSpace = useCallback(
    (gapIndex: number) => {
      if (answered || result !== null) return;
      setSpaces((prev) => {
        const next = new Set(prev);
        if (next.has(gapIndex)) {
          next.delete(gapIndex);
        } else {
          next.add(gapIndex);
        }
        return next;
      });
    },
    [answered, result]
  );

  // Build the current attempt string
  const currentAttempt = useMemo(() => {
    let str = "";
    for (let i = 0; i < chars.length; i++) {
      str += chars[i];
      if (i < chars.length - 1 && spaces.has(i)) {
        str += " ";
      }
    }
    return str;
  }, [chars, spaces]);

  const hasSpaces = spaces.size > 0;

  const handleCheck = useCallback(() => {
    if (!hasSpaces || answered || result !== null) return;
    const isCorrect = currentAttempt === correctSentence;
    setResult(isCorrect ? "correct" : "incorrect");

    if (!isCorrect) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => {
        onAnswer(false, currentAttempt);
      }, 400);
      return;
    }

    // Correct — play sentence readback
    if (questionId && SUPABASE_AUDIO_BASE) {
      const standard = questionId.replace(/-Q\d+$/, "");
      const readbackUrl = `${SUPABASE_AUDIO_BASE}/kindergarten/${standard}/${questionId}-sentence.mp3`;
      new Howl({ src: [readbackUrl] }).play();
      setTimeout(() => onAnswer(true, currentAttempt), 2500);
    } else {
      onAnswer(true, currentAttempt);
    }
  }, [hasSpaces, answered, result, currentAttempt, correctSentence, questionId, onAnswer]);

  return (
    <div className="flex flex-col gap-6">
      {/* Prompt */}
      <h2 className="text-[22px] font-bold text-zinc-900 dark:text-white leading-snug text-center">
        {prompt}
      </h2>

      {/* Instruction */}
      <div className="rounded-xl bg-indigo-50 border border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-700 px-4 py-3 text-center">
        <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
          Tap between letters to add spaces!
        </p>
      </div>

      {/* Character grid with tappable gaps */}
      <motion.div
        className={`rounded-2xl border-2 p-4 md:p-6 transition-colors ${
          result === "correct"
            ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 dark:border-emerald-500"
            : result === "incorrect"
            ? "border-red-400 bg-red-50/50 dark:bg-red-900/20 dark:border-red-500"
            : "border-zinc-300 bg-white dark:border-slate-600 dark:bg-slate-800/50"
        }`}
        animate={
          shaking
            ? { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.5 } }
            : result === "correct"
            ? { scale: [1, 1.02, 1], transition: { duration: 0.3 } }
            : {}
        }
      >
        <div className="flex flex-wrap items-center justify-center">
          {chars.map((char, i) => (
            <div key={i} className="flex items-center">
              {/* The character */}
              <span
                className={`text-2xl md:text-3xl font-bold select-none ${
                  result === "correct"
                    ? "text-emerald-700 dark:text-emerald-300"
                    : result === "incorrect"
                    ? "text-red-700 dark:text-red-300"
                    : "text-zinc-900 dark:text-white"
                }`}
              >
                {char}
              </span>

              {/* Tappable gap between characters */}
              {i < chars.length - 1 && (
                <button
                  onClick={() => toggleSpace(i)}
                  disabled={answered || result !== null}
                  className={`relative flex items-center justify-center transition-all ${
                    answered || result !== null ? "cursor-default" : "cursor-pointer"
                  } ${
                    spaces.has(i)
                      ? "w-6 md:w-8 mx-0.5"
                      : "w-1 md:w-1.5 mx-0 hover:w-4 hover:mx-0.5"
                  }`}
                  aria-label={spaces.has(i) ? "Remove space" : "Add space"}
                >
                  {spaces.has(i) ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-full h-8 md:h-10 rounded-lg bg-indigo-100 border-2 border-dashed border-indigo-400 dark:bg-indigo-900/40 dark:border-indigo-500 flex items-center justify-center"
                    >
                      <span className="text-indigo-400 dark:text-indigo-500 text-xs font-bold">
                        _
                      </span>
                    </motion.div>
                  ) : (
                    <div className="w-full h-8 md:h-10 rounded-lg opacity-0 hover:opacity-100 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-transparent hover:border-dashed hover:border-indigo-300 dark:hover:border-indigo-600 transition-opacity" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Preview of current attempt */}
      {hasSpaces && result === null && (
        <div className="text-center">
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            Your sentence:{" "}
            <span className="font-semibold text-zinc-700 dark:text-slate-200">
              {currentAttempt}
            </span>
          </p>
        </div>
      )}

      {/* Check button */}
      {!answered && result === null && (
        <motion.button
          onClick={handleCheck}
          disabled={!hasSpaces}
          className={`w-full py-4 rounded-2xl font-extrabold text-lg transition-all active:scale-[0.97] ${
            hasSpaces
              ? "text-white"
              : "bg-zinc-200 text-zinc-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed"
          }`}
          style={
            hasSpaces
              ? {
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 4px 0 0 #4f46e5",
                }
              : undefined
          }
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          CHECK
        </motion.button>
      )}
    </div>
  );
}
