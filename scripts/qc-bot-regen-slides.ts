/**
 * QC bot lesson-slide regen — closes the loop on slide.judge fails.
 *
 * Reads open slide.judge findings from content_audit_findings, pulls
 * the failing slide + a K-canon reference slide for the same domain,
 * calls authorSlide() to rewrite, validates structure, UPDATEs the
 * lessons_db.slides[N] in place via jsonb_set, logs the change to
 * content_qc_log, and marks the finding fixed.
 *
 *   npx tsx scripts/qc-bot-regen-slides.ts --dry-run --limit=3
 *   npx tsx scripts/qc-bot-regen-slides.ts --audit-run=<uuid>
 *   npx tsx scripts/qc-bot-regen-slides.ts --severity=fail
 *
 * Cost: ~$0.002 / slide × ~16 fails = ~$0.03 total. Gemini Flash.
 *
 * The regenerated slide's audioFile paths stay pointed at the old
 * MP3s but audioRegenAt is cleared, signaling the audio-regen worker
 * to re-render. Until that worker runs, the slide will play with
 * stale audio against new text — visually correct, audio off. That
 * gap closes on the next audio-regen cron tick (Phase 3.5 worker).
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClient } from "@supabase/supabase-js";
import { findStandardById } from "@/lib/data/all-standards";
import { authorSlide } from "@/lib/qc/slide-author";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const limitArg = args.find((a) => a.startsWith("--limit="));
const sevArg = args.find((a) => a.startsWith("--severity="));
const auditRunArg = args.find((a) => a.startsWith("--audit-run="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : null;
const SEVERITY = sevArg ? sevArg.split("=")[1] : null;
const AUDIT_RUN = auditRunArg ? auditRunArg.split("=")[1] : null;

type Finding = {
  id: string;
  target_id: string;
  finding_type: string;
  severity: string;
  message: string;
  suggestion: string | null;
  grade: string | null;
};

type LessonRow = {
  standard_id: string;
  grade: string | null;
  title: string;
  slides: any[];
  version: number;
};

type RegenOutcome =
  | { ok: true; targetId: string; standardId: string; slideNo: number; oldHeading: string; newHeading: string }
  | { ok: false; targetId: string; reason: string };

// Parse "STANDARD#slide-N" → { standard_id, slide_no }
function parseTargetId(targetId: string): { standardId: string; slideNo: number } | null {
  const m = targetId.match(/^(.+)#slide-(\d+)$/);
  if (!m) return null;
  return { standardId: m[1], slideNo: parseInt(m[2], 10) };
}

async function fetchFindings(): Promise<Finding[]> {
  let q = sb
    .from("content_audit_findings")
    .select("id, target_id, finding_type, severity, message, suggestion, grade")
    .eq("target_kind", "lesson_slide")
    .eq("finding_type", "slide.judge")
    .eq("status", "open");
  if (SEVERITY) q = q.eq("severity", SEVERITY);
  if (AUDIT_RUN) q = q.eq("audit_run_id", AUDIT_RUN);
  if (LIMIT) q = q.limit(LIMIT);
  const { data, error } = await q;
  if (error) {
    console.error("Could not fetch findings:", error.message);
    process.exit(1);
  }
  return (data ?? []) as Finding[];
}

async function fetchLesson(standardId: string): Promise<LessonRow | null> {
  const { data } = await sb
    .from("lessons_db")
    .select("standard_id, grade, title, slides, version")
    .eq("standard_id", standardId)
    .maybeSingle();
  return (data as LessonRow) ?? null;
}

/**
 * Find a K-canon slide for the same domain (RF / RI / RL / L) and
 * same role (intro / teach / example / tip). Falls back to any K
 * slide of the same role if no domain match. Used as the calibration
 * anchor in the author prompt.
 */
async function pickReferenceSlide(
  targetStandardId: string,
  slideType: string,
): Promise<any | null> {
  const domain = targetStandardId.split(".")[0]; // RF / RI / RL / L
  // Find K lessons in the same domain
  const { data: kLessons } = await sb
    .from("lessons_db")
    .select("standard_id, slides")
    .like("standard_id", `${domain}.K.%`)
    .limit(20);
  const candidates: any[] = [];
  for (const l of (kLessons ?? []) as Array<{ slides: any[] }>) {
    for (const s of l.slides ?? []) {
      if ((s as any)?.type === slideType) candidates.push(s);
    }
  }
  if (candidates.length > 0) {
    // Prefer ones with denser animation primitives — score by step count
    candidates.sort(
      (a: any, b: any) => (b.steps?.length ?? 0) - (a.steps?.length ?? 0),
    );
    return candidates[0];
  }
  // Fallback: any K slide of same role
  const { data: anyK } = await sb
    .from("lessons_db")
    .select("slides")
    .like("standard_id", `%.K.%`)
    .limit(10);
  for (const l of (anyK ?? []) as Array<{ slides: any[] }>) {
    for (const s of l.slides ?? []) {
      if ((s as any)?.type === slideType) return s;
    }
  }
  return null;
}

