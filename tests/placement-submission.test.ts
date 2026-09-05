import { describe, it, expect } from "vitest";
import { PlacementSubmissionSchema } from "@/lib/schemas";
import { decidePlacement, type PassageEvidence } from "@/lib/placement/decide";
import { createLadder, type LadderState } from "@/lib/placement/ladder";

/**
 * Guards the runner -> schema -> decide() contract.
 *
 * The one-minute rate window shipped broken: PlacementRunner sent
 * minuteWordsCorrect/minuteSeconds, decide.ts read them, and the route's Zod
 * object stripped them in between because they were never declared. Nothing
 * failed - the rate silently fell back to the whole read, which understates
 * every child who keeps reading past a minute. Types could not catch it: the
 * fields are optional, so their absence is valid.
 */

/** Exactly the shape PlacementRunner posts, JSON round-tripped like the wire. */
function submission(over: Record<string, unknown> = {}) {
  const ladder: LadderState = createLadder(2);
  return JSON.parse(JSON.stringify({
    childId: "3f1a7c2e-9b64-4d1a-8e55-0c2d6b8a1f30",
    enrolled: 2,
    ladder,
    passages: [{
      band: 2,
      wordsCorrect: 100,
      wordsTotal: 100,
      durationSeconds: 180,   // kept reading well past the window
      minuteWordsCorrect: 40, // ...but only 40 words by the one-minute mark
      minuteSeconds: 60,
      prosody: null,
    }],
    comprehension: null,
    foundations: null,
    moments: [],
    durationSeconds: 600,
    ...over,
  }));
}

describe("placement submission schema", () => {
  it("keeps the one-minute rate window the runner sends", () => {
    const parsed = PlacementSubmissionSchema.safeParse(submission());
    expect(parsed.success).toBe(true);
    const p = parsed.data!.passages[0];
    expect(p.minuteWordsCorrect).toBe(40);
    expect(p.minuteSeconds).toBe(60);
  });

  it("still accepts a passage with no window (child finished before the mark)", () => {
    const body = submission();
    delete body.passages[0].minuteWordsCorrect;
    delete body.passages[0].minuteSeconds;
    expect(PlacementSubmissionSchema.safeParse(body).success).toBe(true);
  });
});

describe("wcpm survives the round trip", () => {
  it("rates from the one-minute window, not the whole read", () => {
    const parsed = PlacementSubmissionSchema.parse(submission());
    const decision = decidePlacement({
      enrolled: 2,
      ladder: parsed.ladder as LadderState,
      // Same cast the route makes: the Zod types widen `band` to number.
      passages: parsed.passages as PassageEvidence[],
      comprehension: null,
      foundations: null,
      date: new Date(2027, 3, 15),
    });
    // 40 words in the 60s window = 40 wcpm.
    // The whole read (100 words / 180s = 33) is the number this used to report.
    expect(decision.fluency?.wcpm).toBe(40);
    expect(decision.fluency?.wcpm).not.toBe(33);
  });
});
