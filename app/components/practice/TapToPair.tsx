"use client";

import { useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Howl } from "howler";
import { Volume2 } from "lucide-react";

interface TapToPairProps {
  prompt: string;
  leftItems: string[];
  rightItems: string[];
  correctPairs: Record<string, string>;
  answered: boolean;
  onAnswer: (isCorrect: boolean, userAnswer: string, pairs?: Record<string,string>) => void;
  onPlayItem?: (word: string) => void;
  /** Fired on each correct individual match (for the per-pair chime) */
  onCorrectMatch?: () => void;
  /** Fired on each incorrect individual match */
  onIncorrectMatch?: () => void;
  /** In assessment mode, all pairings are accepted (no rejection on wrong match) */
  assessmentMode?: boolean;
  /** Coached practice keeps connected cards available for spoken replay. */
  allowMatchedReplay?: boolean;
  /** Visual recognition tasks must not automatically announce candidate names. */
  autoPlayOnSelect?: boolean | ((item: string) => boolean);
  audioLabel?: (word: string) => string;
  canPlayItem?: (item: string) => boolean;
  presentation?: "coached";
  renderLabel?: (text: string) => ReactNode;
}

const LEFT_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-300",
  "bg-purple-100 text-purple-800 border-purple-300",
  "bg-amber-100 text-amber-800 border-amber-300",
  "bg-sky-100 text-sky-800 border-sky-300",
  "bg-pink-100 text-pink-800 border-pink-300",
];