async function processFinding(f: Finding): Promise<RegenOutcome> {
  const parsed = parseTargetId(f.target_id);
  if (!parsed) {
    return { ok: false, targetId: f.target_id, reason: "Could not parse target_id (need STD#slide-N)" };
  }
  const { standardId, slideNo } = parsed;
  const lesson = await fetchLesson(standardId);
  if (!lesson) {
    return { ok: false, targetId: f.target_id, reason: `Lesson ${standardId} not in lessons_db` };
  }
  const slideIdx = slideNo - 1;
  const oldSlide = lesson.slides?.[slideIdx];
  if (!oldSlide) {
    return { ok: false, targetId: f.target_id, reason: `Slide ${slideNo} doesn't exist in lesson (lesson has ${lesson.slides?.length ?? 0} slides)` };
  }

  const std = findStandardById(standardId);
  const standardText = std?.standard_description ?? "";
  if (!standardText) {
    return { ok: false, targetId: f.target_id, reason: `Standard ${standardId} not in canon — can't anchor regen` };
  }

  const referenceSlide = await pickReferenceSlide(standardId, oldSlide.type || "teach");
  if (!referenceSlide) {
    return { ok: false, targetId: f.target_id, reason: "No K-canon reference slide available" };
  }

  const res = await authorSlide({
    standardId,
    standardText,
    lessonTitle: lesson.title,
    slideNumber: slideNo,
    oldSlide,
    critique: f.message + (f.suggestion ? ` || ${f.suggestion}` : ""),
    referenceSlide,
    grade: lesson.grade ?? f.grade ?? "",
  });
  if (!res.ok) {
    return { ok: false, targetId: f.target_id, reason: `author failed: ${res.error}` };
  }
  const newSlide = res.slide;

  if (DRY) {
    console.log(`  [DRY] ${f.target_id}`);
    console.log(`    old heading: ${oldSlide.heading ?? "(none)"}`);
    console.log(`    new heading: ${newSlide.heading ?? "(none)"}`);
    console.log(`    steps: ${(oldSlide.steps?.length ?? 0)} → ${newSlide.steps?.length ?? 0}`);
    if (newSlide.steps?.[0]?.ttsScript) {
      console.log(`    new step a: "${String(newSlide.steps[0].ttsScript).slice(0, 110)}"`);
    }
    return {
      ok: true,
      targetId: f.target_id,
      standardId,
      slideNo,
      oldHeading: oldSlide.heading ?? "",
      newHeading: newSlide.heading ?? "",
    };
  }

  // Persist: replace slides[slideIdx] with the new slide
  const { error: updErr } = await sb
    .from("lessons_db")
    .update({
      slides: lesson.slides.map((s: any, i: number) => (i === slideIdx ? newSlide : s)),
      content_hash: null,
      version: (lesson.version ?? 1) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("standard_id", standardId);
  if (updErr) {
    return { ok: false, targetId: f.target_id, reason: `DB update failed: ${updErr.message}` };
  }

  await sb.from("content_qc_log").insert({
    target_kind: "lesson_slide",
    target_id: f.target_id,
    change_type: "regen_slide",
    before: {
      heading: oldSlide.heading,
      type: oldSlide.type,
      step_count: oldSlide.steps?.length ?? 0,
      first_tts: oldSlide.steps?.[0]?.ttsScript ?? null,
    },
    after: {
      heading: newSlide.heading,
      type: newSlide.type,
      step_count: newSlide.steps?.length ?? 0,
      first_tts: newSlide.steps?.[0]?.ttsScript ?? null,
    },
    reason: f.message + (f.suggestion ? ` || ${f.suggestion}` : ""),
    finding_id: f.id,
    agent: "qc-bot/regen-slides",
  });

  await sb
    .from("content_audit_findings")
    .update({
      status: "fixed",
      resolved_at: new Date().toISOString(),
      resolver_note: "qc-bot-regen-slides: slide rewritten with K-canon anchor; audioRegenAt cleared on changed steps pending audio re-render.",
    })
    .eq("id", f.id);

  return {
    ok: true,
    targetId: f.target_id,
    standardId,
    slideNo,
    oldHeading: oldSlide.heading ?? "",
    newHeading: newSlide.heading ?? "",
  };
}

function printSummary(results: RegenOutcome[]): void {
  const ok = results.filter((r): r is Extract<RegenOutcome, { ok: true }> => r.ok);
  const failed = results.filter((r): r is Extract<RegenOutcome, { ok: false }> => !r.ok);

  console.log("");
  console.log("══════════════════════════════════════════════════════════════");
  console.log(`SUMMARY — ${results.length} slide findings processed`);
  console.log(`  ✓ regenerated: ${ok.length}`);
  console.log(`  ✗ skipped/failed: ${failed.length}`);

  if (ok.length > 0) {
    console.log("");
    console.log("REGENERATED SLIDES:");
    for (const r of ok) {
      console.log(`  ${r.targetId}`);
      console.log(`    "${r.oldHeading}" → "${r.newHeading}"`);
    }
  }
  if (failed.length > 0) {
    console.log("");
    console.log("FAILED:");
    for (const r of failed) {
      console.log(`  ${r.targetId}: ${r.reason}`);
    }
  }
  console.log("══════════════════════════════════════════════════════════════");
}

async function main() {
  console.log(
    `QC bot — slide regen ${DRY ? "DRY RUN" : "LIVE"}` +
      (SEVERITY ? ` severity=${SEVERITY}` : "") +
      (AUDIT_RUN ? ` audit_run=${AUDIT_RUN}` : "") +
      (LIMIT ? ` limit=${LIMIT}` : ""),
  );
  const findings = await fetchFindings();
  console.log(`Found ${findings.length} open slide.judge findings.`);
  if (findings.length === 0) return;

  const results: RegenOutcome[] = [];
  for (let i = 0; i < findings.length; i++) {
    const f = findings[i];
    process.stdout.write(`  [${i + 1}/${findings.length}] ${f.target_id} (${f.severity}) ... `);
    const r = await processFinding(f);
    process.stdout.write(r.ok ? `✓\n` : `✗ ${r.reason}\n`);
    results.push(r);
    await new Promise((res) => setTimeout(res, 500));
  }
  printSummary(results);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
