"use client";

import { motion } from "framer-motion";
import { ordinal } from "@/lib/placement/norms";
import { MARKER_S, useReduced } from "./motion";

export type PercentileBarProps = {
  /** 1 to 99. */
  percentile: number;
  childName: string;
  /** When it flips true the marker slides from 1 to the percentile over 0.8 s. */
  animate: boolean;
  /** Render at the final position with no slide (the printable report). */
  instant?: boolean;
};

const TICKS = [10, 25, 75, 90];
const clamp = (n: number) => Math.max(1, Math.min(99, n));
const pos = (p: number): number => ((clamp(p) - 1) / 98) * 100;

export function PercentileBar({ percentile, childName, animate, instant = false }: PercentileBarProps) {
  const reduced = useReduced();
  const jump = instant || reduced;
  const target = animate ? pos(percentile) : pos(1);
  const spring = { duration: jump ? 0 : MARKER_S, ease: "easeOut" as const };
  const anchor = percentile < 25 ? "left" : percentile > 75 ? "right" : "center";
  const labelShift = anchor === "left" ? "translateX(-8px)" : anchor === "right" ? "translateX(calc(-100% + 8px))" : "translateX(-50%)";

  return (
    <div className="w-full">
      <div className="relative h-6">
        <motion.div
          className="absolute top-0 whitespace-nowrap text-sm font-semibold text-violet-700"
          initial={false}
          animate={{ left: `${target}%`, opacity: animate ? 1 : 0 }}
          transition={spring}
          style={{ transform: labelShift }}
        >
          {childName} · {ordinal(percentile)} percentile
        </motion.div>
      </div>

      <div className="relative h-2 rounded-full bg-violet-100">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-600 to-violet-500"
          initial={false}
          animate={{ width: `${target}%` }}
          transition={spring}
        />
        <span aria-hidden className="absolute -top-1 h-4 w-0.5 bg-zinc-400" style={{ left: `${pos(50)}%` }} />
        <motion.span
          aria-hidden
          className="absolute top-1/2 h-4 w-4 rounded-full border-2 border-white bg-violet-600 shadow-sm"
          initial={false}
          animate={{ left: `${target}%` }}
          transition={spring}
          style={{ x: "-50%", y: "-50%" }}
        />
      </div>

      <div className="relative mt-1 h-1">
        {TICKS.map((t) => (
          <span key={t} aria-hidden className="absolute top-0 h-1 w-px bg-violet-300" style={{ left: `${pos(t)}%` }} />
        ))}
      </div>

      <div className="relative mt-1 h-5 text-xs text-zinc-500">
        <span className="absolute left-0">1</span>
        <span className="absolute whitespace-nowrap" style={{ left: `${pos(50)}%`, transform: "translateX(-50%)" }}>
          50 · benchmark
        </span>
        <span className="absolute right-0">99</span>
      </div>
    </div>
  );
}
