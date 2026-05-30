/**
 * Lesson canon — the 5 reference lessons that every other lesson is
 * graded against. RL.K.1 is the gold standard (K curriculum, Filip's
 * 5/5 audit); the other 4 were brought to canon shape on 2026-05-23
 * after the L.3.4b "AI slop galore" audit kicked off this work.
 *
 * Canon enforcement runs as a deterministic audit check
 * (`lesson.canon_drift` and its variants) inside runLessonSpecChecks
 * — non-canon lessons that deviate from the expected slide sequence
 * surface as findings that the auto-heal pipeline can act on.
 *
 * The 5 themselves are skipped — checking the canon against itself
 * is meaningless and would lock us out of editing them.
 *
 * See also:
 *   - app/data/sample-lessons.json (the lessons themselves)
 *   - feedback_lesson_design_rules.md (the human-language rules)
 *   - docs/CONTENT_SPEC.md (canonical quality spec)
 */

export const CANON_STANDARDS = [
  "RL.K.1",
  "RL.1.1",
  "RF.2.3b",
  "L.3.4b",
  "L.4.4b",
] as const;

export type CanonStandardId = (typeof CANON_STANDARDS)[number];

export function isCanonLesson(standardId: string | null | undefined): boolean {
  return !!standardId && (CANON_STANDARDS as readonly string[]).includes(standardId);
}

/**
 * Canon slide sequence. Every non-MCQ lesson must follow this order:
 *
 *   intro → teach(1-2) → example → tip → practice-intro → mcq(1+)
 *
 * Multiple `teach` slides are allowed when a lesson naturally chunks
 * (e.g. UN/RE/PRE on one card, DIS/MIS on the next). But one of each
 * non-teach slide type is required.
 */
export const CANON_REQUIRED_SLIDE_TYPES = [
  "intro",
  "teach",
  "example",
  "tip",
  "practice-intro",
] as const;

export type CanonSlideType = (typeof CANON_REQUIRED_SLIDE_TYPES)[number];

/**
 * Per-slide-type structural rules. These are deterministic — pure
 * count + presence checks, no LLM judgment. Soft pedagogical checks
 * (does the example actually work the concept?) live in the judge
 * committee, not here.
 */
export const CANON_SLIDE_RULES: Record<CanonSlideType, {
  minSteps: number;
  maxSteps: number;
  /** If true, slide should contain Q→A pairs (displayParts of length 2 ending in "?"). */
  requiresQAPair?: boolean;
  /** If true, slide should have a celebration / transition feel. */
  isTransition?: boolean;
}> = {
  intro:            { minSteps: 2, maxSteps: 4 },
  teach:            { minSteps: 2, maxSteps: 5 },
  example:          { minSteps: 3, maxSteps: 6, requiresQAPair: true },
  tip:              { minSteps: 2, maxSteps: 4 },
  "practice-intro": { minSteps: 2, maxSteps: 3, isTransition: true },
};

type CanonCheckResult = {
  ok: boolean;
  findingType: string;
  message: string;
  severity: "fail" | "warn";
  targetSubId: string | null;
};

/**
 * Detect Q→A pairs the way the renderer + aligner do: a step has
 * `displayParts` of length 2 where the first part ends with "?".
 */
function hasQAPair(slide: { steps?: any[] }): boolean {
  const steps = Array.isArray(slide.steps) ? slide.steps : [];
  return steps.some((s) => {
    const parts = Array.isArray(s?.displayParts) ? s.displayParts : [];
    if (parts.length !== 2) return false;
    const first = typeof parts[0]?.text === "string" ? parts[0].text.trim() : "";
    return first.endsWith("?");
  });
}

/**
 * `lesson.canon_drift` — non-canon lesson is missing one of the
 * required slide types in the canon sequence, OR slide types appear
 * in the wrong order, OR the example slide doesn't contain Q→A
 * pairs the way the canon does.
 *
 * Emits one finding per distinct violation so the heal pipeline can
 * act on each independently. Canon lessons themselves are skipped.
 */
