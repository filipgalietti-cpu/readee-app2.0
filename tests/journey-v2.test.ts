import { describe, expect, it } from "vitest";
import {
  JOURNEY_FIXTURES,
  canOpenDemoLesson,
  chapterForLesson,
  firstIncomplete,
  gradeName,
} from "@/app/demo/journey-v2/fixtures";
import { mapGeometry } from "@/app/demo/journey-v2/_components/geometry";
import catalog from "@/app/data/sample-lessons.json";
import { isImmersivePath } from "@/app/_components/Chrome";
import fs from "node:fs";
import path from "node:path";

describe("Journey V2 development boundary", () => {
  it.each(JOURNEY_FIXTURES)(
    "keeps $id compatible with Journey contracts and exact standards",
    (fixture) => {
      expect(fixture.definition.schemaVersion).toBe(1);
      expect(fixture.definition.curriculumReleaseId).toBe("unreleased-visual-fixture");
      expect(fixture.definition.sourcePlacementId).toMatch(/^synthetic-/);
      const nodes = fixture.definition.lessons;
      expect(new Set(nodes.map((l) => l.nodeId)).size).toBe(nodes.length);
      expect(fixture.chapters.flatMap((c) => c.lessonIds)).toEqual(nodes.map((l) => l.lessonId));
      for (const l of nodes) {
        expect(l.contentVersion).toBe("development-presentation-only");
        expect(l.parentExplanation).toBeTruthy();
        expect(l.ruleVersion).toContain("unapproved");
        expect(l.standardIds.every((id) => catalog.some((row) => row.standardId === id))).toBe(
          true,
        );
        expect(
          fixture.chapters.some((c) => c.unitId === l.unitId && c.lessonIds.includes(l.lessonId)),
        ).toBe(true);
      }
      for (const id of fixture.completed) expect(nodes.some((l) => l.nodeId === id)).toBe(true);
      for (const checkpoint of fixture.completedCheckpoints)
        expect(fixture.chapters.some((c) => c.checkpointId === checkpoint)).toBe(true);
    },
  );
  it("has different starting areas, focus routes, and lengths", () => {
    expect(JOURNEY_FIXTURES.find((f) => f.id === "farther")!.chapters.map((c) => c.theme)).toEqual([
      "valley",
      "woods",
    ]);
    const profiles = JOURNEY_FIXTURES.slice(0, 4);
    expect(new Set(profiles.map((p) => p.definition.lessons[0].lessonId)).size).toBe(4);
    expect(new Set(profiles.map((p) => p.definition.lessons.length)).size).toBeGreaterThan(2);
    const higher = profiles[3];
    expect(higher.entry).toBeGreaterThan(higher.enrollment);
    expect(gradeName(0)).toBe("Kindergarten");
  });
  it("preserves provisional explanations and explicit completion records without mastery", () => {
    const provisional = JOURNEY_FIXTURES.find((f) => f.id === "provisional")!;
    expect(provisional.definition.lessons[0].reason.category).toBe("provisional-follow-up");
    const progress = JOURNEY_FIXTURES.find((f) => f.id === "progress")!;
    expect(progress.completed).toHaveLength(4);
    expect(progress.completedCheckpoints).toHaveLength(1);
    expect(firstIncomplete(progress, new Set(progress.completed))?.lessonId).toBe("smooth-reader");
    expect(progress.definition).not.toHaveProperty("mastery");
    expect(chapterForLesson(progress, undefined)).toBe(progress.chapters.length - 1);
  });
  it("changes fixture access without changing instructional recommendations or credit", () => {
    const paid = JOURNEY_FIXTURES.find((f) => f.id === "subscriber")!;
    const free = JOURNEY_FIXTURES.find((f) => f.id === "free")!;
    expect(paid.definition.lessons.map((l) => l.lessonId)).toEqual(
      free.definition.lessons.map((l) => l.lessonId),
    );
    const second = free.definition.lessons[1];
    expect(canOpenDemoLesson(free, second, false, new Set())).toBe(false);
    expect(canOpenDemoLesson(free, second, true, new Set())).toBe(true);
    expect(canOpenDemoLesson(free, second, false, new Set([second.nodeId]))).toBe(true);
  });
  it.each([1, 2, 3, 4])(
    "gives %i lessons distinct mobile geometry and shared path endpoints",
    (count) => {
      const wide = mapGeometry(count, false),
        mobile = mapGeometry(count, true);
      expect(wide.points).toHaveLength(count + 3);
      expect(mobile.points).not.toEqual(wide.points);
      // The larger checkpoint clears the expanded final card at phone widths.
      expect(mobile.points[count + 1].y - mobile.points[count].y).toBeGreaterThan(450);
      for (const g of [wide, mobile]) {
        expect(g.segments).toHaveLength(g.points.length - 1);
        g.points.forEach((p) => {
          expect(p.x).toBeGreaterThan(0);
          expect(p.x).toBeLessThan(g.width);
          expect(p.y).toBeLessThan(g.height);
        });
        g.segments.forEach((d, i) => {
          expect(d.startsWith(`M ${g.points[i].x} ${g.points[i].y}`)).toBe(true);
          expect(d.endsWith(`${g.points[i + 1].x} ${g.points[i + 1].y}`)).toBe(true);
        });
      }
    },
  );
  it("has continuous tangent direction through every join, including the checkpoint", () => {
    for (const mobile of [false, true]) {
      const g = mapGeometry(3, mobile);
      const curves = g.segments.map((s) => s.match(/-?\d+(?:\.\d+)?/g)!.map(Number));
      for (let i = 0; i < curves.length - 1; i++) {
        const a = curves[i],
          b = curves[i + 1];
        expect(a[6] - a[4]).toBeCloseTo(b[2] - b[0], 8);
        expect(a[7] - a[5]).toBeCloseTo(b[3] - b[1], 8);
      }
    }
  });
  it("places the provisional confirmation earlier without inventing completion credit", () => {
    const provisional = JOURNEY_FIXTURES.find((f) => f.id === "provisional")!;
    expect(provisional.chapters[0].lessonIds).toHaveLength(1);
    expect(provisional.completed).toEqual([]);
    expect(mapGeometry(1, false).points[2].x).toBeLessThan(mapGeometry(3, false).points[4].x);
    const later = JOURNEY_FIXTURES.find((f) => f.id === "garden-later")!;
    expect(firstIncomplete(later, new Set(later.completed))?.lessonId).toBe("blend-builders");
    expect(JOURNEY_FIXTURES.find((f) => f.id === "woods")!.chapters[0].name).toBe("Word Woods");
  });
  it("keeps the approved demo and connected Journey immersive", () => {
    expect(isImmersivePath("/demo/journey-v2")).toBe(true);
    expect(isImmersivePath("/journey")).toBe(true);
    expect(isImmersivePath("/demo/journey")).toBe(false);
    const root = "app/demo/journey-v2";
    const files = (dir: string): string[] =>
      fs
        .readdirSync(dir, { withFileTypes: true })
        .flatMap((entry) =>
          entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
        );
    const code = files(root)
      .filter((f) => /\.tsx?$/.test(f))
      .map((f) => fs.readFileSync(f, "utf8"))
      .join("\n");
    expect(code).not.toMatch(/\b(fetch|generateText|generateObject|streamText)\s*\(/);
    expect(code).not.toMatch(/supabase|api\/checkout|awardCarrots|localStorage|sessionStorage/);
    expect(fs.readFileSync("app/demo/layout.tsx", "utf8")).toContain(
      'process.env.ENABLE_DEMOS !== "1"',
    );
  });
});
