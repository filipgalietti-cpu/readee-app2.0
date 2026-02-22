"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

interface CategorySortProps {
  prompt: string;
  categories: string[];
  categoryItems: Record<string, string[]>;
  items: string[];
  answered: boolean;
  onAnswer: (isCorrect: boolean, answer: string) => void;
  onCorrectPlace?: () => void;
  onIncorrectPlace?: () => void;
}

const BUCKET_STYLES = [
  {
    header: "bg-blue-500 text-white",
    body: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700",
    glow: "ring-4 ring-blue-300 dark:ring-blue-500 border-blue-400 dark:border-blue-500 scale-[1.02]",
    correctFlash: "ring-4 ring-emerald-400 dark:ring-emerald-500 border-emerald-400",
    incorrectFlash: "ring-4 ring-red-400 dark:ring-red-500 border-red-400",
    chip: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-700",
  },
  {
    header: "bg-emerald-500 text-white",
    body: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700",
    glow: "ring-4 ring-emerald-300 dark:ring-emerald-500 border-emerald-400 dark:border-emerald-500 scale-[1.02]",
    correctFlash: "ring-4 ring-emerald-400 dark:ring-emerald-500 border-emerald-400",
    incorrectFlash: "ring-4 ring-red-400 dark:ring-red-500 border-red-400",
    chip: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700",
  },
  {
    header: "bg-purple-500 text-white",
    body: "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700",
    glow: "ring-4 ring-purple-300 dark:ring-purple-500 border-purple-400 dark:border-purple-500 scale-[1.02]",
    correctFlash: "ring-4 ring-emerald-400 dark:ring-emerald-500 border-emerald-400",
    incorrectFlash: "ring-4 ring-red-400 dark:ring-red-500 border-red-400",
    chip: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-700",
  },
];

const BANK_CHIP_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-700",
  "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-700",
  "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700",
  "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700",
  "bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/60 dark:text-pink-200 dark:border-pink-700",
  "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/60 dark:text-cyan-200 dark:border-cyan-700",
  "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/60 dark:text-orange-200 dark:border-orange-700",
];

/** Play a word's audio file from /audio/words/ */
function playWord(word: string) {
  const src = `/audio/words/${word.toLowerCase()}.mp3`;
  const audio = new Audio(src);
  audio.play().catch(() => {});
}

