"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhonemeQuestion } from "@/app/components/practice/PhonemeQuestion";
import { TapToPair } from "@/app/components/practice/TapToPair";
import { WordBankFill } from "@/app/components/practice/WordBankFill";

/* ── Sample data ─────────────────────────────────────── */

interface PhonemeQ {
  type: "phoneme";
  prompt: string;
  phonemeAudioUrl?: string;
  choices: string[];
  correct: string;
}

interface MatchingQ {
  type: "matching";
  prompt: string;
  leftItems: string[];
  rightItems: string[];
  correctPairs: Record<string, string>;
}

interface WordBankQ {
  type: "word_bank_fill";
  prompt: string;
  sentence: string;
  blankIndex: number;
  wordBank: string[];
  correct: string;
  difficulty: "easy" | "medium" | "hard";
}

const PHONEME_QUESTIONS: PhonemeQ[] = [
  {
    type: "phoneme",
    prompt: 'What sound does B make?',
    phonemeAudioUrl: "/audio/phonemes/b.mp3",
    choices: ["/b/", "/d/", "/p/", "/g/"],
    correct: "/b/",
  },
  {
    type: "phoneme",
    prompt: 'Which letter says /s/?',
    choices: ["Z", "S", "C", "F"],
    correct: "S",
  },
  {
    type: "phoneme",
    prompt: 'Tap the word that starts with /m/',
    phonemeAudioUrl: "/audio/phonemes/m.mp3",
    choices: ["nap", "map", "tap", "cap"],
    correct: "map",
  },
  {
    type: "phoneme",
    prompt: 'Which letter says /k/?',
    phonemeAudioUrl: "/audio/phonemes/k.mp3",
    choices: ["T", "K", "G", "D"],
    correct: "K",
  },
];

const MATCHING_QUESTIONS: MatchingQ[] = [
  {
    type: "matching",
    prompt: "Match uppercase to lowercase",
    leftItems: ["A", "B", "C", "D"],
    rightItems: ["c", "a", "d", "b"],
    correctPairs: { A: "a", B: "b", C: "c", D: "d" },
  },
  {
    type: "matching",
    prompt: "Match the rhyming words",
    leftItems: ["cat", "dog", "sun", "red"],
    rightItems: ["bed", "fun", "hat", "log"],
    correctPairs: { cat: "hat", dog: "log", sun: "fun", red: "bed" },
  },
  {
    type: "matching",
    prompt: "Match the word to its meaning",
    leftItems: ["big", "fast", "happy"],
    rightItems: ["quick", "glad", "large"],
    correctPairs: { big: "large", fast: "quick", happy: "glad" },
  },
];

const WORD_BANK_QUESTIONS: WordBankQ[] = [
  {
    type: "word_bank_fill",
    prompt: "Fill in the blank:",
    sentence: "The cat sat on the ___.",
    blankIndex: 5,
    wordBank: ["mat", "dog"],
    correct: "mat",
    difficulty: "easy",
  },
  {
    type: "word_bank_fill",
    prompt: "Fill in the blank:",
    sentence: "The ___ flew over the rainbow.",
    blankIndex: 1,
    wordBank: ["bird", "car", "fish"],
    correct: "bird",
    difficulty: "medium",
  },
  {
    type: "word_bank_fill",
    prompt: "Fill in the blank:",
    sentence: "She ___ the ball to her friend.",
    blankIndex: 1,
    wordBank: ["threw", "ate", "read"],
    correct: "threw",
    difficulty: "medium",
  },
  {
    type: "word_bank_fill",
    prompt: "Fill in the blank:",
    sentence: "The scientist ___ the experiment carefully.",
    blankIndex: 2,
    wordBank: ["observed", "ignored", "destroyed", "painted"],
    correct: "observed",
    difficulty: "hard",
  },
];

type Tab = "phoneme" | "matching" | "word_bank";

const TABS: { key: Tab; label: string }[] = [
  { key: "phoneme", label: "Phoneme" },
  { key: "matching", label: "Matching" },
  { key: "word_bank", label: "Word Bank" },
];

/* ── Page ────────────────────────────────────────────── */

