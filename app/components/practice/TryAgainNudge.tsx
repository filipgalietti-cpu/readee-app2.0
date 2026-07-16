"use client";

import { motion } from "framer-motion";

/**
 * The amber "try again" card shown after a first wrong attempt on an
 * interactive question — visually matches the MCQ 2-try nudge in the runner.
 */
export function TryAgainNudge({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700 px-4 py-3 text-center"
    >
      <p className="text-sm font-bold text-amber-800 dark:text-amber-200">{message}</p>
      <p className="mt-0.5 text-xs font-semibold text-amber-600 dark:text-amber-300">
        Try again — you&apos;ve got this!
      </p>
    </motion.div>
  );
}
