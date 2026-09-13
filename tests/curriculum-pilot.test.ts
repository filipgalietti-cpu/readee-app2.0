import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import snapshot from "@/docs/curriculum-pilot/g1-u1/package.json";
import manifest from "@/docs/curriculum-pilot/g1-u1/release.json";
import { lessonPlanningEligibility, validateCurriculumRelease } from "@/lib/curriculum/release";
import { previewPilot, validatePilotRules } from "@/lib/curriculum/pilot/preview";
import { pilotRulesForRelease } from "@/lib/curriculum/pilot/rules";
import { normalizeLearnerEvidence } from "@/lib/journey/learner-evidence";
import {
  pilotFixture,
  pilotFixtureNames,
  pilotInventory,
  pilotRelease,
} from "./fixtures/curriculum-pilot";

const orderedIds = [
  "sentence-shapes",
  "blend-builders",
  "sound-spotters",
  "ask-it-find-it",
  "story-message",
  "fact-questions",
  "topic-spotter",
  "word-toolbox",
  "sentence-clues",
  "prefix-power",
];
const standards = [
  "RF.1.1a",
  "RF.1.2b",
  "RF.1.2c",
  "RL.1.1",
  "RL.1.2",
  "RI.1.1",
  "RI.1.2",
  "L.1.4",
  "L.1.4a",
  "L.1.4b",
];

