import type { CurriculumRelease } from "../release";
import type { InstructionalTargetMapping } from "@/lib/journey/instructional-mappings";
import type { EvidenceSupport } from "@/lib/journey/evidence-contract";
import type { JourneyReason } from "@/lib/journey/planner-contract";

export type PilotRule = {
  id: string;
  assessmentEvidence: string;
  evidenceStrength: EvidenceSupport;
  mapping: InstructionalTargetMapping | null;
  reasonCategory: JourneyReason["category"] | null;
  parentExplanation: string;
  curriculumApprovalRequired: true;
  effect: "review-entry" | "review-followup" | "hold" | "unsupported";
};
const mapping = (
  id: string,
  observation: InstructionalTargetMapping["observation"],
  requirement: string,
): InstructionalTargetMapping => ({
  id,
  version: "g1-u1-rules-v1",
  observation,
  support: "B-broad-inference",
  ruleId: id,
  minimumEvidenceDescription: requirement,
  target: { standardIds: ["RF.1.1a"], unitIds: ["G1.U1"], lessonIds: ["sentence-shapes"] },
  provenance: [
    { source: "docs/UNIT_ROADMAP.md", locator: "G1·U1", version: "pending-version-bound-review" },
    {
      source: "lib/placement/spectrum-decision.ts",
      locator: "saved placedBand and readingStatus",
      version: "spectrum-profile-v3",
    },
  ],
  review: { status: "pending" },
});

