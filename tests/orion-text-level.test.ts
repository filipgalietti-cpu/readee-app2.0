import { describe, it, expect } from "vitest";
import {
  classifyAccuracy,
  recommendTextLevel,
  INDEPENDENT_MIN,
  INSTRUCTIONAL_MIN,
  GENTLE_AFTER_FAILED_LINES,
} from "@/lib/orion/reading/text-level";

describe("classifyAccuracy — the Clay/F&P bands", () => {
  it("95%+ = independent, 90-94% = instructional, <90% = frustration", () => {
    expect(classifyAccuracy(1)).toBe("independent");
    expect(classifyAccuracy(0.95)).toBe("independent");
    expect(classifyAccuracy(0.949)).toBe("instructional");
    expect(classifyAccuracy(0.9)).toBe("instructional");
    expect(classifyAccuracy(0.899)).toBe("frustration");
    expect(classifyAccuracy(0.5)).toBe("frustration");
  });
  it("band constants are the canonical numbers", () => {
    expect(INDEPENDENT_MIN).toBe(0.95);
    expect(INSTRUCTIONAL_MIN).toBe(0.9);
  });
});

describe("recommendTextLevel — the step-down guard", () => {
  const read = (c: number, t: number) => ({ wordsCorrect: c, wordsTotal: t });

  it("steps down when pooled recent accuracy is frustration-level", () => {
    const r = recommendTextLevel([read(20, 30), read(25, 30)]); // 45/60 = 0.75
    expect(r.level).toBe("frustration");
    expect(r.stepDown).toBe(true);
  });

  it("stays put at instructional or independent level", () => {
    expect(recommendTextLevel([read(28, 30), read(27, 30)]).stepDown).toBe(false); // 0.917
    expect(recommendTextLevel([read(30, 30), read(29, 30)]).level).toBe("independent");
  });

  it("never acts on a single read (one bad day is not a level)", () => {
    const r = recommendTextLevel([read(10, 30)]);
    expect(r.level).toBeNull();
    expect(r.stepDown).toBe(false);
  });

  it("ignores tiny non-qualifying reads (word checks, fragments)", () => {
    // Two fragments + one real read → only 1 qualifying → no action.
    const r = recommendTextLevel([read(1, 3), read(2, 5), read(10, 30)]);
    expect(r.stepDown).toBe(false);
    expect(r.level).toBeNull();
  });

  it("pools at most the 3 most recent qualifying reads (recency wins)", () => {
    // Newest three are strong; an old disaster beyond the window is ignored.
    const r = recommendTextLevel([read(29, 30), read(28, 30), read(30, 30), read(5, 30)]);
    expect(r.level).toBe("independent");
    expect(r.stepDown).toBe(false);
  });

  it("clamps wordsCorrect to wordsTotal (bad rows can't inflate accuracy)", () => {
    const r = recommendTextLevel([read(40, 30), read(30, 30)]);
    expect(r.level).toBe("independent");
  });

  it("gentle-mode trigger is a small, sane number of failed lines", () => {
    expect(GENTLE_AFTER_FAILED_LINES).toBeGreaterThanOrEqual(2);
    expect(GENTLE_AFTER_FAILED_LINES).toBeLessThanOrEqual(3);
  });
});
