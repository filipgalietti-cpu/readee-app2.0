/** Round 2: regen the 6 surviving fails with genre-aware naturalistic style. */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" }); loadEnv();
import { targetedImageRegen } from "../lib/daily/build-daily";
const DATES = ["2026-07-20","2026-07-13","2026-07-11","2026-07-10","2026-07-07","2026-07-06"];
(async () => {
  for (const d of DATES) {
    const res = await targetedImageRegen({ date: new Date(`${d}T12:00:00Z`), force: true });
    console.log(d, JSON.stringify(res).slice(0, 120));
  }
})();