describe("Astra G1.U1 integration artifact", () => {
  it("validates exact released-artifact identities, versions, and explicit single-standard coverage", () => {
    expect(manifest).toEqual(snapshot.release);
    expect(validateCurriculumRelease(pilotRelease, pilotInventory)).toEqual([]);
    expect(pilotRelease.lessons.map((l) => l.lessonId)).toEqual(orderedIds);
    expect(pilotRelease.lessons.flatMap((l) => l.coverage.standardIds)).toEqual(standards);
    expect(pilotRelease.lessons.every((l) => l.coverage.kind === "single-standard")).toBe(true);
    expect(pilotRelease.units[0].domains).toEqual(["RF", "RL", "RI", "L"]);
    for (const l of pilotRelease.lessons) {
      expect(snapshot.artifacts.find((a) => a.id === l.lessonId)).toMatchObject({
        contentVersion: l.contentVersion,
        position: l.position,
        standard: l.coverage.standardIds[0],
      });
      expect(l.contentVersion).toMatch(/^sha256:[a-f0-9]{64}$/);
    }
  });

  it("retains approval and QA blockers independently of source existence", () => {
    expect(snapshot.technicalReview.missingFiles.length).toBeGreaterThan(0);
    for (const l of pilotRelease.lessons) {
      expect(l.curriculumReview.status).toBe("pending");
      expect(l.publication.status).toBe("draft");
      const eligibility = lessonPlanningEligibility(pilotRelease, pilotInventory, l.lessonId);
      expect(eligibility.eligible).toBe(false);
      expect(eligibility.blockers).toEqual(
        expect.arrayContaining([
          "curriculum-approval-required",
          "technical-qa-required",
          "production-release-required",
        ]),
      );
    }
    const preview = previewPilot(pilotFixture("appropriate"));
    expect(preview.productionEligible).toBe(false);
    expect(preview.approvalBlockers).toContain("mapping-review-required:g1-u1-confirmed-entry");
  });

  it("does not activate production even with synthetic approvals", () => {
    const input = pilotFixture("appropriate");
    const reference = (version: string) => ({
      source: "synthetic-test-only",
      locator: "not-a-real-approval",
      version,
    });
    for (const unit of input.curriculumRelease.units)
      unit.curriculumReview = {
        status: "approved",
        version: unit.version,
        reference: reference(unit.version),
      };
    for (const item of [
      ...input.curriculumRelease.lessons,
      ...input.curriculumRelease.checkpoints,
    ]) {
      item.curriculumReview = {
        status: "approved",
        version: item.contentVersion,
        reference: reference(item.contentVersion),
      };
      item.technicalQa = {
        status: "passed",
        contentVersion: item.contentVersion,
        reference: reference(item.contentVersion),
      };
      item.publication = {
        status: "released",
        contentVersion: item.contentVersion,
        reference: reference(item.contentVersion),
      };
    }
    for (const lesson of input.curriculumRelease.lessons)
      lesson.coverage.curriculumReview = {
        status: "approved",
        version: lesson.coverage.version,
        reference: reference(lesson.coverage.version),
      };
    expect(
      lessonPlanningEligibility(input.curriculumRelease, input.inventory, "sentence-shapes")
        .eligible,
    ).toBe(true);
    const rules = pilotRulesForRelease(input.curriculumRelease);
    for (const rule of rules)
      if (rule.mapping)
        rule.mapping.review = { status: "approved", reference: reference(rule.mapping.version) };
    const result = previewPilot({ ...input, rules });
    expect(result.productionEligible).toBe(false);
    expect(result.approvalBlockers).toContain("integration-artifact-not-production");
    expect(result.approvalBlockers).toContain("unimplemented-rule:g1-u1-confirmed-entry");
    expect(pilotRelease.lessons[0].curriculumReview.status).toBe("pending");
  });

  it.each(pilotFixtureNames)("uses a schema-valid, server-replayable %s child", (name) => {
    const input = pilotFixture(name);
    expect(input.submission.evidenceVersion).toBe(4);
    const result = previewPilot(input);
    expect(result.structuralIssues).toEqual([]);
    expect(result.case).toBe(
      {
        appropriate: "entry-review",
        below: "earlier-review",
        above: "above-review",
        provisional: "provisional-review",
        partial: "continue-credit",
        completed: "completed-credit",
        "above-enrollment": "entry-review",
      }[name],
    );
    expect(input.learnerEvidence.standardMastery.status).toBe("unsupported");
    expect(result.proposedLessons.every((l) => l.mastery === "not-established")).toBe(true);
  });

  it("does not clamp a confirmed reader to enrollment", () => {
    const input = pilotFixture("above-enrollment");
    expect(input.learnerEvidence.enrollment).toMatchObject({ value: 0 });
    expect(input.learnerEvidence.independentReading).toMatchObject({
      status: "confirmed",
      value: { band: 1 },
    });
    expect(previewPilot(input).nextProposedLessonId).toBe("sentence-shapes");
  });

  it("keeps provisional, missing, and listening evidence separate", () => {
    const input = pilotFixture("provisional");
    expect(input.learnerEvidence.instructionalEntry.status).toBe("provisional");
    expect(previewPilot(input).proposedLessons[0].reason.category).toBe("provisional-follow-up");
    const absent = normalizeLearnerEvidence({ ...input.source, placement: null });
    expect(previewPilot({ ...input, learnerEvidence: absent })).toMatchObject({
      case: "insufficient-evidence",
      proposedLessons: [],
      nextProposedLessonId: null,
    });
    const strongerListening = structuredClone(input);
    if (strongerListening.learnerEvidence.listening.status === "confirmed")
      strongerListening.learnerEvidence.listening.value.supportedBand = 4;
    expect(previewPilot(strongerListening).case).toBe("provisional-review");
  });

  it("preserves historical partial/full completion without redoing or inventing mastery", () => {
    const input = pilotFixture("partial"),
      partial = previewPilot(input);
    expect(partial.proposedLessons.filter((l) => l.completed).map((l) => l.lessonId)).toEqual(
      orderedIds.slice(0, 3),
    );
    expect(partial.nextProposedLessonId).toBe("ask-it-find-it");
    expect(partial.proposedLessons.flatMap((l) => l.credit)).toEqual(
      expect.arrayContaining(input.learnerEvidence.previousCompletions),
    );
    const full = pilotFixture("completed");
    const result = previewPilot(full);
    expect(result.nextProposedLessonId).toBeNull();
    expect(result.proposedLessons.filter((l) => l.completed)).toHaveLength(10);
    expect(result.checkpoint).toEqual({
      id: "g1-unit-1-exam",
      status: "awaiting-threshold-and-persistence-review",
    });
    full.learnerEvidence = normalizeLearnerEvidence({ ...full.source, placement: null });
    expect(previewPilot(full).case).toBe("completed-credit");
  });

  it("preserves completion credit even when new evidence suggests an earlier area", () => {
    const input = pilotFixture("below");
    input.learnerEvidence.previousCompletions =
      pilotFixture("partial").learnerEvidence.previousCompletions;
    const result = previewPilot(input);
    expect(result.case).toBe("earlier-review");
    expect(result.proposedLessons).toHaveLength(3);
    expect(result.proposedLessons.every((l) => l.completed)).toBe(true);
    expect(result.nextProposedLessonId).toBeNull();
  });

  it("orders deterministically, ignores entitlements, and leaves input unchanged", () => {
    const input = pilotFixture("appropriate"),
      original = structuredClone(input);
    const free = previewPilot({ ...input, entitlement: "free" } as typeof input);
    expect(previewPilot({ ...input, entitlement: "Readee+" } as typeof input)).toEqual(free);
    expect(previewPilot(input)).toEqual(free);
    input.curriculumRelease.lessons.reverse();
    expect(previewPilot(input)).toEqual(free);
    input.curriculumRelease.lessons.reverse();
    expect(input).toEqual(original);
  });

  it("rejects duplicate lessons, unknown standards, unknown versions, and unresolved ordering", () => {
    const invalid = pilotFixture("appropriate");
    invalid.curriculumRelease.lessons[0].coverage.standardIds = ["RF.1.UNKNOWN"];
    invalid.curriculumRelease.lessons[1].position = 1;
    invalid.curriculumRelease.lessons[2].contentVersion = "unreviewed";
    invalid.curriculumRelease.lessons.push(invalid.curriculumRelease.lessons[0]);
    const result = previewPilot(invalid);
    expect(result.structuralIssues.join(" ")).toContain("unknown-standard");
    expect(result.structuralIssues.join(" ")).toContain("duplicate-lesson-id");
    expect(result.structuralIssues.join(" ")).toContain("non-contiguous-unit-order");
    expect(result.proposedLessons).toEqual([]);
  });

  it("rejects unresolved, changed, and unsupported prescriptions", () => {
    const rules = pilotRulesForRelease(pilotRelease);
    expect(validatePilotRules(rules, pilotRelease, pilotInventory)).toEqual([]);
    rules[0].mapping!.target.lessonIds = ["unknown-lesson"];
    rules[1].evidenceStrength = "C-unsupported";
    rules[1].reasonCategory = "measured-instructional-need";
    rules[2].reasonCategory = "measured-instructional-need";
    rules.push({ ...rules[0], id: "invented-rule" });
    const issues = validatePilotRules(rules, pilotRelease, pilotInventory).join(" ");
    expect(issues).toContain("unknown-target-lesson:unknown-lesson");
    expect(issues).toContain("unsupported-prescription");
    expect(issues).toContain("inference-as-measured-need");
    expect(issues).toContain("unknown-pilot-rule");
    expect(previewPilot({ ...pilotFixture("appropriate"), rules }).proposedLessons).toEqual([]);
  });

  it("explains every proposed lesson using evidence or the exact authored sequence", () => {
    const rules = pilotRulesForRelease(pilotRelease);
    for (const name of ["appropriate", "provisional", "partial"] as const) {
      const result = previewPilot(pilotFixture(name));
      expect(result.proposedLessons).toHaveLength(10);
      for (const l of result.proposedLessons) {
        expect(l.parentExplanation.length).toBeGreaterThan(20);
        expect(l.standardIds).toEqual(
          pilotRelease.lessons.find((r) => r.lessonId === l.lessonId)!.coverage.standardIds,
        );
        if (l.reason.category === "normal-curriculum-sequence")
          expect(l.reason.curriculumSource).toEqual(pilotRelease.units[0].source);
        else if ("mappingId" in l.reason) {
          const mappingId = l.reason.mappingId;
          const mapping = rules.find((r) => r.id === mappingId)?.mapping;
          expect(mapping?.review.status).toBe("pending");
          expect(mapping?.provenance[0]).toEqual(pilotRelease.units[0].source);
          expect(l.reason.evidence.length).toBeGreaterThan(0);
        } else throw new Error("Unexpected pilot lesson reason");
      }
    }
  });

  it("retains explicit checkpoint attribution without a fabricated pass threshold", () => {
    expect(snapshot.checkpoint.items).toHaveLength(12);
    expect(new Set(snapshot.checkpoint.items.map((i) => i.standardId))).toEqual(new Set(standards));
    expect(new Set(snapshot.checkpoint.items.map((i) => i.questionId)).size).toBe(12);
    expect(snapshot.checkpoint.threshold).toBeNull();
    expect(snapshot.checkpoint.persistence).toBe("not-connected-to-production");
    for (const item of snapshot.checkpoint.items)
      expect(snapshot.artifacts.find((a) => a.id === item.lessonId)).toMatchObject({
        quizId: item.sourceQuizId,
        standard: item.standardId,
      });
  });

  it("has no runtime AI/model, network, entitlement, or production-route dependency", () => {
    const visited = new Set<string>();
    function walk(relative: string) {
      const file = path.resolve(relative);
      if (visited.has(file)) return;
      visited.add(file);
      const source = fs.readFileSync(file, "utf8");
      expect(source).not.toMatch(
        /\b(fetch|XMLHttpRequest|generateText|generateObject|streamText)\s*\(/,
      );
      const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
      for (const node of ast.statements) {
        if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) continue;
        const spec = node.moduleSpecifier.text;
        expect(spec).not.toMatch(
          /openai|anthropic|google-genai|ai-sdk|entitlement|subscription|billing/,
        );
        if (node.importClause?.isTypeOnly || spec === "zod") continue;
        const base = spec.startsWith("@/") ? spec.slice(2) : path.resolve(path.dirname(file), spec);
        if (base.endsWith(".json")) continue;
        const resolved = [base, `${base}.ts`, `${base}/index.ts`].find(
          (p) => fs.existsSync(p) && fs.statSync(p).isFile(),
        );
        expect(resolved, `Unresolved runtime import ${spec}`).toBeTruthy();
        walk(resolved!);
      }
    }
    walk("lib/curriculum/pilot/preview.ts");
    walk("lib/journey/learner-evidence.ts");
    expect([...visited].some((f) => f.includes("/app/(protected)/"))).toBe(false);
  });
});
