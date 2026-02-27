"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

interface PhonemeQuestionProps {
  prompt: string;
  phonemeAudioUrl?: string;
  choices: string[];
  correct: string;
  answered: boolean;
  onAnswer: (isCorrect: boolean, userAnswer: string) => void;
}

const CHOICE_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-700",
  "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-700",
  "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700",
  "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700",
];

export function PhonemeQuestion({
  prompt,
  phonemeAudioUrl,
  choices,
  correct,
  answered,
  onAnswer,
}: PhonemeQuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [playing, setPlaying] = useState(false);

  const handlePlaySound = useCallback(() => {
    if (!phonemeAudioUrl || playing) return;
    setPlaying(true);
    const audio = new Audio(phonemeAudioUrl);
    audio.addEventListener("ended", () => setPlaying(false));
    audio.addEventListener("error", () => setPlaying(false));
    audio.play().catch(() => setPlaying(false));
  }, [phonemeAudioUrl, playing]);

  const handleChoice = useCallback(
    (choice: string) => {
      if (selected !== null || answered) return;
      setSelected(choice);
      const isCorrect = choice === correct;
      setResult(isCorrect ? "correct" : "incorrect");
      onAnswer(isCorrect, choice);
    },
    [selected, answered, correct, onAnswer]
  );

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-[22px] font-bold text-zinc-900 dark:text-white leading-snug text-center">
        {prompt}
      </h2>

      {/* Play sound button */}
      {phonemeAudioUrl && (
        <div className="flex justify-center">
          <motion.button
            onClick={handlePlaySound}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              playing
                ? "bg-indigo-100 dark:bg-indigo-900/40 ring-4 ring-indigo-300 dark:ring-indigo-600"
                : "bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
            } border-2 border-indigo-300 dark:border-indigo-600`}
            whileTap={{ scale: 0.93 }}
            animate={
              playing
                ? { scale: [1, 1.08, 1], transition: { repeat: Infinity, duration: 0.8 } }
                : {}
            }
          >
            <svg
              className="w-10 h-10 text-indigo-600 dark:text-indigo-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path
                d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </motion.button>
        </div>
      )}

      {/* 2x2 choice grid */}
      <div className="grid grid-cols-2 gap-3">
        {choices.map((choice, i) => {
          const isSelected = selected === choice;
          const isCorrectChoice = choice === correct;
          const done = selected !== null;

          let style = CHOICE_COLORS[i % CHOICE_COLORS.length];
          if (done) {
            if (isSelected && result === "correct") {
              style =
                "bg-emerald-200 text-emerald-900 border-emerald-500 ring-2 ring-emerald-400/40 dark:bg-emerald-800 dark:text-emerald-100 dark:border-emerald-500";
            } else if (isSelected && result === "incorrect") {
              style =
                "bg-red-200 text-red-900 border-red-500 ring-2 ring-red-400/40 dark:bg-red-800 dark:text-red-100 dark:border-red-500";
            } else if (isCorrectChoice) {
              style =
                "bg-emerald-100 text-emerald-800 border-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-500";
            } else {
              style += " opacity-40";
            }
          }

          return (
            <motion.button
              key={choice}
              onClick={() => handleChoice(choice)}
              disabled={done || answered}
              className={`px-4 py-5 rounded-xl border-2 font-bold text-xl transition-all ${
                done || answered
                  ? "cursor-default"
                  : "cursor-pointer active:scale-95 hover:scale-105"
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
