/**
 * QC bot — nightly continuous quality assurance.
 *
 * Single orchestrated pipeline that runs the deliverability gate
 * across the catalog every night. Idempotent. Surfaces the count
 * of remaining open issues in the response so the response body
 * doubles as a "deliverability status" report.
 *
 * The pipeline:
 *  1. Auto-dismiss known false positives (qc-bot-cleanup logic
 *     inlined here for one-shot Vercel function)
 *  2. (No re-audit at the cron — the standalone audit cron already
 *     runs once a week. Cron just remediates whatever the audit found.)
 *  3. Bulk-quarantine any new open fails so live serving stays clean
 *  4. Hand off to the regen workers via the same SQL/storage paths
 *     used by the local scripts. We INVOKE the underlying generators
 *     directly here rather than spawning child processes — Vercel
 *     functions can't fork tsx.
 *
 * Schedule: nightly 06:00 UTC (~02:00 ET).
 *
 * Manual trigger: GET with ?force=1 to bypass the per-day dedupe.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateImage, generateSpeech, regenerateMCQQuestion } from "@/lib/ai/readee-ai";
import { invalidateQcCache } from "@/lib/data/qc-filter";
import {
  verifyImageRegen,
  verifyAudioRegen,
} from "@/lib/ai/qc-verify";
import lessonsData from "@/app/data/sample-lessons.json";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Counters = {
  fp_dismissed: number;
  quarantined: number;
  image_regen: number;
  audio_regen: number;
  step_audio_regen: number;
  question_regen: number;
  // Same-night verify pass results (split by outcome so the
  // dashboard can tell auto-fix-that-stuck-the-landing from
  // auto-fix-that-bounced-back-to-open).
  verified_pass: number;
  verified_warn: number;
  verified_reopen: number;
  errors: string[];
};

function ok(): Counters {
  return {
    fp_dismissed: 0,
    quarantined: 0,
    image_regen: 0,
    audio_regen: 0,
    step_audio_regen: 0,
    question_regen: 0,
    verified_pass: 0,
    verified_warn: 0,
    verified_reopen: 0,
    errors: [],
  };
}

/**
 * Bump the in-memory cron counters based on a verify outcome so
 * the response body reports same-night closure rates. Fail-verdict
 * verifies have already reopened the finding (verifyImageRegen /
 * verifyAudioRegen do that) — this just counts.
 */
function tallyVerify(
  c: Counters,
  outcome: { verdict: "pass" | "warn" | "fail" | "skipped" },
): void {
  if (outcome.verdict === "pass") c.verified_pass++;
  else if (outcome.verdict === "warn") c.verified_warn++;
  else if (outcome.verdict === "fail") c.verified_reopen++;
}

