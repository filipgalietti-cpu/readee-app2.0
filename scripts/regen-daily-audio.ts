/**
 * One-off: regenerate the passage TTS for a daily_questions row that
 * has no audio_url. Doesn't touch the passage, image, or QC — just
 * fills the audio gap.
 *
 * Usage:
 *   npx tsx scripts/regen-daily-audio.ts 2026-04-30
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { generateSpeech } from "../lib/ai/readee-ai";
import { supabaseAdmin } from "../lib/supabase/admin";

async function main() {
  const date = process.argv[2];
  if (!date) {
    console.error("Usage: npx tsx scripts/regen-daily-audio.ts YYYY-MM-DD");
    process.exit(1);
  }
  const teacherId = process.env.DAILY_QUESTION_TEACHER_ID;
  if (!teacherId) {
    console.error("DAILY_QUESTION_TEACHER_ID env var required.");
    process.exit(1);
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("daily_questions")
    .select("date, passage_title, passage_body, audio_url")
    .eq("date", date)
    .maybeSingle();
  if (error || !data) {
    console.error("Row not found for date:", date, error);
    process.exit(1);
  }
  const row = data as any;
  console.log(`Regenerating audio for ${row.date} — "${row.passage_title}"`);
  console.log(`Current audio_url: ${row.audio_url ?? "(none)"}`);

  const tts = await generateSpeech({
    teacherId,
    text: String(row.passage_body).slice(0, 1200),
  });
  if (!tts.ok) {
    console.error("TTS failed:", tts.error);
    process.exit(1);
  }
  console.log("New audio_url:", tts.audioUrl);

  const { error: updErr } = await supabase
    .from("daily_questions")
    .update({ audio_url: tts.audioUrl })
    .eq("date", row.date);
  if (updErr) {
    console.error("DB update failed:", updErr.message);
    process.exit(1);
  }
  console.log("Updated daily_questions row. Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
