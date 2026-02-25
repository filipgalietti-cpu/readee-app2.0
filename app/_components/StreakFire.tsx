"use client";

import { motion, AnimatePresence } from "framer-motion";
import { getSessionStreakTier } from "@/lib/carrots/multipliers";

export function StreakFire({ consecutiveCorrect }: { consecutiveCorrect: number }) {
  const { multiplier, fires } = getSessionStreakTier(consecutiveCorrect);

  if (fires === 0) return null;

  const fireEmojis = Array.from({ length: fires }, () => "\uD83D\uDD25").join("");

  return (
    <AnimatePresence>
      <motion.div
        key={multiplier}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-800"
      >
        <span className="text-lg">{fireEmojis}</span>
        <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
          {multiplier}x Streak!
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
