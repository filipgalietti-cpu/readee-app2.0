import { describe, it, expect } from "vitest";
import { validateLunaQuestions } from "@/lib/luna/comprehension";

const good = (kind: "literal" | "inferential", q = "Where did the frog sit?") => ({
  q, choices: ["a green plant", "a big rock", "a blue bird"], answer: 0, kind,
});

describe("validateLunaQuestions — the child-safety gate", () => {
  it("accepts a clean literal + inferential pair, literal first", () => {
    const out = validateLunaQuestions([good("inferential", "How did they feel?"), good("literal")]);
    expect(out).toHaveLength(2);
    expect(out[0].kind).toBe("literal");
    expect(out[1].kind).toBe("inferential");
  });

  it("caps at 2 questions", () => {
    const out = validateLunaQuestions([good("literal"), good("inferential"), good("literal"), good("inferential")]);
    expect(out).toHaveLength(2);
  });

  it("rejects malformed shapes entirely (never a bad question to a child)", () => {
    expect(validateLunaQuestions(null)).toEqual([]);
    expect(validateLunaQuestions("nope")).toEqual([]);
    expect(validateLunaQuestions([{ q: "", choices: ["a", "b", "c"], answer: 0, kind: "literal" }])).toEqual([]);
  });

  it("rejects wrong choice counts and out-of-range answers", () => {
    expect(validateLunaQuestions([{ ...good("literal"), choices: ["a", "b"] }])).toEqual([]);
    expect(validateLunaQuestions([{ ...good("literal"), choices: ["a", "b", "c", "d"] }])).toEqual([]);
    expect(validateLunaQuestions([{ ...good("literal"), answer: 3 }])).toEqual([]);
    expect(validateLunaQuestions([{ ...good("literal"), answer: -1 }])).toEqual([]);
  });

  it("rejects duplicate choices (case-insensitive)", () => {
    expect(validateLunaQuestions([{ ...good("literal"), choices: ["Cat", "cat", "dog"] }])).toEqual([]);
  });

  it("rejects over-long questions and choices (button-sized copy only)", () => {
    expect(validateLunaQuestions([{ ...good("literal"), q: "x".repeat(91) }])).toEqual([]);
    expect(validateLunaQuestions([{ ...good("literal"), choices: ["y".repeat(29), "b", "c"] }])).toEqual([]);
  });

  it("rejects em-dashes in child-facing copy (app rule)", () => {
    expect(validateLunaQuestions([{ ...good("literal"), q: "Where — exactly — did he go?" }])).toEqual([]);
  });

  it("normalizes unknown kind to literal", () => {
    const out = validateLunaQuestions([{ ...good("literal"), kind: "weird" }]);
    expect(out).toHaveLength(1);
    expect(out[0].kind).toBe("literal");
  });
});
