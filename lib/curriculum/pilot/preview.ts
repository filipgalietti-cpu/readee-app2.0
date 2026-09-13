import {
  lessonPlanningEligibility,
  validateCurriculumRelease,
  type CurriculumInventory,
  type CurriculumRelease,
} from "../release";
import type { LearnerEvidence, PreviousCompletion } from "@/lib/journey/evidence-contract";
import type { PlannedJourneyLesson } from "@/lib/journey/planner-contract";
import { validateInstructionalMappings } from "@/lib/journey/instructional-mappings";
import { PILOT_RULES, pilotRulesForRelease, type PilotRule } from "./rules";

export type PilotCase =
  | "entry-review"
  | "earlier-review"
  | "above-review"
  | "provisional-review"
  | "insufficient-evidence"
  | "continue-credit"
  | "completed-credit";
export type PilotPreviewInput = {
  learnerEvidence: LearnerEvidence;
  curriculumRelease: CurriculumRelease;
  inventory: CurriculumInventory;
  rules?: readonly PilotRule[];
};
export type PilotPreview = {
  mode: "curriculum-review-only";
  productionEligible: false;
  case: PilotCase;
  structuralIssues: string[];
  approvalBlockers: string[];
  proposedLessons: (PlannedJourneyLesson & {
    completed: boolean;
    credit: PreviousCompletion[];
    mastery: "not-established";
  })[];
  nextProposedLessonId: string | null;
  checkpoint: { id: string; status: "awaiting-threshold-and-persistence-review" } | null;
};

export function validatePilotRules(
  rules: readonly PilotRule[],
  release: CurriculumRelease,
  inventory: CurriculumInventory,
): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();
  for (const rule of rules) {
    if (ids.has(rule.id)) issues.push(`duplicate-rule:${rule.id}`);
    ids.add(rule.id);
    if (
      rule.evidenceStrength === "C-unsupported" &&
      (rule.mapping ||
        rule.reasonCategory === "measured-instructional-need" ||
        rule.effect !== "unsupported")
    )
      issues.push(`unsupported-prescription:${rule.id}`);
    if (
      rule.reasonCategory === "measured-instructional-need" &&
      rule.evidenceStrength !== "A-directly-measured"
    )
      issues.push(`inference-as-measured-need:${rule.id}`);
    if (rule.mapping) {
      if (
        rule.mapping.id !== rule.id ||
        !rule.parentExplanation.trim() ||
        !rule.curriculumApprovalRequired
      )
        issues.push(`invalid-rule-contract:${rule.id}`);
      issues.push(
        ...validateInstructionalMappings([rule.mapping], release, inventory.standardIds, []).filter(
          (i) => !i.startsWith("mapping-review-required:") && !i.startsWith("unimplemented-rule:"),
        ),
      );
      if (rule.mapping.support !== rule.evidenceStrength)
        issues.push(`mapping-strength-mismatch:${rule.id}`);
    }
    const known = PILOT_RULES.find((candidate) => candidate.id === rule.id);
    if (!known) issues.push(`unknown-pilot-rule:${rule.id}`);
    else if (
      known.reasonCategory !== rule.reasonCategory ||
      known.effect !== rule.effect ||
      known.evidenceStrength !== rule.evidenceStrength ||
      JSON.stringify(known.mapping?.target) !== JSON.stringify(rule.mapping?.target)
    )
      issues.push(`unreviewed-rule-change:${rule.id}`);
  }
  for (const id of ["g1-u1-confirmed-entry", "g1-u1-provisional-followup"])
    if (!rules.some((r) => r.id === id && r.mapping && r.effect.startsWith("review-")))
      issues.push(`missing-entry-rule:${id}`);
  return issues;
}

/** An isolated review projection for ONE unit. Always unreleased, including with approved fixtures.
 * This is not imported by /journey, does not prescribe earlier/later units, and never writes data.
 */
