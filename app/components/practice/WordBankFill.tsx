"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WordBankFillProps {
  prompt: string;
  sentence: string;
  blankIndex: number;
  wordBank: string[];
  correct: string;
  difficulty?: "easy" | "medium" | "hard";
  answered: boolean;
  onAnswer: (isCorrect: boolean, userAnswer: string) => void;
}

const CHIP_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-700",
  "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-700",
  "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700",
  "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700",
  "bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/60 dark:text-pink-200 dark:border-pink-700",
];

export function WordBankFill({
  prompt,
  sentence,
  blankIndex,
  wordBank,
  correct,
  answered,
  onAnswer,
}: WordBankFillProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  const words = sentence.split(" ");

  const handleTapWord = useCallback(
    (word: string) => {
      if (answered || result !== null) return;
      if (selected === word) {
        // Deselect
        setSelected(null);
        return;
      }
      setSelected(word);
    },
    [answered, result, selected]
  );

  const handleCheck = useCallback(() => {
    if (!selected || answered || result !== null) return;
    const isCorrect = selected.toLowerCase() === correct.toLowerCase();
    setResult(isCorrect ? "correct" : "incorrect");
    onAnswer(isCorrect, selected);
  }, [selected, answered, result, correct, onAnswer]);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-[22px] font-bold text-zinc-900 dark:text-white leading-snug text-center">
        {prompt}
      </h2>

      {/* Sentence with blank */}
      <motion.div
        className={`rounded-2xl border-2 p-5 text-center transition-colors ${
          result === "correct"
            ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 dark:border-emerald-500"
            : result === "incorrect"
            ? "border-red-400 bg-red-50/50 dark:bg-red-900/20 dark:border-red-500"
            : "border-zinc-300 bg-white dark:border-slate-600 dark:bg-slate-800/50"
        }`}
        animate={
          result === "incorrect"
            ? { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.5 } }
            : result === "correct"
            ? { scale: [1, 1.02, 1], transition: { duration: 0.3 } }
            : {}
        }
      >
        <p className="text-2xl font-bold text-zinc-900 dark:text-white leading-relaxed flex flex-wrap items-center justify-center gap-2">
          {words.map((word, idx) => {
            if (idx === blankIndex) {
              if (selected && result !== null) {
                const isCorrectChoice =
                  selected.toLowerCase() === correct.toLowerCase();
                return (
                  <span
                    key={idx}
                    className={`inline-block px-3 py-1 rounded-lg font-extrabold ${
                      isCorrectChoice
                        ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100"
                        : "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-100"
                    }`}
                  >
                    {isCorrectChoice ? selected : correct}
                  </span>
                );
              }
              return (
                <AnimatePresence mode="wait" key={idx}>
                  {selected ? (
                    <motion.span
                      key="filled"
                      className="inline-block px-3 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-extrabold dark:bg-indigo-900/40 dark:text-indigo-200 border-2 border-indigo-300 dark:border-indigo-600"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {selected}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="blank"
                      className="inline-block w-24 h-10 rounded-lg border-2 border-dashed border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
              );
            }
            return <span key={idx}>{word}</span>;
          })}
        </p>
      </motion.div>

      {/* Word bank chips */}
      <div className="flex flex-wrap gap-3 justify-center">
        {wordBank.map((word, i) => {
          const isSelected = selected === word;
          const done = result !== null;

          let style = CHIP_COLORS[i % CHIP_COLORS.length];
          if (done) {
            const isCorrectWord = word.toLowerCase() === correct.toLowerCase();
            if (isSelected && result === "correct") {
              style =
                "bg-emerald-200 text-emerald-900 border-emerald-500 ring-2 ring-emerald-400/40 dark:bg-emerald-800 dark:text-emerald-100 dark:border-emerald-500";
            } else if (isSelected && result === "incorrect") {
              style =
                "bg-red-200 text-red-900 border-red-500 ring-2 ring-red-400/40 dark:bg-red-800 dark:text-red-100 dark:border-red-500";
            } else if (isCorrectWord) {
              style =
                "bg-emerald-100 text-emerald-800 border-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-500";
            } else {
              style += " opacity-40";
            }
          } else if (isSelected) {
            style =
              "bg-indigo-200 text-indigo-900 border-indigo-500 ring-2 ring-indigo-400/50 dark:bg-indigo-800 dark:text-indigo-100 dark:border-indigo-400";
          }

          return (
            <motion.button
              key={word}
              onClick={() => handleTapWord(word)}
              disabled={done || answered}
              className={`px-5 py-3 rounded-xl border-2 font-bold text-lg transition-all ${
                done || answered
                  ? "cursor-default"
                  : "cursor-pointer active:scale-95 hover:scale-105"
              } ${style}`}
              whileTap={!done && !answered ? { scale: 0.95 } : undefined}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {word}
            </motion.button>
          );
        })}
      </div>

      {/* Check button */}
      {!answered && result === null && (
        <motion.button
          onClick={handleCheck}
          disabled={!selected}
          className={`w-full py-4 rounded-2xl font-extrabold text-lg transition-all active:scale-[0.97] ${
            selected
              ? "text-white"
              : "bg-zinc-200 text-zinc-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed"
          }`}
          style={
            selected
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
