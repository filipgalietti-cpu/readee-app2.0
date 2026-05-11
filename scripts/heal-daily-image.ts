/**
 * One-shot healer for daily_questions rows whose qc_overall='fail'
 * is driven by image judges. Re-runs targetedImageRegen for the
 * given date.
 *
 *   npx tsx scripts/heal-daily-image.ts 2026-05-06
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();
import { targetedImageRegen } from "@/lib/daily/build-daily";

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Usage: npx tsx scripts/heal-daily-image.ts <YYYY-MM-DD>");
    process.exit(1);
  }
  const date = new Date(`${arg}T12:00:00Z`);
  console.log(`Healing ${arg}...`);
  const r = await targetedImageRegen({ date });
  console.log(JSON.stringify(r, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
