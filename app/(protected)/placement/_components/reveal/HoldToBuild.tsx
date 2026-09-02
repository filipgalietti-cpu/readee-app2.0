"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, type AnimationPlaybackControls } from "framer-motion";
import { Bunny } from "@/app/_components/Bunny/Bunny";
import { Glyph } from "@/app/_components/Glyph";
import { useReduced } from "./motion";

export type HoldToBuildProps = {
  childName: string;
  /** "4th-grade", as in "the 4th-grade benchmark". Without it the line says "the grade benchmark". */
  enrolledGrade?: string;
  onComplete: () => void;
  holdMs?: number;
  /** Soft chime placeholder, called the moment the ring completes. */
  onChime?: () => void;
};

/* The one looping animation in the reveal: the robot walks the bench while
 * the report builds. Real CSS keyframes; off under reduced motion. */
const WALK_CSS = `
@keyframes revealRobotWalk {
  0%   { transform: translateX(-72px) scaleX(1); }
  48%  { transform: translateX(72px) scaleX(1); }
  52%  { transform: translateX(72px) scaleX(-1); }
  98%  { transform: translateX(-72px) scaleX(-1); }
  100% { transform: translateX(-72px) scaleX(1); }
}
.reveal-robot-walk { animation: revealRobotWalk 3.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .reveal-robot-walk { animation: none; } }
`;

export function HoldToBuild({ childName, enrolledGrade, onComplete, holdMs = 2000, onChime }: HoldToBuildProps) {
  const reduced = useReduced();
  const progress = useMotionValue(0);
  const control = useRef<AnimationPlaybackControls | null>(null);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);
  const keyHeld = useRef(false);

  const lines = [
    `Comparing ${childName}'s reading with the ${enrolledGrade ? `${enrolledGrade} benchmark` : "grade benchmark"}`,
    "Checking three skills",
    `Curating ${childName}'s path`,
  ];

  useMotionValueEvent(progress, "change", (v) => {
    setLineIdx(Math.min(lines.length - 1, Math.floor(v * lines.length)));
  });

  const finish = useCallback(() => {
    setDone(true);
    setHolding(false);
    onChime?.();
    onComplete();
  }, [onChime, onComplete]);

  const start = useCallback(() => {
    if (done) return;
    setHolding(true);
    control.current?.stop();
    const from = progress.get();
    control.current = animate(progress, 1, {
      duration: (holdMs / 1000) * (1 - from),
      ease: "linear",
      onComplete: finish,
    });
  }, [done, finish, holdMs, progress]);

  const release = useCallback(() => {
    if (done) return;
    setHolding(false);
    control.current?.stop();
    control.current = animate(progress, 0, { duration: 0.35, ease: "easeOut" });
  }, [done, progress]);

  useEffect(() => () => control.current?.stop(), []);

  const walk = (holding || done) && !reduced;

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-8 text-center @container">
      <style dangerouslySetInnerHTML={{ __html: WALK_CSS }} />

      {/* The workbench: the robot bunny (about 160 px) walks its length while the ring fills. */}
      <div className="relative h-52 w-80">
        <div className="absolute left-1/2 top-0 h-48 w-44 -translate-x-1/2">
          <div className={`h-full w-full ${walk ? "reveal-robot-walk" : ""}`}>
            <Bunny outfitId="bunny_robot" />
          </div>
        </div>
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-3 rounded-full bg-violet-100" />
      </div>

      <div className="relative mt-8 h-48 w-48 @2xl:mt-10 @2xl:h-56 @2xl:w-56">
        <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="46" fill="none" strokeWidth="4" className="stroke-violet-100" />
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className="stroke-violet-600"
            style={{ pathLength: progress }}
          />
        </svg>
        <button
          type="button"
          aria-label={`Hold to build ${childName}'s report`}
          className={`absolute inset-2 flex touch-none select-none items-center justify-center rounded-full bg-white px-6 text-base font-semibold text-violet-700 ring-1 ring-zinc-200 @2xl:text-lg ${
            holding ? "shadow-[0_8px_24px_-8px_rgba(139,92,246,0.45)]" : "shadow-[0_4px_14px_-4px_rgba(49,46,129,0.20)]"
          }`}
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            start();
          }}
          onPointerUp={release}
          onPointerCancel={release}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if ((e.key === " " || e.key === "Enter") && !keyHeld.current) {
              e.preventDefault();
              keyHeld.current = true;
              start();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === " " || e.key === "Enter") {
              keyHeld.current = false;
              release();
            }
          }}
          onBlur={() => {
            if (keyHeld.current) {
              keyHeld.current = false;
              release();
            }
          }}
        >
          {done ? (
            <span className="flex items-center gap-2 text-emerald-600">
              <Glyph name="check" size={20} />
              Ready
            </span>
          ) : (
            <span>Hold to build {childName}&apos;s report</span>
          )}
        </button>
      </div>

      <div className="relative mt-6 h-12 w-full max-w-xs @2xl:mt-8 @2xl:max-w-md">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={holding || done ? lineIdx : "idle"}
            className="absolute inset-x-0 top-0 text-sm text-zinc-500 @2xl:text-base"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {holding || done ? lines[lineIdx] : "Press and hold."}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
