import { describe, it, expect } from "vitest";
import { nextLadderStep, MODELED, type HelpRung } from "@/lib/orion/help-ladder";

// A reading-flavored rung set (but the engine is domain-agnostic).
const RUNGS: HelpRung[] = [
  { id: "recue", level: 0, feasible: true },
  { id: "onset-rime", level: 1, feasible: true },
  { id: "sound-out", level: 2, feasible: true },
  { id: "syllabify", level: 3, feasible: false }, // e.g. single-syllable word
  { id: "say-word", level: 4, feasible: true },
];

describe("nextLadderStep — escalate least→most, short, no spiral", () => {
  it("first stall → the lightest feasible rung", () => {
    const step = nextLadderStep(RUNGS, { triedRungs: [] });
    expect(step).toEqual({ kind: "help", rung: expect.objectContaining({ id: "recue" }) });
  });

  it("escalates one rung at a time on each retry", () => {
    const step = nextLadderStep(RUNGS, { triedRungs: ["recue"] });
    expect(step).toEqual({ kind: "help", rung: expect.objectContaining({ id: "onset-rime" }) });
  });

  it("keeps help SHORT — models after maxHelps (default 2) rungs", () => {
    const step = nextLadderStep(RUNGS, { triedRungs: ["recue", "onset-rime"] });
    expect(step).toEqual({ kind: "model" });
  });

  it("no spiral — once modeled and still stuck, move on", () => {
    const step = nextLadderStep(RUNGS, { triedRungs: ["recue", "onset-rime", MODELED] });
    expect(step).toEqual({ kind: "move-on" });
  });

  it("skips infeasible rungs when picking the next one", () => {
    // Allow more helps so we reach past sound-out; syllabify is infeasible → say-word.
    const step = nextLadderStep(RUNGS, { triedRungs: ["recue", "onset-rime", "sound-out"] }, { maxHelps: 5 });
    expect(step).toEqual({ kind: "help", rung: expect.objectContaining({ id: "say-word" }) });
  });

  it("models immediately when no rung is feasible for this item", () => {
    const allInfeasible = RUNGS.map((r) => ({ ...r, feasible: false }));
    expect(nextLadderStep(allInfeasible, { triedRungs: [] })).toEqual({ kind: "model" });
  });

  it("respects support level, not input order", () => {
    const shuffled = [...RUNGS].reverse();
    const step = nextLadderStep(shuffled, { triedRungs: [] });
    expect(step).toEqual({ kind: "help", rung: expect.objectContaining({ id: "recue", level: 0 }) });
  });

  it("honors a custom maxHelps (e.g. model after a single hint)", () => {
    const step = nextLadderStep(RUNGS, { triedRungs: ["recue"] }, { maxHelps: 1 });
    expect(step).toEqual({ kind: "model" });
  });
});
