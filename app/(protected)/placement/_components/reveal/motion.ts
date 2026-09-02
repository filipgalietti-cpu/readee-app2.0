"use client";

/**
 * Motion canon for the reveal, copied from CLAUDE.md. Every duration and
 * distance the reveal uses lives here so no card re-derives one.
 */
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** Standard entrance: rise 16 over 0.35 s. */
export const RISE = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } } as const;
export const riseT = (delay = 0) => ({ duration: 0.35, ease: "easeOut" as const, delay });
/** Subtle entrance: rise 8 over 0.2 s (chips, rows, inline reveals). */
export const RISE_SUBTLE = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } } as const;
export const subtleT = (delay = 0) => ({ duration: 0.2, ease: "easeOut" as const, delay });

export const COUNT_MS = 1200;
export const BAR_S = 0.6;
export const MARKER_S = 0.8;
export const NODE_GAP_MS = 300;
export const POP_GAP_S = 0.35;
export const CARD_SLIDE = { y: 24, duration: 0.5 } as const;
export const AUTO_ADVANCE_MS = 1500;

export function useReduced(): boolean {
  return useReducedMotion() ?? false;
}

export const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** 0 to target, eased out, over COUNT_MS once `active` is true. `instant` jumps. */
export function useCountUp(target: number, active: boolean, opts: { durationMs?: number; instant?: boolean } = {}): number {
  const { durationMs = COUNT_MS, instant = false } = opts;
  const [value, setValue] = useState(active && instant ? target : 0);
  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    if (instant) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, durationMs, instant]);
  return value;
}
