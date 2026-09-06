import { describe, it, expect } from "vitest";
import sampleLessons from "@/app/data/sample-lessons.json";
import { LESSONS } from "@/app/data/lessons-v2";
import {
  authoredLessonForStandard,
  v2LessonForStandard,
  v2CoveredStandards,
  LESSON_V2_ENABLED,
} from "@/lib/lessons/v2-lookup";

/**
 * /learn picks its engine by standard: a V2 lesson if one exists, the legacy
 * runner otherwise. Two things can go wrong there, and both are silent.
 *
 * A standard that stops resolving sends a child back to the legacy lesson with
 * no error - the page still renders, just the older experience. And a V2 lesson
 * whose `standard` does not match any catalogue entry is unreachable: the
 * factory made it, it passes its own QC, and no route will ever serve it.
 *
 * These tests are about that seam, not about lesson content.
 */

type Legacy = { standardId: string; grade: string; title: string };
const legacy = sampleLessons as Legacy[];

describe("V2 lessons are reachable from the catalogue", () => {
  it("every V2 lesson declares a standard", () => {
    const missing = Object.entries(LESSONS)
      .filter(([, e]) => !e.lesson.standard?.trim())
      .map(([slug]) => slug);
    expect(missing).toEqual([]);
  });

  it("when two lessons claim a standard, the factory one is served", () => {
    const seen = new Map<string, string[]>();
    for (const [slug, e] of Object.entries(LESSONS)) {
      const list = seen.get(e.lesson.standard) ?? [];
      list.push(slug);
      seen.set(e.lesson.standard, list);
    }
    const dupes = [...seen.entries()].filter(([, slugs]) => slugs.length > 1);
    // One known collision: the RL.K.1 exemplar (reading-detective, "the
    // zero-budget proof") against the factory lesson for the same standard.
    // Registry order put the exemplar first, which would have served a
    // Kindergartener the engine demo instead of the reviewed curriculum lesson.
    expect(dupes.map(([std]) => std)).toEqual(["RL.K.1"]);
    expect(authoredLessonForStandard("RL.K.1")?.id).toBe("key-details");
  });

  it("an exemplar still serves a standard nothing else covers", () => {
    // silent-e is an engine exemplar but the only RF.K.3b lesson there is;
    // demoting exemplars wholesale would leave that standard on legacy.
    expect(authoredLessonForStandard("RF.K.3b")?.id).toBe("silent-e");
  });

  it("V2 lesson standards exist in the catalogue, so a route can reach them", () => {
    const catalogue = new Set(legacy.map((l) => l.standardId));
    const orphans = Object.entries(LESSONS)
      .filter(([, e]) => !catalogue.has(e.lesson.standard))
      .map(([slug, e]) => `${slug} (${e.lesson.standard})`);
    // RF.K.1 is a known extra: authored ahead of its catalogue entry.
    expect(orphans).toEqual(["book-basics (RF.K.1)"]);
  });
});

describe("the /learn engine choice", () => {
  it("resolves a standard that has an authored lesson", () => {
    const covered = v2CoveredStandards();
    expect(covered.length).toBeGreaterThan(0);
    const lesson = authoredLessonForStandard(covered[0]);
    expect(lesson?.standard).toBe(covered[0]);
  });

  it("returns undefined for a standard with no V2 lesson, so legacy still runs", () => {
    expect(authoredLessonForStandard("RL.99.9")).toBeUndefined();
  });

  it("covers most of the catalogue, and every grade has some coverage", () => {
    const byGrade: Record<string, { total: number; v2: number }> = {};
    for (const l of legacy) {
      byGrade[l.grade] ??= { total: 0, v2: 0 };
      byGrade[l.grade].total++;
      if (authoredLessonForStandard(l.standardId)) byGrade[l.grade].v2++;
    }
    // Every grade must have at least one V2 lesson - a grade dropping to zero
    // means a whole band silently regressed to the legacy engine.
    for (const [grade, s] of Object.entries(byGrade)) {
      expect(s.v2, `${grade} has no V2 coverage`).toBeGreaterThan(0);
    }
    const covered = legacy.filter((l) => authoredLessonForStandard(l.standardId)).length;
    // Ratchet: coverage only goes up as the factory finishes grade 4. If this
    // fails downward, lessons stopped resolving rather than the bar being wrong.
    expect(covered).toBeGreaterThanOrEqual(181);
  });

  it("returns plain data that can cross the server/client boundary", () => {
    // /learn resolves on the server and passes ONE lesson as a prop. A function
    // or Date anywhere in the tree would throw at the boundary at runtime.
    const lesson = authoredLessonForStandard(v2CoveredStandards()[0])!;
    const walk = (v: unknown, path: string): string[] => {
      if (typeof v === "function") return [path];
      if (v instanceof Date) return [`${path} (Date)`];
      if (v && typeof v === "object")
        return Object.entries(v).flatMap(([k, x]) => walk(x, `${path}.${k}`));
      return [];
    };
    expect(walk(lesson, lesson.id)).toEqual([]);
  });
});

describe("the kill switch", () => {
  it("defaults OFF until V2's assets are actually deployed", () => {
    // /audio/lessons-v2 and /images/lessons-v2 are gitignored and 404 in prod,
    // so serving V2 there means narration-free, picture-free lessons. Flip this
    // to true only once those URLs resolve.
    expect(LESSON_V2_ENABLED).toBe(false);
  });

  it("resolves nothing while disabled, so /learn falls back to legacy", () => {
    expect(v2LessonForStandard("RL.K.1")).toBeUndefined();
  });
});
