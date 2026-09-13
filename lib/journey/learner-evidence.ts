import { z } from "zod";
import { WORD_STEPS, wordItemId } from "@/app/data/placement-spectrum/words";
import languageItems from "@/app/data/placement-spectrum/language.json";
import type { SourceReference } from "@/lib/curriculum/release";
import type {
  Band,
  Counts,
  Evidence,
  LearnerEvidence,
  PreviousCompletion,
} from "./evidence-contract";

const band = z.number().int().min(0).max(4);
const count = z
  .object({ correct: z.number().int().nonnegative(), total: z.number().int().nonnegative() })
  .refine((c) => c.correct <= c.total);
const fluency = z.object({
  band: z.number().int().min(0).max(5),
  wcpm: z.number().finite().nonnegative(),
  accuracy: z.number().min(0).max(1),
});
const spectrum = z.object({
  version: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  wordBand: band,
  wordStep: z.number().int().min(0).max(9).nullable(),
  wordLabel: z.string(),
  wordSample: count.optional(),
  readingBand: band.nullable(),
  readingStatus: z.enum(["confirmed", "starting-point"]),
  supportedReadingBand: band.nullable().optional(),
  readingSamples: z
    .array(
      z
        .object({
          band,
          wordsCorrect: z.number().int().nonnegative(),
          wordsAttempted: z.number().int().positive(),
          referenceWords: z.number().int().positive(),
          accuracy: z.number().min(0).max(1),
          coverage: z.number().min(0).max(1),
          correct: z.number().int().nonnegative(),
          total: z.number().int().positive(),
        })
        .refine(
          (s) =>
            s.wordsCorrect <= s.wordsAttempted &&
            s.wordsAttempted <= s.referenceWords &&
            s.correct <= s.total,
        ),
    )
    .optional(),
  languageBand: band.nullable(),
  languageByBand: z.array(count).length(5),
  oralBlending: count.nullable(),
});
const decision = z.object({
  placedBand: band,
  spectrum: z.unknown().optional(),
  decoding: z.object({ level: z.number().int().min(0).max(5).nullable() }).optional(),
  comprehension: count.nullable().optional(),
  fluency: fluency.nullable().optional(),
  foundations: z.object({ letterSounds: count, blending: count }).nullable().optional(),
  strengths: z.array(z.string()).optional(),
  needs: z.array(z.string()).optional(),
});
const rawEvidence = z.object({
  evidenceVersion: z.union([z.literal(3), z.literal(4)]).optional(),
  spectrum: z
    .object({
      words: z.array(z.object({ itemId: z.string(), correct: z.boolean() })),
      language: z.array(z.object({ itemId: z.string(), choiceId: z.string() })),
    })
    .optional(),
});

export type LearnerEvidenceInput = {
  childId: string;
  enrollmentBand: Band | null;
  // Pass the saved decision, not withCurrentPlan's recalculated result.
  placement?: {
    id: string;
    childId: string;
    enrolled: Band;
    createdAt: string;
    decision: unknown;
    evidence?: unknown;
  } | null;
  legacyAssessment?: {
    id: string;
    child_id: string;
    completed_at: string;
    dimension_profile?: unknown;
  } | null;
  progress?: {
    practice: readonly {
      id: string;
      standard_id: string;
      questions_correct: number;
      completed_at: string | null;
    }[];
    sections: readonly {
      id: string;
      lesson_id: string;
      section: string;
      score: number;
      completed_at: string | null;
    }[];
    // Caller supplies this child's owned rows only. Unknown standards stay out of inference.
    answers?: readonly {
      id: string;
      standard_id: string;
      question_id: string;
      was_correct: boolean;
      answered_at: string;
    }[];
    childId: string;
  };
  knownStandardIds: readonly string[];
};

const absent = <T>(
  reason: string,
  provenance: SourceReference[] = [],
  status: "missing" | "unsupported" = "missing",
): Evidence<T> => ({ status, support: "C-unsupported", reason, provenance });
const measured = <T>(
  value: T,
  provenance: SourceReference[],
  status: "confirmed" | "provisional" = "confirmed",
): Evidence<T> => ({ status, support: "A-directly-measured", value, provenance });
const counts = (c: Counts | null | undefined, refs: SourceReference[]): Evidence<Counts> =>
  c && c.total > 0 ? measured(c, refs) : absent("No measured responses are available.", refs);

