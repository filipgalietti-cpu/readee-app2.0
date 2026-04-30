/**
 * Topic deduplication: don't ship 3 "what's blooming this spring"
 * passages in the same week. Two layers:
 *
 *  v1 (this file): substring-based check against last-30-days of
 *  factory output. Cheap (one Supabase query, no embeddings) and
 *  catches the obvious "title was 80% the same word stem" cases.
 *
 *  v2 (TODO): embedding-based check using the existing pgvector
 *  content_embeddings infra — embed the proposed topic, reject if
 *  cosine sim > 0.85 against any recent factory item. Adds ~1
 *  embedding call per pre-flight (~$0.0001) but catches semantic
 *  duplicates the substring layer misses.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

const RECENT_WINDOW_DAYS = 30;
const SIMILARITY_THRESHOLD = 0.6;

export type DedupeResult =
  | { ok: true; checkedCount: number }
  | { ok: false; reason: string; collidedWith: { title: string; similarity: number } };

/**
 * Normalize for comparison: lowercase, strip punctuation, collapse
 * whitespace, drop tiny stopwords.
 */
function normalize(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4)
    .join(" ")
    .trim();
}

/**
 * Token-overlap similarity. 1.0 = identical token bags, 0.0 = no
 * shared tokens. Coarse but adequate for "is this title basically
 * a re-do of one we shipped 2 weeks ago?"
 */
function tokenOverlap(a: string, b: string): number {
  const ta = new Set(normalize(a).split(" ").filter(Boolean));
  const tb = new Set(normalize(b).split(" ").filter(Boolean));
  if (ta.size === 0 || tb.size === 0) return 0;
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared++;
  return shared / Math.min(ta.size, tb.size);
}

/**
 * Pre-flight check: would this topic be a near-duplicate of anything
 * we shipped in the last 30 days? Pass `assetKind` so we only compare
 * within the same asset type (a leveled passage about birds shouldn't
 * block a vocab card about birds).
 */
export async function checkTopicNotDuplicate(input: {
  assetKind: string;
  proposedTitle: string;
  proposedSummary?: string;
}): Promise<DedupeResult> {
  const supabase = supabaseAdmin();
  const since = new Date(Date.now() - RECENT_WINDOW_DAYS * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from("content_review_queue")
    .select("title, qc_report")
    .eq("asset_kind", input.assetKind)
    .gte("created_at", since)
    .limit(500);
  if (error) {
    return { ok: true, checkedCount: 0 };
  }
  const rows = (data ?? []) as { title: string | null; qc_report: any }[];
  const haystack = `${input.proposedTitle} ${input.proposedSummary ?? ""}`;
  let worst: { title: string; similarity: number } = { title: "", similarity: 0 };
  for (const r of rows) {
    if (!r.title) continue;
    const sim = tokenOverlap(haystack, r.title);
    if (sim > worst.similarity) {
      worst = { title: r.title, similarity: sim };
    }
  }
  if (worst.similarity >= SIMILARITY_THRESHOLD) {
    return {
      ok: false,
      reason: `Topic "${input.proposedTitle}" overlaps ${(worst.similarity * 100).toFixed(0)}% with recent "${worst.title}". Skipping to avoid library bloat.`,
      collidedWith: worst,
    };
  }
  return { ok: true, checkedCount: rows.length };
}
