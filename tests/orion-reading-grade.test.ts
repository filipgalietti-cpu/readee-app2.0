import { describe, it, expect } from "vitest";
import { diagnoseLine, skipThreshold, type WordAnnotation } from "@/lib/orion/reading/grade";

// One char per word: c = correct, s = substituted (real misread), m = missed.
function line(pattern: string): { ann: WordAnnotation[]; total: number } {
  const ann = pattern.split("").map((ch, i) => ({
    word: `w${String.fromCharCode(97 + i)}`,
    status: ch === "c" ? "correct" : ch === "s" ? "substituted" : "missed",
  }));
  return { ann, total: ann.length };
}

describe("diagnoseLine — the reading GRADE stage", () => {
  it("a clean read is correct/clean with no errors", () => {
    const d = diagnoseLine(line("ccccc").ann, 5);
    expect(d).toEqual({ correct: true, severity: "clean", confident: [], uncertain: [] });
  });

  it("a lone recognizer omission still reads as clean (trust)", () => {
    const d = diagnoseLine(line("ccmcc").ann, 5);
    expect(d.correct).toBe(true);
    expect(d.severity).toBe("clean");
    expect(d.uncertain).toEqual(["wc"]); // surfaced but not an error
  });

  it("a single substitution → minor, taught specifically", () => {
    const d = diagnoseLine(line("ccscc").ann, 5);
    expect(d.correct).toBe(false);
    expect(d.severity).toBe("minor");
    expect(d.confident).toEqual(["wc"]);
  });

  it("a genuine skip (many missed, no subs) → major, nothing to drill", () => {
    const d = diagnoseLine(line("mmmmc").ann, 5);
    expect(d.correct).toBe(false);
    expect(d.severity).toBe("major");
    expect(d.confident).toEqual([]);
    expect(d.uncertain).toHaveLength(4);
  });

  it("heavy substitutions (4+) → major", () => {
    const d = diagnoseLine(line("ssssc").ann, 5);
    expect(d.severity).toBe("major");
    expect(d.confident).toHaveLength(4);
  });

  it("strips punctuation/digits off confident words", () => {
    const ann: WordAnnotation[] = [{ word: '"pig!"', status: "substituted" }, { word: "the2", status: "correct" }];
    expect(diagnoseLine(ann, 2).confident).toEqual(["pig"]);
  });
});

describe("skipThreshold — omission-noise tolerance", () => {
  it("always tolerates at least one missed word, scales ~40% on longer lines", () => {
    expect(skipThreshold(1)).toBe(2);
    expect(skipThreshold(6)).toBe(3);
    expect(skipThreshold(10)).toBe(4);
  });
});
