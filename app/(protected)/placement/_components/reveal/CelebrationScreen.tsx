"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BunnyReaction } from "@/app/_components/Bunny/Bunny";
import { FluentIcon } from "@/app/_components/FluentIcon";
import { RISE, riseT, useCountUp, useReduced } from "./motion";

export type CelebrationScreenProps = {
  childName: string;
  /** The child's own equipped outfit; null = the plain bunny. */
  outfitId: string | null;
  carrots: number;
  /** Called by this screen after its timeline ends. Nothing on screen leads onward. */
  onHandoff: () => void;
  /** Delay after the hand-off line appears before onHandoff fires. */
  handoffDelayMs?: number;
};

const CARROTS_AT_MS = 1000;
const CALM_AT_MS = 2800;

export function CelebrationScreen({ childName, outfitId, carrots, onHandoff, handoffDelayMs = 4000 }: CelebrationScreenProps) {
  const reduced = useReduced();
  const [carrotsOn, setCarrotsOn] = useState(reduced);
  const [calmOn, setCalmOn] = useState(reduced);
  const count = useCountUp(carrots, carrotsOn, { instant: reduced });
  const bubble = `Wow, ${childName}, look how far you climbed`;

  // Confetti once. Same recipe as QuizSummary.
  const confetti = useMemo(() => {
    if (reduced) return [];
    const colors = ["#4ade80", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f43f5e"];
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: (i * 37.7) % 100,
      delay: ((i * 13) % 40) / 20,
      size: 6 + ((i * 7) % 8),
      color: colors[i % 7],
    }));
  }, [reduced]);

  useEffect(() => {
    const a = window.setTimeout(() => setCarrotsOn(true), reduced ? 0 : CARROTS_AT_MS);
    const b = window.setTimeout(() => setCalmOn(true), reduced ? 0 : CALM_AT_MS);
    const c = window.setTimeout(onHandoff, (reduced ? 0 : CALM_AT_MS) + handoffDelayMs);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      clearTimeout(c);
    };
  }, [handoffDelayMs, onHandoff, reduced]);

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 py-8 text-center @container">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((c) => (
          <motion.div
            key={c.id}
            className="absolute rounded-full"
            style={{ left: `${c.left}%`, top: -20, width: c.size, height: c.size, backgroundColor: c.color }}
            initial={{ y: -16, opacity: 1 }}
            animate={{ y: "105vh", rotate: 720, opacity: 0 }}
            transition={{ duration: 2.5, delay: c.delay, ease: "easeIn" }}
          />
        ))}
      </div>

      <motion.h1
        className="relative text-2xl font-semibold text-zinc-900 @2xl:text-4xl"
        initial={reduced ? false : RISE.initial}
        animate={RISE.animate}
        transition={riseT()}
      >
        That&apos;s everything. You did it.
      </motion.h1>

      <motion.div
        className="relative mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-base font-semibold text-zinc-800 shadow-sm @2xl:mt-8 @2xl:px-6 @2xl:py-3 @2xl:text-xl"
        initial={reduced ? false : RISE.initial}
        animate={RISE.animate}
        transition={riseT(0.35)}
      >
        {bubble}
      </motion.div>

      <motion.div
        className="relative mt-2 h-56 w-52 @2xl:h-64 @2xl:w-60"
        initial={reduced ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <BunnyReaction outfitId={outfitId} state="superstar" bubbleText={bubble} />
      </motion.div>

      {carrots > 0 && (
        <motion.div
          className="relative mt-4 flex items-center gap-2 text-2xl font-semibold text-amber-600 @2xl:mt-6 @2xl:gap-3 @2xl:text-3xl"
          initial={reduced ? false : RISE.initial}
          animate={{ opacity: carrotsOn ? 1 : 0, y: carrotsOn ? 0 : 16 }}
          transition={riseT()}
        >
          <FluentIcon name="carrot" size={30} />
          <span className="tabular-nums">+{count} carrots</span>
        </motion.div>
      )}

      <motion.p
        className="relative mt-6 max-w-xs text-lg text-zinc-700 @2xl:mt-10 @2xl:max-w-lg @2xl:text-2xl @2xl:leading-9"
        initial={reduced ? false : RISE.initial}
        animate={{ opacity: calmOn ? 1 : 0, y: calmOn ? 0 : 16 }}
        transition={riseT()}
      >
        Now hand the screen to a grown-up, so I can show them what you did today.
      </motion.p>
    </div>
  );
}
