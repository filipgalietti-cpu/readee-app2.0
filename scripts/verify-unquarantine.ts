/**
 * One-shot verification of the un-quarantine loop.
 *
 * Picks one currently-quarantined regenerated question, simulates
 * audio + image landing (by setting URL fields to placeholder strings),
 * triggers the same code path asset-fill uses, then confirms the row
 * flipped to 'pass' in question_qc_status.
 *
 *   npx tsx scripts/verify-unquarantine.ts
 *
 * Throws if anything in the loop is broken. Rolls back its own changes
 * at the end (restores audio_url/image_url to NULL and re-quarantines)
 * so the real asset-fill cron later can do the actual generation.
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { supabaseAdmin } from "@/lib/supabase/admin";

async function main() {
  const admin = supabaseAdmin();

  // 1. Pick one quarantined regen (NULL urls).
  const { data: targets } = await admin
    .from("questions_db")
    .select("id, audio_url, image_url, source, updated_at")
    .eq("source", "ai_regen")
    .is("audio_url", null)
    .is("image_url", null)
    .order("updated_at", { ascending: false })
    .limit(1);
  const target = (targets ?? [])[0] as
    | { id: string; audio_url: string | null; image_url: string | null }
    | undefined;
  if (!target) {
    console.error("FAIL: no quarantined regen with NULL urls found — nothing to verify.");
    process.exit(1);
  }
  const id = target.id;
  console.log(`Target question: ${id}`);

  // 2. Confirm it's actually in the gate as quarantined.
  const { data: pre } = await admin
    .from("question_qc_status")
    .select("qc_status")
    .eq("target_id", id)
    .maybeSingle();
  if (!pre || (pre as { qc_status: string }).qc_status !== "quarantined") {
    console.error(`FAIL: ${id} is not quarantined in question_qc_status (pre-state=${(pre as any)?.qc_status ?? "missing"}). Did the regen forget to call quarantine_question?`);
    process.exit(1);
  }
  console.log(`  pre-state in gate: quarantined ✓`);

  // 3. Simulate assets landing. Use placeholder URLs so we don't burn
  // Vertex/Imagen tokens on the test.
  const audioUrl = `https://example.test/verify-unquarantine/${id}.mp3`;
  const imageUrl = `https://example.test/verify-unquarantine/${id}.png`;
  await admin
    .from("questions_db")
    .update({ audio_url: audioUrl, image_url: imageUrl })
    .eq("id", id);
  console.log(`  placeholder URLs written`);

  // 4. Run the exact code path asset-fill uses to un-quarantine.
  //    Inlined here (the helper is non-exported in asset-fill.ts).
  const { data: q } = await admin
    .from("questions_db")
    .select("audio_url, image_url")
    .eq("id", id)
    .maybeSingle();
  if (!q || !(q as any).audio_url || !(q as any).image_url) {
    console.error("FAIL: placeholder URLs didn't stick.");
    process.exit(1);
  }
  const { data: gate } = await admin
    .from("question_qc_status")
    .select("qc_status")
    .eq("target_id", id)
    .maybeSingle();
  if ((gate as { qc_status: string }).qc_status === "quarantined") {
    const { error } = await admin.rpc("unquarantine_question", { p_target_id: id });
    if (error) {
      console.error(`FAIL: unquarantine_question RPC errored: ${error.message}`);
      process.exit(1);
    }
  }

  // 5. Verify gate flipped.
  const { data: post } = await admin
    .from("question_qc_status")
    .select("qc_status")
    .eq("target_id", id)
    .maybeSingle();
  const postStatus = (post as { qc_status: string } | null)?.qc_status;
  if (postStatus !== "pass") {
    console.error(`FAIL: post-state is ${postStatus}, expected 'pass'`);
    process.exit(1);
  }
  console.log(`  post-state in gate: ${postStatus} ✓`);
  console.log("");
  console.log("✓ Un-quarantine path works end-to-end.");

  // 6. Roll back: restore NULL urls + re-quarantine so the real
  // asset-fill cron later does the actual generation.
  await admin
    .from("questions_db")
    .update({ audio_url: null, image_url: null })
    .eq("id", id);
  await admin.rpc("quarantine_question", {
    p_target_id: id,
    p_finding_id: null,
  });
  console.log(`  rolled back ${id} to quarantined + null urls`);
}

main().catch((e) => {
  console.error("UNEXPECTED ERROR:", e);
  process.exit(1);
});
