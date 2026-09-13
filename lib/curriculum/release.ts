import { z } from "zod";

/** Release metadata references the existing lesson registry. It contains no lesson bodies. */
const text = z.string().min(1);
export const SourceReferenceSchema = z.object({
  source: text,
  locator: text,
  version: text,
});
export type SourceReference = z.infer<typeof SourceReferenceSchema>;
const review = z.object({
  status: z.enum(["unknown", "pending", "approved", "rejected"]),
  // A review applies to this exact content/metadata version, never merely a slug.
  version: text,
  reference: SourceReferenceSchema.optional(),
});
const technicalQa = z.object({
  status: z.enum(["unknown", "passed", "failed"]),
  contentVersion: text,
  reference: SourceReferenceSchema.optional(),
});
const publication = z.object({
  status: z.enum(["draft", "released", "withdrawn"]),
  contentVersion: text,
  reference: SourceReferenceSchema.optional(),
});
export const CurriculumReleaseSchema = z.object({
  schemaVersion: z.literal(1),
  releaseId: text,
  catalogVersion: text,
  registryVersion: text,
  units: z.array(
    z.object({
      id: text,
      grade: z.number().int().min(0).max(4),
      title: text,
      domains: z.array(z.enum(["RF", "RL", "RI", "L"])).optional(),
      version: text,
      source: SourceReferenceSchema,
      curriculumReview: review,
      checkpointIds: z.array(text),
    }),
  ),
  lessons: z.array(
    z.object({
      // The existing LessonDef.id and registry slug are separate identities.
      lessonId: text,
      slug: text,
      contentVersion: text,
      grade: z.number().int().min(0).max(4),
      unitId: text,
      position: z.number().int().positive(),
      objective: text,
      coverage: z.object({
        version: text,
        standardIds: z.array(text).min(1),
        kind: z.enum(["single-standard", "combined-standards"]),
        source: SourceReferenceSchema,
        curriculumReview: review,
      }),
      technicalQa,
      curriculumReview: review,
      publication,
    }),
  ),
  checkpoints: z.array(
    z.object({
      id: text,
      quizId: text,
      contentVersion: text,
      unitIds: z.array(text).min(1),
      curriculumReview: review,
      technicalQa,
      publication,
    }),
  ),
});
export type CurriculumRelease = z.infer<typeof CurriculumReleaseSchema>;
export type ReleaseLesson = CurriculumRelease["lessons"][number];
export type CurriculumInventory = {
  catalogVersion: string;
  registryVersion: string;
  standardIds: readonly string[];
  lessons: readonly { lessonId: string; slug: string; grade: number; contentVersion: string }[];
  quizzes: readonly { id: string; contentVersion: string }[];
};
export type ReleaseIssue = { code: string; reference: string };

