"use client";

/**
 * Desktop-first "large and in-charge" lesson layout exoskeleton.
 *
 * The shell handles chrome — top bar with progress dots + title +
 * close, a 45/55 split body with image-left / content-right + dashed
 * divider, and a bottom bar with audio pulse + big Next CTA. Slide
 * content goes in via `contentSlot`, so the same shell hosts every
 * variant (intro anchor, teach chart, example passage+QA, no-image
 * full-width, practice-intro celebration).
 *
 * Translated from the Claude Design wireframe (May 23 2026) — the
 * exoskeleton pattern Filip asked for. Lexend is already loaded
 * globally via app/layout.tsx, so the chrome inherits font-sans.
 */
import type { ReactNode } from "react";
import { X, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { Bunny } from "@/app/_components/Bunny/Bunny";
import { LoadingImage } from "@/app/components/ui/LoadingImage";

export interface LessonShellDesktopProps {
  slideNum: number;
  totalSlides: number;
  lessonTitle: string;
  onClose: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  /** Defaults to "Next →"; pass "Start practice →", "Let's Go!", etc. */
  nextLabel?: string;
  /** Omit for no-image variants — body collapses to full-width centered
   *  UNLESS `leftSlot` is provided. */
  imageUrl?: string;
  imageAlt?: string;
  /** Custom left-panel content used when there's no real image but
   *  the split layout should stay (e.g., celebration gradient on the
   *  practice-intro variant). Takes precedence over `imageUrl`. */
  leftSlot?: ReactNode;
  /** Right-panel slide content (anchor / chart / example / celebration). */
  contentSlot: ReactNode;
  /** Drives the pulse ring around the speaker icon in the bottom bar. */
  audioPlaying?: boolean;
}

export function LessonShellDesktop({
  slideNum,
  totalSlides,
  lessonTitle,
  onClose,
  onNext,
  nextDisabled = false,
  nextLabel = "Next →",
  imageUrl,
  imageAlt,
  leftSlot,
  contentSlot,
  audioPlaying = false,
}: LessonShellDesktopProps) {
  // Show the split (and the divider) whenever EITHER a left slot is
  // explicitly provided or an image URL exists. Falls back to a
  // centered full-width right panel only when both are absent.
  const hasLeft = !!leftSlot || !!imageUrl;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#fcfcfe] text-[#1e1b3a]">
      {/* ── Top bar — progress dots + title + close ── */}
      <header className="flex h-[60px] flex-shrink-0 items-center gap-5 border-b border-dashed border-zinc-200 bg-white/90 px-8">
        <ProgressDots current={slideNum} total={totalSlides} />
        <div className="flex-1 text-center text-sm font-medium tracking-tight text-zinc-600">
          {lessonTitle}
        </div>
        <button
          onClick={onClose}
          aria-label="Close lesson"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100"
        >
          <X size={18} />
        </button>
      </header>

      {/* ── Body — 45/55 split (or full-width when no left content) ── */}
      <main className="relative flex min-h-0 flex-1">
        {hasLeft && (
          <div className="flex w-[45%] items-center justify-center px-8 py-12 pl-16">
            {leftSlot ?? (
              <LoadingImage
                key={imageUrl}
                src={imageUrl ?? ""}
                alt={imageAlt ?? ""}
                containerClassName="aspect-square h-[70%] rounded-3xl shadow-[0_8px_24px_-8px_rgba(50,30,90,0.18)]"
                className="h-full w-full rounded-3xl object-contain"
              />
            )}
          </div>
        )}

        {hasLeft && (
          // Dashed vertical divider. Stretches full main height with
          // small inset gap (32px) for better visual centering — was
          // 64px which made the divider look short relative to the
          // 720+px body height on a laptop.
          <div className="flex items-stretch py-8" aria-hidden>
            <div
              className="w-px self-stretch"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(180deg, #d4d4dc 0 6px, transparent 6px 12px)",
              }}
            />
          </div>
        )}

        <div
          // Right panel — full-height column. ContentSlot manages its
          // OWN vertical distribution (heading sticks high, body
          // centers in the remaining space via mt-auto / flex-1).
          // Don't apply a vertical alignment here — that would
          // collapse all the contentSlot's children together.
          className={`flex flex-1 justify-center ${
            hasLeft ? "px-10 py-10" : "px-16 py-12"
          }`}
        >
          <motion.div
            key={slideNum}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-[680px] flex"
          >
            {contentSlot}
          </motion.div>
        </div>
      </main>

      {/* ── Bottom bar — audio pulse + big Next CTA ── */}
      <footer className="flex h-20 flex-shrink-0 items-center gap-5 border-t border-dashed border-zinc-200 bg-white/90 px-12">
        <AudioPulse playing={audioPlaying} />
        <div className="flex-1" />
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="flex h-14 w-[280px] items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-semibold text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.6)] transition hover:translate-y-[-1px] hover:shadow-[0_12px_28px_-8px_rgba(99,102,241,0.7)] disabled:translate-y-0 disabled:bg-none disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none"
        >
          {nextLabel}
        </button>
      </footer>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current - 1;
        const isCurrent = i === current - 1;
        return (
          <div
            key={i}
            className={`h-2.5 rounded-full transition-all ${
              isCurrent
                ? "w-7 bg-violet-500"
                : done
                  ? "w-2.5 bg-violet-300"
                  : "w-2.5 bg-zinc-200"
            }`}
          />
        );
      })}
    </div>
  );
}

