/**
 * Dead-space estimator for lesson slides on both mobile + desktop.
 *
 * Walks each slide's authored content, estimates rendered pixel
 * height per element type, compares to the available content area
 * for that surface (mobile = iPhone 16/17 portrait, desktop = laptop
 * split-shell), and flags slides where < ~60% of vertical space is
 * used. The flag drives a heal pass that proposes filler content.
 *
 * Heuristic — pixel counts are deliberately rough. The goal is to
 * surface "this slide looks empty on mobile" / "this slide has 300px
 * of wasted space on desktop", not to render-test exactly.
 *
 * Per-element estimates derived from the actual render output in
 * LessonSlideshow.tsx (May 2026 mobile + desktop shells).
 */

// ── Viewport budgets ──────────────────────────────────────────────
// Mobile = iPhone 16/17 portrait (393 × 852) — same dimensions as
// iPhone 15 + 16, the dominant non-Pro form factor in circulation.
//   chrome = 48 top bar + image zone + 120 bottom bar (audio + CTA + safe area)
// Desktop = laptop split-shell. Right-panel content sits inside a
//   ~680px wide column with ~720px of vertical content height
//   (60 top bar + 720 body + 80 bottom bar = 860 total target).

const MOBILE_VIEWPORT_W = 393;
const MOBILE_VIEWPORT_H = 852;
const MOBILE_TOP_BAR = 48;
const MOBILE_BOTTOM_BAR = 120;

const DESKTOP_BODY_H = 720; // right-panel vertical room
const DESKTOP_BODY_W = 680;

// Image height per slide type on mobile (matches LessonSlideshow.tsx).
const MOBILE_IMAGE_VH: Record<string, number> = {
  intro: 35,
  teach: 28,
  example: 25,
  tip: 35,
  "practice-intro": 35,
};

function mobileAvailableContentH(slideType: string, hasImage: boolean): number {
  const imageVh = hasImage ? (MOBILE_IMAGE_VH[slideType] ?? 35) : 0;
  const imagePx = Math.round((imageVh / 100) * MOBILE_VIEWPORT_H);
  return MOBILE_VIEWPORT_H - MOBILE_TOP_BAR - imagePx - MOBILE_BOTTOM_BAR;
}

// ── Per-element height estimates ──────────────────────────────────
// Mobile renders content as eyebrow heading + violet cards / tables.

function mobileElementHeight(step: any, slideType: string): number {
  const hasParts = Array.isArray(step.displayParts) && step.displayParts.length > 0;
  const hasText = !!step.displayText;
  const hasTable = !!step.displayTableRow;

  // Filler step: audio only, nothing on screen. Counts as 0 on mobile.
  // The renderer auto-shows the table on table slides via earlyTable,
  // but for non-table slides a filler step contributes nothing.
  if (!hasParts && !hasText && !hasTable) {
    return 0;
  }

  if (hasTable) {
    // Tables render once per slide — counted at the slide level below.
    return 0;
  }

  if (hasParts) {
    // Each violet card ~68px (24px text + py-3.5 padding + border).
    // gap-2 between = 8px. Tip flowing-equation = 1 card with multiple
    // text fragments inside (same height as a single card).
    const isTip = slideType === "tip";
    const isFlowing = isTip && step.displayParts.some(
      (p: any) => typeof p.text === "string" && /^\s/.test(p.text),
    );
    if (isFlowing) return 90; // larger card holds the full equation
    return step.displayParts.length * 68 + (step.displayParts.length - 1) * 8;
  }

  if (hasText) {
    // Passage card (≥7 words) = ~110px; single-anchor card = ~75px.
    const wc = String(step.displayText).trim().split(/\s+/).length;
    if (wc >= 7 || step.displayStyle === "passage") return 110;
    return 75;
  }

  return 0;
}

function mobileTableHeight(slide: any): number {
  const steps = Array.isArray(slide.steps) ? slide.steps : [];
  const rows = steps.filter((s: any) => s?.displayTableRow);
  if (rows.length === 0) return 0;
  // 30px header row (uppercase eyebrow style) + per-row 56px + 12px gap
  return 30 + rows.length * 56 + (rows.length - 1) * 12;
}

function mobileExampleWorksheetHeight(slide: any): number {
  // Q→A worksheet rows on example slides. ~50px per row + 8px gap.
  const steps = Array.isArray(slide.steps) ? slide.steps : [];
  const qaPairs = steps.filter(
    (s: any) =>
      Array.isArray(s.displayParts) &&
      s.displayParts.length === 2 &&
      typeof s.displayParts[0]?.text === "string" &&
      s.displayParts[0].text.trim().endsWith("?"),
  );
  if (qaPairs.length === 0) return 0;
  return qaPairs.length * 50 + (qaPairs.length - 1) * 8;
}

// ── Desktop estimates (LessonShellDesktop right-panel) ────────────
// Pills are larger on desktop (text-3xl/5xl + p-5 padding).