/** Proposed policy only. These entries are never added to APPROVED_INSTRUCTIONAL_MAPPINGS. */
export const PILOT_RULES: readonly PilotRule[] = [
  {
    id: "g1-u1-confirmed-entry",
    assessmentEvidence:
      "Saved confirmed independent-reading band and instructional entry are both Grade 1.",
    evidenceStrength: "B-broad-inference",
    mapping: mapping(
      "g1-u1-confirmed-entry",
      "independentReading",
      "Confirmed Grade 1 independent-reading result; no individual prerequisite or standard mastery claim.",
    ),
    reasonCategory: "assessment-selected-starting-unit",
    parentExplanation:
      "The assessment supports Grade 1 reading instruction. This proposed unit begins with sentence features and sounds, then develops reading and word meaning.",
    curriculumApprovalRequired: true,
    effect: "review-entry",
  },
  {
    id: "g1-u1-provisional-followup",
    assessmentEvidence:
      "Saved instructional entry is Grade 1 but independent reading is not confirmed.",
    evidenceStrength: "B-broad-inference",
    mapping: mapping(
      "g1-u1-provisional-followup",
      "independentReading",
      "Saved Grade 1 provisional entry; adult review before selecting this unit.",
    ),
    reasonCategory: "provisional-follow-up",
    parentExplanation:
      "Grade 1 is a provisional starting point. Guided work may help confirm where instruction should begin.",
    curriculumApprovalRequired: true,
    effect: "review-followup",
  },
  {
    id: "g1-u1-blending-followup",
    assessmentEvidence:
      "The three recorded oral-blending responses can inform review; they do not test the full Grade 1 consonant-blend standard.",
    evidenceStrength: "B-broad-inference",
    mapping: {
      ...mapping(
        "g1-u1-blending-followup",
        "oralBlending",
        "Review all available blending responses alongside word and passage evidence; no automatic failure-count threshold.",
      ),
      target: { standardIds: ["RF.1.2b"], unitIds: ["G1.U1"], lessonIds: ["blend-builders"] },
    },
    reasonCategory: "provisional-follow-up",
    parentExplanation:
      "The sound-blending sample is one reason to review whether supported blending practice would be useful.",
    curriculumApprovalRequired: true,
    effect: "review-followup",
  },
  {
    id: "g1-u1-listening-followup",
    assessmentEvidence:
      "Saved supported-language totals and authored RL.1.1, RL.1.2, RI.1.1, RI.1.2 item associations; historical item correctness is not reconstructed.",
    evidenceStrength: "B-broad-inference",
    mapping: {
      ...mapping(
        "g1-u1-listening-followup",
        "listening",
        "Review available supported-language samples alongside independent reading. Do not infer a standard deficit from an item association.",
      ),
      target: {
        standardIds: ["RL.1.1", "RL.1.2", "RI.1.1", "RI.1.2"],
        unitIds: ["G1.U1"],
        lessonIds: ["ask-it-find-it", "story-message", "fact-questions", "topic-spotter"],
      },
    },
    reasonCategory: "provisional-follow-up",
    parentExplanation:
      "The listening sample can help us consider guided story and information work. It does not establish independent reading at that level.",
    curriculumApprovalRequired: true,
    effect: "review-followup",
  },
  {
    id: "g1-u1-comprehension-followup",
    assessmentEvidence:
      "Saved passage question counts show sampled understanding; no complete approved question-to-standard mapping exists.",
    evidenceStrength: "B-broad-inference",
    mapping: {
      ...mapping(
        "g1-u1-comprehension-followup",
        "comprehension",
        "A specialist reviews the passage sample as a whole. Exact lesson selection is not supported by a single missed question.",
      ),
      target: {
        standardIds: ["RL.1.1", "RL.1.2", "RI.1.1", "RI.1.2"],
        unitIds: ["G1.U1"],
        lessonIds: ["ask-it-find-it", "story-message", "fact-questions", "topic-spotter"],
      },
    },
    reasonCategory: "provisional-follow-up",
    parentExplanation:
      "Guided reading and discussion may help clarify the next instructional step.",
    curriculumApprovalRequired: true,
    effect: "review-followup",
  },
  {
    id: "g1-u1-letter-word-review",
    assessmentEvidence:
      "Sampled receptive letter-sound responses and mixed word-set results can inform earlier-area review; Grade 1 word tags are RF.1.3, not the pilot's RF.1.2b or RF.1.2c.",
    evidenceStrength: "B-broad-inference",
    mapping: null,
    reasonCategory: "provisional-follow-up",
    parentExplanation:
      "Review sound and word samples together before selecting foundational practice. No specific earlier lesson has been assigned.",
    curriculumApprovalRequired: true,
    effect: "hold",
  },
  {
    id: "g1-u1-earlier-review",
    assessmentEvidence:
      "Saved entry is below Grade 1, or available evidence does not support Grade 1 entry.",
    evidenceStrength: "B-broad-inference",
    mapping: null,
    reasonCategory: "provisional-follow-up",
    parentExplanation:
      "Review an earlier starting area before assigning this unit. No particular earlier lesson has been prescribed.",
    curriculumApprovalRequired: true,
    effect: "hold",
  },
  {
    id: "g1-u1-above-review",
    assessmentEvidence: "Saved confirmed reading supports a band above Grade 1.",
    evidenceStrength: "B-broad-inference",
    mapping: null,
    reasonCategory: null,
    parentExplanation:
      "The reading sample supports considering a later starting area. It does not establish mastery of every skill in this unit.",
    curriculumApprovalRequired: true,
    effect: "hold",
  },
  {
    id: "g1-u1-no-automatic-skip",
    assessmentEvidence:
      "Word or reading band alone does not establish mastery of this mixed-domain unit.",
    evidenceStrength: "C-unsupported",
    mapping: null,
    reasonCategory: null,
    parentExplanation:
      "There is not enough evidence to mark this unit mastered or automatically skipped.",
    curriculumApprovalRequired: true,
    effect: "unsupported",
  },
  {
    id: "g1-u1-no-specific-deficiency",
    assessmentEvidence:
      "A missed word, listening answer, or reading-rate number alone cannot establish a specific phonics or comprehension deficiency.",
    evidenceStrength: "C-unsupported",
    mapping: null,
    reasonCategory: null,
    parentExplanation: "A single response is a sample, not a diagnosis of a specific skill gap.",
    curriculumApprovalRequired: true,
    effect: "unsupported",
  },
];

/** Bind proposed mappings to the exact unit edition under review. */
export function pilotRulesForRelease(release: CurriculumRelease): PilotRule[] {
  const unit = release.units.find((u) => u.id === "G1.U1");
  if (!unit) throw new Error("Missing pilot unit");
  return structuredClone(PILOT_RULES).map((rule) => ({
    ...rule,
    mapping: rule.mapping
      ? {
          ...rule.mapping,
          provenance: [{ ...unit.source }, ...rule.mapping.provenance.slice(1)],
        }
      : null,
  }));
}
