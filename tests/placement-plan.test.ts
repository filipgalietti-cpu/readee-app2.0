import { describe, it, expect } from "vitest";
import { createLadder, recordWord, activeList, WORDS_PER_LIST, type LadderState, type PlacedBand } from "@/lib/placement/ladder";
import { decidePlacement } from "@/lib/placement/decide";
import {
  buildPlan, catalogUnits, monthWording, unitPhrase, domKeyOf,
  MAX_PLAN_WEEKS, REVIEWED_BY, LUNA_STEP, WORDS_TARGET_REASON,
} from "@/lib/placement/plan";
import { fixtureMaya } from "@/lib/placement/fixtures";
import { firstUnitDomainByGrade } from "@/lib/plan/free-lessons";
import sampleLessons from "@/app/data/sample-lessons.json";
import type { Moment, PlanStepKind, PlacementPlan } from "@/lib/placement/types";

/* ---------------------------------------------------------------- helpers */

function playList(s: LadderState, pass: boolean, hardWords: string[] = []): LadderState {
  if (pass) {
    for (let i = 0; i < WORDS_PER_LIST; i++) s = recordWord(s, `w${i}`, true);
    return s;
  }
  const words = hardWords.length >= 3 ? hardWords : ["x0", "x1", "x2"];
  for (let i = 0; i < 3; i++) s = recordWord(s, words[i], false);
  return s;
}

/** A ladder played by a child whose true word-reading level is `trueBand` (-1 = reads nothing). */
function ladderFor(enrolled: PlacedBand, trueBand: number, hardWords: string[] = []): LadderState {
  let s = createLadder(enrolled);
  let guard = 0;
  while (!s.done && guard++ < 20) {
    const list = activeList(s);
    if (!list) break;
    s = playList(s, list.band <= trueBand, list.band === trueBand + 1 ? hardWords : []);
  }
  return s;
}

const RANK: Record<PlanStepKind, number> = { start: 0, skipped: 1, target: 2, luna: 3, end: 4 };
const kindsOf = (plan: PlacementPlan) => plan.steps.map((s) => s.kind);

const SPRING = new Date(2027, 3, 15);

/** State B: a 3rd grader in spring reading right at 3rd. */
function onLevelThird() {
  const decision = decidePlacement({
    enrolled: 3,
    ladder: ladderFor(3, 3),
    passages: [{ band: 3, wordsCorrect: 97, wordsTotal: 100, durationSeconds: 60 }],
    comprehension: { correct: 3, total: 3, band: 3 },
    foundations: null,
    date: SPRING,
  });
  const moments: Moment[] = [
    { kind: "list-passed", band: 3, misses: 0 },
    { kind: "passage-accurate", band: 3, accuracy: 0.97 },
    { kind: "comprehension", band: 3, correct: 3, total: 3 },
  ];
  return { decision, moments, today: SPRING };
}

/** State C: a kindergartner in September who reads no words yet. */
function kindergartner() {
  const today = new Date(2026, 8, 20);
  const decision = decidePlacement({
    enrolled: 0,
    ladder: ladderFor(0, -1),
    passages: [],
    comprehension: null,
    foundations: { letterSounds: { correct: 3, total: 8 }, blending: { correct: 2, total: 6 }, nonsenseWords: { correct: 1, total: 6 } },
    date: today,
  });
  const moments: Moment[] = [
    { kind: "foundation", skill: "letterSounds", correct: 3, total: 8 },
    { kind: "foundation", skill: "blending", correct: 2, total: 6 },
    { kind: "foundation", skill: "nonsenseWords", correct: 1, total: 6 },
  ];
  return { decision, moments, today };
}

/* ------------------------------------------------------------ the units */

describe("catalogUnits mirrors the journey's unit model", () => {
  const units = catalogUnits();

  it("is one (grade, domain) group per unit in first-appearance order, covering the whole catalogue", () => {
    expect(units.length).toBe(22);
    expect(units.reduce((n, u) => n + u.lessons, 0)).toBe(201);
    expect(units.slice(0, 6).map((u) => u.grade)).toEqual(Array(6).fill("Kindergarten"));
    expect(units.filter((u) => u.grade === "2nd Grade").map((u) => u.domain)).toEqual(["Literature", "Informational", "Foundational Skills", "Language"]);
  });

  it("agrees with the free-lesson rule on each grade's first unit", () => {
    const free = firstUnitDomainByGrade(sampleLessons as { grade: string; domain: string }[]);
    for (const grade of ["Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade"]) {
      expect(units.find((u) => u.grade === grade)?.domain).toBe(free.get(grade));
    }
  });

  it("keys domains the way the journey does, K variants included", () => {
    expect(domKeyOf("RL.K.1", "Reading Literature")).toBe("RL");
    expect(domKeyOf("RI.K.1", "Reading Informational Text")).toBe("RI");
    expect(domKeyOf("RF.2.3", "Foundational Skills")).toBe("RF");
    expect(domKeyOf("L.2.4", "Language")).toBe("L");
    expect(domKeyOf("RF.1.3a", "")).toBe("RF");
    expect(unitPhrase(2, "RF")).toBe("2nd-grade words and sounds");
    expect(unitPhrase(0, "RF")).toBe("kindergarten letters and sounds");
  });
});

