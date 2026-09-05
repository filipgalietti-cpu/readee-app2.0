import { describe, expect, it } from "vitest";
import { difficultyFor, priorityDomainsFor, tailor } from "@/lib/journey-v2/tailor";
import { buildJourney, orderLessons, domainOf } from "@/lib/journey-v2/journey";
import type { CatalogUnit } from "@/lib/journey-v2/catalog";
import type { ProgressRow } from "@/lib/journey-v2/types";
import type { PlacementDecision } from "@/lib/placement/decide";

/** A decision with the fields the tailor reads; everything else is filler. */
function decision(over: Partial<PlacementDecision> & { delta?: number; textLevel?: "independent" | "instructional" | "frustration" | null } = {}): PlacementDecision {
  const delta = over.delta ?? 0;
  const base = {
    placedBand: 2,
    gradeKey: "2nd",
    readingLevelName: "Confident Reader",
    season: "fall",
    relative: { delta, label: delta === 0 ? "on grade level" : delta < 0 ? "one grade level above" : "one grade level below" },
    decoding: { level: 2, emergent: false, ceilingPassed: false, listsPassed: [1, 2], nextTarget: 3 },
    fluency: over.textLevel === undefined ? null : over.textLevel === null ? null : ({ textLevel: over.textLevel, wcpm: 60, accuracy: 0.95, percentile: { percentile: 40 } } as unknown as PlacementDecision["fluency"]),
    comprehension: null,
    foundations: null,
    strengths: [],
    needs: [],
    seeds: [],
    flags: [],
  } as unknown as PlacementDecision;
  const { delta: _d, textLevel: _t, ...rest } = over;
  return { ...base, ...rest } as PlacementDecision;
}

describe("tailor", () => {
  it("difficulty follows the placement", () => {
    expect(difficultyFor(decision())).toBe("core");
    expect(difficultyFor(decision({ delta: -1 }))).toBe("harder");
    expect(difficultyFor(decision({ decoding: { level: 4, emergent: false, ceilingPassed: true, listsPassed: [], nextTarget: null } }))).toBe("harder");
    expect(difficultyFor(decision({ textLevel: "frustration" }))).toBe("easier");
    expect(difficultyFor(decision({ delta: 2 }))).toBe("easier");
    expect(difficultyFor(decision({ needs: ["letter sounds"] }))).toBe("easier");
  });

  it("priority domains follow the loudest need", () => {
    expect(priorityDomainsFor(decision())).toEqual([]);
    expect(priorityDomainsFor(decision({ needs: ["understanding what they read"] }))).toEqual(["RL", "RI"]);
    expect(priorityDomainsFor(decision({ needs: ["reading speed and smoothness"] }))).toEqual(["RF"]);
    expect(priorityDomainsFor(decision({ needs: ["3rd-grade words", "understanding what they read"] }))).toEqual(["RF"]);
  });

  it("credits are the passed seeds and the why lines describe the cut", () => {
    const t = tailor(decision({ delta: 1, seeds: [{ standard_id: "RF.2.3", pass: true, note: "" }, { standard_id: "RL.2.1", pass: false, note: "" }], needs: ["understanding what they read"] }), { childName: "Maya", creditedLessons: 4 });
    expect(t.creditedStandards).toEqual(["RF.2.3"]);
    expect(t.difficulty).toBe("core");
    expect(t.priorityDomains).toEqual(["RL", "RI"]);
    expect(t.why[0]).toContain("Maya placed at 2nd grade");
    expect(t.why.some((w) => w.includes("set aside 4 lessons"))).toBe(true);
    expect(t.why.some((w) => w.startsWith("Story and fact lessons come first") && w.endsWith("The biggest need: understanding what they read."))).toBe(true);
  });
});

