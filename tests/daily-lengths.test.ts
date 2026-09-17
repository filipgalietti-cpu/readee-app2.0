import { describe, it, expect } from "vitest";
import {
  EASY_ABSOLUTE_MIN_WORDS,
  easyLengthOk,
  easyRenditionLengths,
  wordCount,
} from "@/lib/daily/lengths";

describe("daily rendition lengths", () => {
  it("counts words the way the builder does", () => {
    expect(wordCount("  Kim lives in a sunny land.  ")).toBe(6);
    expect(wordCount("")).toBe(0);
  });

  it("sizes the easy rendition at about half the full read", () => {
    expect(easyRenditionLengths(100)).toEqual({ target: 50, ceiling: 65 });
    expect(easyRenditionLengths(114)).toEqual({ target: 57, ceiling: 70 });
    expect(easyRenditionLengths(150)).toEqual({ target: 60, ceiling: 70 });
  });

  it("rejects the 2026-09-17 pair, 58 easy words beside a 67-word full read", () => {
    expect(easyLengthOk(58, 67)).toBe(false);
    expect(easyRenditionLengths(67).ceiling).toBe(45);
  });

  it("accepts the typical pair, 58 easy words beside a 114-word full read", () => {
    expect(easyLengthOk(58, 114)).toBe(true);
  });

  it("keeps every allowed easy rendition clearly shorter than a full read that reached its floor", () => {
    for (let base = 100; base <= 150; base++) {
      const { target, ceiling } = easyRenditionLengths(base);
      expect(target).toBeLessThanOrEqual(ceiling);
      expect(ceiling / base).toBeLessThanOrEqual(0.66);
      expect(target).toBeGreaterThanOrEqual(EASY_ABSOLUTE_MIN_WORDS);
    }
  });

  it("rejects an easy rendition too short to carry the story", () => {
    expect(easyLengthOk(EASY_ABSOLUTE_MIN_WORDS - 1, 120)).toBe(false);
  });
});
