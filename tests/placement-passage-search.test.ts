import { describe, expect, it } from "vitest";
import { PLACEMENT_BANK } from "@/app/data/placement-bank";
import { PlacementSubmissionSchema } from "@/lib/schemas/placement";
import { validatePlacementEvidence } from "@/lib/placement/validate-evidence";
import { decidePlacement } from "@/lib/placement/decide";
import { buildPlan } from "@/lib/placement/plan";
import { computeJourneyProgress } from "@/lib/journey/next-lesson";
import { activeList, createLadder, recordWord, type Band } from "@/lib/placement/ladder";
import { completedSubmission } from "./fixtures/placement-submission";
import type { PlacementSubmission } from "@/lib/placement/types";

function followups(start: Band, comfortable: Band, weakness: "accuracy" | "comprehension" | "both" = "both") {
  const sub = completedSubmission(4);
  sub.evidenceVersion = 3;
  let ladder = createLadder(4);
  while (!ladder.done) {
    const list = activeList(ladder)!;
    ladder = recordWord(ladder, PLACEMENT_BANK.bands[list.band].words[list.attempts.length].word, list.band <= start);
  }
  sub.ladder = ladder;
  sub.passages = []; sub.comprehensionChecks = [];
  for (let band = start; band >= Math.max(1, comfortable); band--) {
    const wordsCorrect = band === comfortable || weakness === "comprehension" ? 95 : 20;
    sub.passages.push({ band: band as Band, wordsCorrect, wordsTotal: 100, durationSeconds: 60, minuteWordsCorrect: wordsCorrect, minuteSeconds: 60 });
    sub.comprehensionChecks.push({ band: band as Band, correct: band === comfortable || weakness === "accuracy" ? 2 : 0, total: 3 });
  }
  sub.comprehension = sub.comprehensionChecks.at(-1)!;
  if (comfortable === 0) {
    sub.comprehension = { band: 0, correct: 1, total: 2 };
    const f = PLACEMENT_BANK.foundations;
    sub.foundations = { letterSounds: { correct: 2, total: f.letterSounds.length }, blending: { correct: 2, total: f.blending.length }, nonsenseWords: { correct: 2, total: f.nonsenseWords.length } };
  }
  return sub;
}
const roundTrip = (s: PlacementSubmission) => validatePlacementEvidence(PlacementSubmissionSchema.parse(JSON.parse(JSON.stringify(s))) as PlacementSubmission, 4);

describe("connected-text follow-ups", () => {
  it.each(["accuracy", "comprehension", "both"] as const)("finds grade 2 despite grade-4 word lists when %s is difficult", (weakness) => {
    const sub = roundTrip(followups(4, 2, weakness));
    const decision = decidePlacement(sub);
    const plan = buildPlan({ decision, moments: sub.moments, today: new Date("2026-09-08T12:00:00Z") });
    const journey = computeJourneyProgress({ placement: plan, readingLevel: decision.readingLevelName, practice: [], lessonProgress: [] });
    expect(decision.placedBand).toBe(2);
    expect(decision.relative.label).toBe("two grade levels below");
    expect(decision.fluency?.band).toBe(2);
    expect(plan.entryBand).toBe(2);
    expect(journey.current?.grade).toBe("2nd Grade");
    expect(journey.current?.domain).toBe(plan.firstUnit?.domain);
  });
  it("can descend from the fifth-grade ceiling all the way to foundations", () => {
    const sub = roundTrip(followups(5, 0));
    expect(sub.passages).toHaveLength(5);
    const decision = decidePlacement(sub);
    expect(decision.placedBand).toBe(0);
    expect(decision.fluency).toBeNull();
    expect(decision.needs).toContain("letter sounds");
  });
  it("caps a comfortable fifth-grade passage at the available fourth-grade curriculum", () => {
    expect(decidePlacement(roundTrip(followups(5, 5))).placedBand).toBe(4);
  });
  it.each([
    (s: PlacementSubmission) => { s.passages.splice(1, 1); s.comprehensionChecks!.splice(1, 1); },
    (s: PlacementSubmission) => { s.passages.pop(); s.comprehensionChecks!.pop(); },
    (s: PlacementSubmission) => { s.comprehensionChecks![0].correct = 5; },
    (s: PlacementSubmission) => { s.comprehension = { band: 2, correct: 3, total: 3 }; },
    (s: PlacementSubmission) => { s.passages[0].wordsCorrect = 100; s.comprehensionChecks![0].correct = 3; },
    (s: PlacementSubmission) => { delete s.comprehensionChecks; },
  ])("rejects missing, skipped, invented, or unnecessary follow-ups", (change) => {
    const sub = followups(4, 2); change(sub);
    expect(() => roundTrip(sub)).toThrow();
  });
  it("requires foundations and listening after grade 1 remains difficult", () => {
    const sub = followups(4, 0); sub.foundations = null;
    expect(() => roundTrip(sub)).toThrow();
  });
});