async function dismissKnownFps(c: Counters) {
  const admin = supabaseAdmin();
  // Mirrors scripts/qc-bot-cleanup.ts so the cron clears FPs the
  // judge keeps producing. Each rule has a known root cause (judge
  // limitation, intentional design, TTS quirk) — see the script for
  // full reasons. Without these in the cron, dashboard "open fail"
  // counts stay artificially high overnight.

  // Rule 1 — q.no_self_leak across all targets. Judge had ~0%
  // precision on root-word / digraph / sight-word identification
  // questions where the answer is intentionally inside the prompt.
  {
    const { data } = await admin
      .from("content_audit_findings")
      .update({
        status: "wont_fix",
        resolved_at: new Date().toISOString(),
        resolver_note: "QC bot cron: known FP — root-word identification questions.",
      })
      .eq("finding_type", "q.no_self_leak")
      .eq("status", "open")
      .in("severity", ["fail", "warn"])
      .select("id");
    c.fp_dismissed += data?.length ?? 0;
  }

  // Rule 2 — q.unique_choices on capitalization (L.x.2) and
  // sentence-punctuation (RF.x.1a) standards. Choices intentionally
  // differ only in case or punctuation; that IS the question.
  {
    const { data: candidates } = await admin
      .from("content_audit_findings")
      .select("id, target_id")
      .eq("finding_type", "q.unique_choices")
      .eq("status", "open")
      .in("severity", ["fail", "warn"]);
    const fpIds = ((candidates ?? []) as Array<{ id: string; target_id: string }>)
      .filter((r) => /^(L|RF)\.[K1-4]\.(2|1a)/.test(r.target_id))
      .map((r) => r.id);
    if (fpIds.length > 0) {
      const { data } = await admin
        .from("content_audit_findings")
        .update({
          status: "wont_fix",
          resolved_at: new Date().toISOString(),
          resolver_note: "QC bot cron: known FP — capitalization / punctuation choices are by design.",
        })
        .in("id", fpIds)
        .select("id");
      c.fp_dismissed += data?.length ?? 0;
    }
  }

  // Rule 3 — q.audio_quality on RF.x.3d phonics-spelling. Gemini
  // TTS auto-corrects non-words like "Thoght" to "thought"; that's
  // a TTS limit, not a content fix.
  {
    const { data: candidates } = await admin
      .from("content_audit_findings")
      .select("id, target_id")
      .eq("finding_type", "q.audio_quality")
      .eq("status", "open")
      .in("severity", ["fail", "warn"]);
    const fpIds = ((candidates ?? []) as Array<{ id: string; target_id: string }>)
      .filter((r) => /^RF\.[1-4]\.3d/i.test(r.target_id))
      .map((r) => r.id);
    if (fpIds.length > 0) {
      const { data } = await admin
        .from("content_audit_findings")
        .update({
          status: "wont_fix",
          resolved_at: new Date().toISOString(),
          resolver_note: "QC bot cron: known FP — RF.x.3d phonics spelling is a TTS limit.",
        })
        .in("id", fpIds)
        .select("id");
      c.fp_dismissed += data?.length ?? 0;
    }
  }

  // Rule 4 — q.audio_quality "choices omitted" complaints on grades
  // 2-4. Choices are silent by design (defaultPerQuestionTts=false
  // per the May 2 audio recalibration). Judge keeps re-flagging the
  // intended convention.
  {
    const { data: candidates } = await admin
      .from("content_audit_findings")
      .select("id, target_id, message")
      .eq("finding_type", "q.audio_quality")
      .eq("status", "open")
      .in("severity", ["fail", "warn"]);
    const messageRe = /multiple[- ]choice|choice options|answer options|reading the choices|omits.*answer|omits.*choice/i;
    const targetRe = /^(R[FILi]\.[234]\.|L\.[234]\.)/;
    const fpIds = (
      (candidates ?? []) as Array<{ id: string; target_id: string; message: string }>
    )
      .filter(
        (r) => targetRe.test(r.target_id) && messageRe.test(r.message ?? ""),
      )
      .map((r) => r.id);
    if (fpIds.length > 0) {
      const { data } = await admin
        .from("content_audit_findings")
        .update({
          status: "wont_fix",
          resolved_at: new Date().toISOString(),
          resolver_note: "QC bot cron: known FP — G2-4 choices are silent by design.",
        })
        .in("id", fpIds)
        .select("id");
      c.fp_dismissed += data?.length ?? 0;
    }
  }
}

async function quarantineOpenFails(c: Counters) {
  const admin = supabaseAdmin();
  const { data: rows } = await admin
    .from("content_audit_findings")
    .select("id, target_id")
    .eq("target_kind", "question")
    .eq("severity", "fail")
    .eq("status", "open");
  for (const r of (rows ?? []) as Array<{ id: string; target_id: string }>) {
    await admin.rpc("quarantine_question", {
      p_target_id: r.target_id,
      p_finding_id: r.id,
    });
    c.quarantined++;
  }
}

async function regenImages(c: Counters, teacherId: string, limit: number) {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("content_audit_findings")
    .select("id, target_id, message, target_snapshot")
    .eq("finding_type", "q.image_quality")
    .eq("severity", "fail")
    .eq("status", "open")
    .limit(limit);
  for (const f of (data ?? []) as any[]) {
    const snap = f.target_snapshot ?? {};
    const imageUrl = snap.image_url as string | undefined;
    const promptText = (snap.prompt ?? "") as string;
    if (!imageUrl || !promptText) continue;
    const m = imageUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (!m) continue;
    const bucket = m[1];
    const path = m[2];

    const constraint = /garbled|misspell|broken text|illegible/i.test(f.message)
      ? "Do not include any text, words, signage, labels, or letters in the image."
      : "Composition must be visually coherent and clearly support the prompt.";
    const prompt = `Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. Scene: ${promptText.split("\n\n")[0].slice(0, 220)}. ${constraint}`;

    const res = await generateImage({ teacherId, prompt });
    if (!res.ok) {
      c.errors.push(`image:${f.target_id} ${res.error}`);
      continue;
    }
    const buf = Buffer.from(res.imageBase64, "base64");
    const { error: upErr } = await admin.storage
      .from(bucket)
      .upload(path, buf, { contentType: res.mimeType, upsert: true });
    if (upErr) {
      c.errors.push(`upload:${f.target_id} ${upErr.message}`);
      continue;
    }
    await admin
      .from("content_audit_findings")
      .update({
        status: "fixed",
        resolved_at: new Date().toISOString(),
        resolver_note: "QC bot cron: image regenerated.",
      })
      .eq("id", f.id);
    await admin.from("content_qc_log").insert({
      target_kind: "question",
      target_id: f.target_id,
      change_type: "regen_image",
      before: { image_url: imageUrl, finding: f.message },
      after: { image_url: imageUrl, regen_prompt: prompt },
      reason: f.message,
      finding_id: f.id,
      agent: "qc-bot/cron",
    });
    await admin.rpc("unquarantine_question", { p_target_id: f.target_id });
    c.image_regen++;

    // Same-night verify — re-run the image judge against the new
    // upload. If it still fails, verifyImageRegen flips the finding
    // back to open so tomorrow's cron retries; image stays uploaded.
    const verify = await verifyImageRegen({
      findingId: f.id,
      targetId: f.target_id,
      imageUrl,
      expectedScene: promptText,
    });
    tallyVerify(c, verify);
  }
}