describe("monthWording", () => {
  const today = new Date(2026, 8, 2);
  it("says early / mid / late by the day of the month, and next fall past ten months", () => {
    expect(monthWording(new Date(2027, 2, 4), today)).toBe("early March");
    expect(monthWording(new Date(2027, 0, 15), today)).toBe("mid-January");
    expect(monthWording(new Date(2027, 3, 26), today)).toBe("late April");
    expect(monthWording(new Date(2027, 6, 30), today)).toBe("late July");
    expect(monthWording(new Date(2027, 7, 4), today)).toBe("next fall");
  });
});

/* ------------------------------------------------------------- Maya (A) */

describe("buildPlan: Maya, 4th grade in September, placed at 2nd", () => {
  const maya = fixtureMaya();
  const today = new Date(2026, 8, 2);
  const plan = buildPlan({ decision: maya.decision, moments: maya.moments, today });

  it("walks start, skipped, target, luna, end in that order", () => {
    const kinds = kindsOf(plan);
    expect(kinds[0]).toBe("start");
    expect(kinds[kinds.length - 1]).toBe("end");
    for (const k of ["start", "skipped", "target", "luna", "end"] as PlanStepKind[]) expect(kinds).toContain(k);
    for (let i = 1; i < kinds.length; i++) expect(RANK[kinds[i]]).toBeGreaterThanOrEqual(RANK[kinds[i - 1]]);
  });

  it("enters at 2nd and starts on the 2nd-grade words unit", () => {
    expect(plan.entryBand).toBe(2);
    expect(plan.steps[0]).toEqual({
      kind: "start",
      title: "2nd-grade words and sounds",
      reason: "where reading is comfortable today",
      unit: { grade: "2nd Grade", domain: "Foundational Skills", lessons: 11 },
    });
    expect(plan.firstUnit).toEqual({ grade: "2nd Grade", domain: "Foundational Skills", title: "2nd Grade Sound Workshop", lessons: 11 });
  });

  it("skips the 2nd-grade story units on three of three comprehension, never Language", () => {
    const skipped = plan.steps.filter((s) => s.kind === "skipped");
    expect(skipped.length).toBeGreaterThanOrEqual(1);
    for (const s of skipped) {
      expect(s.reason.length).toBeGreaterThan(0);
      expect(s.unit?.domain).not.toBe("Language");
      expect(s.unit?.grade).toBe("2nd Grade");
    }
    expect(skipped.map((s) => s.title)).toEqual(["2nd-grade stories", "2nd-grade nonfiction"]);
    expect(skipped[0].reason).toBe("every 2nd-grade story question was right");
  });

  it("targets 3rd-grade words where the list got hard, with Luna right after", () => {
    const targets = plan.steps.filter((s) => s.kind === "target");
    expect(targets).toEqual([{ kind: "target", title: "3rd-grade words", reason: WORDS_TARGET_REASON, unit: { grade: "3rd Grade", domain: "Foundational Skills", lessons: 9 } }]);
    const lunaIdx = plan.steps.findIndex((s) => s.kind === "luna");
    expect(plan.steps.filter((s) => s.kind === "luna")).toEqual([LUNA_STEP]);
    expect(plan.steps[lunaIdx - 1].kind).toBe("target");
  });

  it("ends at the 4th-grade bar with the spring benchmark", () => {
    expect(plan.steps[plan.steps.length - 1]).toEqual({ kind: "end", title: "The 4th-grade bar", reason: "133 words per minute by spring" });
  });

  it("counts a plausible dose", () => {
    expect(plan.lessons).toBeGreaterThan(0);
    expect(plan.weeksAt10Min).toBeGreaterThanOrEqual(4);
    expect(plan.weeksAt10Min).toBeLessThanOrEqual(20);
    expect(plan.weeksAt10Min).toBeLessThanOrEqual(MAX_PLAN_WEEKS);
    expect(plan.minutesPerDay).toBe(10);
    expect(plan.daysPerWeek).toBe(5);
    expect(plan.reviewedBy).toBe(REVIEWED_BY);
    expect(plan.reviewedBy).toBe("Jennifer Klingerman, Certified Reading Specialist");
  });

  it("dates two milestones from the published growth slopes", () => {
    expect(plan.milestones).toEqual([
      { label: "Reads like a 3rd grader", month: "late April", date: "2027-04-28", wcpm: 112 },
      { label: "Reaches the 4th-grade bar", month: "next fall", date: "2027-08-04", wcpm: 133 },
    ]);
  });

  it("is deterministic and is what the fixture carries", () => {
    const again = buildPlan({ decision: maya.decision, moments: maya.moments, today });
    expect(JSON.stringify(again)).toBe(JSON.stringify(plan));
    expect(maya.plan).toEqual(plan);
  });

  it("a bigger daily dose shortens the weeks and moves the milestones earlier", () => {
    const more = buildPlan({ decision: maya.decision, moments: maya.moments, today, minutesPerDay: 15 });
    expect(more.minutesPerDay).toBe(15);
    expect(more.weeksAt10Min).toBeLessThan(plan.weeksAt10Min);
    expect(more.milestones[0].date < plan.milestones[0].date).toBe(true);
  });
});

