/**
 * Per-target executor endpoint — fires the format-rescue executor
 * for ONE target. Owner-only.
 *
 * Some actions can run from a serverless function (URL-rewrite ones
 * like regenerate_audio_with_constraint, regenerate_image_with_constraint).
 * Others edit checked-in JSON files (drop_audio, drop_image,
 * convert_to_X, render_chart_via_css, drop_question_entirely) which
 * Vercel can't persist — those return a "run-locally" hint instead
 * of executing.
 *
 * POST { targetId }
 * → { ok, executed, action, hint? }
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import { generateImage, generateSpeech } from "@/lib/ai/readee-ai";

export const dynamic = "force-dynamic";

const SERVERLESS_OK = new Set([
  "regenerate_audio_with_constraint",
  "regenerate_image_with_constraint",
]);

const NEEDS_LOCAL = new Set([
  "drop_audio",
  "drop_image",
  "convert_to_text_only",
  "convert_to_missing_word",
  "convert_to_sentence_build",
  "convert_to_category_sort",
  "convert_to_tap_to_pair",
  "convert_to_space_insertion",
  "render_chart_via_css",
  "drop_question_entirely",
]);

function parseStorage(url: string): { bucket: string; path: string } | null {
  const m = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return { bucket: m[1], path: m[2] };
}

export async function POST(req: NextRequest) {
  const profile = await requireProfile();
  if (!(await isPlatformAdmin(profile.id))) {
    return NextResponse.json({ ok: false, error: "owner only" }, { status: 403 });
  }
  const teacherId = process.env.QC_BOT_TEACHER_ID || profile.id;

  const body = await req.json().catch(() => ({}));
  const targetId = String(body?.targetId ?? "").trim();
  if (!targetId) {
    return NextResponse.json(
      { ok: false, error: "targetId required" },
      { status: 400 },
    );
  }

  const sb = supabaseAdmin();

  // Find the most recent unexecuted format_rescue_recommendation for
  // this target.
  const { data: recRows } = await sb
    .from("content_qc_log")
    .select("id, target_id, finding_id, after, before, reason, created_at")
    .eq("change_type", "format_rescue_recommendation")
    .eq("target_id", targetId)
    .order("created_at", { ascending: false })
    .limit(5);

  const recs = (recRows ?? []) as any[];
  if (recs.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No pending recommendation for this target" },
      { status: 404 },
    );
  }

  // Skip ones already executed.
  const findingIds = recs
    .map((r: any) => r.finding_id)
    .filter((x: string | null): x is string => !!x);
  const { data: executed } = await sb
    .from("content_qc_log")
    .select("finding_id")
    .eq("change_type", "format_executed")
    .in("finding_id", findingIds);
  const execSet = new Set(
    ((executed ?? []) as any[]).map((r: any) => r.finding_id),
  );
  const rec = recs.find(
    (r: any) => !r.finding_id || !execSet.has(r.finding_id),
  );
  if (!rec) {
    return NextResponse.json(
      { ok: false, error: "All recommendations already executed" },
      { status: 409 },
    );
  }

  const action = String(rec.after?.action ?? "keep_as_is");
  const constraint = (rec.after?.constraint as string | null) ?? null;

  if (NEEDS_LOCAL.has(action)) {
    return NextResponse.json({
      ok: true,
      executed: false,
      action,
      hint: `Run locally: QC_BOT_TEACHER_ID=<id> npx tsx scripts/qc-bot-format-execute.ts --target=${targetId}`,
    });
  }
  if (!SERVERLESS_OK.has(action)) {
    return NextResponse.json({
      ok: true,
      executed: false,
      action,
      hint: "No-op (keep_as_is) or unknown action.",
    });
  }

  // Look up the question's current asset URL via target_snapshot on
  // the most recent finding.
  const { data: finding } = await sb
    .from("content_audit_findings")
    .select("target_snapshot")
    .eq("target_id", targetId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const snap = (finding as any)?.target_snapshot ?? {};

  if (action === "regenerate_audio_with_constraint") {
    const audioUrl = snap.audio_url as string | undefined;
    if (!audioUrl) {
      return NextResponse.json(
        { ok: false, error: "no audio_url to overwrite" },
        { status: 400 },
      );
    }
    const text = `${constraint ?? ""}\n\n${snap.prompt ?? ""}`.trim();
    const tts = await generateSpeech({ teacherId, text });
    if (!tts.ok)
      return NextResponse.json({ ok: false, error: tts.error }, { status: 500 });
    const storage = parseStorage(audioUrl);
    if (storage) {
      const fetched = await fetch(tts.audioUrl);
      if (fetched.ok) {
        const buf = Buffer.from(await fetched.arrayBuffer());
        await sb.storage
          .from(storage.bucket)
          .upload(storage.path, buf, {
            contentType: "audio/mpeg",
            upsert: true,
          });
      }
    }
  }

  if (action === "regenerate_image_with_constraint") {
    const imageUrl = snap.image_url as string | undefined;
    if (!imageUrl) {
      return NextResponse.json(
        { ok: false, error: "no image_url to overwrite" },
        { status: 400 },
      );
    }
    const prompt = [
      "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors.",
      `Scene: ${(snap.prompt ?? "").slice(0, 220)}`,
      constraint ?? "",
    ]
      .filter(Boolean)
      .join(" ");
    const img = await generateImage({ teacherId, prompt });
    if (!img.ok)
      return NextResponse.json({ ok: false, error: img.error }, { status: 500 });
    const storage = parseStorage(imageUrl);
    if (storage) {
      const buf = Buffer.from(img.imageBase64, "base64");
      await sb.storage
        .from(storage.bucket)
        .upload(storage.path, buf, {
          contentType: img.mimeType,
          upsert: true,
        });
    }
  }

  // Log + mark fixed
  await sb.from("content_qc_log").insert({
    target_kind: "question",
    target_id: targetId,
    change_type: "format_executed",
    before: rec.before,
    after: { action, outcome: "applied", constraint },
    reason: `Executed format-rescue: ${action} (via API).`,
    finding_id: rec.finding_id,
    agent: "qc-bot/format-execute",
  });
  if (rec.finding_id) {
    await sb
      .from("content_audit_findings")
      .update({
        status: "fixed",
        resolved_at: new Date().toISOString(),
        resolver_note: `format-execute (API): ${action}.`,
      })
      .eq("id", rec.finding_id);
    await sb.rpc("quarantine_question", {
      p_target_id: targetId,
      p_finding_id: rec.finding_id,
    });
  }

  return NextResponse.json({ ok: true, executed: true, action });
}
