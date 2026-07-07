/**
 * Adaptive engine — Phase 1 DECIDE layer.
 *
 * Pure, dependency-free classification logic (no React, no I/O) so it can be
 * unit-tested and reasoned about in isolation. Given a rolling window of the
 * child's recent graded interactions (plus an optional mastery seed from
 * child_skill_memory), it decides where the child is on the challenge/skill
 * curve and whether the engine should hit the BRAKES or pump the GAS.
 *
 * Pedagogical spine (see docs/ADAPTIVE_LEARNING_MODULE.md):
 *   - Zone of Proximal Development: keep the child challenged-but-capable.
 *   - Mastery learning: struggle is met with support + another rep, not a skip.
 *   - Flow theory (Csikszentmihalyi): match challenge to skill.
 *
 * FOUR STATES → FOUR DIRECTIVES:
 *   breezing   → advance   (+gas: skip mastered reps, stretch up)
 *   flow       → hold      (in the zone — do nothing)
 *   struggling → support   (-light brakes: escalate hint, extra rep, scaffold)
 *   frustrated → reteach   (-hard brakes: re-teach / drop a level, then climb)
 *
 * The classifier is deliberately conservative: it takes real evidence to
 * leave `flow`, and MORE evidence to declare `breezing` (we would rather
 * under-stretch than falsely skip a child ahead). It never coddles — a
 * struggling child is met with support that keeps the challenge, and the
 * ACT layer (Phase 2) is the only thing allowed to make anything easier,
 * always temporarily.
 */

export type AdaptiveState = "breezing" | "flow" | "struggling" | "frustrated";
export type Directive = "advance" | "hold" | "support" | "reteach";

/** The minimal shape the classifier needs from a learning_events row. */
export interface AdaptiveEventLite {
  correct: boolean;
  /** fork: misses + 1; one-shot MCQ: 1. */
  attempts?: number;
  hintUsed?: boolean;
  latencyMs?: number | null;
  surface?: "fork" | "lesson_mcq" | "practice";
}

/** Prior mastery for the current standard (from child_skill_memory). */
export interface MasterySeed {
  consecutiveCorrect?: number;
  easeFactor?: number; // 1.3 .. ~3.0
  totalAttempted?: number;
  totalCorrect?: number;
}

export interface AdaptiveReading {
  state: AdaptiveState;
  directive: Directive;
  /** -2 (hard brakes) .. +2 (full gas). Lets a future ACT layer tune degree. */
  throttle: number;
  /** 0..1, grows as the window fills — the ACT layer should wait for enough. */
  confidence: number;
  /** how many events were considered. */
  window: number;
  /** human-readable explanation (dev badge + the parent Insight narration). */
  reason: string;
}

// ── Tunables (calibrated in scripts/test-adaptive-controller.ts) ──────────
export const WINDOW = 6; // rolling window of recent events
const FAST_MS = 4500; // a confident, quick correct answer
const SLOW_MS = 16000; // laboring over an answer

const DIRECTIVE: Record<AdaptiveState, Directive> = {
  breezing: "advance",
  flow: "hold",
  struggling: "support",
  frustrated: "reteach",
};
const THROTTLE: Record<AdaptiveState, number> = {
  breezing: 2,
  flow: 0,
  struggling: -1,
  frustrated: -2,
};

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

/**
 * Classify the child's current state from their recent events.
 *
 * Order matters: we check the most severe state first (frustrated), so a
 * child in trouble is always caught before any "breezing" optimism.
 */
export function classifyState(
  events: AdaptiveEventLite[],
  seed?: MasterySeed,
): AdaptiveReading {
  const win = events.slice(-WINDOW);
  const n = win.length;

  // Cold start: no in-session evidence yet. Seed a cautious starting read
  // from prior mastery so the engine isn't blind on question one, but never
  // acts on a seed alone (confidence 0 → the ACT layer holds).
  if (n === 0) {
    const mastered = (seed?.consecutiveCorrect ?? 0) >= 3;
    const weak =
      (seed?.totalAttempted ?? 0) >= 3 &&
      (seed?.totalCorrect ?? 0) / Math.max(1, seed?.totalAttempted ?? 1) < 0.5;
    const state: AdaptiveState = weak ? "struggling" : "flow";
    return {
      state,
      directive: DIRECTIVE[state],
      throttle: weak ? -1 : 0,
      confidence: 0,
      window: 0,
      reason: mastered
        ? "prior mastery — ready to stretch once warmed up"
        : weak
          ? "prior weakness — start with support"
          : "no data yet — starting in flow",
    };
  }

  const correct = win.filter((e) => e.correct).length;
  const acc = correct / n;

  // trailing run of wrong answers (the clearest real-time struggle signal)
  let streakWrong = 0;
  for (let i = win.length - 1; i >= 0; i--) {
    if (!win[i].correct) streakWrong++;
    else break;
  }

  const hintRate = win.filter((e) => e.hintUsed).length / n;
  const avgAttempts = mean(win.map((e) => e.attempts ?? 1));

  // Latency is a noisy secondary signal (kids get distracted), so it only
  // ever nudges — never decides on its own. Use it among correct answers.
  const lats = win
    .filter((e) => e.correct && typeof e.latencyMs === "number")
    .map((e) => e.latencyMs as number);
  const avgLat = mean(lats);
  const slow = lats.length >= 2 && avgLat > SLOW_MS;
  const fast = lats.length >= 2 && avgLat < FAST_MS;

  // Breezing needs MORE evidence when prior mastery is weak (don't skip a
  // shaky child ahead on a lucky streak).
  const seedWeak =
    (seed?.totalAttempted ?? 0) >= 3 &&
    (seed?.totalCorrect ?? 0) / Math.max(1, seed?.totalAttempted ?? 1) < 0.5;
  const breezeMinN = seedWeak ? 5 : 3;

  let state: AdaptiveState;
  let reason: string;

  if (streakWrong >= 3 || (acc < 0.4 && n >= 3)) {
    state = "frustrated";
    reason =
      streakWrong >= 3
        ? `${streakWrong} misses in a row`
        : `only ${correct}/${n} right`;
  } else if (
    streakWrong >= 2 ||
    acc < 0.6 ||
    avgAttempts >= 2.5 ||
    hintRate >= 0.5 ||
    (slow && acc < 0.85)
  ) {
    state = "struggling";
    reason =
      streakWrong >= 2
        ? `${streakWrong} misses in a row`
        : avgAttempts >= 2.5
          ? `taking ${avgAttempts.toFixed(1)} tries each`
          : hintRate >= 0.5
            ? "leaning on hints"
            : slow
              ? "slow and shaky"
              : `${correct}/${n} right`;
  } else if (
    acc >= 0.999 &&
    n >= breezeMinN &&
    hintRate === 0 &&
    avgAttempts <= 1.2 &&
    !slow &&
    (fast || lats.length < 2)
  ) {
    state = "breezing";
    reason = fast
      ? "all correct, fast, no hints"
      : "all correct, no hints";
  } else {
    state = "flow";
    reason = `${correct}/${n} right — in the zone`;
  }

  return {
    state,
    directive: DIRECTIVE[state],
    throttle: THROTTLE[state],
    confidence: Math.min(1, n / WINDOW),
    window: n,
    reason,
  };
}

/** Convenience: is the engine recommending we ease off (brakes)? */
export function isBraking(r: AdaptiveReading): boolean {
  return r.throttle < 0;
}
/** Convenience: is the engine recommending we push (gas)? */
export function isAccelerating(r: AdaptiveReading): boolean {
  return r.throttle > 0;
}