const lesson = (id: string, standard: string) => ({ id, title: id, standard, warmupId: null, warmupTitle: null, quizId: `${id}-quiz`, quizTitle: "Questions" });
const unit = (id: string, band: 0 | 1 | 2, unitNo: number, lessons: ReturnType<typeof lesson>[]): CatalogUnit => ({
  id, grade: ["Kindergarten", "1st Grade", "2nd Grade"][band], band, unitNo, name: `Unit ${unitNo}`, standards: lessons.map((l) => l.standard), lessons, examId: `${id}-exam`, examTitle: "Unit exam",
});
const CAT: CatalogUnit[] = [
  unit("g2-u1", 2, 1, [lesson("decode-a", "RF.2.3a"), lesson("story-a", "RL.2.1"), lesson("decode-b", "RF.2.3b"), lesson("fact-a", "RI.2.1"), lesson("word-a", "L.2.4a")]),
  unit("g2-u2", 2, 2, [lesson("story-b", "RL.2.2")]),
];
const credit = (id: string, unit_id: string): ProgressRow => ({ item_type: "lesson", item_id: id, unit_id, score: null, passed: true, completed_at: "2026-09-04T00:00:00Z", source: "placement" });

describe("the tailored cut on the map", () => {
  it("credited lessons leave the map and are counted", () => {
    const v = buildJourney({ childId: "c", catalog: CAT, startBand: 2, enrolledBand: 2, progress: [credit("decode-a", "g2-u1"), credit("decode-b", "g2-u1")], fullAccess: true });
    expect(v.units[0].lessons.map((l) => l.id)).toEqual(["story-a", "fact-a", "word-a"]);
    expect(v.units[0].credited).toBe(2);
    expect(v.units[0].lessonsTotal).toBe(3);
    expect(v.credited).toBe(2);
    expect(v.current?.item.id).toBe("story-a");
  });

  it("a unit credited in full is not on the map at all", () => {
    const v = buildJourney({ childId: "c", catalog: CAT, startBand: 2, enrolledBand: 2, progress: [credit("story-b", "g2-u2")], fullAccess: true });
    expect(v.units.map((u) => u.id)).toEqual(["g2-u1"]);
    expect(v.hiddenAhead).toBe(0);
  });

  it("a played lesson outranks a credit", () => {
    const played: ProgressRow = { item_type: "lesson", item_id: "decode-a", unit_id: "g2-u1", score: null, passed: true, completed_at: "2026-09-05T00:00:00Z", source: "play" };
    const v = buildJourney({ childId: "c", catalog: CAT, startBand: 2, enrolledBand: 2, progress: [credit("decode-a", "g2-u1"), played], fullAccess: true });
    expect(v.units[0].lessons.map((l) => l.id)).toContain("decode-a");
    expect(v.units[0].lessons.find((l) => l.id === "decode-a")?.done).toBe(true);
  });

  it("priority domains come first inside the unit, roadmap order within", () => {
    const v = buildJourney({ childId: "c", catalog: CAT, startBand: 2, enrolledBand: 2, progress: [], fullAccess: true, priorityDomains: ["RL", "RI"] });
    expect(v.units[0].lessons.map((l) => l.id)).toEqual(["story-a", "fact-a", "decode-a", "decode-b", "word-a"]);
    expect(orderLessons(CAT[0].lessons, ["RF"]).map((l) => l.id)).toEqual(["decode-a", "decode-b", "story-a", "fact-a", "word-a"]);
    expect(domainOf("L.3.4b")).toBe("L");
  });

  it("difficulty, why and milestones ride through to the view", () => {
    const v = buildJourney({ childId: "c", catalog: CAT, startBand: 2, enrolledBand: 2, progress: [], fullAccess: false, difficulty: "harder", why: ["Maya placed at 2nd grade."], milestones: [{ label: "Reads 2nd-grade stories smoothly", month: "November", date: "2026-11-01" }] });
    expect(v.difficulty).toBe("harder");
    expect(v.why).toHaveLength(1);
    expect(v.milestones[0].month).toBe("November");
    const plain = buildJourney({ childId: "c", catalog: CAT, startBand: 2, enrolledBand: 2, progress: [], fullAccess: false });
    expect(plain.difficulty).toBe("core");
    expect(plain.why).toEqual([]);
  });
});
