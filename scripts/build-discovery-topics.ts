/**
 * One-off operator runner: build specific discovery articles by topic
 * hint (used when curating a category up to its target count). Same
 * builder + QC + auto-heal as the seeder; only the topic is pinned.
 *
 *   npx tsx scripts/build-discovery-topics.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { buildDiscoveryArticle } from "@/lib/discover/build-discovery";
import type { DiscoveryCategory } from "@/lib/discover/categories";

const JOBS: Array<{ category: DiscoveryCategory; topicHint: string }> = [
  {
    category: "history",
    topicHint:
      "The Wright Brothers and the first airplane flight at Kitty Hawk in 1903 - how two brothers built a flying machine and made the first powered flight",
  },
  {
    category: "history",
    topicHint:
      "The Great Wall of China - a giant wall built long ago across China to protect the land, how workers built it stone by stone over many years",
  },
];

async function main() {
  console.log(`Building ${JOBS.length} discovery articles by topic...`);
  for (const job of JOBS) {
    console.log(`\n[${job.category}] "${job.topicHint.slice(0, 50)}..."`);
    try {
      const r = await buildDiscoveryArticle(job);
      if (r.ok) {
        console.log(
          `  ✓ ${r.slug} (qc=${r.qcOverall}, attempts=${r.attempts.join(",")})`,
        );
      } else {
        console.log(`  ✗ ${r.error}`);
      }
    } catch (e: any) {
      console.log(`  ✗ throw: ${e?.message}`);
    }
  }
  console.log(`\nDone.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
