/**
 * Loader for Readee's standards-aligned question bank. Powers the
 * public SEO pages at /standards/[slug] — each Common Core ELA
 * standard becomes a landing page with the 3 free sample questions
 * and an upgrade CTA.
 *
 * Slugs are URL-safe lowercase (RL.K.1 → rl-k-1, RF.1.3a → rf-1-3a)
 * so search engines index them cleanly.
 */

import kJson from "@/app/data/kindergarten-standards-questions.json";
import g1Json from "@/app/data/1st-grade-standards-questions.json";
import g2Json from "@/app/data/2nd-grade-standards-questions.json";
import g3Json from "@/app/data/3rd-grade-standards-questions.json";
import g4Json from "@/app/data/4th-grade-standards-questions.json";

export type StandardQuestion = {
  id: string;
  type: string;
  prompt: string;
  choices?: string[];
  correct: string | string[];
  hint: string;
  difficulty: number;
  audio_url?: string;
  hint_audio_url?: string;
  image_url?: string;
};

export type Standard = {
  standard_id: string;
  standard_description: string;
  domain: string;
  parent_tip?: string;
  grade: "kindergarten" | "1st-grade" | "2nd-grade" | "3rd-grade" | "4th-grade";
  gradeLabel: string;
  questions: StandardQuestion[];
};

const GRADE_BANKS = [
  { grade: "kindergarten" as const, label: "Kindergarten", json: kJson },
  { grade: "1st-grade" as const, label: "1st Grade", json: g1Json },
  { grade: "2nd-grade" as const, label: "2nd Grade", json: g2Json },
  { grade: "3rd-grade" as const, label: "3rd Grade", json: g3Json },
  { grade: "4th-grade" as const, label: "4th Grade", json: g4Json },
];

export function slugifyStandard(id: string): string {
  return id.toLowerCase().replace(/\./g, "-");
}

export function unslugifyToIdCandidate(slug: string): string {
  // rl-k-1 → RL.K.1    ;   rf-1-3a → RF.1.3a
  // Uppercase the leading domain code (RL/RI/RF/SL/L/W), join on dots.
  const parts = slug.split("-");
  if (parts.length < 3) return slug.toUpperCase();
  const head = parts[0].toUpperCase();
  const grade = parts[1].toUpperCase(); // K, 1, 2, 3, 4
  const rest = parts.slice(2).join("");
  return `${head}.${grade}.${rest}`;
}

export function getAllStandards(): Standard[] {
  const out: Standard[] = [];
  for (const { grade, label, json } of GRADE_BANKS) {
    const bank = json as any;
    for (const s of bank.standards ?? []) {
      out.push({
        standard_id: s.standard_id,
        standard_description: s.standard_description,
        domain: s.domain,
        parent_tip: s.parent_tip,
        grade,
        gradeLabel: label,
        questions: s.questions ?? [],
      });
    }
  }
  return out;
}

export function getStandardBySlug(slug: string): Standard | null {
  const targetId = unslugifyToIdCandidate(slug);
  const all = getAllStandards();
  const hit = all.find((s) => s.standard_id === targetId);
  return hit ?? null;
}

/** Friendly short name for a Common Core code → used in meta titles. */
export function domainFriendlyName(domain: string): string {
  if (/literature/i.test(domain)) return "Reading: Literature";
  if (/informational/i.test(domain)) return "Reading: Informational Text";
  if (/foundational/i.test(domain)) return "Reading: Foundational Skills";
  if (/language/i.test(domain)) return "Language";
  if (/speaking/i.test(domain)) return "Speaking & Listening";
  if (/writing/i.test(domain)) return "Writing";
  return domain;
}