export default function PrototypePage() {
  const [tab, setTab] = useState<Tab>("phoneme");
  const [indices, setIndices] = useState<Record<Tab, number>>({
    phoneme: 0,
    matching: 0,
    word_bank: 0,
  });
  const [answeredKeys, setAnsweredKeys] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, "correct" | "incorrect">>({});

  const counts: Record<Tab, number> = {
    phoneme: PHONEME_QUESTIONS.length,
    matching: MATCHING_QUESTIONS.length,
    word_bank: WORD_BANK_QUESTIONS.length,
  };

  const idx = indices[tab];
  const total = counts[tab];
  const questionKey = `${tab}-${idx}`;
  const isAnswered = answeredKeys.has(questionKey);

  const goTo = useCallback(
    (n: number) => {
      setIndices((prev) => ({
        ...prev,
        [tab]: Math.max(0, Math.min(n, counts[tab] - 1)),
      }));
    },
    [tab, counts]
  );

  const handleAnswer = useCallback(
    (isCorrect: boolean, _userAnswer: string) => {
      setAnsweredKeys((prev) => new Set(prev).add(questionKey));
      setResults((prev) => ({
        ...prev,
        [questionKey]: isCorrect ? "correct" : "incorrect",
      }));
    },
    [questionKey]
  );

  const handleNext = useCallback(() => {
    if (idx < total - 1) {
      goTo(idx + 1);
    }
  }, [idx, total, goTo]);

  const feedbackResult = results[questionKey];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-slate-700">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white text-center">
            Question Prototypes
          </h1>

          {/* Tab bar */}
          <div className="flex gap-1 mt-2 bg-zinc-100 dark:bg-slate-800 rounded-xl p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  tab === t.key
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                    : "text-zinc-500 dark:text-slate-400 hover:text-zinc-700 dark:hover:text-slate-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => goTo(idx - 1)}
            disabled={idx === 0}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 disabled:opacity-30 transition-all hover:bg-zinc-50 dark:hover:bg-slate-700"
          >
            <svg className="w-5 h-5 text-zinc-600 dark:text-slate-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Jump-to dots */}
          <div className="flex gap-2 items-center">
            {Array.from({ length: total }, (_, i) => {
              const key = `${tab}-${i}`;
              const r = results[key];
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === idx
                      ? "ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-slate-900"
                      : ""
                  } ${
                    r === "correct"
                      ? "bg-emerald-400"
                      : r === "incorrect"
                      ? "bg-red-400"
                      : "bg-zinc-300 dark:bg-slate-600"
                  }`}
                />
              );
            })}
          </div>

          <button
            onClick={() => goTo(idx + 1)}
            disabled={idx === total - 1}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 disabled:opacity-30 transition-all hover:bg-zinc-50 dark:hover:bg-slate-700"
          >
            <svg className="w-5 h-5 text-zinc-600 dark:text-slate-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Counter */}
        <p className="text-center text-sm text-zinc-500 dark:text-slate-400 mb-4">
          {idx + 1} / {total}
        </p>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={questionKey}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-800/80 rounded-2xl border border-zinc-200 dark:border-slate-700 p-5 shadow-sm"
          >
            {tab === "phoneme" && (
              <PhonemeQuestion
                key={questionKey}
                prompt={PHONEME_QUESTIONS[idx].prompt}
                phonemeAudioUrl={PHONEME_QUESTIONS[idx].phonemeAudioUrl}
                choices={PHONEME_QUESTIONS[idx].choices}
                correct={PHONEME_QUESTIONS[idx].correct}
                answered={isAnswered}
                onAnswer={handleAnswer}
              />
            )}

            {tab === "matching" && (
              <TapToPair
                key={questionKey}
                prompt={MATCHING_QUESTIONS[idx].prompt}
                leftItems={MATCHING_QUESTIONS[idx].leftItems}
                rightItems={MATCHING_QUESTIONS[idx].rightItems}
                correctPairs={MATCHING_QUESTIONS[idx].correctPairs}
                answered={isAnswered}
                onAnswer={handleAnswer}
              />
            )}

            {tab === "word_bank" && (
              <WordBankFill
                key={questionKey}
                prompt={WORD_BANK_QUESTIONS[idx].prompt}
                sentence={WORD_BANK_QUESTIONS[idx].sentence}
                blankIndex={WORD_BANK_QUESTIONS[idx].blankIndex}
                wordBank={WORD_BANK_QUESTIONS[idx].wordBank}
                correct={WORD_BANK_QUESTIONS[idx].correct}
                difficulty={WORD_BANK_QUESTIONS[idx].difficulty}
                answered={isAnswered}
                onAnswer={handleAnswer}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Feedback + Next */}
        <AnimatePresence>
          {feedbackResult && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="mt-4"
            >
              <div
                className={`rounded-2xl p-4 text-center font-bold text-lg ${
                  feedbackResult === "correct"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700"
                    : "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700"
                }`}
              >
                {feedbackResult === "correct" ? "Correct!" : "Not quite — try the next one!"}
              </div>

              {idx < total - 1 && (
                <motion.button
                  onClick={handleNext}
                  className="w-full mt-3 py-4 rounded-2xl font-extrabold text-lg text-white active:scale-[0.97] transition-all"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    boxShadow: "0 4px 0 0 #4f46e5",
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  NEXT
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
