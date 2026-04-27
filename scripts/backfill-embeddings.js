/**
 * Backfill content_embeddings for everything in the catalog.
 *
 * Run once after migration 065. Safe to re-run — indexContent is
 * idempotent on text_hash, so unchanged content is skipped.
 *
 * Usage:
 *   node scripts/backfill-embeddings.js
 *   GEMINI_API_KEY=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill-embeddings.js
 *
 * Cost estimate (Gemini gemini-embedding-001 @ $0.00013/1K tokens):
 *   ~1000 sample questions × 50 tokens each = 50K tokens = $0.007
 *   ~200 sample lessons × 800 tokens each = 160K tokens = $0.021
 *   ~25 stories × 600 tokens each = 15K tokens = $0.002
 *   Total backfill: well under $0.05.
 */

const path = require("node:path");
const { createHash } = require("node:crypto");

(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const { GoogleGenAI } = await import("@google/genai");

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY || !GEMINI_KEY) {
    console.error(
      "Missing env. Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY.",
    );
    process.exit(1);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });
  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

  async function embed(text) {
    const r = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: [text],
      config: { outputDimensionality: 768, taskType: "RETRIEVAL_DOCUMENT" },
    });
    return r.embeddings?.[0]?.values;
  }

  function hash(s) {
    return createHash("sha256").update(s).digest("hex");
  }

  async function index(contentType, contentId, text, metadata) {
    if (!text || text.trim().length < 5) return { skipped: true };
    const newHash = hash(text);
    const { data: existing } = await admin
      .from("content_embeddings")
      .select("text_hash")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .maybeSingle();
    if (existing?.text_hash === newHash) {
      return { reused: true };
    }
    const vec = await embed(text);
    if (!vec || vec.length !== 768) return { error: "bad shape" };
    const { error } = await admin.from("content_embeddings").upsert(
      {
        content_type: contentType,
        content_id: contentId,
        teacher_id: null,
        text_hash: newHash,
        embedding: vec,
        metadata: metadata || {},
        source_text: text.slice(0, 8000),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "content_type,content_id" },
    );
    if (error) return { error: error.message };
    return { ok: true };
  }

  let added = 0;
  let reused = 0;
  let failed = 0;

  // ── Sample lessons + sample questions (from JSON) ──────────────────
  const grades = [
    { tag: "K", file: "kindergarten-standards-questions.json" },
    { tag: "1st", file: "1st-grade-standards-questions.json" },
    { tag: "2nd", file: "2nd-grade-standards-questions.json" },
    { tag: "3rd", file: "3rd-grade-standards-questions.json" },
    { tag: "4th", file: "4th-grade-standards-questions.json" },
  ];
  for (const g of grades) {
    const json = require(path.join(__dirname, "..", "app", "data", g.file));
    for (const s of json.standards ?? []) {
      for (const q of s.questions ?? []) {
        const text = `${s.standard_description}\n\n${q.prompt}\n${(q.choices ?? []).join(" | ")}`;
        const r = await index("sample_question", q.id, text, {
          grade: g.tag,
          standard_id: s.standard_id,
          standard_description: s.standard_description,
          domain: s.domain,
          prompt: q.prompt,
          type: q.type,
        });
        if (r.ok) added++;
        else if (r.reused) reused++;
        else if (r.error) failed++;
      }
    }
    console.log(`Grade ${g.tag} done. running totals: +${added} =${reused} !${failed}`);
  }

  // ── Stories ────────────────────────────────────────────────────────
  try {
    const storiesFile = require(path.join(__dirname, "stories-bank.json"));
    const stories = Array.isArray(storiesFile)
      ? storiesFile
      : Array.isArray(storiesFile.stories)
        ? storiesFile.stories
        : [];
    for (const s of stories) {
      const text = `${s.title ?? ""}\n\n${s.text ?? s.body ?? ""}`;
      if (!text.trim() || !s.id) continue;
      const r = await index("story", s.id, text, {
        title: s.title,
        grade_level: s.grade,
        skill: s.skill,
      });
      if (r.ok) added++;
      else if (r.reused) reused++;
      else if (r.error) failed++;
    }
    console.log(`Stories done. +${added} =${reused} !${failed}`);
  } catch (e) {
    console.warn("Stories skip:", e.message);
  }

  // ── Sample lessons ─────────────────────────────────────────────────
  try {
    const lessons = require(path.join(__dirname, "..", "app", "data", "sample-lessons.json"));
    for (const l of lessons) {
      const slidesText = (l.slides ?? [])
        .map((sl) => `${sl.display_text ?? ""} ${sl.body ?? ""}`)
        .join("\n");
      const text = `${l.title ?? ""}\n${slidesText}`.trim();
      if (!text) continue;
      // Use standardId-based id so re-runs are stable.
      const id = l.id ?? `${l.standardId ?? l.standard ?? "noid"}:${(l.title ?? "untitled").slice(0, 60)}`;
      const r = await index("sample_lesson", id, text, {
        title: l.title,
        grade_level: l.grade,
        standard_id: l.standardId ?? l.standard,
        domain: l.domain,
      });
      if (r.ok) added++;
      else if (r.reused) reused++;
      else if (r.error) failed++;
    }
    console.log(`Sample lessons done. +${added} =${reused} !${failed}`);
  } catch (e) {
    console.warn("Sample lessons skip:", e.message);
  }

  // ── Custom content (teacher-built) ──────────────────────────────────
  // Pull from DB, embed each. teacher_id IS preserved (so RLS scopes
  // private content correctly).
  for (const tbl of [
    { name: "custom_lessons", type: "custom_lesson" },
    { name: "custom_books", type: "custom_book" },
    { name: "differentiated_passages", type: "leveled_passage" },
  ]) {
    const { data: rows } = await admin
      .from(tbl.name)
      .select("*")
      .limit(2000);
    for (const r of rows ?? []) {
      let text = "";
      const meta = {};
      if (tbl.type === "custom_lesson") {
        const slides = Array.isArray(r.slides) ? r.slides : [];
        text = `${r.title}\n${r.topic}\n${slides.map((s) => s.body ?? "").join("\n")}`;
        Object.assign(meta, { title: r.title, topic: r.topic, grade_level: r.grade_level });
      } else if (tbl.type === "custom_book") {
        const pages = Array.isArray(r.pages) ? r.pages : [];
        text = `${r.title}\n${r.pattern_label}\n${pages.map((p) => p.text ?? "").join("\n")}`;
        Object.assign(meta, { title: r.title, pattern_label: r.pattern_label, grade_level: r.grade_level });
      } else {
        const versions = Array.isArray(r.versions) ? r.versions : [];
        text = `${r.title}\n${r.topic}\n${versions.map((v) => v.body ?? "").join("\n")}`;
        Object.assign(meta, { title: r.title, topic: r.topic, base_grade: r.base_grade });
      }
      if (!text.trim()) continue;
      const newHash = hash(text);
      const { data: existing } = await admin
        .from("content_embeddings")
        .select("text_hash")
        .eq("content_type", tbl.type)
        .eq("content_id", r.id)
        .maybeSingle();
      if (existing?.text_hash === newHash) {
        reused++;
        continue;
      }
      try {
        const vec = await embed(text);
        await admin.from("content_embeddings").upsert(
          {
            content_type: tbl.type,
            content_id: r.id,
            teacher_id: r.teacher_id,
            text_hash: newHash,
            embedding: vec,
            metadata: meta,
            source_text: text.slice(0, 8000),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "content_type,content_id" },
        );
        added++;
      } catch (e) {
        failed++;
        console.warn(`${tbl.type} ${r.id}:`, e.message);
      }
    }
    console.log(`${tbl.name} done.`);
  }

  console.log(`\nBackfill complete. added=${added} reused=${reused} failed=${failed}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
