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
    const t1 = setTimeout(() => setPhase("open"), 1400);
    const t2 = setTimeout(() => setPhase("reveal"), 2200);
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

  const confetti = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    size: 4 + Math.random() * 6,
    color: ["#f59e0b", "#fbbf24", "#8b5cf6", "#10b981", "#ef4444", "#ec4899", "#3b82f6", "#f97316"][i % 8],
  }));

  const sparkles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 200,
    y: (Math.random() - 0.5) * 200,
    delay: Math.random() * 0.3,
    size: 10 + Math.random() * 14,
  }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      >
        <div className="relative w-full max-w-md mx-4 text-center flex flex-col items-center">
          {/* Phase 1: Wobbling closed box — big and dramatic */}
          {phase === "wobble" && (
            <motion.div
              className="w-56 h-56 sm:w-72 sm:h-72 relative"
              animate={{
                rotate: [0, -3, 3, -4, 4, -2, 2, 0],
                scale: [1, 1.03, 1, 1.05, 1, 1.08],
              }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            >
              <img
                src="/images/shop/mystery-box-closed.png"
                alt="Mystery Box"
                className="w-full h-full object-contain"
                style={{ filter: "drop-shadow(0 8px 30px rgba(245, 158, 11, 0.4))" }}
              />
              {/* Golden sparkles during wobble */}
              {sparkles.map((s) => (
                <motion.span
                  key={s.id}
                  className="absolute text-amber-400 pointer-events-none"
                  style={{ top: "50%", left: "50%", fontSize: s.size }}
                  animate={{
                    x: [0, s.x * 0.5, s.x],
                    y: [0, s.y * 0.5, s.y],
                    opacity: [0, 1, 0],
                    scale: [0.3, 1.2, 0],
                  }}
                  transition={{ duration: 1.2, delay: s.delay + 0.3, ease: "easeOut" }}
                >
                  ✦
                </motion.span>
              ))}
            </motion.div>
          )}

          {/* Phase 2: Opening — box flies open and scales up */}
          {phase === "open" && (
            <motion.div
              className="w-56 h-56 sm:w-72 sm:h-72 relative"
              initial={{ scale: 1.08 }}
              animate={{ scale: [1.08, 1.3, 1.15] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.img
                src="/images/shop/mystery-box-open.png"
                alt="Mystery Box Opening"
                className="w-full h-full object-contain"
                style={{ filter: "drop-shadow(0 8px 40px rgba(245, 158, 11, 0.5))" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              />
              {/* Light burst from box */}
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)" }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 2.5, opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.8 }}
              />
            </motion.div>
          )}

          {/* Phase 3: Reward reveal */}
          {phase === "reveal" && (
            <>
              {/* Confetti burst */}
              {confetti.map((c) => (
                <motion.div
                  key={c.id}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: `${c.left}%`,
                    top: "40%",
                    width: c.size,
                    height: c.size,
                    backgroundColor: c.color,
                  }}
                  initial={{ y: 0, x: 0, opacity: 1 }}
                  animate={{
                    y: [0, -100 - Math.random() * 100, 400],
                    x: (Math.random() - 0.5) * 150,
                    opacity: [1, 1, 0],
                    rotate: 360 + Math.random() * 720,
                  }}
                  transition={{ duration: 2, delay: c.delay, ease: "easeOut" }}
                />
              ))}

              <motion.div
                initial={{ opacity: 0, scale: 0.3, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="space-y-5"
              >
                <motion.div
                  className="text-8xl"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {rewardEmoji}
                </motion.div>

                <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl">
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                    {reward.type === "jackpot" ? "JACKPOT!" : "You got..."}
                  </div>
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-white">
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
