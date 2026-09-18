import { it, expect } from "vitest";
import { unitHasAccess, FREE_APPROVED_LESSONS } from "@/lib/approved-unit/entitlement";
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
/*
 * POLICY CHANGED 17 Sep 2026, by Filip, after walking the first run as a parent:
 * "1st lesson is paywalled... I think we want to give them the first few free
 * then hit them with the paywall."
 *
 * Both assertions below used to require `rhyme-time` to be locked. That was
 * deliberate, and it was wrong from the parent's seat: rhyme-time is the FIRST
 * tile of the founder-approved unit, so every family, grandfathered or new,
 * opened the unit and found lesson one locked and lesson two free. The old rule
 * scoped the allowance by (grade, domain) while the unit deliberately mixes
 * domains, so it could never line up with the order a child reads in.
 *
 * What this file protects is unchanged: nobody LOSES access across the release.
 * The new rule only ever grants more.
 */
it("keeps the grandfathered allowance, and now opens the unit at its first lesson", () => {
  const s = snapshot("2026-09-01");
  expect(unitHasAccess(s, "key-details")).toBe(true);
  expect(unitHasAccess(s, "book-makers")).toBe(true);
  expect(unitHasAccess(s, "rhyme-time")).toBe(true);
  // The checkpoint covers every standard in the unit, so it stays paid.
  expect(unitHasAccess(s, "k-unit-1-checkpoint")).toBe(false);
});
it("new families get the opening lessons, in the order they meet them", () => {
  const s = snapshot("2026-09-13");
  const open = UNIT_ONE.filter((l) => unitHasAccess(s, l.id)).map((l) => l.id);
  expect(open.slice(0, FREE_APPROVED_LESSONS)).toEqual(
    UNIT_ONE.slice(0, FREE_APPROVED_LESSONS).map((l) => l.id),
  );
  // Still a paywall: the unit does not become free.
  expect(open.length).toBeLessThan(UNIT_ONE.length);
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