/** Check if a point is inside a DOMRect */
function hitTest(point: { x: number; y: number }, rect: DOMRect) {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

export function CategorySort({
  prompt,
  categories,
  categoryItems,
  items,
  answered,
  onAnswer,
  onCorrectPlace,
  onIncorrectPlace,
}: CategorySortProps) {
  const bucketRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [buckets, setBuckets] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(categories.map((c) => [c, []]))
  );
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [shaking, setShaking] = useState(false);
  const [draggingOver, setDraggingOver] = useState<string | null>(null);
  // Per-bucket flash: "correct" | "incorrect" | null
  const [bucketFlash, setBucketFlash] = useState<Record<string, "correct" | "incorrect" | null>>(
    () => Object.fromEntries(categories.map((c) => [c, null]))
  );

  // Items still in the bank
  const bankItems = items.filter(
    (item) => !categories.some((c) => buckets[c].includes(item))
  );

  const allPlaced = bankItems.length === 0;

  /** Flash a bucket green/red briefly */
  const flashBucket = useCallback((cat: string, type: "correct" | "incorrect") => {
    setBucketFlash((prev) => ({ ...prev, [cat]: type }));
    setTimeout(() => {
      setBucketFlash((prev) => ({ ...prev, [cat]: null }));
    }, 500);
  }, []);

  /** While dragging, highlight whichever bucket the pointer is over */
  const handleDrag = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      let found: string | null = null;
      for (const cat of categories) {
        const el = bucketRefs.current[cat];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (hitTest(info.point, rect)) {
            found = cat;
            break;
          }
        }
      }
      setDraggingOver(found);
    },
    [categories]
  );

  /** On drop, place item into whichever bucket it lands on */
  const handleDragEnd = useCallback(
    (item: string, _event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setDraggingOver(null);
      if (answered || result !== null) return;

      for (const cat of categories) {
        const el = bucketRefs.current[cat];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (hitTest(info.point, rect)) {
            const correctItems = categoryItems[cat] ?? [];
            if (correctItems.includes(item)) {
              // Correct bucket — place it
              setBuckets((prev) => ({
                ...prev,
                [cat]: [...prev[cat], item],
              }));
              flashBucket(cat, "correct");
              onCorrectPlace?.();
            } else {
              // Wrong bucket — reject it (snaps back via dragSnapToOrigin)
              flashBucket(cat, "incorrect");
              onIncorrectPlace?.();
            }
            return;
          }
        }
      }
      // Not dropped on a bucket — snaps back automatically
    },
    [answered, result, categories, categoryItems, flashBucket, onCorrectPlace, onIncorrectPlace]
  );

  /** Tap an item in a bucket to send it back */
  const handleTapBucketItem = useCallback(
    (category: string, item: string) => {
      if (answered || result !== null) return;
      setBuckets((prev) => ({
        ...prev,
        [category]: prev[category].filter((i) => i !== item),
      }));
    },
    [answered, result]
  );

  const handleCheck = useCallback(() => {
    if (!allPlaced || answered || result !== null) return;

    const isCorrect = categories.every((cat) => {
      const placed = new Set(buckets[cat]);
      const correct = new Set(categoryItems[cat]);
      if (placed.size !== correct.size) return false;
      for (const item of placed) {
        if (!correct.has(item)) return false;
      }
      return true;
    });

    setResult(isCorrect ? "correct" : "incorrect");

    if (!isCorrect) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }

    const answer = categories
      .map((c) => `${c}: ${buckets[c].join(", ")}`)
      .join(" | ");

    setTimeout(() => {
      onAnswer(isCorrect, answer);
    }, 400);
  }, [allPlaced, answered, result, categories, buckets, categoryItems, onAnswer]);

  const gridCols =
    categories.length === 2
      ? "grid-cols-2"
      : "grid-cols-1 sm:grid-cols-3";

  return (
    <div className="flex flex-col gap-6">
      {/* Prompt */}
      <h2 className="text-[22px] font-bold text-zinc-900 dark:text-white leading-snug text-center">
        {prompt}
      </h2>

      {/* Category buckets (drop targets) */}
      <div className={`grid ${gridCols} gap-3`}>
        {categories.map((cat, catIdx) => {
          const style = BUCKET_STYLES[catIdx % BUCKET_STYLES.length];
          const isHovered = draggingOver === cat;
          const flash = bucketFlash[cat];

          return (
            <motion.div
              key={cat}
              ref={(el) => { bucketRefs.current[cat] = el; }}
              className={`rounded-2xl border-2 overflow-hidden transition-all duration-150 ${style.body} ${
                flash === "correct"
                  ? style.correctFlash
                  : flash === "incorrect"
                  ? style.incorrectFlash
                  : isHovered
                  ? style.glow
                  : ""
              }`}
              animate={
                flash === "incorrect"
                  ? { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.4 } }
                  : flash === "correct"
                  ? { scale: [1, 1.04, 1], transition: { duration: 0.3 } }
                  : shaking && result === "incorrect"
                  ? { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.5 } }
                  : result === "correct"
                  ? { scale: [1, 1.02, 1], transition: { duration: 0.3 } }
                  : {}
              }
            >
              {/* Bucket header */}
              <div
                className={`w-full px-4 py-3 font-bold text-base text-center ${style.header}`}
              >
                {cat}
              </div>

              {/* Bucket items */}
              <div className="p-3 min-h-[64px] flex flex-wrap gap-2 items-start">
                <AnimatePresence>
                  {buckets[cat].map((item) => (
                    <motion.button
                      key={`bucket-${cat}-${item}`}
                      onClick={() => handleTapBucketItem(cat, item)}
                      disabled={answered || result !== null}
                      className={`px-3 py-1.5 rounded-lg border font-semibold text-sm transition-all ${
                        answered || result !== null ? "cursor-default" : "cursor-pointer active:scale-95"
                      } ${style.chip}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {item}
                    </motion.button>
                  ))}
                </AnimatePresence>
                {buckets[cat].length === 0 && (
                  <span className="text-xs text-zinc-400 dark:text-slate-500 px-1 py-1">
                    Drag words here
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Draggable item bank */}
      <div className="flex flex-wrap gap-2 justify-center min-h-[48px]">
        <AnimatePresence>
          {bankItems.map((item, idx) => (
            <motion.div
              key={`bank-${item}`}
              drag={!(answered || result !== null)}
              dragSnapToOrigin
              dragMomentum={false}
              onDragStart={() => playWord(item)}
              onDrag={handleDrag}
              onDragEnd={(event, info) => handleDragEnd(item, event, info)}
              whileDrag={{ scale: 1.12, zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
              className={`px-4 py-2 rounded-xl border-2 font-semibold text-base select-none touch-none ${
                answered || result !== null
                  ? "opacity-40"
                  : "cursor-grab active:cursor-grabbing"
              } ${BANK_CHIP_COLORS[idx % BANK_CHIP_COLORS.length]}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {item}
            </motion.div>
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
