"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { popIn, confettiPiece } from "@/lib/motion/variants";

const CONFETTI_COLORS = [
  "#6366f1", "#8b5cf6", "#a78bfa", "#60a5fa",
  "#34d399", "#fbbf24", "#fb923c", "#f472b6",
  "#4ade80", "#facc15",
];

const PIECE_COUNT = 20;

export default function CelebrationOverlay({ show }: { show: boolean }) {
  const router = useRouter();

  // Memoize confetti config so pieces don't re-randomize on re-renders
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 6,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
      })),
    [],
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        >
          {/* Confetti pieces */}
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              variants={confettiPiece(p.left, p.delay)}
              initial="hidden"
              animate="visible"
              style={{
                position: "fixed",
                top: 0,
                left: `${p.left}%`,
                width: p.size,
                height: p.size,
                borderRadius: p.borderRadius,
                backgroundColor: p.color,
                zIndex: 51,
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center space-y-5 relative overflow-hidden"
          >
            {/* Emoji */}
            <motion.div
              variants={popIn}
              initial="hidden"
              animate="visible"
              className="text-6xl"
            >
              🎉
            </motion.div>

            {/* Heading */}
            <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-500 to-violet-500 bg-clip-text text-transparent">
              Welcome to Readee+!
            </h2>

            {/* Subtitle */}
            <p className="text-sm text-zinc-500 dark:text-slate-400 leading-relaxed">
              All lessons, reading levels, and premium features are now unlocked. Let the reading adventure begin!
            </p>

            {/* Button */}
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-sm hover:from-indigo-700 hover:to-violet-600 transition-all shadow-md"
            >
              Go to Dashboard
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
