import { describe, expect, it } from "vitest";
import {
  lessonPlanningEligibility,
  validateCurriculumRelease,
  type CurriculumInventory,
  type CurriculumRelease,
} from "@/lib/curriculum/release";

const ref = { source: "fixture-review", locator: "review-1", version: "v1" };
const approved = { status: "approved" as const, version: "v1", reference: ref };
function fixture(): { release: CurriculumRelease; inventory: CurriculumInventory } {
  return structuredClone({
    inventory: {
      catalogVersion: "c1",
      registryVersion: "r1",
      standardIds: ["RF.K.1a", "RF.K.1b", "RF.K.1c"],
      lessons: [{ lessonId: "book-basics", slug: "book-basics", grade: 0, contentVersion: "v1" }],
      quizzes: [{ id: "unit-1-exam", contentVersion: "v1" }],
    },
    release: {
      schemaVersion: 1,
      releaseId: "fixture-only",
      catalogVersion: "c1",
      registryVersion: "r1",
      units: [
        {
          id: "K.U1",
          title: "Reading Foundations",
          grade: 0,
          version: "v1",
          source: ref,
          curriculumReview: approved,
          checkpointIds: ["check-1"],
        },
      ],
      lessons: [
        {
          lessonId: "book-basics",
          slug: "book-basics",
          contentVersion: "v1",
          grade: 0,
          unitId: "K.U1",
          position: 1,
          objective: "Read the page.",
          coverage: {
            version: "v1",
            standardIds: ["RF.K.1a", "RF.K.1b", "RF.K.1c"],
            kind: "combined-standards",
            source: ref,
            curriculumReview: approved,
          },
          technicalQa: { status: "passed", contentVersion: "v1", reference: ref },
          curriculumReview: approved,
          publication: { status: "released", contentVersion: "v1", reference: ref },
        },
      ],
      checkpoints: [
        {
          id: "check-1",
          quizId: "unit-1-exam",
          contentVersion: "v1",
          unitIds: ["K.U1"],
          curriculumReview: approved,
          technicalQa: { status: "passed", contentVersion: "v1", reference: ref },
          publication: { status: "released", contentVersion: "v1", reference: ref },
        },
      ],
    },
  });
}
describe("curriculum release contracts (approvals here are synthetic fixtures only)", () => {
  it("accepts explicitly reviewed combined coverage without changing lesson identity", () => {
    const { release, inventory } = fixture();
    expect(validateCurriculumRelease(release, inventory)).toEqual([]);
    expect(lessonPlanningEligibility(release, inventory, "book-basics")).toEqual({
      eligible: true,
      blockers: [],
    });
  });
  it("does not expand RF.K.1 into its children", () => {
    const { release, inventory } = fixture();
    release.lessons[0].coverage.standardIds = ["RF.K.1"];
    release.lessons[0].coverage.kind = "single-standard";
    expect(validateCurriculumRelease(release, inventory)).toContainEqual({
      code: "unknown-standard",
      reference: "RF.K.1",
    });
  });
  it.each(["unknown", "pending", "rejected"] as const)(
    "blocks combined coverage with %s approval",
    (status) => {
      const { release, inventory } = fixture();
      release.lessons[0].coverage.curriculumReview = { status, version: "v1" };
      expect(lessonPlanningEligibility(release, inventory, "book-basics").blockers).toContain(
        "coverage-approval-required",
      );
    },
  );
  it("rejects duplicate identities, overlapping positions, and unknown references", () => {
    const { release, inventory } = fixture();
    release.lessons.push(structuredClone(release.lessons[0]));
    const codes = validateCurriculumRelease(release, inventory).map((i) => i.code);
    expect(codes).toEqual(
      expect.arrayContaining([
        "duplicate-lesson-id",
        "duplicate-lesson-slug",
        "non-contiguous-unit-order",
      ]),
    );
    release.lessons[0].unitId = "unknown";
    expect(
      validateCurriculumRelease(release, inventory).some(
        (i) => i.code === "unknown-or-wrong-grade-unit",
      ),
    ).toBe(true);
  });
  it("requires exact slug, content version, grade, and registry snapshot", () => {
    const { release, inventory } = fixture();
    release.lessons[0].slug = "renamed-without-migration";
    expect(
      validateCurriculumRelease(release, inventory).some(
        (i) => i.code === "lesson-identity-unresolved",
      ),
    ).toBe(true);
    release.lessons[0].slug = "book-basics";
    release.lessons[0].contentVersion = "v2";
    expect(lessonPlanningEligibility(release, inventory, "book-basics").eligible).toBe(false);
    release.registryVersion = "stale";
    expect(
      validateCurriculumRelease(release, inventory).some(
        (i) => i.code === "registry-version-mismatch",
      ),
    ).toBe(true);
  });
  it("does not turn existence, technical QA, or an old approval into publication", () => {
    const { release, inventory } = fixture();
    release.lessons[0].publication.status = "draft";
    expect(lessonPlanningEligibility(release, inventory, "book-basics").blockers).toContain(
      "production-release-required",
    );
    release.lessons[0].curriculumReview.version = "old-content";
    expect(lessonPlanningEligibility(release, inventory, "book-basics").blockers).toContain(
      "curriculum-approval-required",
    );
    release.lessons[0].technicalQa.reference = undefined;
    expect(lessonPlanningEligibility(release, inventory, "book-basics").blockers).toContain(
      "technical-qa-required",
    );
  });
  it("requires contiguous lesson positions independent of standard-row positions", () => {
    const { release, inventory } = fixture();
    release.lessons[0].position = 3;
    expect(validateCurriculumRelease(release, inventory)).toContainEqual({
      code: "non-contiguous-unit-order",
      reference: "K.U1",
    });
  });
  it("checks checkpoint identity and reverse unit membership", () => {
    const { release, inventory } = fixture();
    release.checkpoints[0].quizId = "unwritten-final";
    release.checkpoints[0].unitIds = ["G4.U4"];
    expect(validateCurriculumRelease(release, inventory).map((i) => i.code)).toEqual(
      expect.arrayContaining(["unknown-checkpoint-version", "checkpoint-unit-mismatch"]),
    );
  });
  it("fails closed on malformed JSON", () => {
    expect(
      lessonPlanningEligibility({ lessons: [] }, fixture().inventory, "book-basics").eligible,
    ).toBe(false);
  });
  it("does not schedule a unit with an unpublished checkpoint", () => {
    const { release, inventory } = fixture();
    release.checkpoints[0].publication.status = "draft";
    expect(lessonPlanningEligibility(release, inventory, "book-basics").blockers).toContain(
      "checkpoint-release-required",
    );
  });
});
