import { describe, it, expect } from "vitest";
import sampleLessons from "@/app/data/sample-lessons.json";
import kStandards from "@/app/data/kindergarten-standards-questions.json";
import g1Standards from "@/app/data/1st-grade-standards-questions.json";
import g2Standards from "@/app/data/2nd-grade-standards-questions.json";
import g3Standards from "@/app/data/3rd-grade-standards-questions.json";
import g4Standards from "@/app/data/4th-grade-standards-questions.json";
import { getStandardsForGrade, getAllStandards, findStandardById } from "@/lib/data/all-standards";
import {
  LESSON_META,
  getStandardMetaForGrade,
  getAllStandardMeta,
  findStandardMetaById,
} from "@/lib/data/curriculum-manifest";

/**
 * The manifest is a GENERATED copy of curriculum navigation data, so it can go
 * stale: edit the catalogue, forget to re-run the generator, and the dashboard
 * quietly shows a lesson list that no longer matches what /learn will teach.
 *
 * Staleness is exactly the kind of bug that never announces itself, so these
 * tests are the announcement. If one fails, the fix is one command:
 *     npx tsx scripts/build-curriculum-manifest.ts
 */

const FIELDS = ["standard_id", "standard_description", "domain"] as const;
const slim = (s: Record<string, unknown>) =>
  Object.fromEntries(FIELDS.map((k) => [k, s[k]]));

describe("curriculum manifest is in sync with the catalogue", () => {
  it("has every lesson, in catalogue order, with the same navigation fields", () => {
    type CatalogEntry = { standardId: string; grade: string; domain: string; title: string };
    const source = (sampleLessons as CatalogEntry[]).map((l) => ({
      standardId: l.standardId,
      grade: l.grade,
      domain: l.domain,
      title: l.title,
    }));
    expect(LESSON_META.map(({ id: _id, ...rest }) => rest)).toEqual(source);
  });

  it("has every standard of every grade, in bank order", () => {
    const banks = {
      kindergarten: kStandards,
      "1st": g1Standards,
      "2nd": g2Standards,
      "3rd": g3Standards,
      "4th": g4Standards,
    } as Record<string, { standards: Record<string, unknown>[] }>;
    for (const [grade, bank] of Object.entries(banks)) {
      expect(getStandardMetaForGrade(grade), grade).toEqual(bank.standards.map(slim));
    }
  });
});

describe("manifest accessors match the full-data ones they replaced", () => {
  it("getStandardMetaForGrade matches getStandardsForGrade, pre-k fallback included", () => {
    for (const g of ["pre-k", "kindergarten", "1st", "2nd", "3rd", "4th"] as const) {
      expect(getStandardMetaForGrade(g), g).toEqual(
        getStandardsForGrade(g as never).map((s) => slim(s as never)),
      );
    }
  });

  it("an unknown grade key falls back to kindergarten, as the original did", () => {
    expect(getStandardMetaForGrade("11th")).toEqual(getStandardMetaForGrade("kindergarten"));
  });

  it("getAllStandardMeta matches getAllStandards, same grades in the same order", () => {
    expect(getAllStandardMeta()).toEqual(getAllStandards().map((s) => slim(s as never)));
  });

  it("findStandardMetaById resolves every id findStandardById does", () => {
    for (const { standard_id } of getAllStandards()) {
      expect(findStandardMetaById(standard_id), standard_id).toEqual(
        slim(findStandardById(standard_id) as never),
      );
    }
  });

  it("returns undefined for an id that does not exist", () => {
    expect(findStandardMetaById("RL.99.9")).toBeUndefined();
  });
});
