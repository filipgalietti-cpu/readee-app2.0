import { describe, expect, it } from "vitest";
import { spectrumSubmission } from "./fixtures/placement-spectrum";
import { decidePlacement } from "@/lib/placement/decide";
import {
  wordSearch,
  readingSearch,
  readingScore,
  languageSearch,
  LANGUAGE_ITEMS,
} from "@/lib/placement/spectrum";
import { validatePlacementEvidence } from "@/lib/placement/validate-evidence";
import { PlacementSubmissionSchema } from "@/lib/schemas/placement";
import { buildPlan } from "@/lib/placement/plan";
import { assignedJourneyCatalog } from "@/lib/journey/next-lesson";
import { narrate } from "@/lib/placement/narration";
import type { PlacedBand } from "@/lib/placement/ladder";
import type { PlacementSubmission, PlacementResult } from "@/lib/placement/types";
import { buildRevealCopy } from "@/app/(protected)/placement/_components/reveal/copy";

describe("K–4 adaptive instructional spectrum", () => {
  it.each([0, 1, 2, 3, 4] as PlacedBand[])(
    "can reach every word step from enrollment %i",
    (enrolled) => {
      for (let ceiling = -1; ceiling <= 9; ceiling++) {
        const sub = spectrumSubmission(enrolled, ceiling, 4, 4);
        expect(wordSearch(enrolled, sub.spectrum!.words).highest).toBe(
          ceiling < 0 ? null : ceiling,
        );
        expect(validatePlacementEvidence(sub, enrolled).spectrum).toEqual(sub.spectrum);
        expect(decidePlacement(sub).placedBand).toBeLessThanOrEqual(4);
      }
    },
  );
  it("preserves enrollment 4, confirms reading 2 twice, and retains stronger listening", () => {
    const s = spectrumSubmission();
    const d = decidePlacement(s);
    expect(d.placedBand).toBe(2);
    expect(s.enrolled).toBe(4);
    expect(d.relative.delta).toBe(2);
    expect(d.spectrum).toMatchObject({ readingBand: 2, languageBand: 4, wordStep: 5 });
    expect(s.spectrum!.reading).toHaveLength(2);
    expect(d.fluency?.gradeEquivalent).toBeNull();
    expect(d.fluency?.percentile).toBeNull();
    expect(d.seeds).toEqual([]);
  });
  it("allows a Kindergarten enrollee to reach the actual fourth-grade ceiling", () => {
    const d = decidePlacement(spectrumSubmission(0, 9, 4, 4));
    expect(d.placedBand).toBe(4);
    expect(d.spectrum?.ceilingReached).toBe(true);
    expect(d.flags).not.toContain("above-4th-words");
  });
  it("steps connected text down independently of successful word reading", () => {
    const s = spectrumSubmission(4, 9, 2, 4);
    expect(s.spectrum!.reading.map((t) => t.passageId)).toEqual([
      "sp-read-4-a",
      "sp-read-3-a",
      "sp-read-2-a",
      "sp-read-2-b",
    ]);
    expect(decidePlacement(s).spectrum).toMatchObject({
      wordBand: 4,
      readingBand: 2,
      languageBand: 4,
    });
  });
  it("leaves letters-only and floor outcomes provisional rather than labeling nonreaders", () => {
    for (const ceiling of [-1, 0]) {
      const s = spectrumSubmission(4, ceiling, 0, 4),
        d = decidePlacement(s);
      expect(s.spectrum!.reading).toEqual([]);
      expect(d.spectrum?.readingStatus).toBe("starting-point");
      expect(d.decoding.emergent).toBe(false);
      expect(d.flags).not.toContain("emergent");
      expect(d.spectrum?.languageBand).toBe(4);
    }
  });
  it("does not turn one short accurate fragment into a comfortable passage", () => {
    const s = spectrumSubmission(),
      t = s.spectrum!.reading[0];
    t.speech = { band: 2, wordsTotal: 5, wordsCorrect: 5, durationSeconds: 10 };
    expect(readingScore(t).comfortable).toBe(false);
    expect(() => validatePlacementEvidence(s, 4)).toThrow();
  });
  it("requires the second independent passage and all language evidence before saving", () => {
    const s = spectrumSubmission();
    s.spectrum!.reading.pop();
    expect(readingSearch(4, s.spectrum!.words, s.spectrum!.reading).next?.id).toBe("sp-read-2-b");
    expect(() => validatePlacementEvidence(s, 4)).toThrow();
    const other = spectrumSubmission();
    other.spectrum!.language.pop();
    expect(() => validatePlacementEvidence(other, 4)).toThrow();
  });
  it("requires five of six meaning answers across the confirmation pair", () => {
    const s = spectrumSubmission();
    for (const trial of s.spectrum!.reading) {
      const qid = trial.choices[0].itemId;
      // All fixture answers start correct; change one choice in each text.
      trial.choices[0].choiceId = trial.choices[0].choiceId === "a" ? "b" : "a";
      expect(trial.choices[0].itemId).toBe(qid);
    }
    expect(readingSearch(4, s.spectrum!.words, s.spectrum!.reading).next?.grade).toBe(1);
    expect(() => validatePlacementEvidence(s, 4)).toThrow();
  });
  it("replays identically without mutating traces or repeating questions", () => {
    const s = spectrumSubmission(),
      trace = s.spectrum!.language.slice(0, 5);
    const before = JSON.stringify(trace);
    expect(languageSearch(4, trace)).toEqual(languageSearch(4, trace));
    expect(JSON.stringify(trace)).toBe(before);
    expect(new Set(s.spectrum!.language.map((q) => q.itemId)).size).toBe(10);
    expect(wordSearch(4, [])).toEqual(wordSearch(4, []));
  });
  it("rejects forged item order, answer IDs and child enrollment", () => {
    const s = spectrumSubmission();
    s.spectrum!.words[0].itemId = "not-in-the-bank";
    expect(() => validatePlacementEvidence(s, 4)).toThrow();
    const t = spectrumSubmission();
    t.spectrum!.language[0].choiceId = "fake";
    expect(() => validatePlacementEvidence(t, 4)).toThrow();
    expect(() => validatePlacementEvidence(spectrumSubmission(), 3)).toThrow();
  });
  it("keeps all new evidence through Zod instead of stripping it", () => {
    const s = spectrumSubmission();
    const parsed = PlacementSubmissionSchema.parse(s) as PlacementSubmission;
    expect(parsed.spectrum).toEqual(s.spectrum);
    expect(decidePlacement(validatePlacementEvidence(parsed, 4)).placedBand).toBe(2);
  });
  it("routes the first lesson to the reading band without marking whole units mastered", () => {
    const s = spectrumSubmission(),
      d = decidePlacement(s),
      today = new Date("2026-09-09T12:00:00Z");
    const plan = buildPlan({ decision: d, moments: [], today });
    expect(plan.version).toBe(3);
    expect(plan.entryBand).toBe(2);
    expect(plan.firstUnit?.grade).toBe("2nd Grade");
    expect(plan.steps.some((s) => s.kind === "skipped")).toBe(false);
    expect(plan.milestones).toEqual([]);
    const journey = assignedJourneyCatalog(d.readingLevelName, plan);
    expect(journey[0]).toMatchObject({
      grade: plan.firstUnit?.grade,
      domain: plan.firstUnit?.domain,
    });
    expect(plan.steps.some((s) => s.title.includes("4th-grade ideas"))).toBe(true);
    const result: PlacementResult = {
      id: "demo",
      childId: s.childId,
      childName: "Maya",
      enrolled: 4,
      decision: d,
      plan,
      moments: [],
      narration: [],
      passageRecordingPath: null,
      durationSeconds: 360,
      createdAt: today.toISOString(),
    };
    const copy = buildRevealCopy(result);
    expect(copy.number?.source).not.toContain("Hasbrouck");
    expect(copy.plan.growth).toBeNull();
    expect(copy.placement.support).toContain("read-aloud support");
    expect(
      narrate({ childName: "Maya", decision: d, moments: [], plan, today }).every(
        (n) => !n.text.includes("5th grade"),
      ),
    ).toBe(true);
  });
  it("has fixed, unique, source-linked narrated questions in every K–4 band", () => {
    expect(new Set(LANGUAGE_ITEMS.map((q) => q.id)).size).toBe(LANGUAGE_ITEMS.length);
    for (const grade of [0, 1, 2, 3, 4])
      expect(LANGUAGE_ITEMS.filter((q) => q.grade === grade)).toHaveLength(10);
    for (const q of LANGUAGE_ITEMS) {
      expect(q.sourceId).toBeTruthy();
      expect(
        q.audio.startsWith("https://") || q.audio.startsWith("/audio/placement-spectrum/"),
      ).toBe(true);
      expect(q.options.some((o) => o.id === q.correctId)).toBe(true);
    }
  });
});
