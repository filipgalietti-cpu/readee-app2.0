import { describe, expect, it } from "vitest";
import { buildJourney, nextItem, bandFromGrade, EXAM_PASS_PCT } from "@/lib/journey-v2/journey";
import { standardCovers } from "@/lib/journey-v2/catalog";
import type { CatalogUnit } from "@/lib/journey-v2/catalog";
import type { ProgressRow } from "@/lib/journey-v2/types";

const lesson = (id: string, standard: string, opts: { warmup?: boolean; quiz?: boolean } = { warmup: true, quiz: true }) => ({
  id, title: id, standard,
  warmupId: opts.warmup === false ? null : `${id}-warmup`, warmupTitle: opts.warmup === false ? null : "Warm-up",
  quizId: opts.quiz === false ? null : `${id}-quiz`, quizTitle: opts.quiz === false ? null : "Questions",
});

const unit = (id: string, band: 0 | 1 | 2 | 3 | 4, unitNo: number, lessons: ReturnType<typeof lesson>[], exam = true): CatalogUnit => ({
  id, grade: ["Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade"][band], band, unitNo, name: `Unit ${unitNo}`,
  standards: lessons.map((l) => l.standard), lessons, examId: exam ? `${id}-exam` : null, examTitle: exam ? "Unit exam" : null,
});

const CATALOG: CatalogUnit[] = [
  unit("k-u1", 0, 1, [lesson("rhyme-time", "RF.K.2a"), lesson("book-basics", "RF.K.1", { quiz: false })]),
  unit("k-u2", 0, 2, [lesson("letter-sounds", "RF.K.3a")]),
  unit("g1-u1", 1, 1, [lesson("sentence-shapes", "RF.1.1a")]),
  unit("g1-u2", 1, 2, [lesson("smooth-reader", "RF.1.4b")]),
  unit("g2-u1", 2, 1, [lesson("fable-tellers", "RL.2.2")]),
  unit("g3-u1", 3, 1, []), // roadmap unit, nothing shipped yet
  unit("g3-u2", 3, 2, []),
];

const row = (item_type: ProgressRow["item_type"], item_id: string, unit_id: string, extra: Partial<ProgressRow> = {}): ProgressRow => ({
  item_type, item_id, unit_id, score: null, passed: false, completed_at: "2026-09-04T00:00:00Z", ...extra,
});

