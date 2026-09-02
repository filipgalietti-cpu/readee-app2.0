"use client";

import { motion } from "framer-motion";
import { Glyph, type GlyphName } from "@/app/_components/Glyph";
import { BAR_S, useReduced } from "./motion";

export type SkillBarProps = {
  icon: GlyphName;
  label: string;
  value: string;
  /** 0 to 100. */
  fillPct: number;
  meaning: string;
  /** The fill grows from 0 over 0.6 s once this flips true. */
  animate: boolean;
  /** Render filled with no growth (the printable report). */
  instant?: boolean;
};

export function SkillBar({ icon, label, value, fillPct, meaning, animate, instant = false }: SkillBarProps) {
  const reduced = useReduced();
  const pct = Math.max(0, Math.min(100, fillPct));
  return (
    <div>
      <div className="flex items-center gap-2 @2xl:flex-wrap">
        <Glyph name={icon} size={20} className="text-violet-600" />
        <span className="text-base font-semibold text-zinc-900 @2xl:text-lg">{label}</span>
        <span className="ml-auto text-sm text-zinc-600 @2xl:basis-full @2xl:text-base">{value}</span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-violet-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-500"
          initial={false}
          animate={{ width: animate ? `${pct}%` : "0%" }}
          transition={{ duration: instant || reduced ? 0 : BAR_S, ease: "easeOut" }}
        />
      </div>
      <p className="mt-3 text-[15px] leading-6 text-zinc-500 @2xl:text-base">{meaning}</p>
    </div>
  );
}
