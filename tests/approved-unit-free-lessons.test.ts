import { describe, it, expect } from "vitest";
import { unitHasAccess, FREE_APPROVED_LESSONS } from "@/lib/approved-unit/entitlement";
import { UNIT_ONE } from "@/lib/approved-unit/catalogue";
import type { JourneySnapshot } from "@/lib/journey/types";

/**
 * Filip, walking the first run as a new parent: "1st lesson is paywalled."
 *
 * It was, and the free one sat behind it. The journey rule unlocks the first
 * lesson of the unit the assessment assigned, located by (grade, domain) in the
 * curriculum manifest. The approved Kindergarten unit mixes domains on purpose,
 * so for a placement assigning Kindergarten / Reading Literature the single
 * unlocked standard was RL.K.1 — the SECOND tile. Tile one, rhyme-time, is
 * RF.K.2a and was locked.
 */

/** A free family: no subscription, signed up after the allowance changed. */
function freeSnapshot(): JourneySnapshot {
  return {
    billing: { fullAccess: false, signupAt: "2026-09-18T00:00:00.000Z" },
    child: { reading_level: "Beginning Reader" },
    // Fil's real placement: Kindergarten, Reading Literature.
    result: {
      plan: {
        firstUnit: { grade: "Kindergarten", domain: "Reading Literature", lessons: 8 },
        steps: [],
        milestones: [],
      },
    },
  } as unknown as JourneySnapshot;
}

describe("approved unit, free allowance", () => {
  it("opens the first lesson a child actually meets", () => {
    // The regression in one line: this was false.
    expect(unitHasAccess(freeSnapshot(), UNIT_ONE[0].id)).toBe(true);
  });

  it("opens the first few, in the unit's own order", () => {
    const snapshot = freeSnapshot();
    const open = UNIT_ONE.filter((l) => unitHasAccess(snapshot, l.id)).map((l) => l.id);
    expect(open.slice(0, FREE_APPROVED_LESSONS)).toEqual(
      UNIT_ONE.slice(0, FREE_APPROVED_LESSONS).map((l) => l.id),
    );
  });

  it("still charges for the rest of the unit", () => {
    const snapshot = freeSnapshot();
    const last = UNIT_ONE[UNIT_ONE.length - 1];
    expect(unitHasAccess(snapshot, last.id)).toBe(false);
  });

  it("keeps the checkpoint behind the whole unit", () => {
    // It tests every standard in the unit, so being early in the list must not
    // hand it over.
    expect(unitHasAccess(freeSnapshot(), "k-unit-1-checkpoint")).toBe(false);
  });

  it("gives a paying family everything", () => {
    const paid = { ...freeSnapshot(), billing: { fullAccess: true, signupAt: null } } as JourneySnapshot;
    for (const lesson of UNIT_ONE) expect(unitHasAccess(paid, lesson.id)).toBe(true);
    expect(unitHasAccess(paid, "k-unit-1-checkpoint")).toBe(true);
  });
});