const RIGHT_COLORS = [
  "bg-cyan-100 text-cyan-800 border-cyan-300",
  "bg-orange-100 text-orange-800 border-orange-300",
  "bg-rose-100 text-rose-800 border-rose-300",
  "bg-teal-100 text-teal-800 border-teal-300",
  "bg-indigo-100 text-indigo-800 border-indigo-300",
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
  onCorrectMatch,
  onIncorrectMatch,
  assessmentMode = false,
  allowMatchedReplay = false,
  autoPlayOnSelect = true,
  audioLabel,
  canPlayItem,
  presentation,
  renderLabel,
}: TapToPairProps) {
  const reduceMotion = useReducedMotion();
  const playsOnSelect = useCallback((item: string) => (canPlayItem?.(item) ?? true) && (typeof autoPlayOnSelect === "function" ? autoPlayOnSelect(item) : autoPlayOnSelect), [autoPlayOnSelect, canPlayItem]);
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
    const observer = new ResizeObserver(updateLines);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => { observer.disconnect(); window.removeEventListener("resize", updateLines); };
  }, [updateLines]);

  /** Complete a match — shared by both directions */
  const completeMatch = useCallback(
    (left: string, right: string) => {
      const isCorrect = correctPairs[left] === right;
      if (isCorrect || assessmentMode) {
        const newMatches = [...matches, { left, right, correct: isCorrect }];
        setMatches(newMatches);
        setSelectedLeft(null);
        setSelectedRight(null);

        if (!assessmentMode) {
          setFlashingPair({ left, right });
          setTimeout(() => setFlashingPair(null), 600);
        }

        // Per-match ka-ching (after left/right tap audio has had a moment to play)
        if (isCorrect && !assessmentMode && onCorrectMatch) {
          setTimeout(() => onCorrectMatch(), 1400);
        }

        if (newMatches.length === leftItems.length) {
          setTimeout(() => {
            setDone(true);
            const allCorrect = newMatches.every((m) => m.correct);
            const answer = newMatches.map((m) => `${m.left}→${m.right}`).join(", ");
            onAnswer(allCorrect, answer, Object.fromEntries(newMatches.map(m=>[m.left,m.right])));
          }, assessmentMode ? 500 : 2800);
        }
      } else {
        // Wrong match — shake the second-tapped side
        setShakingRight(right);
        setShakingLeft(left);
        setTimeout(() => { setShakingRight(null); setShakingLeft(null); }, 500);
        setSelectedLeft(null);
        setSelectedRight(null);
        if (onIncorrectMatch) setTimeout(() => onIncorrectMatch(), 1400);
      }
    },
    [correctPairs, matches, leftItems.length, onAnswer, onPlayItem, onCorrectMatch, onIncorrectMatch, assessmentMode]
  );

  const handleTapLeft = useCallback(
    (item: string) => {
      if (!answered && allowMatchedReplay && canPlayItem?.(item) !== false && matchedLeftItems.has(item)) {
        (onPlayItem || playWord)(item);
        return;
      }
      if (answered || done || matchedLeftItems.has(item)) return;
      if (playsOnSelect(item)) (onPlayItem || playWord)(item);

      if (selectedRight) {
        // Right already selected — try to match
        completeMatch(item, selectedRight);
      } else {
        // Just select this left item (toggle)
        setSelectedLeft((prev) => (prev === item ? null : item));
        setSelectedRight(null);
      }
    },
    [answered, done, matchedLeftItems, selectedRight, completeMatch, onPlayItem, allowMatchedReplay, playsOnSelect, canPlayItem]
  );

  const handleTapRight = useCallback(
    (item: string) => {
      if (!answered && allowMatchedReplay && canPlayItem?.(item) !== false && matchedRightItems.has(item)) {
        (onPlayItem || playWord)(item);
        return;
      }
      if (answered || done || matchedRightItems.has(item)) return;
      if (playsOnSelect(item)) (onPlayItem || playWord)(item);

      if (selectedLeft) {
        // Left already selected — try to match
        completeMatch(selectedLeft, item);
      } else {
        // Just select this right item (toggle)
        setSelectedRight((prev) => (prev === item ? null : item));
        setSelectedLeft(null);
      }
    },
    [answered, done, matchedRightItems, selectedLeft, completeMatch, onPlayItem, allowMatchedReplay, playsOnSelect, canPlayItem]
  );

  return (
    <div className={`flex flex-col gap-6 ${presentation === "coached" ? "le-pairing" : ""}`}>
      {prompt ? (
        <h2 className="font-[family-name:var(--font-baloo)] text-[clamp(21px,2vw,26px)] font-bold text-indigo-950 leading-tight text-center mb-2">
          {prompt}
        </h2>
      ) : null}

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
              stroke={assessmentMode ? "#818cf8" : line.correct ? "#10b981" : "#ef4444"}
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35 }}
            />
          ))}
        </svg>

        {/* Two columns */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {/* Left column */}
          <div className="flex flex-col gap-3">
            {leftItems.map((item, i) => {
              const isMatched = matchedLeftItems.has(item);
              const isSelected = selectedLeft === item;
              const isShaking = shakingLeft === item;
              let style = LEFT_COLORS[i % LEFT_COLORS.length];

              const isFlashing = !assessmentMode && flashingPair?.left === item;
              if (isMatched) {
                style = assessmentMode
                  ? style + " opacity-60"
                  : "bg-emerald-100 text-emerald-800 border-emerald-400 opacity-70";
              } else if (isSelected) {
                style =
                  "bg-indigo-200 text-indigo-900 border-indigo-500 ring-2 ring-indigo-400/50";
              }

              const card = (
                <motion.button
                  key={item}
                  data-selected={isSelected || undefined}
                  data-matched={isMatched || undefined}
                  aria-pressed={isSelected}
                  ref={(el) => {
                    leftRefs.current[item] = el;
                  }}
                  onClick={() => handleTapLeft(item)}
                  disabled={answered || ((done || isMatched) && !(allowMatchedReplay && isMatched))}
                  className={`le-pair-card px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 font-bold text-base sm:text-lg text-center transition-colors ${
                    isMatched || answered || done
                      ? "cursor-default"
                      : "cursor-pointer active:scale-95 hover:scale-105"
                  } ${style}`}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={
                    isFlashing
                      ? { opacity: 1, x: 0, scale: [1, 1.15, 1], transition: { duration: 0.5 } }
                      : isShaking
                      ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                      : { opacity: 1, x: 0 }
                  }
                  transition={reduceMotion ? { duration: 0 } : isShaking ? { duration: 0.5 } : { duration: 0.18, delay: i * 0.07 }}
                >
                  {presentation === "coached" ? <><span>{renderLabel ? renderLabel(item) : item}</span>{playsOnSelect(item) && <Volume2 size={17} aria-hidden="true" />}</> : item}
                </motion.button>
              );
              return playsOnSelect(item) || canPlayItem?.(item) === false ? card : (
                <div key={item} className="le-pair-choice">
                  {card}
                  <button type="button" className="le-pair-audio" disabled={answered}
                    aria-label={`Hear ${audioLabel?.(item) ?? item}`}
                    onClick={() => (onPlayItem || playWord)(item)}><Volume2 size={17} aria-hidden="true" /></button>
                </div>
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

              const isFlashing = !assessmentMode && flashingPair?.right === item;
              if (isMatched) {
                style = assessmentMode
                  ? style + " opacity-60"
                  : "bg-emerald-100 text-emerald-800 border-emerald-400 opacity-70";
              } else if (isSelected) {
                style =
                  "bg-indigo-200 text-indigo-900 border-indigo-500 ring-2 ring-indigo-400/50";
              }

              const card = (
                <motion.button
                  key={item}
                  data-selected={isSelected || undefined}
                  data-matched={isMatched || undefined}
                  aria-pressed={isSelected}
                  ref={(el) => {
                    rightRefs.current[item] = el;
                  }}
                  onClick={() => handleTapRight(item)}
                  disabled={answered || ((done || isMatched) && !(allowMatchedReplay && isMatched))}
                  className={`le-pair-card px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 font-bold text-base sm:text-lg text-center transition-colors ${
                    isMatched || answered || done
                      ? "cursor-default"
                      : "cursor-pointer active:scale-95 hover:scale-105"
                  } ${style}`}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={
                    isFlashing
                      ? { opacity: 1, x: 0, scale: [1, 1.15, 1], transition: { duration: 0.5 } }
                      : isShaking
                      ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                      : { opacity: 1, x: 0 }
                  }
                  transition={reduceMotion ? { duration: 0 } : isShaking ? { duration: 0.5 } : { duration: 0.18, delay: i * 0.07 }}
                >
                  {presentation === "coached" ? <><span>{renderLabel ? renderLabel(item) : item}</span>{playsOnSelect(item) && <Volume2 size={17} aria-hidden="true" />}</> : item}
                </motion.button>
              );
              return playsOnSelect(item) || canPlayItem?.(item) === false ? card : (
                <div key={item} className="le-pair-choice">
                  {card}
                  <button type="button" className="le-pair-audio" disabled={answered}
                    aria-label={`Hear ${audioLabel?.(item) ?? item}`}
                    onClick={() => (onPlayItem || playWord)(item)}><Volume2 size={17} aria-hidden="true" /></button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
