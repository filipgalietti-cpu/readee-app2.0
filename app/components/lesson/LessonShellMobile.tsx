"use client";

/**
 * Mobile-portrait lesson layout exoskeleton — companion to
 * LessonShellDesktop. Same content slots (AnchorContent, ChartContent,
 * ExampleContent, CelebrationContent), reshaped for 393 × 852 phones (iPhone 15/16/17).
 *
 * Translated from the Claude Design mobile wireframe bundle (May 23
 * 2026). Layout zones:
 *
 *   1. Top bar (h-12)         — full-width progress dots + close X.
 *                                No lesson title on mobile (eats horizontal
 *                                space; the kid already knows what
 *                                lesson they're in).
 *   2. Image zone (35/28/25vh)— rounded image, collapses to 0 when no
 *                                image AND no leftSlot.
 *   3. Content area (flex-1)  — scrollable single-column body; the
 *                                same contentSlot the desktop shell
 *                                hosts on the right panel.
 *   4. Bottom controls        — audio pulse above big violet Next CTA
 *                                pinned bottom with safe-area inset
 *                                so it never sits under the iPhone
 *                                home indicator.
 *
 * Touch targets ≥44×44; active:scale press feedback; no hover states.
 */
import type { ReactNode } from "react";
import { X, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { LoadingImage } from "@/app/components/ui/LoadingImage";

export interface LessonShellMobileProps {
  slideNum: number;
  totalSlides: number;
  onClose: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  /** Defaults to "Next →"; pass "Start practice →" / "Let's Go!" etc. */
  nextLabel?: string;
  /** Omit for no-image variants — image zone collapses UNLESS
   *  `leftSlot` is provided. */
  imageUrl?: string;
  imageAlt?: string;
  /** Per-variant image zone height. 35 = intro, 28 = teach,
   *  25 = example. Ignored when there's no image and no leftSlot. */
  imageHeightVh?: 35 | 28 | 25;
  /** Replaces the image zone with custom content (gradient celebration
   *  panel on practice-intro). Takes precedence over `imageUrl`. */
  leftSlot?: ReactNode;
  /** Slide body — heading + AnchorContent / ChartContent / etc. */
  contentSlot: ReactNode;
  /** Drives the pulse ring around the speaker icon. */
  audioPlaying?: boolean;
}

export function LessonShellMobile({
  slideNum,
  totalSlides,
  onClose,
  onNext,
  nextDisabled = false,
  nextLabel = "Next →",
  imageUrl,
  imageAlt,
  imageHeightVh = 35,
  leftSlot,
  contentSlot,
  audioPlaying = false,
}: LessonShellMobileProps) {
  const hasImage = !!leftSlot || !!imageUrl;
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#fcfcfe] text-[#1e1b3a]">
      {/* ── 1. Top bar — progress dots stretch full width + close ── */}
      <header className="flex h-12 flex-shrink-0 items-center gap-3 border-b border-dashed border-zinc-200 bg-white/90 px-4">
        <ProgressDots current={slideNum} total={totalSlides} />
        <button
          onClick={onClose}
          aria-label="Close lesson"
          className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-500 transition active:scale-95 [touch-action:manipulation] before:absolute before:-inset-2 before:content-['']"
        >
          <X size={16} />
        </button>
      </header>

      {/* ── 2. Image zone (collapses when no image AND no leftSlot) ──
          Square image SIZED BY HEIGHT (imageHeightVh × imageHeightVh),
          centered horizontally. Lesson PNGs are 1024×1024 (Vertex
          Imagen). Forcing the zone square = no letterbox wash and
          no cropped heads/feet, but letting it consume the full
          width hogs vertical space on content-heavy slides (example
          / teach). Solution: square aspect at the variant's height
          → image is 25/28/35vh tall AND wide. Page bg fills the
          horizontal margins so it looks like a polaroid, not a
          framed image with bars.
          25vh ≈ 213px on iPhone 16/17 (example), 28vh ≈ 239px (teach),
          35vh ≈ 295px (intro/tip). */}
      {hasImage && (
        <div className="flex flex-shrink-0 justify-center px-4 pt-3">
          {leftSlot ?? (
            <LoadingImage
              key={imageUrl}
              src={imageUrl ?? ""}
              alt={imageAlt ?? ""}
              style={{ height: `${imageHeightVh}vh` }}
              containerClassName="aspect-square rounded-2xl shadow-[0_4px_16px_-6px_rgba(50,30,90,0.18)]"
              className="h-full w-full rounded-2xl object-cover"
            />
          )}
        </div>
      )}

      {/* ── 3. Content area (scrollable single column) ──
          main is flex-col + overflow-y-auto; motion.div is min-h-full
          so my-auto inside contentSlot (LessonSlideshow flex-1/my-auto
          centering pattern at line ~1673) has slack to absorb. If
          content overflows, main scrolls normally. */}
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6">
        <motion.div
          key={slideNum}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex min-h-full w-full flex-col"
        >
          {contentSlot}
        </motion.div>
      </main>

      {/* ── 4. Bottom-pinned controls (safe-area aware) ── */}
      <footer
        className="flex-shrink-0 border-t border-dashed border-zinc-200 bg-white/90 px-4 pt-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 14px)" }}
      >
        <AudioPulse playing={audioPlaying} />
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="mt-3 flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-semibold text-white shadow-[0_6px_18px_-6px_rgba(99,102,241,0.6)] transition active:scale-[0.98] disabled:bg-none disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none"
        >
          {nextLabel}
        </button>
      </footer>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

function ProgressDots({ current, total }: { current: number; total: number }) {
  // Full-width stretched bars instead of fixed-size dots — the kid
  // feels horizontal position by the active bar growing to ~2.2x.
  return (
    <div className="flex flex-1 items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current - 1;
        const isCurrent = i === current - 1;
        return (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              isCurrent
                ? "flex-[2.2] bg-violet-500"
                : done
                  ? "flex-1 bg-violet-300"
                  : "flex-1 bg-zinc-200"
            }`}
          />
        );
      })}
    </div>
  );
}

function AudioPulse({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="relative h-8 w-8">
        {playing && (
          <span className="absolute inset-0 animate-ping rounded-full bg-violet-100" />
        )}
        <span className="absolute inset-1 flex items-center justify-center rounded-full border border-violet-300 bg-white text-violet-500">
          <Volume2 size={13} />
        </span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
        {playing ? "audio playing…" : "audio paused"}
      </span>
    </div>
  );
}