export function previewPilot(input: PilotPreviewInput): PilotPreview {
  const { learnerEvidence: evidence, curriculumRelease: release, inventory } = input;
  const rules = input.rules ?? pilotRulesForRelease(release);
  const structuralIssues = [
    ...validateCurriculumRelease(release, inventory).map((i) => `${i.code}:${i.reference}`),
    ...validatePilotRules(rules, release, inventory),
  ];
  if (
    release.units.length !== 1 ||
    release.units[0]?.id !== "G1.U1" ||
    release.lessons.length !== 10
  )
    structuralIssues.push("outside-pilot-scope");
  const approvalBlockers = [
    ...new Set([
      "integration-artifact-not-production",
      ...release.lessons.flatMap(
        (l) => lessonPlanningEligibility(release, inventory, l.lessonId).blockers,
      ),
      ...validateInstructionalMappings(
        rules.flatMap((r) => (r.mapping ? [r.mapping] : [])),
        release,
        inventory.standardIds,
        [],
      ),
    ]),
  ];
  const out: PilotPreview = {
    mode: "curriculum-review-only",
    productionEligible: false,
    case: "insufficient-evidence",
    structuralIssues,
    approvalBlockers,
    proposedLessons: [],
    nextProposedLessonId: null,
    checkpoint: null,
  };
  if (structuralIssues.length) return out;
  const ordered = [...release.lessons].sort((a, b) => a.position - b.position);
  const creditFor = (standards: string[]) =>
    evidence.previousCompletions.filter((c) => standards.includes(c.standardId));
  const allCompleted = ordered.every((l) => creditFor(l.coverage.standardIds).length > 0);
  const anyCompleted = ordered.some((l) => creditFor(l.coverage.standardIds).length > 0);
  const entry = evidence.instructionalEntry;
  if (allCompleted) out.case = "completed-credit";
  else if (!("value" in entry)) out.case = "insufficient-evidence";
  else if (entry.value < 1) out.case = "earlier-review";
  else if (entry.value > 1) out.case = "above-review";
  else if (
    entry.status === "provisional" ||
    evidence.independentReading.status !== "confirmed" ||
    evidence.independentReading.value.band !== 1
  )
    out.case = "provisional-review";
  else out.case = anyCompleted ? "continue-credit" : "entry-review";
  const showCandidateSequence = [
    "entry-review",
    "provisional-review",
    "continue-credit",
    "completed-credit",
  ].includes(out.case);
  const unit = release.units[0];
  const entryRule = rules.find(
    (r) =>
      r.id ===
      (out.case === "provisional-review" ? "g1-u1-provisional-followup" : "g1-u1-confirmed-entry"),
  )!;
  out.proposedLessons = ordered
    .filter((l) => showCandidateSequence || creditFor(l.coverage.standardIds).length > 0)
    .map((l) => {
      const credit = creditFor(l.coverage.standardIds);
      const isEntry = l.position === 1 && credit.length === 0 && out.case !== "completed-credit";
      return {
        nodeId: `${release.releaseId}:${unit.id}:${l.lessonId}`,
        lessonId: l.lessonId,
        slug: l.slug,
        contentVersion: l.contentVersion,
        unitId: l.unitId,
        standardIds: [...l.coverage.standardIds],
        completed: credit.length > 0,
        credit,
        mastery: "not-established" as const,
        reason: isEntry
          ? {
              category: entryRule.reasonCategory as
                | "assessment-selected-starting-unit"
                | "provisional-follow-up",
              evidence: entry.provenance,
              mappingId: entryRule.mapping!.id,
              mappingVersion: entryRule.mapping!.version,
            }
          : { category: "normal-curriculum-sequence" as const, curriculumSource: unit.source },
        parentExplanation: credit.length
          ? "This lesson retains your child's recorded completion credit. Completion does not establish mastery."
          : isEntry
            ? entryRule.parentExplanation
            : `This is the next lesson in the proposed unit sequence: ${l.objective}`,
        explanationTemplateVersion: "g1-u1-review-copy-v1",
        ruleVersion: "g1-u1-review-v1",
      };
    });
  if (showCandidateSequence)
    out.nextProposedLessonId = out.proposedLessons.find((l) => !l.completed)?.lessonId ?? null;
  if (allCompleted)
    out.checkpoint = {
      id: unit.checkpointIds[0],
      status: "awaiting-threshold-and-persistence-review",
    };
  return out;
}
