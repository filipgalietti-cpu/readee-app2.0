"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Glyph } from "@/app/_components/Glyph";

/**
 * Get-more-carrots upsell — shown when a kid tries to buy a shop
 * item they can't afford. Two paths to more carrots:
 *
 *   1. EARN — practice + lessons. Always available, the real loop.
 *   2. BUY — Stripe-backed carrot packs. INTENTIONALLY HIDDEN until
 *      the Stripe checkout integration ships. Showing "Coming soon"
 *      buttons that take a kid's tap and do nothing is worse than
 *      not showing the option at all. When `purchase` route flips
 *      live, re-add the section.
 */
export function GetMoreCarrotsModal({
  itemName,
  shortfall,
  childId,
  onClose,
}: {
  itemName: string;
  shortfall: number;
  childId: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="w-10 h-1 rounded-full bg-zinc-300 mx-auto mb-4" />

          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
            <Glyph name="carrot" size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 text-center mb-1">
            Get more carrots
          </h2>
          <p className="text-sm text-zinc-500 text-center mb-6">
            You need {shortfall} more for {itemName}
          </p>

          {/* Earn More */}
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
            Earn more
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/practice?child=${childId}&standard=K.RF.1`}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center hover:border-indigo-300 transition-colors"
              onClick={onClose}
            >
              <Glyph name="target" size={28} className="mx-auto mb-1.5 text-indigo-500" />
              <div className="text-sm font-bold text-zinc-900">Practice</div>
              <div className="text-xs text-zinc-400">5 carrots per question</div>
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center hover:border-indigo-300 transition-colors"
              onClick={onClose}
            >
              <Glyph name="book-open" size={28} className="mx-auto mb-1.5 text-violet-500" />
              <div className="text-sm font-bold text-zinc-900">Lessons</div>
              <div className="text-xs text-zinc-400">Up to 20 carrots each</div>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