describe("buildJourney", () => {
  it("starts at the placed band and prescribes its first unit as the free one", () => {
    const v = buildJourney({ childId: "c1", catalog: CATALOG, startBand: 1, enrolledBand: 2, progress: [], fullAccess: false });
    expect(v.prescribedUnitId).toBe("g1-u1");
    expect(v.units.map((u) => u.id)).toEqual(["g1-u1", "g1-u2"]); // current + next; g2-u1 is in the fog
    expect(v.hiddenAhead).toBe(1);
    expect(v.units[0].free).toBe(true);
    expect(v.units[1].free).toBe(false);
    expect(v.units[0].exam?.free).toBe(true); // the free unit's exam is free
    expect(v.current?.item).toMatchObject({ kind: "warmup", id: "sentence-shapes-warmup" });
  });

  it("walks warm-up → lesson → questions → exam inside a unit", () => {
    const base = { childId: "c1", catalog: CATALOG, startBand: 0 as const, enrolledBand: 0 as const, fullAccess: true };
    let v = buildJourney({ ...base, progress: [row("warmup", "rhyme-time-warmup", "k-u1")] });
    expect(v.current?.item).toMatchObject({ kind: "lesson", id: "rhyme-time" });
    v = buildJourney({ ...base, progress: [row("warmup", "rhyme-time-warmup", "k-u1"), row("lesson", "rhyme-time", "k-u1")] });
    expect(v.current?.item).toMatchObject({ kind: "quiz", id: "rhyme-time-quiz" });
    const allK1 = [
      row("warmup", "rhyme-time-warmup", "k-u1"), row("lesson", "rhyme-time", "k-u1"), row("quiz", "rhyme-time-quiz", "k-u1"),
      row("warmup", "book-basics-warmup", "k-u1"), row("lesson", "book-basics", "k-u1"),
    ];
    v = buildJourney({ ...base, progress: allK1 });
    expect(v.current?.item).toMatchObject({ kind: "exam", id: "k-u1-exam" });
    expect(v.units[0].pct).toBe(100);
    expect(v.units[0].status).toBe("current"); // lessons done, exam not passed: still the current unit
  });

  it("the exam is the gate: a failed exam keeps the unit current, a pass unveils the next", () => {
    const base = { childId: "c1", catalog: CATALOG, startBand: 0 as const, enrolledBand: 0 as const, fullAccess: true };
    let v = buildJourney({ ...base, progress: [row("exam", "k-u1-exam", "k-u1", { score: 40, passed: false })] });
    expect(v.units[0].status).toBe("current");
    expect(v.current?.unit.id).toBe("k-u1");
    v = buildJourney({ ...base, progress: [row("exam", "k-u1-exam", "k-u1", { score: 40, passed: false }), row("exam", "k-u1-exam", "k-u1", { score: 85, passed: true })] });
    expect(v.units[0].status).toBe("done");
    expect(v.units[0].exam?.score).toBe(85);
    expect(v.current?.unit.id).toBe("k-u2");
  });

  it("passing the exam early tests out of the whole unit", () => {
    const v = buildJourney({ childId: "c1", catalog: CATALOG, startBand: 0, enrolledBand: 1, progress: [row("exam", "k-u1-exam", "k-u1", { score: 90, passed: true })], fullAccess: true });
    expect(v.units[0].status).toBe("done");
    expect(v.units[0].lessonsDone).toBe(0);
    expect(v.current?.unit.id).toBe("k-u2");
  });

  it("a unit with no exam in the manifest completes when its lessons are done", () => {
    const cat = [unit("k-u1", 0, 1, [lesson("rhyme-time", "RF.K.2a", { warmup: false, quiz: false })], false), unit("k-u2", 0, 2, [lesson("letter-sounds", "RF.K.3a")])];
    const v = buildJourney({ childId: "c1", catalog: cat, startBand: 0, enrolledBand: 0, progress: [row("lesson", "rhyme-time", "k-u1")], fullAccess: true });
    expect(v.units[0].status).toBe("done");
    expect(v.current?.unit.id).toBe("k-u2");
  });

  it("leaves unbuilt roadmap units off the map and counts them", () => {
    const v = buildJourney({ childId: "c1", catalog: CATALOG, startBand: 2, enrolledBand: 3, progress: [], fullAccess: true });
    expect(v.units.map((u) => u.id)).toEqual(["g2-u1"]);
    expect(v.unbuiltAhead).toBe(2);
    expect(v.hiddenAhead).toBe(0);
  });

  it("reports completion when every unit with content is done", () => {
    const v = buildJourney({ childId: "c1", catalog: CATALOG, startBand: 2, enrolledBand: 2, progress: [row("exam", "g2-u1-exam", "g2-u1", { score: 100, passed: true })], fullAccess: true });
    expect(v.current).toBeNull();
    expect(v.units[0].status).toBe("done");
  });

  it("Readee+ keeps walking past the bar; free stops at the prescribed unit", () => {
    const paid = buildJourney({ childId: "c1", catalog: CATALOG, startBand: 0, enrolledBand: 0, progress: [], fullAccess: true });
    expect(paid.beyondBar).toBe(3);
    expect(paid.units.every((u) => u.free)).toBe(true);
    const free = buildJourney({ childId: "c1", catalog: CATALOG, startBand: 0, enrolledBand: 0, progress: [], fullAccess: false });
    expect(free.units.map((u) => u.free)).toEqual([true, false]);
  });

  it("attaches the graduation exam to the band's last unit, Readee+ only", () => {
    const v = buildJourney({ childId: "c1", catalog: CATALOG, finals: { 0: { id: "k-final", title: "Kindergarten Graduation" } }, startBand: 0, enrolledBand: 0, progress: [row("exam", "k-u1-exam", "k-u1", { passed: true, score: 80 })], fullAccess: false });
    expect(v.units[0].final).toBeNull();
    expect(v.units[1].final).toMatchObject({ id: "k-final", free: false });
  });

  it("nextItem returns the exam for a retake once lessons are done", () => {
    const v = buildJourney({ childId: "c1", catalog: CATALOG, startBand: 2, enrolledBand: 2, progress: [row("warmup", "fable-tellers-warmup", "g2-u1"), row("lesson", "fable-tellers", "g2-u1"), row("quiz", "fable-tellers-quiz", "g2-u1"), row("exam", "g2-u1-exam", "g2-u1", { score: 50, passed: false })], fullAccess: true });
    expect(nextItem(v.units[0])).toMatchObject({ kind: "exam", id: "g2-u1-exam", done: true, passed: false });
  });
});

describe("helpers", () => {
  it("standardCovers handles umbrellas without over-matching", () => {
    expect(standardCovers("RF.K.1", "RF.K.1a")).toBe(true);
    expect(standardCovers("RL.K.1", "RL.K.10")).toBe(false);
    expect(standardCovers("RL.K.1", "RL.K.1")).toBe(true);
    expect(standardCovers("RF.K.1a", "RF.K.1")).toBe(false);
  });
  it("bandFromGrade reads the children.grade strings", () => {
    expect(bandFromGrade("Kindergarten")).toBe(0);
    expect(bandFromGrade("Pre-K")).toBe(0);
    expect(bandFromGrade("1st Grade")).toBe(1);
    expect(bandFromGrade("4th Grade")).toBe(4);
    expect(bandFromGrade(null)).toBe(0);
  });
  it("pass mark is a real bar", () => {
    expect(EXAM_PASS_PCT).toBeGreaterThanOrEqual(60);
  });
});