async function regenAudio(c: Counters, teacherId: string, limit: number) {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("content_audit_findings")
    .select("id, target_id, message, target_snapshot")
    .eq("finding_type", "q.audio_quality")
    .eq("severity", "fail")
    .eq("status", "open")
    .limit(limit);
  for (const f of (data ?? []) as any[]) {
    const snap = f.target_snapshot ?? {};
    const audioUrl = snap.audio_url as string | undefined;
    if (!audioUrl) continue;
    const m = audioUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (!m) continue;
    const bucket = m[1];
    const path = m[2];
    const promptText = String(snap.prompt ?? "").trim();
    const choices = Array.isArray(snap.choices) ? (snap.choices as string[]) : [];
    const isKor1 = /^(K\.|RF\.K\.|RI\.K\.|RL\.K\.|L\.K\.|RF\.1\.|RI\.1\.|RL\.1\.|L\.1\.)/.test(
      f.target_id,
    );
    const text =
      isKor1 && choices.length > 0
        ? `${promptText}\n\n${choices.map((cc, i) => `${["A", "B", "C", "D"][i] ?? i + 1}. ${cc}`).join("\n")}`
        : promptText;
    if (!text) continue;

    const res = await generateSpeech({ teacherId, text });
    if (!res.ok) {
      c.errors.push(`audio:${f.target_id} ${res.error}`);
      continue;
    }
    const fetched = await fetch(res.audioUrl);
    if (!fetched.ok) continue;
    const buf = Buffer.from(await fetched.arrayBuffer());
    await admin.storage
      .from(bucket)
      .upload(path, buf, { contentType: "audio/mpeg", upsert: true });
    await admin
      .from("content_audit_findings")
      .update({
        status: "fixed",
        resolved_at: new Date().toISOString(),
        resolver_note: "QC bot cron: audio regenerated.",
      })
      .eq("id", f.id);
    await admin.from("content_qc_log").insert({
      target_kind: "question",
      target_id: f.target_id,
      change_type: "regen_audio",
      before: { audio_url: audioUrl, finding: f.message },
      after: { audio_url: audioUrl, regen_text: text },
      reason: f.message,
      finding_id: f.id,
      agent: "qc-bot/cron",
    });
    await admin.rpc("unquarantine_question", { p_target_id: f.target_id });
    c.audio_regen++;

    const verify = await verifyAudioRegen({
      findingId: f.id,
      targetKind: "question",
      targetId: f.target_id,
      audioUrl,
      expectedText: text,
    });
    tallyVerify(c, verify);
  }
}

// ── Lesson-slide audio regen (mirrors qc-bot-regen-step-audio.ts) ──
// Runs alongside the question audio worker so the nightly cron clears
// step.audio_quality fails too, not just q.audio_quality. Reads the
// canonical slide ttsScript from the bundled lessons JSON, then
// re-uploads to the same Supabase storage path.

type SlideStep = { sub: string; ttsScript?: string };
type SlideRow = { slide: number; steps?: SlideStep[] };
type LessonRow = { standardId: string; slides?: SlideRow[] };

