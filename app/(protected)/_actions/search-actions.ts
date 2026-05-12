"use server";

import { requireProfile } from "@/lib/auth/helpers";
import { searchContent, type SearchHit } from "@/lib/ai/embeddings";

/**
 * Server action behind the parent-side smart search bar.
 *
 * B2C scope only: results are restricted to Readee canon content
 * (sample lessons, practice questions, decodable stories). Custom
 * teacher content is intentionally excluded — parents never see
 * teacher-built material in this product.
 *
 * Plan gate — Readee+ feature. Free parents see the bar but the
 * server returns reason="plan" so the UI can prompt to upgrade.
 *
 * Margin: each search is ~1 embedding call ($0.0001) + a pgvector
 * lookup. Gating is for differentiation, not cost recovery.
 */
function isAllowed(plan: string | null | undefined): boolean {
  return plan === "premium";
}

const CANON_TYPES = ["sample_lesson", "sample_question", "story"] as const;
type CanonType = (typeof CANON_TYPES)[number];

export async function semanticSearch(input: {
  query: string;
  filterTypes?: CanonType[];
  limit?: number;
}): Promise<
  | { ok: true; hits: SearchHit[] }
  | { ok: false; error: string; reason?: "plan" | "auth" }
> {
  const profile = await requireProfile();
  if (!isAllowed((profile as any).plan)) {
    return {
      ok: false,
      reason: "plan",
      error: "Smart search is a Readee+ feature. Upgrade to enable.",
    };
  }
  const q = input.query.trim();
  if (!q) return { ok: true, hits: [] };
  if (q.length < 3) return { ok: true, hits: [] };

  // Canon-only — never surface teacher-built content to parents.
  const types = input.filterTypes && input.filterTypes.length > 0
    ? input.filterTypes
    : [...CANON_TYPES];

  const res = await searchContent({
    query: q,
    filterTypes: types,
    filterTeacher: null,
    matchCount: input.limit ?? 12,
  });
  return res;
}
