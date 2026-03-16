"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Howl } from "howler";

interface TapToPairProps {
  prompt: string;
  leftItems: string[];
  rightItems: string[];
  correctPairs: Record<string, string>;
  answered: boolean;
  onAnswer: (isCorrect: boolean, userAnswer: string) => void;
  onPlayItem?: (word: string) => void;
}

const LEFT_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-700",
  "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-700",
  "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700",
  "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700",
  "bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/60 dark:text-pink-200 dark:border-pink-700",
];

const RIGHT_COLORS = [
  "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/60 dark:text-cyan-200 dark:border-cyan-700",
  "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/60 dark:text-orange-200 dark:border-orange-700",
  "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-700",
  "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/60 dark:text-teal-200 dark:border-teal-700",
  "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/60 dark:text-indigo-200 dark:border-indigo-700",
];

interface MatchedPair {
  left: string;
  right: string;
  correct: boolean;
}

/** Play a word/phrase audio file */
function playWord(word: string) {
  const clean = word.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase().replace(/\s+/g, "_");
  if (!clean) return;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio`
    : "";
  const src = base
    ? `${base}/words/${clean}.mp3`
    : `/audio/words/${clean}.mp3`;
  new Howl({ src: [src] }).play();
}

export function TapToPair({
  prompt,
  leftItems,
  rightItems,
  correctPairs,
  answered,
  onAnswer,
  onPlayItem,
}: TapToPairProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchedPair[]>([]);
  const [shakingRight, setShakingRight] = useState<string | null>(null);
  const [shakingLeft, setShakingLeft] = useState<string | null>(null);
  const [flashingPair, setFlashingPair] = useState<{ left: string; right: string } | null>(null);
  const [done, setDone] = useState(false);

  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [linePositions, setLinePositions] = useState<
    { x1: number; y1: number; x2: number; y2: number; correct: boolean }[]
  >([]);

  const matchedLeftItems = new Set(matches.map((m) => m.left));
  const matchedRightItems = new Set(matches.map((m) => m.right));

  // Recalculate line positions when matches change
  const updateLines = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines = matches.map((m) => {
      const leftEl = leftRefs.current[m.left];
      const rightEl = rightRefs.current[m.right];
      if (!leftEl || !rightEl) return { x1: 0, y1: 0, x2: 0, y2: 0, correct: m.correct };
      const lr = leftEl.getBoundingClientRect();
      const rr = rightEl.getBoundingClientRect();
      return {
        x1: lr.right - containerRect.left,
        y1: lr.top + lr.height / 2 - containerRect.top,
        x2: rr.left - containerRect.left,
        y2: rr.top + rr.height / 2 - containerRect.top,
        correct: m.correct,
      };
    });
    setLinePositions(newLines);
  }, [matches]);

  useEffect(() => {
    updateLines();
    window.addEventListener("resize", updateLines);
    return () => window.removeEventListener("resize", updateLines);
  }, [updateLines]);

  /** Complete a match — shared by both directions */
  const completeMatch = useCallback(
    (left: string, right: string) => {
      const isCorrect = correctPairs[left] === right;
      if (isCorrect) {
        (onPlayItem || playWord)(right);
        const newMatches = [...matches, { left, right, correct: true }];
        setMatches(newMatches);
        setSelectedLeft(null);
        setSelectedRight(null);

        setFlashingPair({ left, right });
        setTimeout(() => setFlashingPair(null), 600);

        if (newMatches.length === leftItems.length) {
          setTimeout(() => {
            setDone(true);
            const allCorrect = newMatches.every((m) => m.correct);
            const answer = newMatches.map((m) => `${m.left}→${m.right}`).join(", ");
            onAnswer(allCorrect, answer);
          }, 400);
        }
      } else {
        // Wrong match — shake the second-tapped side
        setShakingRight(right);
        setShakingLeft(left);
        setTimeout(() => { setShakingRight(null); setShakingLeft(null); }, 500);
        setSelectedLeft(null);
        setSelectedRight(null);
      }
    },
    [correctPairs, matches, leftItems.length, onAnswer, onPlayItem]
  );

  const handleTapLeft = useCallback(
    (item: string) => {
      if (answered || done || matchedLeftItems.has(item)) return;
      (onPlayItem || playWord)(item);

      if (selectedRight) {
        // Right already selected — try to match
        completeMatch(item, selectedRight);
      } else {
        // Just select this left item (toggle)
        setSelectedLeft((prev) => (prev === item ? null : item));
        setSelectedRight(null);
      }
    },
    [answered, done, matchedLeftItems, selectedRight, completeMatch, onPlayItem]
  );

  const handleTapRight = useCallback(
    (item: string) => {
      if (answered || done || matchedRightItems.has(item)) return;
      (onPlayItem || playWord)(item);

      if (selectedLeft) {
        // Left already selected — try to match
        completeMatch(selectedLeft, item);
      } else {
        // Just select this right item (toggle)
        setSelectedRight((prev) => (prev === item ? null : item));
        setSelectedLeft(null);
      }
    },
    [answered, done, matchedRightItems, selectedLeft, completeMatch, onPlayItem]
  );

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-[22px] font-bold text-zinc-900 dark:text-white leading-snug text-center">
        {prompt}
      </h2>

      <div ref={containerRef} className="relative">
        {/* SVG lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {linePositions.map((line, i) => (
            <motion.line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.correct ? "#10b981" : "#ef4444"}
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </svg>

        {/* Two columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left column */}
          <div className="flex flex-col gap-3">
            {leftItems.map((item, i) => {
              const isMatched = matchedLeftItems.has(item);
              const isSelected = selectedLeft === item;
              const isShaking = shakingLeft === item;
              let style = LEFT_COLORS[i % LEFT_COLORS.length];

              const isFlashing = flashingPair?.left === item;
              if (isMatched) {
                style =
                  "bg-emerald-100 text-emerald-800 border-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-500 opacity-70";
              } else if (isSelected) {
                style =
                  "bg-indigo-200 text-indigo-900 border-indigo-500 ring-2 ring-indigo-400/50 dark:bg-indigo-800 dark:text-indigo-100 dark:border-indigo-400";
              }

              return (
                <motion.button
                  key={item}
                  ref={(el) => {
                    leftRefs.current[item] = el;
                  }}
                  onClick={() => handleTapLeft(item)}
                  disabled={answered || done || isMatched}
                  className={`px-4 py-4 rounded-xl border-2 font-bold text-lg text-center transition-all ${
                    isMatched || answered || done
                      ? "cursor-default"
                      : "cursor-pointer active:scale-95 hover:scale-105"
                  } ${style}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={
                    isFlashing
                      ? { opacity: 1, x: 0, scale: [1, 1.15, 1], transition: { duration: 0.5 } }
                      : isShaking
                      ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                      : { opacity: 1, x: 0 }
                  }
                  transition={isShaking ? { duration: 0.5 } : { delay: i * 0.05 }}
                >
                  {item}
                </motion.button>
              );
            })}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-3">
            {rightItems.map((item, i) => {
              const isMatched = matchedRightItems.has(item);
              const isShaking = shakingRight === item;
              const isSelected = selectedRight === item;
              let style = RIGHT_COLORS[i % RIGHT_COLORS.length];

              const isFlashing = flashingPair?.right === item;
              if (isMatched) {
                style =
                  "bg-emerald-100 text-emerald-800 border-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-500 opacity-70";
              } else if (isSelected) {
                style =
                  "bg-indigo-200 text-indigo-900 border-indigo-500 ring-2 ring-indigo-400/50 dark:bg-indigo-800 dark:text-indigo-100 dark:border-indigo-400";
              }

              return (
                <motion.button
                  key={item}
                  ref={(el) => {
                    rightRefs.current[item] = el;
                  }}
                  onClick={() => handleTapRight(item)}
                  disabled={answered || done || isMatched}
                  className={`px-4 py-4 rounded-xl border-2 font-bold text-lg text-center transition-all ${
                    isMatched || answered || done
                      ? "cursor-default"
                      : "cursor-pointer active:scale-95 hover:scale-105"
                  } ${style}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={
                    isFlashing
                      ? { opacity: 1, x: 0, scale: [1, 1.15, 1], transition: { duration: 0.5 } }
                      : isShaking
                      ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                      : { opacity: 1, x: 0 }
                  }
                  transition={isShaking ? { duration: 0.5 } : { delay: i * 0.05 }}
                >
                  {item}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
