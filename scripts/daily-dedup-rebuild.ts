/** Bulk rebuild: for each content-dupe group keep the OLDEST day, rebuild the
 *  rest under the (now content-aware) avoid-list. Sequential; ~2-3 min each. */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" }); loadEnv();
import { buildDailyQuestion } from "../lib/daily/build-daily";
const REBUILD = [
  "2026-08-20", // cicadas (keep 07-23)
  "2026-08-16","2026-08-09","2026-07-12","2026-07-05","2026-06-07","2026-05-31", // lost toy (keep 05-17)
  "2026-08-15","2026-08-08","2026-08-01","2026-07-25", // exploring nature (keep 07-18)
  "2026-08-11","2026-07-21", // acorn (keep 05-26)
  "2026-08-06", // sunflowers (keep 06-25)
  "2026-08-04","2026-07-14","2026-07-07", // tuesday animals (keep 06-30)
  "2026-08-03", // shadows (keep 07-06)
  "2026-07-30", // hummingbirds (keep 06-23)
  "2026-07-26","2026-06-28","2026-06-14","2026-05-28","2026-05-24", // kite (keep 05-03)
  "2026-07-16","2026-07-13","2026-07-10","2026-07-02","2026-06-29","2026-06-15", // fireflies (keep 06-04)
  "2026-07-15", // bell (keep 07-01)
  "2026-07-11", // squirrel climb (keep 05-16)
  "2026-07-09", // butterflies (keep 06-18)
  "2026-07-08", // wright bros (keep 05-27)
  "2026-06-27", // squirrel explore (keep 06-13)
  "2026-06-22", // sweat (keep 06-08)
  "2026-06-21", // breakfast (keep 05-10)
  "2026-06-09", // axolotl (keep 05-19)
  "2026-06-02", // animal friends (keep 05-12)
  "2026-05-22","2026-05-15","2026-05-08", // butterflies-feet (keep 05-01)
  "2026-05-09", // fox (keep 05-02)
];
(async () => {
  let ok = 0, fail = 0;
  for (const d of REBUILD) {
    const res = await buildDailyQuestion({ date: new Date(`${d}T12:00:00Z`), force: true });
    if (res.ok) { ok++; console.log(`${d} ✓ rebuilt (${(res as any).qcOverall})`); }
    else { fail++; console.log(`${d} ✗ ${(res as any).error}`); }
  }
  console.log(`\nDONE: ${ok} rebuilt, ${fail} failed of ${REBUILD.length}`);
})();
