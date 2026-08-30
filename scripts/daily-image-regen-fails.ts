/** One-off: regen the sweep's confirmed-fail Daily images through the
 *  (source-fixed) spec pipeline. 2026-07-23 cicada held for style review. */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" }); loadEnv();
import { targetedImageRegen } from "../lib/daily/build-daily";

const DATES = ["2026-07-31","2026-07-29","2026-07-27","2026-07-24","2026-07-22","2026-07-20","2026-07-16","2026-07-13","2026-07-11","2026-07-10","2026-07-07","2026-07-06","2026-07-04","2026-07-02"];

(async () => {
  for (const d of DATES) {
    const res = await targetedImageRegen({ date: new Date(`${d}T12:00:00Z`), force: true });
    if (res.ok && "regenerated" in res && res.regenerated) console.log(`${d} ✓ regen (${res.newOverall})`);
    else if (res.ok) console.log(`${d} — skipped: ${(res as any).reason}`);
    else console.log(`${d} ✗ ${res.error}`);
  }
})();
