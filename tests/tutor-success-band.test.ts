import { describe, it, expect } from "vitest";
import {
  evaluateBand,
  nextDifficulty,
  TARGET_SUCCESS,
  ADVANCE_ABOVE,
  EASE_BELOW,
} from "@/lib/tutor/success-band";

const r = (correct: number, total: number): boolean[] =>
  Array.from({ length: total }, (_, i) => i < correct);

describe("evaluateBand — the difficulty thermostat", () => {
  it("keeps the learner in the ~80-85% band → hold (no difficulty change)", () => {
    const v = evaluateBand({ recent: r(5, 6) }); // 0.833, in the sweet spot
    expect(v.action).toBe("hold");
    expect(v.confident).toBe(true);
    expect(v.successRate).toBeCloseTo(0.833, 2);
  });

  it("consistently too easy (≥90%) → advance / harden", () => {
    expect(evaluateBand({ recent: r(5, 5) }).action).toBe("advance");
    expect(evaluateBand({ recent: r(9, 10) }).action).toBe("advance");
  });

  it("struggling (<75%) → ease / scaffold", () => {
    expect(evaluateBand({ recent: r(2, 5) }).action).toBe("ease"); // 0.4
    expect(evaluateBand({ recent: r(5, 8) }).action).toBe("ease"); // 0.625
  });

  it("holds and reports low confidence when evidence is too thin (no yo-yo)", () => {
    const v = evaluateBand({ recent: [true, true] }); // 2 < MIN_RECENT
    expect(v.action).toBe("hold");
    expect(v.confident).toBe(false);
  });

  it("falls back to lifetime totals when there's no recent window", () => {
    const v = evaluateBand({ totalCorrect: 8, totalAttempted: 10 }); // 0.8 → hold
    expect(v.confident).toBe(true);
    expect(v.action).toBe("hold");
    expect(v.successRate).toBeCloseTo(0.8, 5);
  });

  it("prefers the recent window over lifetime (recency wins)", () => {
    // Great lifetime, but the child is now struggling → ease.
    const v = evaluateBand({ recent: r(1, 4), totalCorrect: 100, totalAttempted: 100 });
    expect(v.action).toBe("ease");
    expect(v.successRate).toBeCloseTo(0.25, 5);
  });

  it("marks mastery only after sustained high success (≥6 attempts, ≥90%)", () => {
    expect(evaluateBand({ recent: r(5, 5) }).mastered).toBe(false); // advance, but too few
    expect(evaluateBand({ recent: r(6, 6) }).mastered).toBe(true);
    expect(evaluateBand({ totalCorrect: 10, totalAttempted: 10 }).mastered).toBe(true);
    expect(evaluateBand({ recent: r(5, 6) }).mastered).toBe(false); // in-band, not mastered
  });

  it("the band thresholds are the flow sweet spot (sanity)", () => {
    expect(EASE_BELOW).toBeLessThan(TARGET_SUCCESS);
    expect(TARGET_SUCCESS).toBeLessThan(ADVANCE_ABOVE);
    expect(TARGET_SUCCESS).toBeGreaterThanOrEqual(0.8);
    expect(TARGET_SUCCESS).toBeLessThanOrEqual(0.85);
  });
});

describe("nextDifficulty — mapping a verdict onto the content pool", () => {
  it("advances, holds, and eases by one step", () => {
    expect(nextDifficulty(3, "advance")).toBe(4);
    expect(nextDifficulty(3, "hold")).toBe(3);
    expect(nextDifficulty(3, "ease")).toBe(2);
  });
  it("clamps to the pool bounds", () => {
    expect(nextDifficulty(0, "ease", { min: 0 })).toBe(0);
    expect(nextDifficulty(9, "advance", { max: 9 })).toBe(9);
  });
  it("respects a custom step size", () => {
    expect(nextDifficulty(10, "ease", { step: 5 })).toBe(5);
  });
});
