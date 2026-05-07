/**
 * One-shot seeder: run checkLessonRichness against every lesson in
 * app/data/sample-lessons.json and upsert findings into
 * content_audit_findings so the QC bot dashboard shows them right
 * now, without waiting for the next full audit pass.
 *
 *   npx tsx scripts/qc-seed-richness-findings.ts
 *
 * Idempotent — uses (target_kind, target_id, finding_type) as the
 * dedupe key. Re-runs are safe.
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { checkLessonRichness } from "../lib/ai/qc-lesson";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const GRADE_SHORT: Record<string, string> = {
  Kindergarten: "K",
  "1st Grade": "1",
  "2nd Grade": "2",
  "3rd Grade": "3",
  "4th Grade": "4",
};

async function main() {
  const raw = await fs.readFile(
    path.join(process.cwd(), "app", "data", "sample-lessons.json"),
    "utf-8",
  );
  const lessons = JSON.parse(raw) as Array<{
    standardId: string;
    grade: string;
    title: string;
    slides: any[];
  }>;
  console.log(`Scanning ${lessons.length} lessons...`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  for (const lesson of lessons) {
    const findings = checkLessonRichness({
      standardId: lesson.standardId,
      lesson,
    });
    if (findings.length === 0) {
      skipped++;
      continue;
    }
    for (const f of findings) {
      // Upsert by (target_kind, target_id, finding_type) so a
      // re-run flips an existing row to open instead of duplicating.
      const { data: existing } = await sb
        .from("content_audit_findings")
        .select("id, status")
        .eq("target_kind", "lesson")
        .eq("target_id", lesson.standardId)
        .eq("finding_type", f.type)
        .maybeSingle();

      const payload = {
        target_kind: "lesson",
        target_id: lesson.standardId,
        finding_type: f.type,
        severity: f.severity,
        message: f.message,
        suggestion: f.suggestion ?? null,
        status: "open" as const,
        grade: GRADE_SHORT[lesson.grade] ?? null,
        target_snapshot: {
          standardId: lesson.standardId,
          title: lesson.title,
          slideCount: lesson.slides?.length ?? 0,
          slidesPreview: (lesson.slides ?? []).slice(0, 3),
        },
      };

      if (existing) {
        const { error: upErr } = await sb
          .from("content_audit_findings")
          .update({ ...payload, status: "open" })
          .eq("id", existing.id);
        if (upErr) {
          console.error(`  ! update ${lesson.standardId} ${f.type}:`, upErr.message);
          continue;
        }
        updated++;
      } else {
        const { error: insErr } = await sb
          .from("content_audit_findings")
          .insert(payload);
        if (insErr) {
          console.error(`  ! insert ${lesson.standardId} ${f.type}:`, insErr.message);
          continue;
        }
        inserted++;
      }
    }
  }

  console.log(`Done — inserted ${inserted}, updated ${updated}, skipped ${skipped}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
