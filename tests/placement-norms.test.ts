import { describe, it, expect } from "vitest";
import {
  typicalWcpm, normWcpm, weeklyGrowth, seasonFor, estimatePercentile, gradeEquivalent,
  dibelsCoreMin, meetsDibelsCore, projectPlan,
} from "@/lib/placement/norms";

describe("Hasbrouck & Tindal 2017 table", () => {
  it("spot-checks the 50th percentile spring numbers the parent report cites", () => {
    expect(typicalWcpm(1, "spring")).toBe(60);
    expect(typicalWcpm(2, "spring")).toBe(100);
    expect(typicalWcpm(3, "spring")).toBe(112);
    expect(typicalWcpm(4, "spring")).toBe(133);
  });
  it("has no grade 1 fall norms (null, never 0)", () => {
    expect(typicalWcpm(1, "fall")).toBeNull();
    expect(normWcpm(1, "fall", 90)).toBeNull();
  });
  it("keeps the other anchors and the growth column", () => {
    expect(normWcpm(4, "spring", 90)).toBe(184);
    expect(normWcpm(2, "fall", 10)).toBe(23);
    expect(normWcpm(3, "winter", 50)).toBe(97);
    expect(weeklyGrowth(2, 50)).toBe(1.6);
  });
});

describe("seasonFor", () => {
  it("maps months to H&T seasons", () => {
    expect(seasonFor(new Date(2026, 8, 2))).toBe("fall");
    expect(seasonFor(new Date(2026, 7, 15))).toBe("fall");
    expect(seasonFor(new Date(2026, 10, 30))).toBe("fall");
    expect(seasonFor(new Date(2026, 11, 1))).toBe("winter");
    expect(seasonFor(new Date(2027, 1, 28))).toBe("winter");
    expect(seasonFor(new Date(2027, 2, 1))).toBe("spring");
    expect(seasonFor(new Date(2027, 6, 4))).toBe("spring");
  });
});

describe("estimatePercentile", () => {
  it("hits the published anchors exactly", () => {
    expect(estimatePercentile(4, "spring", 133)?.percentile).toBe(50);
    expect(estimatePercentile(2, "spring", 124)?.percentile).toBe(75);
    expect(estimatePercentile(2, "spring", 100)?.band).toBe("50-74");
  });
  it("interpolates between anchors", () => {
    const p = estimatePercentile(2, "spring", 86);
    expect(p?.percentile).toBe(38);
    expect(p?.band).toBe("25-49");
    expect(estimatePercentile(2, "spring", 130)?.percentile).toBe(79);
  });
  it("puts a 4th grader reading 61 wcpm in spring below the 10th percentile", () => {
    const p = estimatePercentile(4, "spring", 61);
    expect(p?.percentile).toBe(7);
    expect(p?.band).toBe("below 10");
  });
  it("clamps to 1..99", () => {
    expect(estimatePercentile(2, "spring", 0)?.percentile).toBe(1);
    expect(estimatePercentile(2, "spring", 400)?.percentile).toBe(99);
  });
  it("returns null where no norms exist", () => {
    expect(estimatePercentile(1, "fall", 40)).toBeNull();
  });
});

describe("gradeEquivalent", () => {
  it("a spring 2nd-grade median reader is a late 2nd grader", () => {
    const g = gradeEquivalent(100, "spring");
    expect(g.value).toBe(2.8);
    expect(g.label).toBe("late-2nd-grade");
  });
  it("61 wcpm in fall reads like a mid 2nd grader (the research example)", () => {
    const g = gradeEquivalent(61, "fall");
    expect(g.value).toBe(2.4);
    expect(g.phase).toBe("mid");
    expect(g.label).toBe("mid-2nd-grade");
  });
  it("61 wcpm in spring reads like a late 1st grader", () => {
    expect(gradeEquivalent(61, "spring").label).toBe("late-1st-grade");
  });
  it("floors at 1.0 and caps at 6.9", () => {
    expect(gradeEquivalent(20, "spring").value).toBe(1.3);
    expect(gradeEquivalent(0, "spring").value).toBe(1.0);
    expect(gradeEquivalent(300, "spring").value).toBe(6.9);
  });
});

describe("DIBELS 8 core-support cuts", () => {
  it("looks up published minimums", () => {
    expect(dibelsCoreMin("LNF", "K", "fall")).toBe(25);
    expect(dibelsCoreMin("ORF_ACC", "3", "spring")).toBe(96);
    expect(dibelsCoreMin("ORF_WC", "K", "fall")).toBeNull();
  });
  it("judges a score against the cut, null when no cut exists", () => {
    expect(meetsDibelsCore("PSF", "1", "winter", 43)).toBe(true);
    expect(meetsDibelsCore("PSF", "1", "winter", 42)).toBe(false);
    expect(meetsDibelsCore("ORF_WC", "K", "spring", 5)).toBeNull();
  });
});

describe("projectPlan", () => {
  const today = new Date(2027, 3, 1);
  it("projects a 4th grader taught at 2nd-grade level at 10 minutes a day on the realistic slope", () => {
    const p = projectPlan({ currentWcpm: 61, enrolledGrade: 4, instructionGrade: 2, today, minutesPerDay: 10 });
    expect(p.targetWcpm).toBe(133);
    expect(p.gapWcpm).toBe(72);
    expect(p.slopePerWeek).toBe(1.5);
    expect(p.weeks).toBe(48);
    expect(p.onTrackDate.getTime()).toBe(today.getTime() + 48 * 7 * 86400000);
    expect(p.milestone?.grade).toBe(3);
    expect(p.milestone?.wcpm).toBe(112);
    expect(p.milestone?.weeks).toBe(34);
    expect(p.alreadyOnLevel).toBe(false);
  });
  it("15 minutes a day switches to the ambitious slope", () => {
    const p = projectPlan({ currentWcpm: 61, enrolledGrade: 4, instructionGrade: 2, today, minutesPerDay: 15 });
    expect(p.slopePerWeek).toBe(2.0);
    expect(p.weeks).toBe(36);
  });
  it("a child already at the target has no gap and no milestone", () => {
    const p = projectPlan({ currentWcpm: 140, enrolledGrade: 4, instructionGrade: 4, today, minutesPerDay: 10 });
    expect(p.weeks).toBe(0);
    expect(p.alreadyOnLevel).toBe(true);
    expect(p.milestone).toBeNull();
  });
});
