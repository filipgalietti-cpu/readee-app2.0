"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SentenceBuildProps {
  prompt: string;
  passage: string | null;
  words: string[];
  correctSentence: string;
  sentenceHint?: string;
  sentenceAudioUrl?: string;
  answered: boolean;
  onAnswer: (isCorrect: boolean, placedSentence: string) => void;
}

const PUNCTUATION = new Set([".", "!", "?"]);

/** Play a word's audio file from /audio/words/ */
function playWord(word: string) {
  const src = `/audio/words/${word.toLowerCase()}.mp3`;
  const audio = new Audio(src);
  audio.play().catch(() => {});
}

/** Play an audio URL and return a promise that resolves when it ends */
function playAudioAsync(url: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.addEventListener("ended", () => resolve());
    audio.addEventListener("error", () => resolve());
    audio.play().catch(() => resolve());
  });
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

export function SentenceBuild({
  prompt,
  passage,
  words,
  correctSentence,
  sentenceHint,
  sentenceAudioUrl,
  answered,
  onAnswer,
}: SentenceBuildProps) {
  // Filter out any stray punctuation from words (backward compat)
  const filteredWords = useMemo(
    () => words.filter((w) => !PUNCTUATION.has(w)),
    [words]
  );

  // Extract trailing punctuation from correctSentence
  const trailingPunctuation = useMemo(() => {
    const last = correctSentence.slice(-1);
    return PUNCTUATION.has(last) ? last : "";
  }, [correctSentence]);

  // Each word gets a unique index so duplicates are tracked separately
  const [placed, setPlaced] = useState<number[]>([]); // indices into filteredWords
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [shaking, setShaking] = useState(false);

  const bankIndices = filteredWords
    .map((_, i) => i)
    .filter((i) => !placed.includes(i));

  const allPlaced = placed.length === filteredWords.length;

  const handleTapBank = useCallback(
    (wordIdx: number) => {
      if (answered || result !== null) return;
      playWord(filteredWords[wordIdx]);
      setPlaced((prev) => [...prev, wordIdx]);
    },
    [answered, result, filteredWords]
  );

  const handleTapAnswer = useCallback(
    (positionInAnswer: number) => {
      if (answered || result !== null) return;
      setPlaced((prev) => prev.filter((_, i) => i !== positionInAnswer));
    },
    [answered, result]
  );

  const handleCheck = useCallback(async () => {
    if (!allPlaced || answered || result !== null) return;
    const sentence = placed.map((i) => filteredWords[i]).join(" ") + trailingPunctuation;
    const isCorrect = sentence === correctSentence;
    setResult(isCorrect ? "correct" : "incorrect");

    if (!isCorrect) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => {
        onAnswer(false, sentence);
      }, 400);
      return;
    }

    // Correct — play sentence audio first, then fire callback
    if (sentenceAudioUrl) {
      await playAudioAsync(sentenceAudioUrl);
    }
    onAnswer(true, sentence);
  }, [allPlaced, answered, result, placed, filteredWords, trailingPunctuation, correctSentence, sentenceAudioUrl, onAnswer]);

  return (
    <div className="flex flex-col gap-6">
      {/* Passage */}
      {passage && (
        <div className="rounded-2xl bg-white border border-zinc-200 dark:bg-slate-800/80 dark:border-slate-700 p-5">
          <p className="text-lg leading-relaxed text-zinc-900 dark:text-white/90 whitespace-pre-line">
            {passage}
          </p>
        </div>
      )}

      {/* Prompt */}
      <h2 className="text-[22px] font-bold text-zinc-900 dark:text-white leading-snug text-center">
        {prompt}
      </h2>

      {/* Sentence hint */}
      {sentenceHint && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700 px-4 py-3 text-center">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Hint: {sentenceHint}
          </p>
        </div>
      )}

      {/* Answer area + trailing punctuation */}
      <div className="flex items-center gap-1">
        <motion.div
          className={`flex-1 min-h-[72px] rounded-2xl border-2 border-dashed p-3 flex flex-wrap gap-2 items-center transition-colors ${
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
          {placed.length === 0 && (
            <span className="text-zinc-400 dark:text-slate-500 text-sm px-2">
              Tap words below to build your sentence
            </span>
          )}
          <AnimatePresence mode="popLayout">
            {placed.map((wordIdx, posIdx) => (
              <motion.button
                key={`answer-${wordIdx}`}
                layoutId={`word-${wordIdx}`}
                onClick={() => handleTapAnswer(posIdx)}
                disabled={answered || result !== null}
                className={`px-4 py-2 rounded-xl border-2 font-semibold text-base transition-all
                  ${answered || result !== null ? "cursor-default" : "cursor-pointer active:scale-95"}
                  ${CHIP_COLORS[wordIdx % CHIP_COLORS.length]}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {filteredWords[wordIdx]}
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
        {/* Fixed trailing punctuation — outside the dashed box */}
        {trailingPunctuation && (
          <span className="text-2xl font-bold text-zinc-700 dark:text-slate-300 select-none px-1">
            {trailingPunctuation}
          </span>
        )}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2 justify-center min-h-[48px]">
        <AnimatePresence mode="popLayout">
          {bankIndices.map((wordIdx) => (
            <motion.button
              key={`bank-${wordIdx}`}
              layoutId={`word-${wordIdx}`}
              onClick={() => handleTapBank(wordIdx)}
              disabled={answered || result !== null}
              className={`px-4 py-2 rounded-xl border-2 font-semibold text-base transition-all
                ${answered || result !== null ? "cursor-default opacity-40" : "cursor-pointer hover:scale-105 active:scale-95"}
                ${CHIP_COLORS[wordIdx % CHIP_COLORS.length]}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {filteredWords[wordIdx]}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Check button */}
      {!answered && result === null && (
        <motion.button
          onClick={handleCheck}
          disabled={!allPlaced}
          className={`w-full py-4 rounded-2xl font-extrabold text-lg transition-all active:scale-[0.97] ${
            allPlaced
              ? "text-white"
              : "bg-zinc-200 text-zinc-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed"
          }`}
          style={
            allPlaced
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
