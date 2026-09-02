"use client";

/**
 * TrialTimeline: the three moments of the trial, drawn as a friendly timeline
 * with icons rather than fine print. All the cards on the table (Blinkist's
 * transparent timeline lifted trial starts and cut complaints), in a tone that
 * reads as a plan, not a warning. Vertical by default; `horizontal` for the
 * printable report.
 */
import { Glyph, type GlyphName } from "@/app/_components/Glyph";
import type { TrialStep } from "./copy";

const ICONS: GlyphName[] = ["calendar-days", "bell", "credit-card"];

export function TrialTimeline({ steps, horizontal = false }: { steps: TrialStep[]; horizontal?: boolean }) {
  if (horizontal) {
    return (
      <ol className="grid grid-cols-3 gap-3">
        {steps.map((s, i) => (
          <li key={s.when} className="relative flex flex-col items-center text-center">
            {i < steps.length - 1 && <span aria-hidden className="absolute left-1/2 top-5 h-0.5 w-full bg-violet-100" />}
            <span className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${i === 0 ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-700"}`}>
              <Glyph name={ICONS[i] ?? "check"} size={18} />
            </span>
            <p className="mt-2 text-sm font-semibold text-zinc-800">{s.when}</p>
            <p className="text-xs text-zinc-500">{s.text}</p>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <ol className="relative">
      {steps.map((s, i) => (
        <li key={s.when} className={`relative flex gap-3 ${i < steps.length - 1 ? "pb-2 @2xl:pb-3" : ""}`}>
          {i < steps.length - 1 && <span aria-hidden className="absolute left-4 top-9 bottom-0 w-0.5 -translate-x-1/2 bg-violet-100" />}
          <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${i === 0 ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-700"}`}>
            <Glyph name={ICONS[i] ?? "check"} size={16} />
          </span>
          <div className="min-w-0 pt-1">
            <p className="text-sm font-semibold leading-tight text-zinc-800">{s.when}</p>
            <p className="text-xs text-zinc-500 @2xl:text-sm">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
