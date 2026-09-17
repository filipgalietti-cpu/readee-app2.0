import { expect, it } from "vitest";
import { unitGateway, blockedByUnitExam, UNIT_EXAM_ID } from "@/lib/approved-unit/gateway";
import { UNIT_ONE } from "@/lib/approved-unit/catalogue";
import { buildAdventureView } from "@/lib/journey/adventure-view";
import { journeyReturnTransition } from "@/lib/journey/return-transition";
import type { JourneySnapshot } from "@/lib/journey/types";
const snapshot = {
  child: { reading_level: "Kindergarten", first_name: "Synthetic" },
  approvedUnitEnabled: true,
  result: null,
  practice: [],
  lessonProgress: [],
  billing: { fullAccess: true, signupAt: "2026-09-01" },
} as unknown as JourneySnapshot;
it("uses the eight released lessons across domains, then the exam", () => {
  expect(unitGateway(snapshot)).toMatchObject({
    applies: true,
    locked: true,
    examAvailable: false,
  });
  const view = buildAdventureView(snapshot);
  expect(view.lessons.slice(0, 9).map((l) => l.lessonId)).toEqual([
    ...UNIT_ONE.map((l) => l.standard),
    UNIT_EXAM_ID,
  ]);
  expect(view.chapters[0].unitLessonIds).toHaveLength(9);
  expect(view.lessons[9].available).toBe(false);
  expect(blockedByUnitExam(snapshot, view.lessons[9].lessonId)).toBe(true);
  expect(blockedByUnitExam(snapshot, UNIT_ONE[0].standard)).toBe(false);
});
it.each([undefined, "practice", "more-evidence"] as const)(
  "completion alone does not pass the exam (%s)",
  (status) => {
    const s = {
      ...snapshot,
      completedStandards: UNIT_ONE.map((l) => l.standard),
      unitOneExamStatus: status,
    };
    const v = buildAdventureView(s);
    expect(v.current?.lessonId).toBe(UNIT_EXAM_ID);
    expect(unitGateway(s).examAvailable).toBe(true);
    expect(journeyReturnTransition(v, UNIT_ONE.at(-1)!.standard).travel?.to).toBe(UNIT_EXAM_ID);
  },
);
it("opens later lessons only after server readiness is ready", () => {
  const s = {
    ...snapshot,
    completedStandards: UNIT_ONE.map((l) => l.standard),
    unitOneExamStatus: "ready" as const,
  };
  const v = buildAdventureView(s);
  expect(v.completed.has(UNIT_EXAM_ID)).toBe(true);
  expect(v.current?.lessonId).toBe(v.lessons[9].lessonId);
  expect(v.current?.available).toBe(true);
  expect(blockedByUnitExam(s, v.current!.lessonId)).toBe(false);
});
it("does not impose K on an older reader or activate an unreleased unit", () => {
  expect(
    unitGateway({ ...snapshot, child: { ...snapshot.child, reading_level: "Independent Reader" } })
      .applies,
  ).toBe(false);
  expect(unitGateway({ ...snapshot, approvedUnitEnabled: false }).locked).toBe(false);
});
it("legacy quiz scores cannot impersonate completion of the reviewed unit", () => {
  const s = {
    ...snapshot,
    practice: UNIT_ONE.map((l) => ({ standard_id: l.standard, questions_correct: 12 })),
  };
  expect(unitGateway(s).examAvailable).toBe(false);
  expect(buildAdventureView(s).current?.lessonId).toBe(UNIT_ONE[0].standard);
});

it("keeps the existing free starter accessible without gifting other lessons", () => {
  const v = buildAdventureView({
    ...snapshot,
    billing: { fullAccess: false, eligibleForTrial: false, signupAt: "2026-09-13" },
  });
  expect(v.current?.lessonId).toBe("RL.K.1");
  expect(v.lessons.filter((l) => l.available).map((l) => l.lessonId)).toEqual(["RL.K.1"]);
});

it("does not renumber existing reward chests when the reviewed unit is inserted", () => {
  const before = buildAdventureView({ ...snapshot, approvedUnitEnabled: false });
  const after = buildAdventureView(snapshot);
  for (const chapter of after.chapters.filter((c) => c.rewardId)) {
    expect(chapter.rewardId).toBe(
      before.chapters.find((c) => c.unitKey === chapter.unitKey && c.rewardId)?.rewardId,
    );
  }
});
