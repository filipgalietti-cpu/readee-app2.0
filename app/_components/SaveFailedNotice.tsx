"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Glyph } from "@/app/_components/Glyph";

/**
 * The listener for `readee:save-failed`.
 *
 * `savedOk()` has broadcast that event since July, but nothing in the app ever
 * listened, so a failed write was only ever a console line: practice could
 * finish, celebrate, award carrots and show "Perfect Score" while none of it
 * reached Postgres. This is the half that tells the family.
 *
 * Deliberately quiet: a child may be mid-session and this must not read as
 * their fault or as a lost cause. It states what happened, stays until
 * dismissed (a save failure should not time out the way a success toast does),
 * and counts repeats rather than stacking.
 */
export default function SaveFailedNotice() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function onFail() {
      setCount((c) => c + 1);
    }
    window.addEventListener("readee:save-failed", onFail);
    return () => window.removeEventListener("readee:save-failed", onFail);
  }, []);

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 z-[200] w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2"
        >
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-[0_10px_40px_-12px_rgba(49,46,129,0.18)]">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <Glyph name="alert-circle" size={16} className="text-amber-700" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-amber-900">
                We could not save that
              </div>
              <div className="mt-0.5 text-xs text-amber-800">
                The last activity may not have been recorded. Check your connection.
                {count > 1 && ` (${count} times)`}
              </div>
            </div>
            <button
              onClick={() => setCount(0)}
              aria-label="Dismiss"
              className="mt-0.5 flex-shrink-0 rounded-lg p-1 text-amber-700 transition-colors hover:bg-amber-100"
            >
              <Glyph name="x" size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
