import type { CurriculumRelease, SourceReference } from "@/lib/curriculum/release";
import type { EvidenceSupport } from "./evidence-contract";

/** Capability policy, not an approved mapping from a child to a lesson. */
export const OBSERVATION_CAPABILITIES = {
  letterSounds: {
    directlyMeasured:
      "Correct responses to sampled sound-to-letter choices; receptive recognition.",
    broadInference: "Consider supported letter-sound work after review of the sample.",
    unsupported: "Complete alphabet mastery, productive sound mastery, or a phonics diagnosis.",
  },
  wordReading: {
    directlyMeasured: "Success on the named mixed word set under the existing assessment policy.",
    broadInference: "Starting area for word-reading instruction at the observed band.",
    unsupported: "A specific vowel-team, affix, or root deficiency inferred from the band.",
  },
  oralBlending: {
    directlyMeasured: "Success combining the three sampled spoken sound sequences.",
    broadInference: "Consider more supported oral blending practice.",
    unsupported: "Mastery of segmentation, manipulation, or all phonemic awareness.",
  },
  independentReading: {
    directlyMeasured: "Accuracy, coverage, and meaning responses on sampled connected text.",
    broadInference: "Confirmed or provisional instructional starting band from the saved decision.",
    unsupported: "National grade equivalent, or failure inferred from an unmeasured passage.",
  },
  comprehension: {
    directlyMeasured: "Correct counts on questions about the sampled passages.",
    broadInference: "Guided reading and discussion when the saved result needs follow-up.",
    unsupported: "Specific RL/RI standard mastery without authored question-to-standard mapping.",
  },
  listening: {
    directlyMeasured: "Responses to authored standard-tagged questions with read-aloud support.",
    broadInference: "Supported discussion work at the evidenced language band.",
    unsupported: "Independent reading at the listening band, or standard mastery from one item.",
  },
  fluency: {
    directlyMeasured: "Saved rate and accuracy on a Readee reading sample.",
    broadInference:
      "Descriptive evidence for a specialist to consider with other reading evidence.",
    unsupported:
      "A national percentile, prosody diagnosis, automatic deficiency, or catch-up date.",
  },
} as const;

export type ObservationKind = keyof typeof OBSERVATION_CAPABILITIES;
export type InstructionalTargetMapping = {
  id: string;
  version: string;
  observation: ObservationKind;
  support: Exclude<EvidenceSupport, "C-unsupported">;
  // These describe the exact reviewed rule; an implementation must be separately registered.
  ruleId: string;
  minimumEvidenceDescription: string;
  target: { standardIds: string[]; unitIds: string[]; lessonIds: string[] };
  provenance: SourceReference[];
  review: { status: "pending" | "approved" | "rejected"; reference?: SourceReference };
};

/** Deliberately empty. Authored tags identify observations, not prescriptions. */
export const APPROVED_INSTRUCTIONAL_MAPPINGS: readonly InstructionalTargetMapping[] = [];

/** Validate reviewed declarations, not evaluate a child or select a lesson. */
export function validateInstructionalMappings(
  mappings: readonly InstructionalTargetMapping[],
  release: CurriculumRelease,
  knownStandards: readonly string[],
  implementedRuleIds: readonly string[],
): string[] {
  const issues: string[] = [],
    seen = new Set<string>();
  for (const m of mappings) {
    if (seen.has(m.id)) issues.push(`duplicate-mapping:${m.id}`);
    seen.add(m.id);
    if (!m.version || !m.minimumEvidenceDescription.trim() || !m.provenance.length)
      issues.push(`missing-mapping-provenance:${m.id}`);
    if (
      !Object.hasOwn(OBSERVATION_CAPABILITIES, m.observation) ||
      !["A-directly-measured", "B-broad-inference"].includes(m.support)
    )
      issues.push(`unsupported-observation:${m.id}`);
    if (m.review.status !== "approved" || !m.review.reference)
      issues.push(`mapping-review-required:${m.id}`);
    if (!implementedRuleIds.includes(m.ruleId)) issues.push(`unimplemented-rule:${m.id}`);
    if (!m.target.standardIds.length && !m.target.unitIds.length && !m.target.lessonIds.length)
      issues.push(`empty-target:${m.id}`);
    for (const id of m.target.standardIds)
      if (!knownStandards.includes(id)) issues.push(`unknown-target-standard:${id}`);
    for (const id of m.target.unitIds)
      if (!release.units.some((u) => u.id === id)) issues.push(`unknown-target-unit:${id}`);
    for (const id of m.target.lessonIds)
      if (!release.lessons.some((l) => l.lessonId === id))
        issues.push(`unknown-target-lesson:${id}`);
  }
  return issues;
}
