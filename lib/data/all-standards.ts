import kStandards from "@/app/data/kindergarten-standards-questions.json";
import g1Standards from "@/app/data/1st-grade-standards-questions.json";
import g2Standards from "@/app/data/2nd-grade-standards-questions.json";
import g3Standards from "@/app/data/3rd-grade-standards-questions.json";
import g4Standards from "@/app/data/4th-grade-standards-questions.json";
import { safeValidate } from "@/lib/validate";
import { StandardsFileSchema } from "@/lib/schemas";
import type { GradeKey } from "@/lib/assessment/questions";

type Standard = {
  standard_id: string;
  standard_description: string;
  domain: string;
  parent_tip: string;
  questions: Array<{
    id: string;
    type: string;
    prompt: string;
    choices?: string[];
    correct: string;
    hint: string;
    difficulty: number;
    audio_url?: string;
    hint_audio_url?: string;
    words?: string[];
    sentence_hint?: string;
    sentence_audio_url?: string;
    categories?: string[];
    category_items?: Record<string, string[]>;
    items?: string[];
  }>;
};

const validated = {
  kindergarten: safeValidate(StandardsFileSchema, kStandards).standards as Standard[],
  "1st": safeValidate(StandardsFileSchema, g1Standards).standards as Standard[],
  "2nd": safeValidate(StandardsFileSchema, g2Standards).standards as Standard[],
  "3rd": safeValidate(StandardsFileSchema, g3Standards).standards as Standard[],
  "4th": safeValidate(StandardsFileSchema, g4Standards).standards as Standard[],
};

const STANDARDS_BY_GRADE: Record<string, Standard[]> = {
  "pre-k": validated.kindergarten, // pre-k falls back to kindergarten
  ...validated,
};

/** Get standards for a specific grade */
export function getStandardsForGrade(gradeKey: GradeKey): Standard[] {
  return STANDARDS_BY_GRADE[gradeKey] ?? validated.kindergarten;
}

/** Get all standards across every grade (deduplicated — no pre-k duplicate) */
export function getAllStandards(): Standard[] {
  return [
    ...validated.kindergarten,
    ...validated["1st"],
    ...validated["2nd"],
    ...validated["3rd"],
    ...validated["4th"],
  ];
}

/** Find a single standard by ID across all grades */
export function findStandardById(standardId: string): Standard | undefined {
  for (const standards of Object.values(validated)) {
    const found = standards.find((s) => s.standard_id === standardId);
    if (found) return found;
  }
  return undefined;
}

/** Grade key labels */
export const GRADE_LABELS: Record<string, string> = {
  "pre-k": "Pre-K",
  kindergarten: "Kindergarten",
  "1st": "1st Grade",
  "2nd": "2nd Grade",
  "3rd": "3rd Grade",
  "4th": "4th Grade",
};
