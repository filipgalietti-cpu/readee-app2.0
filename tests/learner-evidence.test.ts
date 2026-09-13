import { describe, expect, it } from "vitest";
import {
  normalizeLearnerEvidence,
  type LearnerEvidenceInput,
} from "@/lib/journey/learner-evidence";
import { decidePlacement } from "@/lib/placement/decide";
import { spectrumSubmission } from "./fixtures/placement-spectrum";
import { completedSubmission } from "./fixtures/placement-submission";
import catalog from "@/app/data/sample-lessons.json";
import type { PlacementSubmission } from "@/lib/placement/types";

function input(sub = spectrumSubmission()): LearnerEvidenceInput {
  return {
    childId: sub.childId,
    enrollmentBand: sub.enrolled,
    knownStandardIds: catalog.map((l) => l.standardId),
    placement: {
      id: "placement-fixture",
      childId: sub.childId,
      enrolled: sub.enrolled,
      createdAt: "2026-09-11T12:00:00Z",
      decision: decidePlacement(sub),
      evidence: sub,
    },
  };
}
describe("learner evidence without new assessment scoring", () => {
  it("preserves confirmed reading and distinct stronger listening", () => {
    const source = input(),
      original = JSON.stringify(source);
    const e = normalizeLearnerEvidence(source);
    expect(e.instructionalEntry).toMatchObject({
      status: "confirmed",
      support: "B-broad-inference",
      value: 2,
    });
    expect(e.independentReading).toMatchObject({ status: "confirmed", value: { band: 2 } });
    expect(e.listening).toMatchObject({ value: { supportedBand: 4 } });
    expect(e.readingSamples).toMatchObject({ status: "confirmed" });
    expect(e.standardObservations.filter((s) => s.modality === "listening-supported")).toHaveLength(
      10,
    );
    expect(
      e.standardObservations
        .filter((s) => s.modality === "listening-supported")
        .every((s) => s.correct === null && !!s.choiceId),
    ).toBe(true);
    expect(e.issues).toContain("historical-item-bank-version-not-persisted");
    expect(JSON.stringify(source)).toBe(original);
  });
  it("retains above-enrollment placement", () => {
    const e = normalizeLearnerEvidence(input(spectrumSubmission(0, 9, 4, 4)));
    expect(e.enrollment).toMatchObject({ value: 0 });
    expect(e.instructionalEntry).toMatchObject({ value: 4 });
  });
  it.each([1, 2] as const)(
    "accepts historical spectrum profile version %i without inventing newer sample fields",
    (version) => {
      const x = input(),
        d = decidePlacement(spectrumSubmission());
      x.placement!.decision = {
        ...d,
        spectrum: {
          ...d.spectrum,
          version,
          readingSamples: undefined,
          wordSample: undefined,
          supportedReadingBand: undefined,
        },
      };
      const normalized = normalizeLearnerEvidence(x);
      expect(normalized.instructionalEntry).toMatchObject({ status: "confirmed", value: 2 });
      expect(normalized.readingSamples.status).toBe("missing");
      expect(normalized.wordReading).toMatchObject({ value: { sample: null } });
    },
  );
  it("distinguishes provisional reading, missing rate, and unsupported mastery", () => {
    const e = normalizeLearnerEvidence(input(spectrumSubmission(4, 0, 0, 4)));
    expect(e.independentReading).toMatchObject({ status: "provisional", value: { band: null } });
    expect(e.fluency.status).toBe("missing");
    expect(e.standardMastery).toMatchObject({ status: "unsupported", support: "C-unsupported" });
    expect(e.specificPatternDeficiencies.status).toBe("unsupported");
    expect(e.letterSounds.status).toBe("confirmed");
  });
  it("does not invent zeroes or Kindergarten when placement is absent", () => {
    const e = normalizeLearnerEvidence({ ...input(), placement: null, enrollmentBand: null });
    expect(e.instructionalEntry.status).toBe("missing");
    expect(e.enrollment.status).toBe("missing");
    expect(e.comprehension).not.toHaveProperty("value");
  });
  it("copies historical v3 recommendation without asserting v4 confirmation or inherited norms", () => {
    const sub = completedSubmission() as PlacementSubmission;
    const e = normalizeLearnerEvidence(input(sub));
    expect(e.instructionalEntry).toMatchObject({
      status: "provisional",
      value: decidePlacement(sub).placedBand,
    });
    expect(e.independentReading.status).toBe("unsupported");
    expect(e.fluency).not.toHaveProperty("value.percentile");
    expect(e.fluency).not.toHaveProperty("value.gradeEquivalent");
    expect(e.issues).toContain("historical-placement-preserved-without-rescoring");
  });
  it("does not reinterpret old percentage dimensions as spectrum", () => {
    const x = input();
    x.placement = null;
    x.legacyAssessment = {
      id: "old",
      child_id: x.childId,
      completed_at: "2026-01-01",
      dimension_profile: { phonics: { scorePercent: 100 } },
    };
    expect(normalizeLearnerEvidence(x).instructionalEntry.status).toBe("unsupported");
  });
  it("fails closed on unknown future profile versions and contradictory confirmation", () => {
    const x = input();
    const d = decidePlacement(spectrumSubmission());
    x.placement!.decision = { ...d, spectrum: { ...d.spectrum, version: 99 } };
    expect(normalizeLearnerEvidence(x).instructionalEntry.status).toBe("unsupported");
    x.placement!.decision = {
      ...d,
      spectrum: { ...d.spectrum, readingStatus: "confirmed", readingBand: null },
    };
    expect(normalizeLearnerEvidence(x).instructionalEntry.status).toBe("unsupported");
  });
  it("preserves prior completions without converting them into mastery", () => {
    const x = input();
    x.progress = {
      childId: x.childId,
      practice: [
        { id: "p1", standard_id: "RL.2.1", questions_correct: 3, completed_at: "2026-09-01" },
      ],
      sections: [
        { id: "s1", lesson_id: "RL.2.2", section: "practice", score: 60, completed_at: null },
      ],
      answers: [
        {
          id: "a1",
          standard_id: "RL.2.1",
          question_id: "q",
          was_correct: false,
          answered_at: "2026-09-01",
        },
      ],
    };
    const e = normalizeLearnerEvidence(x);
    expect(e.previousCompletions).toHaveLength(2);
    expect(e.previousCompletions.every((c) => c.mastery === "not-established")).toBe(true);
    expect(e.standardMastery.status).toBe("unsupported");
    expect(e.standardObservations.find((s) => s.modality === "practice")).toMatchObject({
      correct: false,
      interpretation: "sample-response-only",
    });
  });
  it("rejects cross-child evidence", () => {
    const x = input();
    x.placement!.childId = "another-child";
    expect(() => normalizeLearnerEvidence(x)).toThrow("another child");
  });
  it("retains band summaries when historical raw items are unavailable", () => {
    const x = input();
    x.placement!.evidence = undefined;
    const e = normalizeLearnerEvidence(x);
    expect(e.instructionalEntry).toMatchObject({ value: 2 });
    expect(e.standardObservations).toEqual([]);
    expect(e.letterSounds.status).toBe("missing");
  });
  it("does not recompute historical listening scores from the current answer key", () => {
    const x = input(),
      original = normalizeLearnerEvidence(x);
    const sub = spectrumSubmission();
    sub.spectrum!.language = sub.spectrum!.language.map((r) => ({ ...r, choiceId: "__pass" }));
    x.placement!.evidence = sub;
    const normalized = normalizeLearnerEvidence(x);
    expect(normalized.listening).toEqual(original.listening);
    expect(
      normalized.standardObservations
        .filter((r) => r.modality === "listening-supported")
        .every((r) => r.correct === null),
    ).toBe(true);
  });
  it("rejects unknown or repeated raw item IDs instead of generating standard evidence", () => {
    const x = input(),
      sub = spectrumSubmission();
    sub.spectrum!.language = [
      { itemId: "made-up", choiceId: "a" },
      ...sub.spectrum!.language,
      sub.spectrum!.language[0],
    ];
    x.placement!.evidence = sub;
    const e = normalizeLearnerEvidence(x);
    expect(e.issues).toContain("unknown-or-duplicate-listening-item");
    expect(e.standardObservations.filter((s) => s.modality === "listening-supported")).toHaveLength(
      10,
    );
  });
});
