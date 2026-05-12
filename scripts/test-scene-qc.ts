/**
 * Smoke test for the new SceneSpec + structured image QC layer.
 * Runs against a real passage + two image URLs (old / new) so we can
 * see whether the new judge would have caught the May 12 chimera.
 *
 *   npx tsx scripts/test-scene-qc.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { extractSceneSpec, renderSpecAsBrief, describeSpec } from "@/lib/ai/scene-spec";
import { qcImageStructured } from "@/lib/ai/qc-scene";

const PASSAGE = {
  title: "A Fun Tuesday for Animal Friends",
  body:
    'It was Tuesday morning. A little brown squirrel woke up. He ran to find his friend, a fluffy bunny. "Let\'s go to the big pond!" said the squirrel. The bunny hopped along. They saw a duck swim. The duck had soft feathers. Two green frogs sat on a log. The frogs jumped into the water with a splash. What a fun Tuesday for the animal friends!',
};

// Old image: the "wtf animal" one that shipped pre-fix.
const OLD_IMAGE_URL =
  "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/images/custom/aa7b7ef9-ad2a-4944-a018-a3b7844fb2f0/502db71b-d806-435c-97d8-8b775df74717.png";

// New image: the fresh species-anchored regen.
const NEW_IMAGE_URL =
  "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/images/custom/00000000-0000-0000-0000-000000000001/0e4072de-11b2-44be-9892-e98e80691904.png";

const TEACHER_ID = process.env.QC_BOT_TEACHER_ID!;
if (!TEACHER_ID) {
  console.error("Need QC_BOT_TEACHER_ID");
  process.exit(1);
}

async function main() {
  console.log("\n── 1. Extract SceneSpec from passage ──\n");
  const specRes = await extractSceneSpec({
    teacherId: TEACHER_ID,
    passageTitle: PASSAGE.title,
    passageBody: PASSAGE.body,
  });
  if (!specRes.ok) {
    console.error("spec extract failed:", specRes.error);
    process.exit(1);
  }
  const spec = specRes.spec;
  console.log("spec:", describeSpec(spec));
  console.log("\nrendered brief:\n", renderSpecAsBrief(spec));

  console.log("\n── 2. Run structured QC against OLD image (the chimera) ──\n");
  const oldRes = await qcImageStructured({
    teacherId: TEACHER_ID,
    imageUrl: OLD_IMAGE_URL,
    spec,
  });
  for (const c of oldRes.checks) {
    console.log(`  [${c.severity.padEnd(4)}] ${c.name.padEnd(50)} ${c.message.slice(0, 120)}`);
  }

  console.log("\n── 3. Run structured QC against NEW image (post-regen) ──\n");
  const newRes = await qcImageStructured({
    teacherId: TEACHER_ID,
    imageUrl: NEW_IMAGE_URL,
    spec,
  });
  for (const c of newRes.checks) {
    console.log(`  [${c.severity.padEnd(4)}] ${c.name.padEnd(50)} ${c.message.slice(0, 120)}`);
  }

  const sevWeight = (s: string) => (s === "fail" ? 2 : s === "warn" ? 1 : 0);
  const oldWorst = oldRes.checks.reduce((m, c) => Math.max(m, sevWeight(c.severity)), 0);
  const newWorst = newRes.checks.reduce((m, c) => Math.max(m, sevWeight(c.severity)), 0);
  console.log("\n── Summary ──");
  console.log(`old image worst severity: ${["pass", "warn", "fail"][oldWorst]}`);
  console.log(`new image worst severity: ${["pass", "warn", "fail"][newWorst]}`);
  if (oldWorst > newWorst) {
    console.log("\n✓ New layer correctly distinguishes old (bad) from new (good).");
  } else if (oldWorst === newWorst && oldWorst === 0) {
    console.log("\n⚠ Both images passed — possibly a pass-bias still present.");
  } else {
    console.log("\n⚠ Old and new images surfaced same severity; review evidence above.");
  }
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