function AudioPulse({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11">
        {playing && (
          <span className="absolute inset-0 animate-ping rounded-full bg-violet-100" />
        )}
        <span className="absolute inset-1.5 flex items-center justify-center rounded-full border border-violet-300 bg-white text-violet-500">
          <Volume2 size={16} />
        </span>
      </div>
      <span className="text-xs font-medium tracking-wide text-zinc-400">
        {playing ? "audio playing…" : "audio paused"}
      </span>
    </div>
  );
}

/* ── Content slot helpers ───────────────────────────────────────── */
// Reusable building blocks for the right-panel content. The slideshow
// orchestrator picks which one to render based on slide.type. These
// match the Claude Design wireframes (variants.jsx) at the right
// scale + color palette.

export function AnchorContent({
  eyebrow,
  title,
  body,
  highlight,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  body?: string;
}) {
  // Split the title around the highlight word so it gets violet color.
  const titleRendered = highlight
    ? (() => {
        const idx = title.toLowerCase().indexOf(highlight.toLowerCase());
        if (idx < 0) return title;
        const before = title.slice(0, idx);
        const match = title.slice(idx, idx + highlight.length);
        const after = title.slice(idx + highlight.length);
        return (
          <>
            {before}
            <span className="text-violet-600">{match}</span>
            {after}
          </>
        );
      })()
    : title;
  return (
    <div>
      {eyebrow && (
        <div className="mb-4 text-sm font-medium tracking-wide text-zinc-400">
          {eyebrow}
        </div>
      )}
      <div className="text-[48px] font-extrabold leading-[1.2] tracking-tight">
        {titleRendered}
      </div>
      {body && (
        <p className="mt-7 max-w-[480px] text-lg leading-relaxed text-zinc-500">
          {body}
        </p>
      )}
    </div>
  );
}

export type ChartRow = {
  label: string;
  means: string;
  example?: string;
  tone?: "violet" | "blue" | "amber" | "emerald" | "rose";
};

const PILL_TONE: Record<
  NonNullable<ChartRow["tone"]>,
  { bg: string; fg: string; border: string }
> = {
  violet: { bg: "bg-violet-100", fg: "text-violet-800", border: "border-violet-300" },
  blue: { bg: "bg-blue-100", fg: "text-blue-800", border: "border-blue-300" },
  amber: { bg: "bg-amber-100", fg: "text-amber-800", border: "border-amber-300" },
  emerald: {
    bg: "bg-emerald-100",
    fg: "text-emerald-800",
    border: "border-emerald-300",
  },
  rose: { bg: "bg-rose-100", fg: "text-rose-800", border: "border-rose-300" },
};

