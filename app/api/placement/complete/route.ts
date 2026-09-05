import { NextResponse, after } from "next/server";
import { PlacementSubmissionSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateSpeechVertex } from "@/lib/ai/vertex-tts";
import { decidePlacement } from "@/lib/placement/decide";
import { buildPlan } from "@/lib/placement/plan";
import { narrate } from "@/lib/placement/narration";
import { withSpokenName } from "@/lib/audio/name-pronunciation";
import { sendPlacementReportEmail } from "@/lib/email/placement-report";
import { trackFunnel } from "@/lib/analytics/funnel.server";
import { grades } from "@/lib/assessment/questions";
import type { LadderState } from "@/lib/placement/ladder";
import type { Moment, PlacementSubmission, NarrationLine } from "@/lib/placement/types";

/**
 * POST /api/placement/complete — the runner hands over the evidence; this
 * route decides, curates the path, writes the narration, and saves:
 *   placements row (the reveal reads it)
 *   assessments row (what the dashboard and journey already key off)
 *   children.reading_level (the band name the whole app anchors on)
 *   child_skill_memory seeds (the learner spine, SM-2 shape)
 * then synthesizes the narration clips in the background (Vertex, sequential)
 * and writes their private-bucket paths back onto the row. The reveal polls
 * /api/placement/result until the clips it needs exist.
 */

function seedRow(childId: string, standardId: string, pass: boolean, now: Date) {
  const ease = pass ? 2.55 : 2.3;
  const interval = pass ? 3 : 1;
  return {
    child_id: childId,
    standard_id: standardId,
    ease_factor: ease,
    interval_days: interval,
    consecutive_correct: pass ? 1 : 0,
    next_due: new Date(now.getTime() + interval * 86400000).toISOString(),
    total_correct: pass ? 1 : 0,
    total_attempted: 1,
    last_practiced_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 }); }
  const parsed = PlacementSubmissionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Bad submission.", issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  const sub = parsed.data as unknown as PlacementSubmission;

  const { data: child } = await supabase.from("children").select("id, first_name, parent_id, grade, name_said_as").eq("id", sub.childId).maybeSingle();
  if (!child || (child as { parent_id: string }).parent_id !== user.id) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  const childName = (((child as { first_name?: string }).first_name ?? "").split(" ")[0] || "Reader");
  if (sub.passageRecordingPath && !sub.passageRecordingPath.startsWith(`placement/${sub.childId}/`)) sub.passageRecordingPath = null;

  const now = new Date();
  const decision = decidePlacement({
    enrolled: sub.enrolled,
    ladder: sub.ladder as LadderState,
    passages: sub.passages,
    comprehension: sub.comprehension,
    foundations: sub.foundations,
    date: now,
  });
  const moments = sub.moments as unknown as Moment[];
  const plan = buildPlan({ decision, moments, today: now });
  const narration: NarrationLine[] = narrate({ childName, pronoun: "they", decision, moments, plan, today: now });

  const admin = supabaseAdmin();
  const { data: inserted, error: insErr } = await admin
    .from("placements")
    .insert({
      child_id: sub.childId,
      enrolled: String(sub.enrolled),
      decision,
      evidence: { ladder: sub.ladder, passages: sub.passages, comprehension: sub.comprehension, foundations: sub.foundations },
      moments,
      plan,
      narration,
      passage_recording_path: sub.passageRecordingPath ?? null,
      duration_seconds: Math.round(sub.durationSeconds),
    })
    .select("id")
    .single();
  if (insErr || !inserted) return NextResponse.json({ ok: false, error: "Could not save the placement." }, { status: 500 });
  const placementId = (inserted as { id: string }).id;

  // The funnel's assessment step. Server-side because it must not depend on the
  // child's browser surviving the redirect to the reveal.
  void trackFunnel("funnel.placement_complete", user.id, {
    child_id: sub.childId,
    placement_id: placementId,
    enrolled: sub.enrolled,
    placed_band: decision.placedBand,
    relative_delta: decision.relative.delta,
    reading_level: decision.readingLevelName,
    wcpm: decision.fluency?.wcpm ?? null,
    duration_seconds: Math.round(sub.durationSeconds),
    version: "v2",
  });

  // Legacy row the dashboard, journey and results page already key off.
  const comp = decision.comprehension;
  const scorePercent = comp && comp.total > 0 ? Math.round((comp.correct / comp.total) * 100) : decision.decoding.level !== null ? 100 : 0;
  await admin.from("assessments").insert({
    child_id: sub.childId,
    grade_tested: grades[decision.gradeKey]?.grade_label ?? String(sub.enrolled),
    score_percent: Math.max(0, Math.min(100, scorePercent)),
    reading_level_placed: decision.readingLevelName,
    answers: [],
    dimension_profile: {
      source: "placement-v2",
      placementId,
      placedBand: decision.placedBand,
      relative: decision.relative.label,
      fluency: decision.fluency ? { wcpm: decision.fluency.wcpm, accuracy: decision.fluency.accuracy, percentile: decision.fluency.percentile?.percentile ?? null } : null,
      comprehension: comp ? { correct: comp.correct, total: comp.total } : null,
      strengths: decision.strengths,
      needs: decision.needs,
    },
  });
  await admin.from("children").update({ reading_level: decision.readingLevelName }).eq("id", sub.childId);

  // Learner spine seeds (best-effort, never fail the placement).
  try {
    const rows = decision.seeds.map((s) => seedRow(sub.childId, s.standard_id, s.pass, now));
    if (rows.length) await admin.from("child_skill_memory").upsert(rows, { onConflict: "child_id,standard_id" });
  } catch { /* seeds are a garnish */ }

  // Narration clips: sequential Vertex synthesis after the response is sent
  // (next/server `after` keeps the serverless function alive for it); the
  // reveal polls for the paths. Each line says the child's name -> private bucket.
  after(async () => {
    // The parent's report email first (needs no audio): the same numbers and plan as the reveal.
    try { await sendPlacementReportEmail(placementId); } catch { /* the reveal still works without the email */ }
    const paths: Record<string, string> = {};
    for (const line of narration) {
      try {
        const spokenText = withSpokenName(line.text, childName, (child as { name_said_as?: string | null }).name_said_as).slice(0, 700);
        let res = await generateSpeechVertex({ text: spokenText, voice: "Autonoe" });
        if (!res.ok) { await new Promise((r) => setTimeout(r, 3000)); res = await generateSpeechVertex({ text: spokenText, voice: "Autonoe" }); }
        if (!res.ok) continue;
        const wav = pcmToWav(Buffer.from(res.pcmBase64, "base64"), 24000);
        const path = `placement/${sub.childId}/narr-${placementId.slice(0, 8)}-${line.id}.wav`;
        const { error } = await admin.storage.from("child-audio").upload(path, wav, { contentType: "audio/wav", upsert: true });
        if (error) continue;
        paths[line.id] = path;
        const withAudio = narration.map((l) => ({ ...l, audioPath: paths[l.id] ?? l.audioPath ?? null }));
        await admin.from("placements").update({ narration: withAudio }).eq("id", placementId);
      } catch { /* a missing clip only costs the parent a caption */ }
    }
  });

  return NextResponse.json({ ok: true, placementId, decision: { placedBand: decision.placedBand, readingLevelName: decision.readingLevelName } });
}

/** PCM s16le 24 kHz mono -> WAV container (same as lib/audio/child-greeting.ts). */
function pcmToWav(pcm: Buffer, sampleRate: number): Buffer {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0); header.writeUInt32LE(36 + pcm.length, 4); header.write("WAVE", 8);
  header.write("fmt ", 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write("data", 36); header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}
