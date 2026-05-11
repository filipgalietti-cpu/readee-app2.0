/**
 * Re-runs the new fact-check + learning-objective + audio + reading-
 * level judges against every existing daily_questions row. Prints a
 * report so we can see what the new gates would catch on already-
 * shipped content before marketing pushes traffic.
 *
 *   npx tsx scripts/audit-daily-history.ts
 *
 * Updates qc_overall + qc_report in-place when a fresh judgment is
 * stricter than the previous one (e.g., a row that used to be 'pass'
 * but the new fact-check finds a contradiction). Read-time filter on
 * /today already hides qc_overall='fail', so updating is safe.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClient } from "@supabase/supabase-js";
import { runFullQuizQc } from "@/lib/ai/qc";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TEACHER_ID = process.env.QC_BOT_TEACHER_ID!;
if (!SUPABASE_URL || !SERVICE_KEY || !TEACHER_ID) {
  console.error("Need URL + KEY + QC_BOT_TEACHER_ID");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  const { data, error } = await sb
    .from("daily_questions")
    .select(
      "date, passage_title, passage_body, image_url, audio_url, question_prompt, choices, correct, extra_questions, qc_overall",
    )
    .order("date", { ascending: false })
    .limit(14);
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  const rows = data ?? [];
  console.log(`Re-auditing ${rows.length} daily rows...`);

  for (const row of rows) {
    const date = (row as any).date as string;
    const extras = ((row as any).extra_questions ?? []) as any[];
    const questions = [
      {
        kind: "multiple_choice" as const,
        prompt: (row as any).question_prompt,
        choices: (row as any).choices,
        correct: (row as any).correct,
        hint: null,
      },
      ...extras.map((q: any) => ({
        kind: "multiple_choice" as const,
        prompt: q.prompt,
        choices: q.choices,
        correct: q.correct,
        hint: q.hint ?? null,
      })),
    ];
    // Hardcode 2nd grade — daily_questions doesn't store the grade
    // it was built for; the builder defaults to 2nd.
    const qc = await runFullQuizQc({
      teacherId: TEACHER_ID,
      passageTitle: (row as any).passage_title,
      passageBody: (row as any).passage_body,
      gradeLevel: "2nd",
      questions,
      imageUrl: (row as any).image_url ?? null,
      imageScene: null, // pre-existing rows didn't store the brief
      audioUrl: (row as any).audio_url ?? null,
    });
    const fails = qc.checks.filter((c) => c.severity === "fail");
    const warns = qc.checks.filter((c) => c.severity === "warn");
    const wasOverall = (row as any).qc_overall ?? "?";
    console.log(`\n${date}  overall ${wasOverall} → ${qc.overall}`);
    for (const f of fails) console.log(`  ✗ ${f.name}: ${f.message}`);
    for (const w of warns) console.log(`  · ${w.name}: ${w.message}`);

    // Update if the new verdict is stricter
    const sev = (s: string) => (s === "fail" ? 2 : s === "warn" ? 1 : 0);
    if (sev(qc.overall) > sev(wasOverall)) {
      await sb
        .from("daily_questions")
        .update({ qc_overall: qc.overall, qc_report: qc })
        .eq("date", date);
      console.log(`  → updated qc_overall to ${qc.overall}`);
    }
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