function desktopElementHeight(step: any, slideType: string): number {
  const hasParts = Array.isArray(step.displayParts) && step.displayParts.length > 0;
  const hasText = !!step.displayText;
  const hasTable = !!step.displayTableRow;
  if (!hasParts && !hasText && !hasTable) return 0;
  if (hasTable) return 0;

  if (hasParts) {
    // Desktop pills are larger (text-5xl, p-5) ~95px each.
    return step.displayParts.length * 95 + (step.displayParts.length - 1) * 16;
  }
  if (hasText) {
    const wc = String(step.displayText).trim().split(/\s+/).length;
    if (wc >= 7 || step.displayStyle === "passage") return 160;
    return 110;
  }
  return 0;
}

function desktopTableHeight(slide: any): number {
  const steps = Array.isArray(slide.steps) ? slide.steps : [];
  const rows = steps.filter((s: any) => s?.displayTableRow);
  if (rows.length === 0) return 0;
  // 40px header + 84px per row + 16px gap
  return 40 + rows.length * 84 + (rows.length - 1) * 16;
}

// ── Slide-level estimate ──────────────────────────────────────────

export type SurfaceUsage = {
  surface: "mobile" | "desktop";
  usedPx: number;
  availablePx: number;
  usedRatio: number;
  deadPx: number;
};

export function estimateSlideUsage(slide: any, surface: "mobile" | "desktop"): SurfaceUsage {
  const slideType = String(slide?.type ?? "");
  const hasImage = !!slide?.imageFile;
  const steps = Array.isArray(slide.steps) ? slide.steps : [];

  // Heading eyebrow / banner
  const headingPx = slide?.heading
    ? (surface === "mobile" ? 18 : 60)
    : 0;

  // Beat-height sum. The renderer accumulates beats on:
  //   - desktop always
  //   - mobile: example + tip slides + anchor-runs (≤2-word steps)
  // For accumulate cases the kid sees ALL beats stacked, so we sum.
  // For replace cases the kid sees one beat at a time, so we take
  // the tallest single beat.
  const accumulatesOnSurface = surface === "desktop"
    ? true
    : (slideType === "example" || slideType === "tip");
  let beatHeights: number[] = [];
  for (const step of steps) {
    const h = surface === "mobile"
      ? mobileElementHeight(step, slideType)
      : desktopElementHeight(step, slideType);
    if (h > 0) beatHeights.push(h);
  }
  const beatTotal = accumulatesOnSurface
    ? beatHeights.reduce((a, b) => a + b, 0)
    : (beatHeights.length > 0 ? Math.max(...beatHeights) : 0);
  const gapBetweenBeats = 12; // accumulate spacing
  const beatGaps = accumulatesOnSurface
    ? Math.max(0, beatHeights.length - 1) * gapBetweenBeats
    : 0;
  const tallestBeat = beatTotal + beatGaps;

  // Tables + example worksheets stick around regardless of which beat
  // is current (renderer accumulates them).
  const tablePx = surface === "mobile" ? mobileTableHeight(slide) : desktopTableHeight(slide);
  const worksheetPx = surface === "mobile" ? mobileExampleWorksheetHeight(slide) : 0;

  // Final estimate — heading + max(beat) + persistent chrome (table,
  // worksheet) + a single gap.
  const usedPx = headingPx + tallestBeat + tablePx + worksheetPx +
    (tallestBeat > 0 && (tablePx > 0 || worksheetPx > 0) ? gapBetweenBeats : 0);

  const availablePx = surface === "mobile"
    ? mobileAvailableContentH(slideType, hasImage)
    : DESKTOP_BODY_H;

  return {
    surface,
    usedPx,
    availablePx,
    usedRatio: availablePx > 0 ? usedPx / availablePx : 0,
    deadPx: Math.max(0, availablePx - usedPx),
  };
}

// ── Spec check ────────────────────────────────────────────────────

type CheckResult = {
  ok: boolean;
  findingType: string;
  message: string;
  severity: "fail" | "warn";
  targetSubId: string | null;
};

/**
 * Flag slides where mobile OR desktop usage is below 60% of the
 * available content area. Practice-intro and intro slides are
 * tolerated down to 50% — they're naturally lighter (transition
 * beats), so a moderate dead-space ratio is expected.
 */
export function checkDeadSpace(lesson: { slides?: any[] }): CheckResult[] {
  const out: CheckResult[] = [];
  const slides = Array.isArray(lesson.slides) ? lesson.slides : [];
  for (let si = 0; si < slides.length; si++) {
    const slide = slides[si];
    if (!slide || slide.type === "mcq") continue;
    const slideType = String(slide.type);
    const threshold = (slideType === "intro" || slideType === "practice-intro") ? 0.5 : 0.6;

    for (const surface of ["mobile", "desktop"] as const) {
      const usage = estimateSlideUsage(slide, surface);
      if (usage.usedRatio < threshold && usage.deadPx > 120) {
        out.push({
          ok: false,
          findingType: `slide.${surface}_dead_space`,
          severity: "warn",
          message: `${surface} slide ${slide.slide ?? "?"} (${slideType}) uses ~${Math.round(usage.usedRatio * 100)}% of available height (${usage.deadPx}px dead). Add an anchor pill / preview / example to fill the space.`,
          targetSubId: `slide-${si + 1}`,
        });
      }
    }
  }
  return out;
}
