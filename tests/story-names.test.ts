import { describe, it, expect } from "vitest";
import {
  STORY_NAMES, OVERUSED_NAMES, pickStoryNames, storyNameDirective,
} from "@/lib/content/story-names";

/**
 * Measured on 2026-09-07: 31 of 53 story dailies used one of five names, Leo on
 * 10 days, Ben on 8, Mia on 9; the lesson catalog had Sam 83 times. The prompt
 * rule asking for a wide pool had already shipped and had not moved any of it.
 * These pin the properties that make handing over a chosen name actually work.
 */
describe("story names", () => {
  it("never hands out a name the generators overuse", () => {
    const overused = new Set(OVERUSED_NAMES.map((n) => n.toLowerCase()));
    for (const n of STORY_NAMES) expect(overused.has(n.toLowerCase())).toBe(false);
  });

  it("has no duplicates", () => {
    const seen = new Set(STORY_NAMES.map((n) => n.toLowerCase()));
    expect(seen.size).toBe(STORY_NAMES.length);
  });

  it("is deterministic for a given day", () => {
    expect(pickStoryNames("2026-09-07")).toEqual(pickStoryNames("2026-09-07"));
  });

  it("returns distinct names within one story", () => {
    for (const d of ["2026-09-07", "2026-10-01", "2026-12-25"]) {
      const [a, b] = pickStoryNames(d, 2);
      expect(a).not.toBe(b);
    }
  });

  it("spreads across the roster instead of clustering", () => {
    // The real failure was concentration, so measure that directly: a year of
    // draws must touch a large share of the pool, with no name dominating.
    const counts = new Map<string, number>();
    const start = new Date("2026-09-07");
    for (let i = 0; i < 365; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      for (const n of pickStoryNames(d.toISOString().slice(0, 10), 2)) {
        counts.set(n, (counts.get(n) ?? 0) + 1);
      }
    }
    expect(counts.size).toBeGreaterThan(STORY_NAMES.length * 0.6);
    // Leo managed 10 days out of 134. Nothing should get near that rate.
    const worst = Math.max(...counts.values());
    expect(worst / 365).toBeLessThan(0.05);
  });

  it("honours the recency filter", () => {
    const first = pickStoryNames("2026-09-07", 2);
    const next = pickStoryNames("2026-09-07", 2, first);
    for (const n of next) expect(first).not.toContain(n);
  });

  it("names the cast and bans the defaults in the directive", () => {
    const d = storyNameDirective(["Amara", "Tunde"]);
    expect(d).toContain("Amara and Tunde");
    expect(d).toContain("Leo");   // listed as forbidden
    expect(d).toMatch(/real people/i);
  });
});
