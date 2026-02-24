"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

interface MissingWordProps {
  prompt: string;
  sentenceWords: string[];
  blankIndex: number;
  choices: string[];
  sentenceHint?: string;
  sentenceAudioUrl?: string;
  answered: boolean;
  onAnswer: (isCorrect: boolean, selected: string) => void;
}

function playAudioAsync(url: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.addEventListener("ended", () => resolve());
    audio.addEventListener("error", () => resolve());
    audio.play().catch(() => resolve());
  });
}

const CHOICE_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-700",
  "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-700",
  "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700",
  "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700",
];

export function MissingWord({
  prompt,
  sentenceWords,
  blankIndex,
  choices,
  sentenceHint,
  sentenceAudioUrl,
  answered,
  onAnswer,
}: MissingWordProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const correctWord = sentenceWords[blankIndex];

  const handleChoice = useCallback(
    async (choice: string) => {
      if (selected !== null || answered) return;
      setSelected(choice);
      const isCorrect = choice.toLowerCase() === correctWord.toLowerCase();
      setResult(isCorrect ? "correct" : "incorrect");

      if (isCorrect && sentenceAudioUrl) {
        await playAudioAsync(sentenceAudioUrl);
      }

      onAnswer(isCorrect, choice);
    },
    [selected, answered, correctWord, sentenceAudioUrl, onAnswer]
  );

  const handleReplay = useCallback(() => {
    if (sentenceAudioUrl) {
      const audio = new Audio(sentenceAudioUrl);
      audio.play().catch(() => {});
    }
  }, [sentenceAudioUrl]);

  return (
    <div className="flex flex-col gap-6">
      {/* Prompt */}
      <div className="flex items-start gap-2">
        <h2 className="text-[22px] font-bold text-zinc-900 dark:text-white leading-snug text-center flex-1">
          {prompt}
        </h2>
        {sentenceAudioUrl && (
          <button
            onClick={handleReplay}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Replay audio"
          >
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z" />
            </svg>
          </button>
        )}
      </div>

      {/* Hint */}
      {sentenceHint && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700 px-4 py-3 text-center">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Hint: {sentenceHint}
          </p>
        </div>
      )}

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
          {sentenceWords.map((word, idx) => {
            if (idx === blankIndex) {
              // Show the selected answer or blank
              if (selected) {
                const isCorrectChoice = selected.toLowerCase() === correctWord.toLowerCase();
                return (
                  <span
                    key={idx}
                    className={`inline-block px-3 py-1 rounded-lg font-extrabold ${
                      isCorrectChoice
                        ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100"
                        : "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-100"
                    }`}
                  >
                    {isCorrectChoice ? selected : correctWord}
                  </span>
                );
              }
              return (
                <span
                  key={idx}
                  className="inline-block w-24 h-10 rounded-lg border-2 border-dashed border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-500"
                />
              );
            }
            return <span key={idx}>{word}</span>;
          })}
          <span>.</span>
        </p>
      </motion.div>

      {/* Word choices */}
      <div className="grid grid-cols-2 gap-3">
        {choices.map((choice, i) => {
          const isSelected = selected === choice;
          const isCorrectChoice = choice.toLowerCase() === correctWord.toLowerCase();
          const done = selected !== null;

          let style = CHOICE_COLORS[i % CHOICE_COLORS.length];
          if (done) {
            if (isSelected && result === "correct") {
              style = "bg-emerald-200 text-emerald-900 border-emerald-500 ring-2 ring-emerald-400/40 dark:bg-emerald-800 dark:text-emerald-100 dark:border-emerald-500";
            } else if (isSelected && result === "incorrect") {
              style = "bg-red-200 text-red-900 border-red-500 ring-2 ring-red-400/40 dark:bg-red-800 dark:text-red-100 dark:border-red-500";
            } else if (isCorrectChoice) {
              style = "bg-emerald-100 text-emerald-800 border-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-500";
            } else {
              style += " opacity-40";
            }
          }

          return (
            <motion.button
              key={choice}
              onClick={() => handleChoice(choice)}
              disabled={done || answered}
              className={`px-4 py-4 rounded-xl border-2 font-bold text-lg transition-all ${
                done || answered ? "cursor-default" : "cursor-pointer active:scale-95 hover:scale-105"
              } ${style}`}
              whileTap={!done && !answered ? { scale: 0.95 } : undefined}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {choice}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
