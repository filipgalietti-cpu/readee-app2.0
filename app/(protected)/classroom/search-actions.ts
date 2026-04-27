"use server";

import { requireProfile } from "@/lib/auth/helpers";
import { searchContent, type SearchHit } from "@/lib/ai/embeddings";

/**
 * Plan gate — semantic search is a Readee+ / Teacher Solo+ feature.
 * Free teachers fall back to keyword filtering on the existing UI.
 *
 * Margin: each search costs ~1 embedding call ($0.0001) + ~1ms of pgvector.
 * Net-zero meaningful cost at any reasonable usage volume. Gating is for
 * differentiation, not cost recovery.
 */
function isAllowed(plan: string | null | undefined): boolean {
  return plan === "premium" || plan === "teacher_solo" || plan === "classroom" || plan === "school" || plan === "district";
}

export async function semanticSearch(input: {
  query: string;
  filterTypes?: (
    | "sample_lesson"
    | "sample_question"
    | "story"
    | "custom_lesson"
    | "custom_book"
    | "custom_quiz"
    | "leveled_passage"
  )[];
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

  const res = await searchContent({
    query: q,
    filterTypes: input.filterTypes,
    filterTeacher: profile.id,
    matchCount: input.limit ?? 12,
  });
  return res;
}
