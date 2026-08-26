/** Final convergence: rebuild remaining dupes with the WHOLE archive as
 *  avoid-list; fix not-live/no-img/short-MCQ stragglers. */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" }); loadEnv();
import { createClient } from "@supabase/supabase-js";
import { buildDailyQuestion, targetedImageRegen, targetedQuestionsRegen } from "../lib/daily/build-daily";
const REBUILD = [
  "2026-08-22","2026-07-19","2026-07-05", // beach (keep 06-27)
  "2026-08-15","2026-07-25",              // cave (keep 06-20)
  "2026-08-11","2026-07-28","2026-06-13", // pip squirrel (keep 06-06)
  "2026-08-10",                            // seesaw (keep 06-15)
  "2026-08-09",                            // swim (keep 06-28)
  "2026-08-04",                            // ants + its short MCQ (keep 06-09)
  "2026-07-18","2026-05-30","2026-05-09", // path (keep 05-02)
  "2026-06-30",                            // tuesday fun (keep 05-12)
  "2026-06-21",                            // surprise (keep 05-10)
  "2026-06-14",                            // bike (keep 05-24)
];
(async () => {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await sb.from("daily_questions").select("date, passage_title, passage_body");
  const buildAvoid = (excludeDate: string) =>
    data!.filter((r) => r.date !== excludeDate)
      .map((r) => `${r.passage_title} (${(r.passage_body ?? "").replace(/\s+/g, " ").slice(0, 70)}...)`);
  for (const d of REBUILD) {
    const res = await buildDailyQuestion({ date: new Date(`${d}T12:00:00Z`), force: true, extraAvoid: buildAvoid(d) });
    console.log(d, res.ok ? `✓ (${(res as any).qcOverall})` : `✗ ${(res as any).error}`);
  }
  // stragglers: July 13 (not-live + no-img), June 27 + June 22 (not-live)
  const r13 = await targetedImageRegen({ date: new Date("2026-07-13T12:00:00Z"), force: true });
  console.log("07-13 img:", JSON.stringify(r13).slice(0, 60));
  for (const d of ["2026-07-13","2026-06-27","2026-06-22"]) {
    await sb.from("daily_questions").update({ published_state: "live" }).eq("date", d).neq("qc_overall", "___never");
    console.log(d, "published");
  }
})();
