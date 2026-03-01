"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MysteryReward } from "@/lib/data/mystery-box";

type Phase = "wobble" | "open" | "reveal";

export function MysteryBoxOpener({
  reward,
  onClose,
}: {
  reward: MysteryReward;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("wobble");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("open"), 1000);
    const t2 = setTimeout(() => setPhase("reveal"), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const rewardEmoji =
    reward.type === "jackpot"
      ? "\uD83D\uDCB0"
      : reward.type === "multiplier"
      ? "\u26A1"
      : reward.type === "item"
      ? reward.item.emoji
      : "\uD83E\uDD55";

  const confetti = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ["#f59e0b", "#8b5cf6", "#10b981", "#ef4444", "#ec4899", "#3b82f6"][i % 6],
  }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <div className="relative w-full max-w-sm mx-4 text-center">
          {/* Phase 1: Wobbling box */}
          {phase === "wobble" && (
            <motion.div
              animate={{
                rotate: [0, -5, 5, -5, 5, -3, 3, 0],
                scale: [1, 1.05, 1, 1.05, 1],
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="w-32 h-32 mx-auto"
            >
              <img src="/images/shop/mystery-box-closed.png" alt="Mystery Box" className="w-full h-full object-contain" />
            </motion.div>
          )}

          {/* Phase 2: Opening burst */}
          {phase === "open" && (
            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: [1.1, 1.5, 0.8] }}
              transition={{ duration: 0.5 }}
              className="w-32 h-32 mx-auto"
            >
              <img src="/images/shop/mystery-box-open.png" alt="Mystery Box Opening" className="w-full h-full object-contain" />
            </motion.div>
          )}

          {/* Phase 3: Reward reveal */}
          {phase === "reveal" && (
            <>
              {/* Confetti */}
              {confetti.map((c) => (
                <motion.div
                  key={c.id}
                  className="absolute w-2 h-2 rounded-full pointer-events-none"
                  style={{ left: `${c.left}%`, top: 0, backgroundColor: c.color }}
                  initial={{ y: 0, opacity: 1 }}
                  animate={{ y: 300, opacity: 0, rotate: 720 }}
                  transition={{ duration: 1.5, delay: c.delay, ease: "easeOut" }}
                />
              ))}

              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="space-y-4"
              >
                <div className="text-7xl">{rewardEmoji}</div>

                <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl">
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                    {reward.type === "jackpot" ? "JACKPOT!" : "You got..."}
                  </div>
                  <div className="text-xl font-extrabold text-zinc-900 dark:text-white">
                    {reward.label}
                  </div>
                  {reward.type === "multiplier" && (
                    <p className="text-sm text-zinc-500 dark:text-slate-400 mt-1">
                      Your next practice session earns double carrots!
                    </p>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all active:scale-[0.97] shadow-lg"
                >
                  Collect!
                </button>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
