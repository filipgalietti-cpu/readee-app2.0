/**
 * Text embeddings + content indexing for semantic search.
 *
 * Provider-abstracted so we can A/B Gemini vs OpenAI vs Voyage in the
 * future. Today: Gemini gemini-embedding-001 with output_dimensionality=768.
 *
 * Cost (Gemini, 2026-04): ~$0.00013 per 1K input tokens. Indexing the
 * entire current Readee catalog (~1k passages, ~200 lessons, ~25 stories)
 * is well under $1. This is a near-free feature operationally.
 *
 * Margin: not a teacher-facing upcharge itself — it's the substrate
 * underneath upchargeable features (smart recommendations, "find similar,"
 * duplicate detection, auto-tagging).
 */

import { createHash } from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { trackError } from "@/lib/observability/track";

export type EmbeddingProvider = "gemini" | "openai" | "voyage";

const DEFAULT_PROVIDER: EmbeddingProvider = "gemini";
const EMBEDDING_DIMS = 768;
const GEMINI_EMBED_MODEL = "gemini-embedding-001";

export type ContentType =
  | "sample_lesson"
  | "sample_question"
  | "story"
  | "custom_lesson"
  | "custom_book"
  | "custom_quiz"
  | "leveled_passage";

let cachedClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");
  cachedClient = new GoogleGenAI({ apiKey });
  return cachedClient;
}

/**
 * Embed a single piece of text. Returns a 768-dim vector.
 *
 * Provider switch is one-line: pass `provider: "openai"` and we'd
 * call OpenAI's text-embedding-3-large with dimensions=768. Today
 * only Gemini is wired.
 */
export async function embedText(input: {
  text: string;
  provider?: EmbeddingProvider;
  /** Hint to the model: "RETRIEVAL_DOCUMENT" for content being indexed,
   *  "RETRIEVAL_QUERY" for a search query. Improves recall. */
  taskType?: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" | "SEMANTIC_SIMILARITY";
}): Promise<number[]> {
  const text = input.text.trim();
  if (!text) throw new Error("Cannot embed empty text.");

  const provider = input.provider ?? DEFAULT_PROVIDER;
  if (provider !== "gemini") {
    throw new Error(`Embedding provider "${provider}" not yet wired.`);
  }

  const client = getGeminiClient();
  const response = await client.models.embedContent({
    model: GEMINI_EMBED_MODEL,
    contents: [text],
    config: {
      outputDimensionality: EMBEDDING_DIMS,
      taskType: input.taskType ?? "RETRIEVAL_DOCUMENT",
    },
  });
  const values = response.embeddings?.[0]?.values;
  if (!values || values.length !== EMBEDDING_DIMS) {
    throw new Error(`Embedding returned wrong shape (${values?.length}).`);
  }
  return values;
}

function hashText(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

/**
 * Indexes one piece of content. Idempotent — if the text hash hasn't
 * changed since last index, skips the embedding call entirely.
 *
 * teacherId is null for Readee-built content (visible to all).
 */
export async function indexContent(input: {
  contentType: ContentType;
  contentId: string;
  text: string;
  teacherId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<{ ok: true; reused: boolean } | { ok: false; error: string }> {
  const text = input.text.trim();
  if (!text) return { ok: false, error: "Text required." };

  const admin = supabaseAdmin();
  const newHash = hashText(text);

  // Re-embed only when text changed.
  const { data: existing } = await admin
    .from("content_embeddings")
    .select("id, text_hash")
    .eq("content_type", input.contentType)
    .eq("content_id", input.contentId)
    .maybeSingle();
  if (existing && (existing as any).text_hash === newHash) {
    return { ok: true, reused: true };
  }

  let vector: number[];
  try {
    vector = await embedText({ text, taskType: "RETRIEVAL_DOCUMENT" });
  } catch (e: any) {
    trackError(e, {
      route: "embeddings.indexContent",
      tags: { content_type: input.contentType, content_id: input.contentId },
    });
    return { ok: false, error: e.message ?? "Embedding failed." };
  }

  const row = {
    content_type: input.contentType,
    content_id: input.contentId,
    teacher_id: input.teacherId ?? null,
    text_hash: newHash,
    embedding: vector as any,
    metadata: input.metadata ?? {},
    source_text: text.slice(0, 8000),
    updated_at: new Date().toISOString(),
  };
  const { error } = await admin
    .from("content_embeddings")
    .upsert(row, { onConflict: "content_type,content_id" });
  if (error) return { ok: false, error: error.message };
  return { ok: true, reused: false };
}

export type SearchHit = {
  contentType: ContentType;
  contentId: string;
  teacherId: string | null;
  metadata: Record<string, unknown>;
  similarity: number;
};

/**
 * Embeds a query and runs cosine-similarity search. Returns hits sorted
 * by similarity descending. Filter by content type(s) and/or teacher.
 *
 * For teacher-owned filtering, pass filterTeacher = teacher's profile.id —
 * the RPC always also returns public Readee content.
 */
export async function searchContent(input: {
  query: string;
  filterTypes?: ContentType[];
  filterTeacher?: string | null;
  matchThreshold?: number;
  matchCount?: number;
}): Promise<{ ok: true; hits: SearchHit[] } | { ok: false; error: string }> {
  const query = input.query.trim();
  if (!query) return { ok: true, hits: [] };

  let vector: number[];
  try {
    vector = await embedText({ text: query, taskType: "RETRIEVAL_QUERY" });
  } catch (e: any) {
    trackError(e, { route: "embeddings.searchContent" });
    return { ok: false, error: e.message ?? "Search failed." };
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin.rpc("match_content_embeddings", {
    query_embedding: vector as any,
    match_threshold: input.matchThreshold ?? 0.55,
    match_count: input.matchCount ?? 20,
    filter_types: input.filterTypes ?? null,
    filter_teacher: input.filterTeacher ?? null,
  });
  if (error) return { ok: false, error: error.message };

  const hits: SearchHit[] = ((data ?? []) as any[]).map((r) => ({
    contentType: r.content_type as ContentType,
    contentId: r.content_id as string,
    teacherId: r.teacher_id as string | null,
    metadata: (r.metadata ?? {}) as Record<string, unknown>,
    similarity: Number(r.similarity),
  }));
  return { ok: true, hits };
}

/**
 * Find content similar to a piece of content already in the index.
 * Useful for "more like this" recommendations on detail pages.
 */
export async function findSimilarContent(input: {
  contentType: ContentType;
  contentId: string;
  matchCount?: number;
}): Promise<{ ok: true; hits: SearchHit[] } | { ok: false; error: string }> {
  const admin = supabaseAdmin();
  const { data: row } = await admin
    .from("content_embeddings")
    .select("source_text")
    .eq("content_type", input.contentType)
    .eq("content_id", input.contentId)
    .maybeSingle();
  if (!row) return { ok: false, error: "Content not indexed yet." };
  return searchContent({
    query: (row as any).source_text,
    matchCount: (input.matchCount ?? 6) + 1, // +1 to filter self
  }).then((res) => {
    if (!res.ok) return res;
    return {
      ok: true as const,
      hits: res.hits.filter(
        (h) =>
          !(h.contentType === input.contentType && h.contentId === input.contentId),
      ).slice(0, input.matchCount ?? 6),
    };
  });
}
