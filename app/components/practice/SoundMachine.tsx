"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SoundMachineProps {
  prompt: string;
  targetWord: string;
  phonemes: string[];
  distractors?: string[];
  answered: boolean;
  onAnswer: (isCorrect: boolean, userAnswer: string) => void;
}

const CHIP_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-700",
  "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-700",
  "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700",
  "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700",
  "bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/60 dark:text-pink-200 dark:border-pink-700",
  "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/60 dark:text-cyan-200 dark:border-cyan-700",
  "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/60 dark:text-orange-200 dark:border-orange-700",
];

export function SoundMachine({
  prompt,
  targetWord,
  phonemes,
  distractors = [],
  answered,
  onAnswer,
}: SoundMachineProps) {
  const slotCount = phonemes.length;

  // All available sounds with stable indices for color mapping
  const allSounds = useMemo(() => {
    const combined = [...phonemes, ...distractors];
    // Shuffle deterministically based on the target word
    const seeded = combined.map((s, i) => ({ s, sort: hashCode(`${targetWord}-${i}`) }));
    seeded.sort((a, b) => a.sort - b.sort);
    return seeded.map((x) => x.s);
  }, [phonemes, distractors, targetWord]);

  // Map each sound in allSounds back to its original index for color consistency
  const colorIndices = useMemo(() => {
    const combined = [...phonemes, ...distractors];
    return allSounds.map((s) => {
      const idx = combined.indexOf(s);
      // Handle duplicates by marking found ones
      combined[idx] = "\0";
      return idx;
    });
  }, [allSounds, phonemes, distractors]);

  // placed[i] = index into allSounds that occupies slot i, or -1 if empty
  const [placed, setPlaced] = useState<number[]>(() => Array(slotCount).fill(-1));
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [shaking, setShaking] = useState(false);

  const usedIndices = new Set(placed.filter((i) => i !== -1));
  const bankIndices = allSounds.map((_, i) => i).filter((i) => !usedIndices.has(i));
  const allSlotsFilled = placed.every((i) => i !== -1);

  const nextEmptySlot = placed.indexOf(-1);

  const handleTapBank = useCallback(
    (soundIdx: number) => {
      if (answered || result !== null || nextEmptySlot === -1) return;
      setPlaced((prev) => {
        const next = [...prev];
        next[nextEmptySlot] = soundIdx;
        return next;
      });
    },
    [answered, result, nextEmptySlot]
  );

  const handleTapSlot = useCallback(
    (slotIdx: number) => {
      if (answered || result !== null) return;
      if (placed[slotIdx] === -1) return;
      setPlaced((prev) => {
        const next = [...prev];
        next[slotIdx] = -1;
        return next;
      });
    },
    [answered, result, placed]
  );

  const handleCheck = useCallback(() => {
    if (!allSlotsFilled || answered || result !== null) return;
    const userPhonemes = placed.map((i) => allSounds[i]);
    const isCorrect = userPhonemes.every((s, i) => s === phonemes[i]);
    const userAnswer = userPhonemes.join(" ");

    setResult(isCorrect ? "correct" : "incorrect");

    if (!isCorrect) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => {
        onAnswer(false, userAnswer);
      }, 400);
      return;
    }

    onAnswer(true, userAnswer);
  }, [allSlotsFilled, answered, result, placed, allSounds, phonemes, onAnswer]);

  return (
    <div className="flex flex-col gap-6">
      {/* Prompt */}
      <h2 className="text-[22px] font-bold text-zinc-900 dark:text-white leading-snug text-center">
        {prompt}
      </h2>

      {/* Machine */}
      <motion.div
        className={`relative rounded-2xl p-4 transition-colors ${
          result === "correct"
            ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-800/20"
            : result === "incorrect"
            ? "bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/30 dark:to-red-800/20"
            : "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20"
        }`}
        style={{
          border: "3px solid transparent",
          backgroundClip: "padding-box",
          outline:
            result === "correct"
              ? "3px solid rgb(52 211 153)"
              : result === "incorrect"
              ? "3px solid rgb(248 113 113)"
              : "3px solid transparent",
          backgroundImage:
            result === null
              ? `linear-gradient(to bottom right, ${
                  "var(--tw-gradient-from, rgb(238 242 255)), var(--tw-gradient-to, rgb(250 245 255))"
                }), linear-gradient(135deg, #6366f1, #8b5cf6, #6366f1)`
              : undefined,
          backgroundOrigin: "border-box",
        }}
      >
        {/* Gradient border wrapper */}
        <div
          className={`absolute inset-0 rounded-2xl -z-10 ${
            result !== null ? "" : "bg-gradient-to-br from-indigo-400 to-purple-500"
          }`}
          style={{ margin: "-3px", borderRadius: "inherit" }}
        />

        {/* Gear icon */}
        <div className="flex items-center gap-2 mb-3">
          <svg
            className={`w-5 h-5 ${
              result === "correct"
                ? "text-emerald-500 dark:text-emerald-400"
                : result === "incorrect"
                ? "text-red-500 dark:text-red-400"
                : "text-indigo-500 dark:text-indigo-400"
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z" />
          </svg>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wide">
            Sound Machine
          </span>
        </div>

        {/* Slots */}
        <div className="flex gap-2 justify-center flex-wrap">
          {placed.map((soundIdx, slotIdx) => (
            <motion.button
              key={`slot-${slotIdx}`}
              onClick={() => handleTapSlot(slotIdx)}
              disabled={answered || result !== null || soundIdx === -1}
              className={`w-20 h-16 rounded-xl border-2 border-dashed flex items-center justify-center text-lg font-bold transition-all ${
                soundIdx === -1
                  ? "border-zinc-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50"
                  : `border-solid cursor-pointer active:scale-95 ${
                      CHIP_COLORS[colorIndices[soundIdx] % CHIP_COLORS.length]
                    }`
              } ${answered || result !== null ? "cursor-default" : ""}`}
              animate={
                shaking && soundIdx !== -1
                  ? { x: [0, -6, 6, -4, 4, -2, 2, 0], transition: { duration: 0.5 } }
                  : result === "correct" && soundIdx !== -1
                  ? { scale: [1, 1.08, 1], transition: { duration: 0.3, delay: slotIdx * 0.05 } }
                  : {}
              }
            >
              {soundIdx === -1 ? (
                <span className="text-zinc-400 dark:text-slate-500 text-sm">{slotIdx + 1}</span>
              ) : (
                <motion.span
                  layoutId={`sound-${soundIdx}`}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {allSounds[soundIdx]}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Output area — assembled word after correct answer */}
      <AnimatePresence>
        {result === "correct" && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.5, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.15 }}
          >
            <span className="inline-block text-4xl font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-6 py-3 rounded-2xl border-2 border-emerald-300 dark:border-emerald-600">
              {targetWord}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sound bank */}
      <div className="flex flex-wrap gap-2 justify-center min-h-[48px]">
        <AnimatePresence mode="popLayout">
          {bankIndices.map((soundIdx) => (
            <motion.button
              key={`bank-${soundIdx}`}
              onClick={() => handleTapBank(soundIdx)}
              disabled={answered || result !== null}
              className={`px-5 py-3 rounded-xl border-2 font-bold text-lg transition-all ${
                answered || result !== null
                  ? "cursor-default opacity-40"
                  : "cursor-pointer hover:scale-105 active:scale-95"
              } ${CHIP_COLORS[colorIndices[soundIdx] % CHIP_COLORS.length]}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <motion.span
                layoutId={`sound-${soundIdx}`}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {allSounds[soundIdx]}
              </motion.span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Check button */}
      {!answered && result === null && (
        <motion.button
          onClick={handleCheck}
          disabled={!allSlotsFilled}
          className={`w-full py-4 rounded-2xl font-extrabold text-lg transition-all active:scale-[0.97] ${
            allSlotsFilled
              ? "text-white"
              : "bg-zinc-200 text-zinc-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed"
          }`}
          style={
            allSlotsFilled
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

/** Simple deterministic hash for shuffling */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
