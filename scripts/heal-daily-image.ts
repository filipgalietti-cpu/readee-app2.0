/**
 * One-shot healer for a daily_questions row. Runs autoHealDaily which
 * dispatches surgical regens per failing check class — image,
 * passage (reading-level / fact-check / judge), and questions
 * (learning-objective). Up to 3 sweeps in case one fix exposes a
 * downstream issue. Read-time filter on /today hides any row still
 * at qc_overall='fail' after the heal.
 *
 *   npx tsx scripts/heal-daily-image.ts 2026-05-06
 *
 * (Filename kept for compatibility; the underlying call is the full
 * auto-heal dispatcher, not just image regen.)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();
import { autoHealDaily } from "@/lib/daily/build-daily";

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Usage: npx tsx scripts/heal-daily-image.ts <YYYY-MM-DD>");
    process.exit(1);
  }
  const date = new Date(`${arg}T12:00:00Z`);
  console.log(`Healing ${arg}...`);
  // Up to 3 sweeps — same logic as the cron retry path.
  for (let i = 0; i < 3; i++) {
    const r = await autoHealDaily({ date });
    console.log(`Pass ${i + 1}: ${JSON.stringify(r)}`);
    if (!r.ok) break;
    if (r.newOverall === "pass" || r.healed.length === 0) break;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
