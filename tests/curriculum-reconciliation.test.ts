import { describe, expect, it } from "vitest";
import path from "node:path";
import fs from "node:fs";
import ts from "typescript";
import {
  parseRoadmap,
  reconcileCurriculum,
  reconciliationCsv,
} from "@/scripts/curriculum-reconciliation";
import {
  APPROVED_INSTRUCTIONAL_MAPPINGS,
  OBSERVATION_CAPABILITIES,
  validateInstructionalMappings,
} from "@/lib/journey/instructional-mappings";
import catalog from "@/app/data/sample-lessons.json";
import type { CurriculumRelease } from "@/lib/curriculum/release";

const root = process.cwd();
describe("curriculum source reconciliation", () => {
  it("covers every catalog standard without collapsing multiple lesson identities", () => {
    const report = reconcileCurriculum(root);
    expect(
      new Set(report.rows.flatMap((r) => (r.catalogStandard ? [r.catalogStandard] : []))),
    ).toEqual(new Set(catalog.map((l) => l.standardId)));
    expect(report.summary.catalogStandards).toBe(201);
    expect(report.summary.duplicateLessonIds).toEqual([]);
    const ids = report.rows
      .filter((r) => r.catalogStandard === "RL.K.1")
      .map((r) => r.canonicalLessonId);
    expect(ids).toEqual(expect.arrayContaining(["reading-detective", "key-details"]));
    expect(
      report.rows.every((r) => !r.planningEligible && r.curriculumApproval === "unknown"),
    ).toBe(true);
  });
  it("surfaces documented combined coverage as review candidates, never exact aliases", () => {
    const report = reconcileCurriculum(root);
    const combined = report.rows.filter((r) => r.relationship === "documented-combined-candidate");
    expect(combined.map((r) => r.catalogStandard)).toEqual(["RF.K.1a", "RF.K.1b", "RF.K.1c"]);
    expect(
      combined.every(
        (r) => r.canonicalLessonId === "book-basics" && r.declaredStandards[0] === "RF.K.1",
      ),
    ).toBe(true);
    expect(combined.map((r) => r.positionWithinUnit)).toEqual([1, 2, 3]);
    expect(
      combined.every((r) => r.positionMeaning === "roadmap-standard-row-not-approved-lesson-order"),
    ).toBe(true);
  });
  it("does not infer a substandard from an unlisted parent in the roadmap", () => {
    expect(
      parseRoadmap("### K·U1\n| ☑ | RF.K.1 | Book Basics | teach |").map((r) => r.standard),
    ).toEqual(["RF.K.1"]);
  });
  it("is reproducible and quotes CSV safely", () => {
    const a = reconcileCurriculum(root),
      b = reconcileCurriculum(root);
    expect(a).toEqual(b);
    const row = { ...a.rows[0], objective: 'Read "this", then that.\nNext line.' };
    expect(reconciliationCsv([row])).toContain('"Read ""this"", then that.\nNext line."');
  });
  it("reports actual quiz associations without treating them as approved release metadata", () => {
    const row = reconcileCurriculum(root).rows.find((r) => r.canonicalLessonId === "key-details")!;
    expect(row.checkpoints).toContain("unit-1-exam");
    expect(row.planningEligible).toBe(false);
  });
});

describe("mapping and runtime dependency boundaries", () => {
  it("ships capabilities for seven observation types and no invented approved prescriptions", () => {
    expect(Object.keys(OBSERVATION_CAPABILITIES)).toHaveLength(7);
    expect(APPROVED_INSTRUCTIONAL_MAPPINGS).toEqual([]);
  });
  it("rejects unreviewed mappings and arbitrary targets/rules", () => {
    const release: CurriculumRelease = {
      schemaVersion: 1,
      releaseId: "fixture",
      catalogVersion: "c",
      registryVersion: "r",
      units: [],
      lessons: [],
      checkpoints: [],
    };
    const problems = validateInstructionalMappings(
      [
        {
          id: "m1",
          version: "v1",
          observation: "wordReading",
          support: "B-broad-inference",
          ruleId: "one-wrong-answer",
          minimumEvidenceDescription: "",
          target: { standardIds: ["RF.K.999"], unitIds: [], lessonIds: [] },
          provenance: [],
          review: { status: "pending" },
        },
      ],
      release,
      catalog.map((l) => l.standardId),
      [],
    );
    expect(problems).toEqual(
      expect.arrayContaining([
        "mapping-review-required:m1",
        "unimplemented-rule:m1",
        "unknown-target-standard:RF.K.999",
      ]),
    );
  });
  it("keeps the entire runtime foundation import graph free of models, scoring calls, billing and I/O", () => {
    const visited = new Set<string>();
    function visit(file: string) {
      if (visited.has(file) || file.endsWith(".json")) return;
      visited.add(file);
      const code = fs.readFileSync(file, "utf8"),
        ast = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
      const imports: string[] = [];
      function walk(n: ts.Node) {
        if (
          ts.isImportDeclaration(n) &&
          !n.importClause?.isTypeOnly &&
          ts.isStringLiteral(n.moduleSpecifier)
        )
          imports.push(n.moduleSpecifier.text);
        if (ts.isCallExpression(n)) {
          const call = n.expression.getText(ast);
          expect(call).not.toMatch(/^(fetch|decidePlacement|decideSpectrum|eval|require)$/);
          expect(n.expression.kind).not.toBe(ts.SyntaxKind.ImportKeyword);
        }
        ts.forEachChild(n, walk);
      }
      walk(ast);
      for (const spec of imports) {
        expect(spec).not.toMatch(
          /(@google|openai|anthropic|supabase|stripe|node:|lib\/ai\/|billing|\/placement\/(decide|spectrum-decision|current-plan))/,
        );
        if (!spec.startsWith(".") && !spec.startsWith("@/")) {
          expect(spec).toBe("zod");
          continue;
        }
        const target = spec.startsWith("@/")
          ? path.join(root, spec.slice(2))
          : path.resolve(path.dirname(file), spec);
        visit(fs.existsSync(target) ? target : `${target}.ts`);
      }
    }
    for (const file of [
      "lib/curriculum/release.ts",
      "lib/journey/learner-evidence.ts",
      "lib/journey/instructional-mappings.ts",
      "lib/journey/planner-contract.ts",
    ])
      visit(path.join(root, file));
    const contract = fs.readFileSync(path.join(root, "lib/journey/planner-contract.ts"), "utf8");
    expect(contract).not.toMatch(/fullAccess|eligibleForTrial|subscriptionStatus|profile\.plan/);
  });
});