/* ------------------------------------------------------- on level (B) */

describe("buildPlan: a 3rd grader on grade level in spring", () => {
  const { decision, moments, today } = onLevelThird();
  const plan = buildPlan({ decision, moments, today });

  it("keeps the path inside the entry grade and skips only what the evidence covers", () => {
    expect(decision.relative.delta).toBe(0);
    expect(plan.entryBand).toBe(3);
    for (const s of plan.steps) if (s.unit) expect(s.unit.grade).toBe("3rd Grade");
    const skipped = plan.steps.filter((s) => s.kind === "skipped").map((s) => s.unit?.domain);
    expect(skipped).toEqual(["Literature", "Informational", "Foundational Skills"]);
    expect(plan.steps[0].unit?.domain).toBe("Language");
    expect(plan.firstUnit?.title).toBe("3rd Grade Word Magic");
  });

  it("still has exactly one Luna node and ends at the 3rd-grade bar", () => {
    expect(kindsOf(plan)).toEqual(["start", "skipped", "skipped", "skipped", "luna", "end"]);
    expect(plan.steps[plan.steps.length - 1]).toEqual({ kind: "end", title: "The 3rd-grade bar", reason: "112 words per minute by spring" });
    expect(plan.milestones.map((m) => m.label)).toEqual(["Reaches the 3rd-grade bar"]);
    expect(plan.lessons).toBe(13);
    expect(plan.weeksAt10Min).toBe(4);
  });
});

/* ---------------------------------------------------- kindergarten (C) */

describe("buildPlan: a kindergartner with foundations only", () => {
  const { decision, moments, today } = kindergartner();
  const plan = buildPlan({ decision, moments, today });

  it("starts at kindergarten stories, targets letters and sounds, ends at the kindergarten bar", () => {
    expect(plan.entryBand).toBe(0);
    expect(plan.steps[0].title).toBe("kindergarten stories");
    expect(plan.steps.filter((s) => s.kind === "skipped")).toEqual([]);
    expect(plan.steps.filter((s) => s.kind === "target")).toEqual([
      { kind: "target", title: "kindergarten letters and sounds", reason: "letter sounds and blending come first", unit: { grade: "Kindergarten", domain: "Foundational Skills", lessons: 14 } },
    ]);
    expect(kindsOf(plan)).toEqual(["start", "target", "luna", "end"]);
    expect(plan.steps[plan.steps.length - 1]).toEqual({ kind: "end", title: "The kindergarten bar", reason: "letter sounds, blending, and first words by spring" });
    expect(plan.lessons).toBe(38);
    expect(plan.weeksAt10Min).toBe(10);
  });

  it("uses two qualitative milestones from the foundations needs, not the norms", () => {
    expect(plan.milestones).toEqual([
      { label: "Letter sounds", month: "mid-October", date: "2026-10-11" },
      { label: "First words", month: "mid-December", date: "2026-12-13" },
    ]);
    for (const m of plan.milestones) expect(m.month).not.toBe("next fall");
  });
});
