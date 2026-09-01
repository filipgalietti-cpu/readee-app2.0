import { describe, it, expect } from "vitest";
import { pickProcessPraise, notYet, personalGrowth, type PraiseBank } from "@/lib/tutor/motivation";
import { READING_PRAISE, READING_WIN, readingGrowthLine } from "@/lib/tutor/reading/praise";

const BANK: PraiseBank = {
  win_detail: ["You worked out {detail}!", "Yes, {detail}!"],
  win_plain: ["You read the whole line!", "Smooth reading!"],
  mixed: ["Nice work.", "You blended {detail}."],
};

describe("pickProcessPraise — specific, varied, process-focused", () => {
  it("fills {detail} when a detail is provided", () => {
    const line = pickProcessPraise({ kind: "win_detail", detail: "flat" }, BANK, { rand: () => 0 });
    expect(line).toBe("You worked out flat!");
  });

  it("prefers detail templates when a detail exists (more information)", () => {
    // 'mixed' has one plain + one {detail}; with a detail we should get the filled one.
    const line = pickProcessPraise({ kind: "mixed", detail: "sh" }, BANK, { rand: () => 0 });
    expect(line).toBe("You blended sh.");
  });

  it("drops placeholder templates cleanly when there's no detail", () => {
    const line = pickProcessPraise({ kind: "mixed" }, BANK, { rand: () => 0 });
    expect(line).toBe("Nice work."); // the plain one, not "You blended {detail}."
    expect(line).not.toContain("{detail}");
  });

  it("avoids repeating the just-used line (variety)", () => {
    const line = pickProcessPraise({ kind: "win_plain" }, BANK, { avoid: "You read the whole line!", rand: () => 0 });
    expect(line).toBe("Smooth reading!");
  });

  it("returns null for an unknown win kind", () => {
    expect(pickProcessPraise({ kind: "nope" }, BANK)).toBeNull();
  });

  it("NEVER praises the person — the reading bank has no 'smart'/'good job'", () => {
    const allLines = Object.values(READING_PRAISE).flat().join(" ").toLowerCase();
    expect(allLines).not.toMatch(/\bsmart\b/);
    expect(allLines).not.toMatch(/good job/);
    expect(allLines).not.toContain("—"); // copy rule: no em-dashes in spoken copy
  });
});

describe("notYet — power of yet, not 'wrong'", () => {
  it("frames the error as not-yet, with and without a detail", () => {
    expect(notYet("flat")).toBe("Not yet — let's work out flat together.");
    expect(notYet()).toContain("Not yet");
  });
});

describe("personalGrowth — self-referential, growth-only", () => {
  it("reports improvement vs the learner's own previous result", () => {
    expect(personalGrowth(58, 42)).toEqual({ improved: true, delta: 16 });
  });
  it("never announces a slowdown or a tie", () => {
    expect(personalGrowth(40, 42).improved).toBe(false);
    expect(personalGrowth(42, 42).improved).toBe(false);
  });
  it("is silent when there's no prior result", () => {
    expect(personalGrowth(50, null)).toEqual({ improved: false, delta: 0 });
    expect(personalGrowth(50, undefined)).toEqual({ improved: false, delta: 0 });
  });
});

describe("readingGrowthLine — the 'faster than YOUR last time' beat", () => {
  it("celebrates a real gain with correct pluralization", () => {
    expect(readingGrowthLine(58, 42)).toBe("You read 16 more words a minute than last time!");
    expect(readingGrowthLine(43, 42)).toBe("You read 1 more word a minute than last time!");
  });
  it("stays silent on no prior or no gain", () => {
    expect(readingGrowthLine(50, null)).toBeNull();
    expect(readingGrowthLine(40, 42)).toBeNull();
  });
  it("the reading praise bank covers every declared win kind", () => {
    for (const kind of Object.values(READING_WIN)) {
      expect(READING_PRAISE[kind]?.length).toBeGreaterThan(0);
    }
  });
});