/** Strict identity validation. A parent standard is NEVER expanded into children. */
export function validateCurriculumRelease(
  input: unknown,
  inventory: CurriculumInventory,
): ReleaseIssue[] {
  const parsed = CurriculumReleaseSchema.safeParse(input);
  if (!parsed.success)
    return parsed.error.issues.map((i) => ({ code: "invalid-shape", reference: i.path.join(".") }));
  const r = parsed.data;
  const issues: ReleaseIssue[] = [];
  const add = (code: string, reference: string) => issues.push({ code, reference });
  const unique = (values: string[], code: string) => {
    const seen = new Set<string>();
    for (const id of values) {
      if (seen.has(id)) add(code, id);
      seen.add(id);
    }
  };
  unique(
    r.lessons.map((l) => l.lessonId),
    "duplicate-lesson-id",
  );
  unique(
    r.lessons.map((l) => l.slug),
    "duplicate-lesson-slug",
  );
  unique(
    r.units.map((u) => u.id),
    "duplicate-unit-id",
  );
  unique(
    r.checkpoints.map((c) => c.id),
    "duplicate-checkpoint-id",
  );
  if (r.catalogVersion !== inventory.catalogVersion) add("catalog-version-mismatch", r.releaseId);
  if (r.registryVersion !== inventory.registryVersion)
    add("registry-version-mismatch", r.releaseId);
  const standards = new Set(inventory.standardIds);
  for (const l of r.lessons) {
    const matches = inventory.lessons.filter((x) => x.lessonId === l.lessonId && x.slug === l.slug);
    if (matches.length !== 1) add("lesson-identity-unresolved", l.lessonId);
    else if (matches[0].contentVersion !== l.contentVersion || matches[0].grade !== l.grade)
      add("lesson-version-or-grade-mismatch", l.lessonId);
    const unit = r.units.find((u) => u.id === l.unitId);
    if (!unit || unit.grade !== l.grade) add("unknown-or-wrong-grade-unit", l.lessonId);
    unique(l.coverage.standardIds, "duplicate-coverage");
    for (const s of l.coverage.standardIds) if (!standards.has(s)) add("unknown-standard", s);
    if (l.coverage.standardIds.length > 1 !== (l.coverage.kind === "combined-standards"))
      add("coverage-kind-mismatch", l.lessonId);
  }
  for (const unit of r.units) {
    const positions = r.lessons
      .filter((l) => l.unitId === unit.id)
      .map((l) => l.position)
      .sort((a, b) => a - b);
    if (!positions.length || positions.some((p, i) => p !== i + 1))
      add("non-contiguous-unit-order", unit.id);
    unique(unit.checkpointIds, "duplicate-unit-checkpoint");
    for (const id of unit.checkpointIds)
      if (!r.checkpoints.some((c) => c.id === id && c.unitIds.includes(unit.id)))
        add("checkpoint-unit-mismatch", id);
  }
  for (const c of r.checkpoints) {
    if (!inventory.quizzes.some((q) => q.id === c.quizId && q.contentVersion === c.contentVersion))
      add("unknown-checkpoint-version", c.id);
    for (const id of c.unitIds)
      if (!r.units.some((u) => u.id === id && u.checkpointIds.includes(c.id)))
        add("checkpoint-unit-mismatch", c.id);
  }
  return issues;
}

const approved = (r: z.infer<typeof review>, version: string) =>
  r.status === "approved" && r.version === version && !!r.reference;

/** Fail closed. Status is derived, never an author-editable `eligible: true`. */
export function lessonPlanningEligibility(
  input: unknown,
  inventory: CurriculumInventory,
  lessonId: string,
) {
  const blockers = validateCurriculumRelease(input, inventory).map((i) => i.code);
  const parsed = CurriculumReleaseSchema.safeParse(input);
  if (!parsed.success) return { eligible: false, blockers };
  const r = parsed.data;
  const l = r.lessons.find((l) => l.lessonId === lessonId);
  if (!l) return { eligible: false, blockers: [...blockers, "unknown-lesson"] };
  const u = r.units.find((u) => u.id === l.unitId);
  if (
    l.technicalQa.status !== "passed" ||
    l.technicalQa.contentVersion !== l.contentVersion ||
    !l.technicalQa.reference
  )
    blockers.push("technical-qa-required");
  if (!approved(l.curriculumReview, l.contentVersion))
    blockers.push("curriculum-approval-required");
  if (!approved(l.coverage.curriculumReview, l.coverage.version))
    blockers.push("coverage-approval-required");
  if (!u || !approved(u.curriculumReview, u.version)) blockers.push("unit-approval-required");
  if (
    l.publication.status !== "released" ||
    l.publication.contentVersion !== l.contentVersion ||
    !l.publication.reference
  )
    blockers.push("production-release-required");
  for (const id of u?.checkpointIds ?? []) {
    const c = r.checkpoints.find((c) => c.id === id);
    if (!c || !approved(c.curriculumReview, c.contentVersion))
      blockers.push("checkpoint-approval-required");
    if (
      c &&
      (c.technicalQa.status !== "passed" ||
        c.technicalQa.contentVersion !== c.contentVersion ||
        !c.technicalQa.reference)
    )
      blockers.push("checkpoint-technical-qa-required");
    if (
      c &&
      (c.publication.status !== "released" ||
        c.publication.contentVersion !== c.contentVersion ||
        !c.publication.reference)
    )
      blockers.push("checkpoint-release-required");
  }
  return { eligible: blockers.length === 0, blockers: [...new Set(blockers)] };
}
