/**
 * Adds a K-1 "easy rendition" (daily_questions.easy_variant) to an
 * EXISTING Daily Readee day. Reuses the exact pipeline step new days
 * run at build time (generateEasyRendition in lib/daily/build-daily.ts):
 * Gemini easy passage → 3 K-1 MCQs → QC judges → TTS narration.
 *
 *   npx tsx scripts/daily-easy-backfill.ts --date=2026-08-30
 *   npx tsx scripts/daily-easy-backfill.ts --date=2026-08-30 --force   # overwrite existing easy_variant
 *
 * Never touches the base rendition. If the easy generation fails QC
 * twice the row is left as-is (base-only day).
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClient } from "@supabase/supabase-js";
import { generateEasyRendition } from "@/lib/daily/build-daily";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TEACHER_ID = process.env.DAILY_QUESTION_TEACHER_ID!;
if (!SUPABASE_URL || !SERVICE_KEY || !TEACHER_ID) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + DAILY_QUESTION_TEACHER_ID");
  process.exit(1);
}

const dateArg = process.argv.find((a) => a.startsWith("--date="))?.slice(7) ?? "";
const force = process.argv.includes("--force");
if (!/^\d{4}-\d{2}-\d{2}$/.test(dateArg)) {
  console.error("Usage: npx tsx scripts/daily-easy-backfill.ts --date=YYYY-MM-DD [--force]");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  const { data: row, error } = await sb
    .from("daily_questions")
    .select("date, theme, passage_title, passage_body, easy_variant")
    .eq("date", dateArg)
    .maybeSingle();
  if (error) throw new Error(`db: ${error.message}`);
  if (!row) throw new Error(`no daily_questions row for ${dateArg}`);
  if (row.easy_variant && !force) {
    console.log(`${dateArg}: easy_variant already set — skipping (use --force to overwrite).`);
    return;
  }

  console.log(`${dateArg}: "${row.passage_title}" — generating easy rendition...`);
  const easy = await generateEasyRendition({
    teacherId: TEACHER_ID,
    themeLabel: String(row.theme ?? ""),
    baseTitle: String(row.passage_title ?? ""),
    baseBody: String(row.passage_body ?? ""),
    dateStr: dateArg,
  });
  if (!easy) {
    console.error(`${dateArg}: easy rendition failed QC twice — row left base-only.`);
    process.exit(2);
  }

  const { error: updErr } = await sb
    .from("daily_questions")
    .update({ easy_variant: easy })
    .eq("date", dateArg);
  if (updErr) throw new Error(`update: ${updErr.message}`);

  const words = easy.passage_body.split(/\s+/).filter(Boolean).length;
  console.log(`${dateArg}: easy_variant saved.`);
  console.log(`  title:   ${easy.passage_title}`);
  console.log(`  words:   ${words}`);
  console.log(`  audio:   ${easy.audio_url ?? "(none)"}`);
  console.log(`  mcqs:    ${1 + easy.extra_questions.length}`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