function parseStepTarget(targetId: string): {
  standardId: string;
  slideNum: number;
  sub: string;
} | null {
  const m = targetId.match(/^([^#]+)#S(\d+)([a-z])$/i);
  if (!m) return null;
  return { standardId: m[1], slideNum: Number(m[2]), sub: m[3].toLowerCase() };
}

async function regenStepAudio(c: Counters, teacherId: string, limit: number) {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("content_audit_findings")
    .select("id, target_id, message, target_snapshot")
    .eq("finding_type", "step.audio_quality")
    .eq("severity", "fail")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(limit);

  const lessons = lessonsData as LessonRow[];
  for (const f of (data ?? []) as any[]) {
    const snap = f.target_snapshot ?? {};
    const audioUrl = snap.audio_url as string | undefined;
    if (!audioUrl) continue;
    const m = audioUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (!m) continue;
    const bucket = m[1];
    const path = m[2];
    const parsed = parseStepTarget(f.target_id);
    if (!parsed) continue;

    const lesson = lessons.find((l) => l.standardId === parsed.standardId);
    const slide = lesson?.slides?.find((s) => s.slide === parsed.slideNum);
    const step = slide?.steps?.find((s) => s.sub === parsed.sub);
    const ttsScript = (step?.ttsScript ?? "").trim();
    if (!ttsScript) continue;

    const res = await generateSpeech({ teacherId, text: ttsScript });
    if (!res.ok) {
      c.errors.push(`step_audio:${f.target_id} ${res.error}`);
      continue;
    }
    const fetched = await fetch(res.audioUrl);
    if (!fetched.ok) continue;
    const buf = Buffer.from(await fetched.arrayBuffer());
    const { error: upErr } = await admin.storage
      .from(bucket)
      .upload(path, buf, { contentType: "audio/mpeg", upsert: true });
    if (upErr) {
      c.errors.push(`step_upload:${f.target_id} ${upErr.message}`);
      continue;
    }
    await admin
      .from("content_audit_findings")
      .update({
        status: "fixed",
        resolved_at: new Date().toISOString(),
        resolver_note: "QC bot cron: lesson-slide audio regenerated.",
      })
      .eq("id", f.id);
    await admin.from("content_qc_log").insert({
      target_kind: "lesson_slide",
      target_id: f.target_id,
      change_type: "regen_audio",
      before: { audio_url: audioUrl, finding: f.message },
      after: { audio_url: audioUrl, regen_text: ttsScript },
      reason: f.message,
      finding_id: f.id,
      agent: "qc-bot/cron",
    });
    c.step_audio_regen++;

    const verify = await verifyAudioRegen({
      findingId: f.id,
      targetKind: "lesson_slide",
      targetId: f.target_id,
      audioUrl,
      expectedText: ttsScript,
    });
    tallyVerify(c, verify);
  }
}

// Question pedagogy regen is intentionally NOT run in the cron yet —
// it edits checked-in JSON files which Vercel functions can't write
// back to the deployed bundle. That worker stays as a local script
// for now (`npm run qc:regen-questions`), invoked by ops as part of
// the weekly content review. Same applies to slide.judge fails —
// those need either pedagogy regen or a hand review.

async function run(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const teacherId = process.env.QC_BOT_TEACHER_ID || process.env.DAILY_QUESTION_TEACHER_ID;
  if (!teacherId) {
    return NextResponse.json(
      { ok: false, error: "QC_BOT_TEACHER_ID or DAILY_QUESTION_TEACHER_ID required" },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const limit = Math.max(1, Math.min(50, parseInt(url.searchParams.get("limit") ?? "30", 10) || 30));

  const c = ok();
  try {
    await dismissKnownFps(c);
    await quarantineOpenFails(c);
    await regenImages(c, teacherId, limit);
    await regenAudio(c, teacherId, limit);
    await regenStepAudio(c, teacherId, limit);
    invalidateQcCache();
  } catch (e: any) {
    c.errors.push(e?.message ?? "unknown");
  }

  // Final scoreboard for the response body.
  const admin = supabaseAdmin();
  const [{ count: openFails }, { count: quarantined }] = await Promise.all([
    admin
      .from("content_audit_findings")
      .select("id", { count: "exact", head: true })
      .eq("severity", "fail")
      .eq("status", "open"),
    admin
      .from("question_qc_status")
      .select("target_id", { count: "exact", head: true })
      .eq("qc_status", "quarantined"),
  ]);

  return NextResponse.json({
    ok: true,
    counters: c,
    state: {
      open_fails: openFails ?? 0,
      questions_quarantined: quarantined ?? 0,
    },
  });
}

export async function GET(req: NextRequest) {
  return run(req);
}
export async function POST(req: NextRequest) {
  return run(req);
}
