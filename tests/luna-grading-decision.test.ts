import { describe, it, expect } from "vitest";
import { classifyLineRead, skipThreshold, wcpm, type WordAnnotation } from "@/lib/luna/grading-decision";

// Build a line's worth of annotations quickly. `pattern` is one char per word:
//   c = correct, s = substituted (real misread), m = missed (omission).
// Word names are letters only (no digits) — grading-decision cleans punctuation
// and digits off words, so `w0` would collapse to `w`.
function line(pattern: string): { ann: WordAnnotation[]; total: number } {
  const ann = pattern.split("").map((ch, i) => ({
    word: `w${String.fromCharCode(97 + i)}`, // wa, wb, wc, …
    status: ch === "c" ? "correct" : ch === "s" ? "substituted" : "missed",
  }));
  return { ann, total: ann.length };
}

describe("classifyLineRead — trust: never re-teach a correct read", () => {
  it("a fully clean read is not an error", () => {
    const { ann, total } = line("ccccc");
    const d = classifyLineRead(ann, total);
    expect(d.hasError).toBe(false);
    expect(d.subWords).toEqual([]);
  });

  it("a LONE missed word (recognizer omission noise) reads as clean", () => {
    const { ann, total } = line("ccmcc"); // 1 missed of 5
    expect(classifyLineRead(ann, total).hasError).toBe(false);
  });

  it("two missed on a long line stays tolerated (below the 40% skip bar)", () => {
    const { ann, total } = line("ccmccmcccc"); // 2 missed of 10 -> need 4
    expect(classifyLineRead(ann, total).hasError).toBe(false);
  });
});

describe("classifyLineRead — real errors still caught", () => {
  it("a single substitution is a real misread → error, sound-out (not heavy)", () => {
    const { ann, total } = line("ccscc");
    const d = classifyLineRead(ann, total);
    expect(d.hasError).toBe(true);
    expect(d.heavy).toBe(false);
    expect(d.subWords).toEqual(["wc"]); // the substituted word at index 2
  });

  it("a genuine skip/mumble (many missed, no subs) → error, MODEL the line", () => {
    const { ann, total } = line("mmmmc"); // 4 missed of 5
    const d = classifyLineRead(ann, total);
    expect(d.hasError).toBe(true);
    expect(d.heavy).toBe(true);      // subCount === 0 → model, don't drill
    expect(d.subWords).toEqual([]);  // nothing safe to sound-out
  });

  it("heavy substitutions (4+) → model the line, not one-word drills", () => {
    const { ann, total } = line("ssssc");
    const d = classifyLineRead(ann, total);
    expect(d.hasError).toBe(true);
    expect(d.heavy).toBe(true);
    expect(d.subWords).toHaveLength(4);
  });

  it("three substitutions on a 5-word line → error, sound-out those words (not heavy)", () => {
    const { ann, total } = line("csscs"); // 3 subs of 5 (< 4, and 3/5 = 0.6 not > 0.6)
    const d = classifyLineRead(ann, total);
    expect(d.hasError).toBe(true);
    expect(d.heavy).toBe(false);
    expect(d.subWords).toHaveLength(3);
  });
});

describe("skipThreshold — the omission-noise tolerance", () => {
  it("always tolerates at least one missed word", () => {
    expect(skipThreshold(1)).toBe(2);
    expect(skipThreshold(3)).toBe(2); // ceil(1.2)=2
  });
  it("scales to ~40% of the line on longer lines", () => {
    expect(skipThreshold(10)).toBe(4); // ceil(4)
    expect(skipThreshold(6)).toBe(3);  // ceil(2.4)
  });
});

describe("wcpm — connected read rate", () => {
  it("computes words-correct per minute", () => {
    expect(wcpm(30, 60)).toBe(30);
    expect(wcpm(45, 30)).toBe(90);
  });
  it("is 0 when there is no duration (avoids divide-by-zero)", () => {
    expect(wcpm(20, 0)).toBe(0);
  });
});
