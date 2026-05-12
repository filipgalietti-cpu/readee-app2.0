/**
 * Force-regenerate the image on a daily_questions row with a tight,
 * species-anchored prompt. Use when the original generator produced
 * a chimera / wrong-animal image that the QC image judge didn't
 * catch (or never ran).
 *
 *   npx tsx scripts/regen-daily-image.ts 2026-05-12
 *   npx tsx scripts/regen-daily-image.ts 2026-05-12 --brief="..."
 *
 * The default brief is derived from passage_title + passage_body with
 * the model encouraged to enumerate every named animal/character so
 * we don't get a generic "cute critter at a pond" hand-wave.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClient } from "@supabase/supabase-js";
import { generateImage, generateImageBrief } from "@/lib/ai/readee-ai";
import { qcImage } from "@/lib/ai/qc";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TEACHER_ID = process.env.QC_BOT_TEACHER_ID!;
if (!SUPABASE_URL || !SERVICE_KEY || !TEACHER_ID) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / QC_BOT_TEACHER_ID");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  const slug = process.argv[2];
  const briefArg = process.argv.find((a) => a.startsWith("--brief="))?.split("=").slice(1).join("=");
  if (!slug) {
    console.error("Usage: npx tsx scripts/regen-daily-image.ts <YYYY-MM-DD> [--brief='...']");
    process.exit(1);
  }

  const { data: row, error } = await sb
    .from("daily_questions")
    .select("date, slug, passage_title, passage_body, image_url, qc_report")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !row) {
    console.error(`no row for ${slug}: ${error?.message ?? "not found"}`);
    process.exit(1);
  }

  // Build the brief. Either operator-provided or freshly generated
  // from the passage with the "name every animal/character" tweak so
  // the model doesn't paint a generic scene.
  let brief: string;
  if (briefArg) {
    brief = briefArg;
  } else {
    const briefRes = await generateImageBrief({
      teacherId: TEACHER_ID,
      passageTitle: (row as any).passage_title,
      passageBody: (row as any).passage_body,
    });
    if (!briefRes.ok) {
      console.error("brief:", briefRes.error);
      process.exit(1);
    }
    // Append an explicit anchor — most "wtf animal" cases come from
    // the model inventing a hybrid because the brief said "a cute
    // animal" instead of "a fluffy gray bunny."
    brief =
      briefRes.brief +
      "\n\nDraw every named animal/character as a clearly recognizable real-world species — no chimeras, no invented hybrids. If the text says bunny, draw a recognizable rabbit; squirrel, a recognizable squirrel; etc.";
  }

  console.log(`▶ Regenerating image for ${slug}`);
  console.log(`Brief:\n${brief.slice(0, 600)}\n`);

  const imgRes = await generateImage({ teacherId: TEACHER_ID, prompt: brief });
  if (!imgRes.ok) {
    console.error("image:", imgRes.error);
    process.exit(1);
  }

  // Run the image judge against the new image so we lock the QC
  // verdict on the regen, not the old one.
  const { checks: imageChecks } = await qcImage({
    teacherId: TEACHER_ID,
    imageUrl: imgRes.imageUrl,
    expectedScene: brief,
  });

  // Splice the new image checks into the existing qc_report, drop
  // any prior image.* entries.
  const oldReport = (row as any).qc_report ?? {};
  const oldChecks = Array.isArray(oldReport.checks) ? oldReport.checks : [];
  const otherChecks = oldChecks.filter(
    (c: any) => !String(c.name ?? "").startsWith("image."),
  );
  const updatedChecks: any[] = [...otherChecks, ...imageChecks];
  const sev = (s: string): number =>
    s === "fail" ? 2 : s === "warn" ? 1 : 0;
  const worst = updatedChecks.reduce(
    (acc, c: any) => Math.max(acc, sev(c.severity)),
    0,
  );
  const newOverall = worst === 2 ? "fail" : worst === 1 ? "warn" : "pass";

  const { error: updErr } = await sb
    .from("daily_questions")
    .update({
      image_url: imgRes.imageUrl,
      qc_report: {
        ...oldReport,
        checks: updatedChecks,
        overall: newOverall,
        regeneratedAt: new Date().toISOString(),
      },
      qc_overall: newOverall,
    })
    .eq("slug", slug);
  if (updErr) {
    console.error("db update:", updErr.message);
    process.exit(1);
  }

  console.log(`\n✓ Saved`);
  console.log(`  image_url: ${imgRes.imageUrl}`);
  console.log(`  qc_overall: ${newOverall}`);
  console.log(`  image checks: ${imageChecks.map((c) => `${c.name}=${c.severity}`).join(", ")}`);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