/** Pure normalization only: no rescoring, database, clock, model call, or new mastery score. */
export function normalizeLearnerEvidence(input: LearnerEvidenceInput): LearnerEvidence {
  const unavailable = "No usable measurement is available.";
  const out: LearnerEvidence = {
    schemaVersion: 1,
    adapterVersion: "learner-evidence-v1",
    childId: input.childId,
    placementId: null,
    enrollment:
      input.enrollmentBand === null
        ? absent("Enrollment was not supplied.")
        : measured(input.enrollmentBand, [
            { source: "children", locator: `${input.childId}.grade`, version: "input-snapshot" },
          ]),
    instructionalEntry: absent(unavailable),
    wordReading: absent(unavailable),
    letterSounds: absent(unavailable),
    oralBlending: absent(unavailable),
    independentReading: absent(unavailable),
    comprehension: absent(unavailable),
    readingSamples: absent(unavailable),
    listening: absent(unavailable),
    fluency: absent(unavailable),
    reportedStrengths: [],
    reportedNeeds: [],
    standardObservations: [],
    previousCompletions: [],
    issues: [],
    standardMastery: absent(
      "These samples and completion records do not establish standard mastery.",
      [],
      "unsupported",
    ),
    specificPatternDeficiencies: absent(
      "Mixed word sets cannot establish individual pattern deficiencies.",
      [],
      "unsupported",
    ),
  };
  const p = input.placement;
  if (p && p.childId !== input.childId) throw new Error("Placement belongs to another child.");
  if (input.legacyAssessment && input.legacyAssessment.child_id !== input.childId)
    throw new Error("Assessment belongs to another child.");
  if (input.progress && input.progress.childId !== input.childId)
    throw new Error("Progress belongs to another child.");
  if (p) {
    out.placementId = p.id;
    const ref = (locator: string): SourceReference[] => [
      { source: "placements", locator: `${p.id}.${locator}`, version: p.createdAt },
    ];
    const d = decision.safeParse(p.decision);
    if (!d.success) {
      out.issues.push("invalid-saved-decision");
      out.instructionalEntry = absent(
        "Saved decision has an unsupported shape.",
        ref("decision"),
        "unsupported",
      );
    } else {
      const v = d.data;
      out.reportedStrengths = [...(v.strengths ?? [])];
      out.reportedNeeds = [...(v.needs ?? [])];
      out.comprehension = counts(v.comprehension, ref("decision.comprehension"));
      if (v.fluency)
        out.fluency = measured(
          { ...v.fluency, interpretation: "observed-sample-only" },
          ref("decision.fluency"),
        );
      const s = spectrum.safeParse(v.spectrum);
      if (v.spectrum !== undefined && !s.success) {
        out.issues.push("unsupported-spectrum-version-or-shape");
        out.instructionalEntry = absent(
          "Spectrum version or fields require an adapter update.",
          ref("decision.spectrum"),
          "unsupported",
        );
      } else if (s.success) {
        const x = s.data;
        const consistent = (x.readingStatus === "confirmed") === (x.readingBand !== null);
        if (!consistent) out.issues.push("inconsistent-reading-confirmation");
        out.instructionalEntry = consistent
          ? {
              status: x.readingStatus === "confirmed" ? "confirmed" : "provisional",
              support: "B-broad-inference",
              value: v.placedBand as Band,
              provenance: ref("decision.placedBand"),
            }
          : absent(
              "Reading confirmation fields disagree.",
              ref("decision.spectrum"),
              "unsupported",
            );
        out.wordReading = measured(
          {
            band: x.wordBand as Band,
            step: x.wordStep,
            label: x.wordLabel,
            sample: x.wordSample ?? null,
          },
          ref("decision.spectrum"),
          x.wordStep === null ? "provisional" : "confirmed",
        );
        out.independentReading = consistent
          ? {
              status: x.readingBand === null ? "provisional" : "confirmed",
              support: "B-broad-inference",
              value: {
                band: x.readingBand as Band | null,
                supportedSinglePassageBand: (x.supportedReadingBand ?? null) as Band | null,
              },
              provenance: ref("decision.spectrum"),
            }
          : absent(
              "Reading confirmation fields disagree.",
              ref("decision.spectrum"),
              "unsupported",
            );
        out.oralBlending = counts(x.oralBlending, ref("decision.spectrum.oralBlending"));
        if (x.readingSamples?.length)
          out.readingSamples = measured(x.readingSamples, ref("decision.spectrum.readingSamples"));
        if (x.languageByBand.some((c) => c.total > 0))
          out.listening = measured(
            { supportedBand: x.languageBand as Band | null, byBand: x.languageByBand },
            ref("decision.spectrum.languageByBand"),
            x.languageBand === null ? "provisional" : "confirmed",
          );
        const raw = rawEvidence.safeParse(p.evidence);
        if (raw.success && raw.data.evidenceVersion === 4 && raw.data.spectrum) {
          const seen = new Set<string>();
          let lettersCorrect = 0,
            lettersTotal = 0;
          for (const r of raw.data.spectrum.words) {
            const step = WORD_STEPS.findIndex((s, i) =>
              s.words.some((_, j) => wordItemId(i, j) === r.itemId),
            );
            if (step < 0 || seen.has(r.itemId)) {
              out.issues.push("unknown-or-duplicate-word-item");
              continue;
            }
            seen.add(r.itemId);
            if (step === 0) {
              lettersTotal++;
              if (r.correct) lettersCorrect++;
            }
            out.standardObservations.push({
              standardId: WORD_STEPS[step].standard,
              modality: "word-probe",
              itemId: r.itemId,
              correct: r.correct,
              standardAttribution: "current-authored-bank-unverified-for-history",
              provenance: ref(`evidence.spectrum.words.${r.itemId}`)[0],
              interpretation: "sample-response-only",
            });
          }
          out.letterSounds = counts(
            { correct: lettersCorrect, total: lettersTotal },
            ref("evidence.spectrum.words"),
          );
          for (const r of raw.data.spectrum.language) {
            const item = languageItems.find((i) => i.id === r.itemId);
            if (
              !item ||
              seen.has(r.itemId) ||
              (r.choiceId !== "__pass" && !item.options.some((o) => o.id === r.choiceId))
            ) {
              out.issues.push("unknown-or-duplicate-listening-item");
              continue;
            }
            seen.add(r.itemId);
            // No historical bank revision/key was persisted. Keep the chosen ID;
            // do NOT rescore old answers using today's key. Counts above come
            // from the saved decision and remain authoritative for this adapter.
            out.standardObservations.push({
              standardId: item.standard,
              modality: "listening-supported",
              itemId: item.id,
              choiceId: r.choiceId,
              correct: null,
              standardAttribution: "current-authored-bank-unverified-for-history",
              provenance: ref(`evidence.spectrum.language.${item.id}`)[0],
              interpretation: "sample-response-only",
            });
          }
          if (out.standardObservations.length)
            out.issues.push("historical-item-bank-version-not-persisted");
        } else {
          out.issues.push(
            p.evidence == null ? "raw-item-evidence-unavailable" : "raw-item-evidence-unsupported",
          );
        }
      } else {
        // Historical v3 decisions remain useful as recorded starting recommendations.
        // They did not use v4's paired-text confirmation; never upgrade them to it.
        out.instructionalEntry = {
          status: "provisional",
          support: "B-broad-inference",
          value: v.placedBand as Band,
          provenance: ref("decision.placedBand"),
        };
        out.independentReading = absent(
          "Historical placement does not establish v4 paired-passage confirmation.",
          ref("decision"),
          "unsupported",
        );
        out.letterSounds = counts(
          v.foundations?.letterSounds,
          ref("decision.foundations.letterSounds"),
        );
        out.oralBlending = counts(v.foundations?.blending, ref("decision.foundations.blending"));
        out.issues.push("historical-placement-preserved-without-rescoring");
        if (v.decoding?.level != null) {
          out.wordReading =
            v.decoding.level <= 4
              ? {
                  status: "provisional",
                  support: "B-broad-inference",
                  value: {
                    band: v.decoding.level as Band,
                    step: null,
                    label: "Historical word-list result",
                    sample: null,
                  },
                  provenance: ref("decision.decoding.level"),
                }
              : absent(
                  "Historical ceiling is outside the K–4 band contract.",
                  ref("decision.decoding.level"),
                  "unsupported",
                );
        }
      }
    }
    if (input.enrollmentBand !== null && input.enrollmentBand !== p.enrolled)
      out.issues.push("enrollment-changed-since-placement");
  } else if (input.legacyAssessment) {
    const a = input.legacyAssessment;
    out.instructionalEntry = absent(
      "Legacy percentage dimensions are not spectrum bands; no automatic conversion is approved.",
      [{ source: "assessments", locator: a.id, version: a.completed_at }],
      "unsupported",
    );
    out.issues.push("legacy-assessment-requires-explicit-mapping");
  }
  const known = new Set(input.knownStandardIds);
  const completions: PreviousCompletion[] = [];
  for (const row of input.progress?.practice ?? []) {
    if (!known.has(row.standard_id)) {
      out.issues.push(`unknown-progress-standard:${row.standard_id}`);
      continue;
    }
    if (Number.isFinite(row.questions_correct) && row.questions_correct >= 3)
      completions.push({
        standardId: row.standard_id,
        source: "practice_results",
        sourceId: row.id,
        completedAt: row.completed_at,
        basis: "existing-journey-completion-rule",
        mastery: "not-established",
      });
  }
  for (const row of input.progress?.sections ?? []) {
    if (!known.has(row.lesson_id)) {
      out.issues.push(`unresolved-progress-lesson:${row.lesson_id}`);
      continue;
    }
    if (row.section === "practice" && Number.isFinite(row.score) && row.score >= 60)
      completions.push({
        standardId: row.lesson_id,
        source: "lessons_progress",
        sourceId: row.id,
        completedAt: row.completed_at,
        basis: "existing-journey-completion-rule",
        mastery: "not-established",
      });
  }
  out.previousCompletions = completions;
  for (const a of input.progress?.answers ?? []) {
    if (!known.has(a.standard_id)) {
      out.issues.push(`unknown-practice-standard:${a.standard_id}`);
      continue;
    }
    out.standardObservations.push({
      standardId: a.standard_id,
      modality: "practice",
      itemId: a.question_id,
      correct: a.was_correct,
      standardAttribution: "recorded-with-response",
      provenance: { source: "practice_answers", locator: a.id, version: a.answered_at },
      interpretation: "sample-response-only",
    });
  }
  out.issues = [...new Set(out.issues)];
  return out;
}
