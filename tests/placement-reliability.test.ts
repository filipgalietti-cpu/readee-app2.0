import { describe, expect, it } from "vitest";
import { PLACEMENT_BANK } from "@/app/data/placement-bank";
import { activeList, createLadder, recordWord, type PlacedBand } from "@/lib/placement/ladder";
import { validatePlacementEvidence } from "@/lib/placement/validate-evidence";
import { decidePlacement } from "@/lib/placement/decide";
import { buildPlan } from "@/lib/placement/plan";
import { assignedJourneyCatalog, computeJourneyProgress } from "@/lib/journey/next-lesson";
import type { PlacementSubmission } from "@/lib/placement/types";

import { completedSubmission } from "./fixtures/placement-submission";

describe("assessment evidence", () => {
  it("accepts a completed bank-driven assessment and derives its moments", () => {
    expect(validatePlacementEvidence(completedSubmission(), 2).moments.some((m) => m.kind === "comprehension")).toBe(true);
  });
  it.each([
    (s: PlacementSubmission) => { s.ladder = createLadder(2); },
    (s: PlacementSubmission) => { s.ladder.lists[0].attempts[0].word = "not in the bank"; },
    (s: PlacementSubmission) => { s.ladder.lists[0].correct = 999; },
    (s: PlacementSubmission) => { s.comprehension!.correct = 999; },
    (s: PlacementSubmission) => { s.passages = []; },
    (s: PlacementSubmission) => { s.passages[0].minuteWordsCorrect = 999; },
    (s: PlacementSubmission) => { s.passages[0].wordsTotal = 0; },
    (s: PlacementSubmission) => { s.durationSeconds = 0; },
  ])("rejects incomplete or inconsistent evidence", (change) => {
    const s = completedSubmission(); change(s);
    expect(() => validatePlacementEvidence(s, 2)).toThrow();
  });
  it("uses the child's stored enrolled grade", () => {
    expect(() => validatePlacementEvidence(completedSubmission(), 4)).toThrow();
  });
  it("does not let client moments invent comprehension mastery", () => {
    const s = completedSubmission(); s.comprehension!.correct = 0;
    s.moments = [{ kind: "comprehension", band: 4, correct: 3, total: 3 }];
    const out = validatePlacementEvidence(s, 2);
    expect(out.moments.filter((m) => m.kind === "comprehension")).toEqual([{ kind: "comprehension", band: 2, correct: 0, total: 3 }]);
  });
});

describe("the promised plan is the actual journey", () => {
  for (const enrolled of [0, 1, 2, 3, 4] as const) {
    it(`agrees on the first unit for enrolled grade ${enrolled}`, () => {
      const sub = validatePlacementEvidence(completedSubmission(enrolled), enrolled);
      const date = new Date("2026-09-07T12:00:00Z");
      const decision = decidePlacement({ ...sub, date });
      const plan = buildPlan({ decision, moments: sub.moments, today: date });
      const progress = computeJourneyProgress({ readingLevel: decision.readingLevelName, placement: plan, practice: [], lessonProgress: [] });
      expect(progress.current?.grade).toBe(plan.firstUnit?.grade);
      expect(progress.current?.domain).toBe(plan.firstUnit?.domain);
      expect(progress.gradeDone).toBe(0);
      const assigned = assignedJourneyCatalog(decision.readingLevelName, plan);
      for (const step of plan.steps.filter((s) => s.kind === "skipped")) {
        expect(assigned.some((l) => l.grade === step.unit?.grade && l.domain === step.unit?.domain)).toBe(false);
      }
      expect(plan.steps.some((s) => s.kind === "skipped" && s.unit?.domain === "Informational")).toBe(false);
      if (enrolled <= 1) {
        expect(plan.firstUnit?.grade).toBe("Kindergarten");
        expect(plan.firstUnit?.domain).toBe("Foundational Skills");
        expect(plan.steps.some((s) => s.kind === "skipped" && s.unit?.domain === "Foundational Skills")).toBe(false);
      }
    });
  }
});
