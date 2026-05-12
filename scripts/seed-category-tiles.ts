/**
 * Generate one tile image per discovery category. Bright 2D cartoon
 * style matching the rest of Readee. Uploads each to
 * images/discovery-tiles/{slug}.png in Supabase storage so the
 * /discover index can render them via a stable public URL.
 *
 * Run once. Re-runnable — uploads are upsert so it just overwrites.
 *
 *   npx tsx scripts/seed-category-tiles.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClient } from "@supabase/supabase-js";
import { generateImage } from "@/lib/ai/readee-ai";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TEACHER = process.env.QC_BOT_TEACHER_ID!;
if (!SUPABASE_URL || !SERVICE_KEY || !TEACHER) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + QC_BOT_TEACHER_ID");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const STYLE =
  "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, square 1:1 composition, single subject centered, no text, no letters, no people's faces, kid-friendly playful style suitable for a K-4 reading app tile.";

const TILES: Array<{ slug: string; prompt: string }> = [
  {
    slug: "science",
    prompt: `A single colorful test tube with bubbling liquid and glowing bubbles, on a soft pastel blue gradient background. ${STYLE}`,
  },
  {
    slug: "history",
    prompt: `An open old book with a quill pen and a small scroll, on a warm sandy gradient background. ${STYLE}`,
  },
  {
    slug: "nature",
    prompt: `A green oak tree with leaves and a small bird perched on a branch, on a soft sky-blue gradient background. ${STYLE}`,
  },
  {
    slug: "inventions",
    prompt: `A glowing yellow lightbulb with gears around it, on a soft pastel orange gradient background. ${STYLE}`,
  },
  {
    slug: "sports",
    prompt: `A bouncing soccer ball with a few motion lines, on a soft pastel green gradient background. ${STYLE}`,
  },
  {
    slug: "stories",
    prompt: `An open storybook with a tiny dragon and a castle popping out, on a soft pastel purple gradient background. ${STYLE}`,
  },
  {
    slug: "math_in_real_life",
    prompt: `A slice of pizza next to colorful number digits (1, 2, 3), on a soft pastel pink gradient background. ${STYLE}`,
  },
];

async function main() {
  console.log(`Seeding ${TILES.length} category tiles...`);
  for (const t of TILES) {
    console.log(`\n[${t.slug}] generating...`);
    const img = await generateImage({ teacherId: TEACHER, prompt: t.prompt });
    if (!img.ok) {
      console.log(`  ✗ ${img.error}`);
      continue;
    }
    const fetched = await fetch(img.imageUrl);
    if (!fetched.ok) {
      console.log(`  ✗ fetch failed: ${fetched.status}`);
      continue;
    }
    const buf = Buffer.from(await fetched.arrayBuffer());
    const path = `discovery-tiles/${t.slug}.png`;
    const { error } = await sb.storage
      .from("images")
      .upload(path, buf, { contentType: "image/png", upsert: true });
    if (error) {
      console.log(`  ✗ upload: ${error.message}`);
      continue;
    }
    const { data: pub } = sb.storage.from("images").getPublicUrl(path);
    console.log(`  ✓ ${pub.publicUrl}`);
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
