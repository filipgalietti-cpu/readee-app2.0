/**
 * Backfill seeder for /discover. Builds one article per category
 * sequentially so the library has content on it by the time marketing
 * pushes traffic. Idempotent for re-runs (we always insert a new
 * row; slugs get auto-uniqued).
 *
 *   npx tsx scripts/seed-discovery.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { buildDiscoveryArticle } from "@/lib/discover/build-discovery";
import { listCategories } from "@/lib/discover/categories";

async function main() {
  const cats = listCategories();
  console.log(`Seeding ${cats.length} articles, one per category...`);
  let pass = 0;
  let warn = 0;
  let fail = 0;
  for (const cat of cats) {
    console.log(`\n[${cat.slug}] building...`);
    try {
      const r = await buildDiscoveryArticle({ category: cat.slug });
      if (r.ok) {
        if (r.qcOverall === "pass") pass++;
        else if (r.qcOverall === "warn") warn++;
        else fail++;
        console.log(
          `  ✓ ${r.slug} (qc=${r.qcOverall}, attempts=${r.attempts.join(",")})`,
        );
      } else {
        fail++;
        console.log(`  ✗ ${r.error}`);
      }
    } catch (e: any) {
      fail++;
      console.log(`  ✗ throw: ${e?.message}`);
    }
  }
  console.log(`\nDone — pass=${pass} warn=${warn} fail=${fail}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