export function checkCanonDrift(lesson: {
  standardId?: string | null;
  slides?: any[];
}): CanonCheckResult[] {
  const out: CanonCheckResult[] = [];
  const std = lesson.standardId ?? null;
  if (isCanonLesson(std)) return out;

  const slides = Array.isArray(lesson.slides) ? lesson.slides : [];
  const nonMcqSlides = slides.filter((s) => s?.type !== "mcq");
  if (nonMcqSlides.length === 0) return out;

  const typesPresent = new Set<string>();
  for (const s of nonMcqSlides) {
    if (typeof s?.type === "string") typesPresent.add(s.type);
  }

  // ── Missing required slide types ─────────────────────────────────
  for (const required of CANON_REQUIRED_SLIDE_TYPES) {
    if (!typesPresent.has(required)) {
      out.push({
        ok: false,
        findingType: `lesson.canon_missing_${required.replace("-", "_")}`,
        severity: "warn",
        message: `Lesson is missing a "${required}" slide. Canon shape: ${CANON_REQUIRED_SLIDE_TYPES.join(" → ")} → mcq.`,
        targetSubId: null,
      });
    }
  }

  // ── Wrong order ──────────────────────────────────────────────────
  // Build the actual non-mcq type sequence (deduped to first-occurrence
  // index per type) and check the order matches the canon spine. We
  // tolerate multiple teach slides in a row but not interleaving.
  const firstIdx: Record<string, number> = {};
  nonMcqSlides.forEach((s, i) => {
    const t = s?.type;
    if (typeof t === "string" && firstIdx[t] === undefined) firstIdx[t] = i;
  });
  const expectedOrder = CANON_REQUIRED_SLIDE_TYPES.filter((t) => firstIdx[t] !== undefined);
  for (let i = 1; i < expectedOrder.length; i++) {
    if (firstIdx[expectedOrder[i]] < firstIdx[expectedOrder[i - 1]]) {
      out.push({
        ok: false,
        findingType: "lesson.canon_slide_order",
        severity: "warn",
        message: `Slide types appear in wrong order. Canon: ${CANON_REQUIRED_SLIDE_TYPES.join(" → ")}. Got: ${nonMcqSlides.map((s) => s?.type).join(" → ")}.`,
        targetSubId: null,
      });
      break;
    }
  }

  // ── Per-slide rules ──────────────────────────────────────────────
  for (let si = 0; si < slides.length; si++) {
    const slide = slides[si];
    const rawType = typeof slide?.type === "string" ? slide.type : null;
    if (!rawType || rawType === "mcq") continue;
    const rules = (CANON_SLIDE_RULES as Record<string, typeof CANON_SLIDE_RULES[CanonSlideType] | undefined>)[rawType];
    if (!rules) continue;
    const t = rawType;

    const steps = Array.isArray(slide.steps) ? slide.steps : [];
    if (steps.length < rules.minSteps) {
      out.push({
        ok: false,
        findingType: `lesson.canon_${t.replace("-", "_")}_too_few_steps`,
        severity: "warn",
        message: `${t} slide has ${steps.length} step(s); canon needs at least ${rules.minSteps}.`,
        targetSubId: `slide-${si + 1}`,
      });
    }
    if (steps.length > rules.maxSteps) {
      out.push({
        ok: false,
        findingType: `lesson.canon_${t.replace("-", "_")}_too_many_steps`,
        severity: "warn",
        message: `${t} slide has ${steps.length} step(s); canon caps at ${rules.maxSteps}. Split or trim.`,
        targetSubId: `slide-${si + 1}`,
      });
    }

    if (rules.requiresQAPair && !hasQAPair(slide)) {
      out.push({
        ok: false,
        findingType: `lesson.canon_example_missing_qa`,
        severity: "warn",
        message: `example slide should contain at least one Q→A displayParts pair (first part ends with "?"). Pattern: { displayParts: [{ text: "Who?" }, { text: "Bella!" }] }.`,
        targetSubId: `slide-${si + 1}`,
      });
    }
  }

  return out;
}

/**
 * Compact structural summary used by /owner dashboards + the canon
 * drift audit message. Returns the slide-type sequence as a single
 * arrow-joined string ("intro → teach → teach → tip → mcq × 5").
 */
export function summarizeStructure(lesson: { slides?: any[] }): string {
  const slides = Array.isArray(lesson.slides) ? lesson.slides : [];
  if (slides.length === 0) return "(no slides)";

  const parts: string[] = [];
  let runType: string | null = null;
  let runCount = 0;
  for (const s of slides) {
    const t = typeof s?.type === "string" ? s.type : "?";
    if (t === runType) {
      runCount++;
    } else {
      if (runType !== null) {
        parts.push(runCount > 1 ? `${runType} × ${runCount}` : runType);
      }
      runType = t;
      runCount = 1;
    }
  }
  if (runType !== null) {
    parts.push(runCount > 1 ? `${runType} × ${runCount}` : runType);
  }
  return parts.join(" → ");
}