export function ChartContent({
  title,
  headers,
  rows,
}: {
  title?: string;
  headers: string[];
  rows: ChartRow[];
}) {
  const cols = headers.length === 3 ? "1.1fr 1fr 1fr" : "1.1fr 1fr";
  return (
    <div>
      {title && (
        <div className="mb-7 text-[28px] font-extrabold tracking-tight">
          {title}
        </div>
      )}
      <div
        className="grid gap-4 border-b border-dashed border-zinc-200 px-2 pb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400"
        style={{ gridTemplateColumns: cols }}
      >
        {headers.map((h, i) => (
          <div key={i}>{h}</div>
        ))}
      </div>
      {rows.map((r, i) => {
        const tone = PILL_TONE[r.tone ?? "violet"];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.12, ease: "easeOut" }}
            className={`grid items-center gap-4 px-2 py-4 ${
              i < rows.length - 1 ? "border-b border-dashed border-zinc-100" : ""
            }`}
            style={{ gridTemplateColumns: cols }}
          >
            <span
              className={`inline-flex items-center justify-center rounded-full border px-5 py-2 text-base font-semibold ${tone.bg} ${tone.fg} ${tone.border}`}
            >
              {r.label}
            </span>
            <span className="text-lg font-medium text-zinc-700">{r.means}</span>
            {r.example !== undefined && (
              <span className="text-lg font-semibold text-zinc-900">
                {r.example}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export function ExampleContent({
  eyebrow = "from the story",
  passage,
  highlight,
  qa,
}: {
  eyebrow?: string;
  passage: string;
  highlight?: string;
  qa: Array<{ q: string; a: string; aTone?: ChartRow["tone"] }>;
}) {
  const passageRendered = highlight
    ? (() => {
        const idx = passage.toLowerCase().indexOf(highlight.toLowerCase());
        if (idx < 0) return passage;
        return (
          <>
            {passage.slice(0, idx)}
            <span className="underline decoration-violet-500 decoration-2 underline-offset-4">
              {passage.slice(idx, idx + highlight.length)}
            </span>
            {passage.slice(idx + highlight.length)}
          </>
        );
      })()
    : passage;
  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
        <div className="mb-3 text-sm font-medium tracking-wide text-zinc-400">
          {eyebrow}
        </div>
        <p className="text-[22px] font-medium leading-relaxed">
          {passageRendered}
        </p>
      </div>
      <div className="flex flex-col gap-3.5">
        {qa.map((row, i) => {
          const tone = PILL_TONE[row.aTone ?? "violet"];
          return (
            <div key={i} className="flex items-center gap-3.5">
              <span className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 px-5 py-2 text-base font-semibold text-zinc-700">
                {row.q}
              </span>
              <span className="text-xl text-zinc-300">→</span>
              <span
                className={`inline-flex items-center justify-center rounded-full border px-5 py-2 text-base font-semibold ${tone.bg} ${tone.fg} ${tone.border}`}
              >
                {row.a}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CelebrationContent({
  eyebrow = "you've got this →",
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <div>
      {eyebrow && (
        <div className="mb-4 text-base font-medium tracking-wide text-violet-500">
          {eyebrow}
        </div>
      )}
      <div className="text-[52px] font-extrabold leading-[1.2] tracking-tight text-violet-700 dark:text-violet-300">
        {title}
      </div>
      {body && (
        <p className="mt-6 max-w-[480px] text-xl leading-relaxed text-zinc-500">
          {body}
        </p>
      )}
    </div>
  );
}

/**
 * Soft violet placeholder used in the left panel of the practice-intro
 * variant — replaces the lesson image with a gradient surface +
 * sparkle marks. Pass via `imageUrl` only when there's no real
 * illustration; or use the no-image variant.
 */
export function CelebrationLeftPanel() {
  // On-brand Readee bunny on a violet gradient — replaces the native 🚀
  // emoji (glossy 3D, off our flat-cartoon style + breaks no-native-emoji).
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-[70%] w-[86%] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-violet-100 to-violet-300 shadow-[0_8px_24px_-8px_rgba(108,76,224,0.3)]">
        {[
          { x: "20%", y: "25%", s: 18 },
          { x: "75%", y: "18%", s: 14 },
          { x: "82%", y: "65%", s: 22 },
          { x: "15%", y: "70%", s: 16 },
          { x: "50%", y: "85%", s: 12 },
          { x: "30%", y: "45%", s: 10 },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 font-mono text-amber-400"
            style={{ left: p.x, top: p.y, fontSize: p.s }}
          >
            ✦
          </span>
        ))}
        <div className="h-[58%] w-[58%]">
          <Bunny outfitId={null} />
        </div>
      </div>
    </div>
  );
}
