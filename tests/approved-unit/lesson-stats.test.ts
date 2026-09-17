import { expect, it } from "vitest";
import { savedLessonStats, lessonStatsLine } from "@/lib/approved-unit/lesson-stats";
import { parentQuestionReport } from "@/lib/approved-unit/parent-report";
import { packages } from "@/lib/approved-unit/packages";
it("reports actual independent grades and keeps unavailable/help separate", () => {
  const stats = savedLessonStats(
    ["correct", "incorrect", "assisted", "unavailable", "practice"].map((outcome) => ({ outcome })),
    24,
  )!;
  expect(stats).toMatchObject({
    total: 5,
    checked: 2,
    correct: 1,
    helped: 1,
    pending: 1,
    supported: 1,
    percent: null,
    carrots: 24,
  });
  expect(lessonStatsLine(stats)).toContain("1 of 2 independently checked");
});
it("does not invent a score for missing or malformed old results", () => {
  expect(savedLessonStats(null)).toBeNull();
  expect(savedLessonStats([])).toBeNull();
  expect(savedLessonStats([{ outcome: "pass" }])).toBeNull();
  expect(savedLessonStats([{ outcome: "correct" }, { outcome: "practice" }])?.percent).toBe(100);
});
it("builds a parent question report only from known question IDs and result outcomes", () => {
  const q = packages["key-details"].pool.find((q) => q.scene.evidence === "assessed")!;
  const result = { itemId: q.id, standard: q.standard, band: q.band, outcome: "incorrect" };
  expect(parentQuestionReport("key-details", [result])).toMatchObject({ correct: 0, percent: 0 });
  expect(parentQuestionReport("key-details", [{ ...result, itemId: "not-authored" }])).toBeNull();
  expect(parentQuestionReport("key-details", [{ ...result, outcome: "made-up" }])).toBeNull();
});
