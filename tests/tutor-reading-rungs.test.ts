import { describe, it, expect } from "vitest";
import { readingRungs, READING_RUNG, READING_MAX_HELPS } from "@/lib/tutor/reading/rungs";
import { nextLadderStep, MODELED } from "@/lib/tutor/help-ladder";

const feasibleIds = (word: string) =>
  readingRungs({ word }).filter((r) => r.feasible).map((r) => r.id);

describe("readingRungs — reading-specific feasibility gates", () => {
  it("a decodable word gets the full decode ladder (flat = f.l.a.t)", () => {
    expect(feasibleIds("flat")).toEqual([
      READING_RUNG.FIRST_SOUND,
      READING_RUNG.ONSET_RIME,
      READING_RUNG.SOUND_OUT,
    ]);
  });

  it("a SIGHT word is never blended — only know-by-heart (the)", () => {
    expect(feasibleIds("the")).toEqual([READING_RUNG.SIGHT_SAY]);
  });

  it("an undecodable word has no hints — the ladder will model it (strengths)", () => {
    expect(feasibleIds("strengths")).toEqual([]);
    // No feasible rung → the kernel models it (says the word) immediately.
    expect(nextLadderStep(readingRungs({ word: "strengths" }), { triedRungs: [] })).toEqual({ kind: "model" });
  });

  it("ignores surrounding punctuation on the word", () => {
    expect(feasibleIds('"flat,"')).toEqual(feasibleIds("flat"));
  });
});

describe("reading rungs + kernel ladder = the tutor's correction sequence", () => {
  it("a stuck decodable word climbs first-sound → onset-rime → sound-out → model", () => {
    const rungs = readingRungs({ word: "flat" });
    const opts = { maxHelps: READING_MAX_HELPS };
    const tried: string[] = [];

    const s1 = nextLadderStep(rungs, { triedRungs: tried }, opts);
    expect(s1).toEqual({ kind: "help", rung: expect.objectContaining({ id: READING_RUNG.FIRST_SOUND }) });
    tried.push(READING_RUNG.FIRST_SOUND);

    const s2 = nextLadderStep(rungs, { triedRungs: tried }, opts);
    expect(s2).toEqual({ kind: "help", rung: expect.objectContaining({ id: READING_RUNG.ONSET_RIME }) });
    tried.push(READING_RUNG.ONSET_RIME);

    const s3 = nextLadderStep(rungs, { triedRungs: tried }, opts);
    expect(s3).toEqual({ kind: "help", rung: expect.objectContaining({ id: READING_RUNG.SOUND_OUT }) });
    tried.push(READING_RUNG.SOUND_OUT);

    const s4 = nextLadderStep(rungs, { triedRungs: tried }, opts);
    expect(s4).toEqual({ kind: "model" }); // 3 helps given → model it
    tried.push(MODELED);

    expect(nextLadderStep(rungs, { triedRungs: tried }, opts)).toEqual({ kind: "move-on" });
  });

  it("a sight word goes know-by-heart → model, never a blend", () => {
    const rungs = readingRungs({ word: "the" });
    const opts = { maxHelps: READING_MAX_HELPS };
    const s1 = nextLadderStep(rungs, { triedRungs: [] }, opts);
    expect(s1).toEqual({ kind: "help", rung: expect.objectContaining({ id: READING_RUNG.SIGHT_SAY }) });
    const s2 = nextLadderStep(rungs, { triedRungs: [READING_RUNG.SIGHT_SAY] }, opts);
    expect(s2).toEqual({ kind: "model" });
  });
});
