/**
 * Generate a set of Readee bunny mascot variants. The base character is
 * locked: same white bunny, round black-framed glasses, bright purple
 * t-shirt, bright pink inner ears. What changes is the pose / prop /
 * expression so different empty states get a contextually-matching
 * bunny instead of one frozen celebrate-bunny everywhere.
 *
 * Outputs to /public/images/ui/bunny-{slug}.png so they ship as
 * static Next.js assets — `<Image src="/images/ui/bunny-{slug}.png" />`.
 *
 * Run once. Re-runnable (overwrites by slug).
 *
 *   npx tsx scripts/seed-bunny-mascots.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import fs from "node:fs/promises";
import path from "node:path";
import { generateImage } from "@/lib/ai/readee-ai";

const TEACHER = process.env.QC_BOT_TEACHER_ID!;
if (!TEACHER) {
  console.error("Need QC_BOT_TEACHER_ID");
  process.exit(1);
}

// Character lock — every prompt below repeats this block so the model
// keeps the same bunny across poses. Matches bunny-celebrate.png:
// white body, big bright-pink inner ears, round black-framed glasses,
// bright purple t-shirt, friendly cartoon proportions.
const CHARACTER =
  "A cheerful white cartoon bunny wearing round black-framed glasses and a bright purple t-shirt. Big upright ears with bright pink inner ears. Friendly chibi proportions, big head, small body. Standing on hind legs unless the pose says otherwise.";

const STYLE =
  "Bright 2D cartoon illustration, bold clean black outlines, flat vibrant saturated colors, soft pastel background, kid-friendly K-4 reading app mascot style. Square 1:1 composition. Single character centered. No text, no letters, no words.";

const POSES: Array<{ slug: string; prompt: string }> = [
  {
    slug: "welcome",
    prompt: `${CHARACTER} Pose: smiling warmly and waving one paw to say hi. Eyes open and bright, mouth in a friendly smile. Tiny sparkles drifting around. ${STYLE}`,
  },
  {
    slug: "reading",
    prompt: `${CHARACTER} Pose: sitting and holding open a small storybook with both paws, eyes happily focused on the page. The book has a soft yellow cover with no text on it. ${STYLE}`,
  },
  {
    slug: "thinking",
    prompt: `${CHARACTER} Pose: standing with one paw thoughtfully touching the chin, eyes looking up slightly, small lightbulb floating near the head. Curious expression. ${STYLE}`,
  },
  {
    slug: "sleepy",
    prompt: `${CHARACTER} Pose: cozy and sleepy — eyes closed in soft happy curves, a small striped nightcap, one paw covering a yawn. A tiny soft "Z" floating near the head. ${STYLE}`,
  },
  {
    slug: "search",
    prompt: `${CHARACTER} Pose: holding a large round magnifying glass up to one eye with both paws, curious tilted-head expression, like searching for something. ${STYLE}`,
  },
  {
    slug: "cheer",
    prompt: `${CHARACTER} Pose: bouncing forward with both paws raised in the air, joyful open-mouth smile, tiny confetti pieces around. Energetic motion. ${STYLE}`,
  },
  {
    slug: "wave-clipboard",
    prompt: `${CHARACTER} Pose: holding a small clipboard with a checkmark, the other paw giving a thumbs-up, proud encouraging smile. Conveys "you've got this." ${STYLE}`,
  },
  {
    slug: "stars",
    prompt: `${CHARACTER} Pose: pointing upward at a row of small bright stars with one paw, eyes wide with wonder, mouth in an excited "wow" smile. ${STYLE}`,
  },
];

async function main() {
  const outDir = path.join(process.cwd(), "public", "images", "ui");
  await fs.mkdir(outDir, { recursive: true });
  console.log(`Generating ${POSES.length} bunny mascot variants → ${outDir}\n`);

  for (const p of POSES) {
    console.log(`[bunny-${p.slug}] generating...`);
    const img = await generateImage({ teacherId: TEACHER, prompt: p.prompt });
    if (!img.ok) {
      console.log(`  ✗ ${img.error}`);
      continue;
    }
    const res = await fetch(img.imageUrl);
    if (!res.ok) {
      console.log(`  ✗ fetch failed HTTP ${res.status}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const outPath = path.join(outDir, `bunny-${p.slug}.png`);
    await fs.writeFile(outPath, buf);
    console.log(`  ✓ /images/ui/bunny-${p.slug}.png`);
  }
  console.log("\nDone. Commit the new pngs and ship.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
