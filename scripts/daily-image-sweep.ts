/**
 * DAILY IMAGE SWEEP — run the (factory-upgraded) image judge across recent
 * Daily Readee rows and report sloppy images. READ-ONLY: prints a verdict
 * table; regen is a separate pass once Filip eyeballs the report.
 *
 *   npx tsx scripts/daily-image-sweep.ts [--days=60]
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClient } from "@supabase/supabase-js";
import { judgeImageQuality } from "../lib/ai/qc-media";

const DAYS = Number((process.argv.find((a) => a.startsWith("--days=")) ?? "--days=60").split("=")[1]);

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const since = new Date(Date.now() - DAYS * 86400_000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("daily_questions")
    .select("date, passage_title, passage_body, image_url")
    .gte("date", since)
    .not("image_url", "is", null)
    .order("date", { ascending: false });
  if (error) throw error;

  let pass = 0, warn = 0, fail = 0, skipped = 0;
  const bad: string[] = [];
  console.log(`\nDAILY IMAGE SWEEP · ${data!.length} rows since ${since}\n`);
  for (const row of data!) {
    // Wikipedia portraits are licensed photos, not Imagen output — skip.
    if (/wikipedia|wikimedia/i.test(row.image_url)) { skipped++; continue; }
    const v = await judgeImageQuality({
      imageUrl: row.image_url,
      expectedScene: `Illustration for a kids passage titled "${row.passage_title}"`,
      passageBody: row.passage_body ?? undefined,
    });
    if (!v.ok) { skipped++; console.log(`  ${row.date}  ?? judge error: ${v.error}`); continue; }
    if (v.severity === "fail") { fail++; bad.push(`${row.date} FAIL ${v.reason.slice(0, 110)}\n    ${row.image_url}`); }
    else if (v.severity === "warn") { warn++; bad.push(`${row.date} warn ${v.reason.slice(0, 110)}`); }
    else pass++;
    process.stdout.write(v.severity === "fail" ? "F" : v.severity === "warn" ? "w" : ".");
  }
  console.log(`\n\npass ${pass} · warn ${warn} · FAIL ${fail} · skipped ${skipped}\n`);
  for (const b of bad) console.log(`  ${b}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
