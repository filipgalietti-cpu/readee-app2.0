/**
 * Manual test runner for buildDiscoveryArticle. Builds ONE article in
 * the given category and prints the result. Used to validate the
 * loop end-to-end before wiring per-category crons.
 *
 *   npx tsx scripts/test-discovery.ts science
 *   npx tsx scripts/test-discovery.ts history "Sacagawea"
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { buildDiscoveryArticle } from "@/lib/discover/build-discovery";
import type { DiscoveryCategory } from "@/lib/discover/categories";

async function main() {
  const category = process.argv[2] as DiscoveryCategory | undefined;
  const topicHint = process.argv[3];
  if (!category) {
    console.error(
      "Usage: npx tsx scripts/test-discovery.ts <category> [topic-hint]",
    );
    console.error(
      "Categories: science | history | nature | inventions | sports | stories | math_in_real_life",
    );
    process.exit(1);
  }
  console.log(`Building 1 ${category} article...`);
  const res = await buildDiscoveryArticle({ category, topicHint });
  console.log(JSON.stringify(res, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
