"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Text that lights up word by word as the teacher says it.
 *
 * The engine already knew how to do this and only did it in one place. ReadAlong
 * has karaoke highlighting, proven, using Whisper word timings; 331 scenes get
 * it. The other 2,157 narrated scenes carry the same timings and showed a static
 * block of text while a voice read something adjacent to it.
 *
 * For a child who is still learning to read, that is the difference between
 * words on a screen and words they can follow. Hearing "cats" and seeing "cats"
 * light up at that instant is the whole mechanism by which print maps to sound.
 * It is not decoration.
 *
 * Timings come from the narration, so only the words the teacher actually says
 * light up - a prompt word absent from the script simply stays plain rather than
 * guessing. Reduced-motion users get the text with no sweep.
 */

export default function SpokenText({
  text,
  wordStartsMs,
  className,
  activeClassName = "text-violet-700",
  spokenClassName = "text-[#1e1b3a]",
  pendingClassName = "text-zinc-400",
  playing = true,
  audioMs,
}: {
  text: string;
  /** Start time per word of `text`, ms from narration start. NaN = never spoken. */
  wordStartsMs?: number[];
  className?: string;
  activeClassName?: string;
  spokenClassName?: string;
  pendingClassName?: string;
  /** False freezes the sweep - e.g. the clip has not started or was stopped. */
  playing?: boolean;
  /**
   * Real narration position in ms. This is what the highlight should follow: a
   * self-run timer sweeps ahead of a buffering clip and lands the highlight on
   * words the child has not heard yet, which teaches the wrong map.
   */
  audioMs?: number;
}) {
  const words = text.split(/(\s+)/);
  const [selfElapsed, setSelfElapsed] = useState(0);
  const audioDriven = typeof audioMs === "number";
  const elapsed = audioDriven ? (audioMs as number) : selfElapsed;
  const raf = useRef<number | null>(null);
  const t0 = useRef(0);

  const hasTimings = !!wordStartsMs?.some((n) => Number.isFinite(n));

  useEffect(() => {
    if (audioDriven || !hasTimings || !playing) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    t0.current = performance.now();
    const tick = () => {
      setSelfElapsed(performance.now() - t0.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [text, hasTimings, playing, audioDriven]);

  // Without timings this is ordinary text, which is the right fallback: a
  // highlight that guessed would land on the wrong word and teach the wrong map.
  if (!hasTimings) return <span className={className}>{text}</span>;

  let wordIndex = -1;
  return (
    <span className={className}>
      {words.map((chunk, i) => {
        if (/^\s+$/.test(chunk)) return <span key={i}>{chunk}</span>;
        wordIndex += 1;
        const start = wordStartsMs?.[wordIndex];
        const next = wordStartsMs?.slice(wordIndex + 1).find((n) => Number.isFinite(n));
        const spoken = Number.isFinite(start) && elapsed >= (start as number);
        const active =
          spoken && (next === undefined || !Number.isFinite(next) || elapsed < (next as number));
        return (
          <span
            key={i}
            className={active ? activeClassName : spoken ? spokenClassName : pendingClassName}
            style={{
              transition: "color .18s ease",
              // A gentle lift on the word being said, so the eye is pulled to it
              // without the line jumping around.
              display: "inline-block",
              transform: active ? "translateY(-2px)" : "none",
            }}
          >
            {chunk}
          </span>
        );
      })}
    </span>
  );
}
