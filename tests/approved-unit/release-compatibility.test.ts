import { it, expect } from "vitest";
import { unitHasAccess } from "@/lib/approved-unit/entitlement";
import { UNIT_ONE } from "@/lib/approved-unit/catalogue";
import { lessonCompleted } from "@/lib/journey/lesson-access";
import { buildAdventureView } from "@/lib/journey/adventure-view";
import type { JourneySnapshot } from "@/lib/journey/types";
function snapshot(signupAt: string, fullAccess = false): JourneySnapshot {
  return {
    child: {
      id: "test-reader",
      parent_id: "test-parent",
      owner_type: "parent",
      owner_classroom_id: null,
      created_by_teacher: null,
      first_name: "Reader",
      grade: "K",
      reading_level: null,
      carrots: 0,
      stories_read: 0,
      streak_days: 0,
      last_lesson_at: null,
      equipped_items: {},
      created_at: signupAt,
    },
    result: null,
    practice: [],
    lessonProgress: [],
    billing: { signupAt, fullAccess, eligibleForTrial: false },
  };
}
it("keeps the current grandfathered allowance without making the mixed unit all free", () => {
  const s = snapshot("2026-09-01");
  expect(unitHasAccess(s, "key-details")).toBe(true);
  expect(unitHasAccess(s, "book-makers")).toBe(true);
  expect(unitHasAccess(s, "rhyme-time")).toBe(false);
  expect(unitHasAccess(s, "k-unit-1-checkpoint")).toBe(false);
});
it("new families keep the one starter lesson policy", () => {
  const s = snapshot("2026-09-13");
  expect(UNIT_ONE.filter((l) => unitHasAccess(s, l.id)).map((l) => l.id)).toEqual(["key-details"]);
});
it("paid or effective trial access allows the complete reviewed unit", () => {
  const s = snapshot("2026-09-13", true);
  for (const id of [...UNIT_ONE.map((l) => l.id), "k-unit-1-checkpoint"])
    expect(unitHasAccess(s, id)).toBe(true);
});
it("the current adventure acknowledges completion without inventing a better score", () => {
  const s = snapshot("2026-09-13", true);
  s.practice = [{ standard_id: "RL.K.1", questions_correct: 1 }];
  s.completedStandards = ["RL.K.1"];
  expect(lessonCompleted("RL.K.1", s.practice, [])).toBe(false);
  expect(buildAdventureView(s).completed.has("RL.K.1")).toBe(true);
  expect(s.practice[0].questions_correct).toBe(1);
});
