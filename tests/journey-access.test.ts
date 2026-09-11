import { describe, expect, it } from "vitest";
import {
  freeJourneyLesson,
  hasLegacyLessonAllowance,
  lessonCompleted,
  SAMPLE_ACCESS_START,
} from "@/lib/journey/lesson-access";
import { assignedJourneyCatalog } from "@/lib/journey/next-lesson";
import { fixtureSpectrumMaya, fixtureUnconfirmedReader } from "@/lib/placement/spectrum-fixtures";
import { previewLessons } from "@/lib/lessons/preview-catalog";

describe("journey lesson allowance", () => {
  for (const [name, result] of [
    ["confirmed below enrollment", fixtureSpectrumMaya()],
    ["provisional", fixtureUnconfirmedReader()],
  ] as const) {
    it(`keeps one assigned starter lesson for a new ${name} reader`, () => {
      const catalog = assignedJourneyCatalog(result.decision.readingLevelName, result.plan);
      const opts = {
        signupAt: SAMPLE_ACCESS_START,
        readingLevel: result.decision.readingLevelName,
        placement: result.plan,
      };
      expect(
        catalog.filter((lesson) => freeJourneyLesson({ ...opts, lesson })).map((l) => l.standardId),
      ).toEqual([catalog[0].standardId]);
      expect(catalog[0].grade).toBe(result.plan.firstUnit!.grade);
      expect(catalog[0].domain).toBe(result.plan.firstUnit!.domain);
      expect(
        lessonCompleted(
          catalog[0].standardId,
          [{ standard_id: catalog[0].standardId, questions_correct: 3 }],
          [],
        ),
      ).toBe(true);
      // Completing or replaying the sample never turns the next lesson free.
      expect(freeJourneyLesson({ ...opts, lesson: catalog[1] })).toBe(false);
      expect(freeJourneyLesson({ ...opts, lesson: catalog[0] })).toBe(true);
    });
  }
  it("preserves existing families' units at the rollout boundary", () => {
    expect(hasLegacyLessonAllowance("2026-09-11T23:59:59.999Z")).toBe(true);
    expect(hasLegacyLessonAllowance(SAMPLE_ACCESS_START)).toBe(false);
    expect(hasLegacyLessonAllowance(null)).toBe(true);
    const result = fixtureSpectrumMaya();
    const catalog = assignedJourneyCatalog(null, result.plan);
    const included = catalog.filter((lesson) =>
      freeJourneyLesson({
        lesson,
        signupAt: "2026-09-01",
        readingLevel: null,
        placement: result.plan,
      }),
    );
    expect(included.length).toBeGreaterThan(1);
    expect(
      included.filter(
        (l) =>
          l.grade === result.plan.firstUnit!.grade && l.domain === result.plan.firstUnit!.domain,
      ).length,
    ).toBeGreaterThan(1);
  });
  it("limits public browsing to the same five samples advertised in Explore", () => {
    expect(previewLessons).toHaveLength(5);
    expect(new Set(previewLessons.map((l) => l.grade)).size).toBe(5);
    expect(previewLessons.some((l) => l.standardId === "RI.2.2")).toBe(false);
  });
});
