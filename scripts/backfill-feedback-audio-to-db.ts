/**
 * Backfill feedback-audio URLs into questions_db so the DB→JSON sync
 * stops stripping them (they were JSON-only). Reads the committed
 * backup map (scripts/feedback-audio-url-backup.json: question_id →
 * { audio_url, audio_regen, *_feedback_audio_url }) and merges those
 * fields into each question's jsonb payload, matched by payload->>'id'.
 *
 *   npx tsx scripts/backfill-feedback-audio-to-db.ts --dry   # preview
 *   npx tsx scripts/backfill-feedback-audio-to-db.ts         # apply
 *
 * Idempotent: merging the same URLs again is a no-op.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import fs from "node:fs/promises";
import path from "node:path";
import { supabaseAdmin } from "@/lib/supabase/admin";

const DRY = process.argv.includes("--dry");
const BACKUP = path.join(process.cwd(), "scripts", "feedback-audio-url-backup.json");

async function main() {
  const backup: Record<string, Record<string, unknown>> = JSON.parse(
    await fs.readFile(BACKUP, "utf-8"),
  );
  const qids = Object.keys(backup);
  console.log(`backup: ${qids.length} questions with audio URLs`);

  const admin = supabaseAdmin();

  // Pull every question row (id + payload) so we can merge in memory.
  const rows: Array<{ id: string; payload: Record<string, unknown> }> = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await admin
      .from("questions_db")
      .select("id, payload")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    rows.push(...(data as any[]));
    if (data.length < PAGE) break;
  }
  console.log(`questions_db rows fetched: ${rows.length}`);

  // Map payload->>'id' → row.
  const byQid = new Map<string, { id: string; payload: Record<string, unknown> }>();
  for (const r of rows) {
    const qid = (r.payload as any)?.id;
    if (typeof qid === "string") byQid.set(qid, r);
  }

  let matched = 0, missing = 0, unchanged = 0, updated = 0, failed = 0;
  const concurrency = 12;
  const pending: Array<Promise<void>> = [];

  for (const qid of qids) {
    const row = byQid.get(qid);
    if (!row) { missing++; continue; }
    matched++;
    const patch = backup[qid];
    // Skip if the payload already has every field with the same value.
    const already = Object.entries(patch).every(
      ([k, v]) => (row.payload as any)[k] === v,
    );
    if (already) { unchanged++; continue; }
    const merged = { ...row.payload, ...patch };

    if (DRY) { updated++; continue; }

    const p = (async () => {
      const { error } = await admin
        .from("questions_db")
        .update({ payload: merged })
        .eq("id", row.id);
      if (error) { failed++; console.error(`  ! ${qid}: ${error.message}`); }
      else { updated++; if (updated % 100 === 0) process.stdout.write(`${updated} `); }
    })();
    pending.push(p);
    if (pending.length >= concurrency) { await Promise.race(pending); }
    // prune settled
    for (let i = pending.length - 1; i >= 0; i--) {
      // @ts-expect-error inspect settled state via a marker
      if (pending[i].__done) pending.splice(i, 1);
    }
    p.then(() => { (p as any).__done = true; });
  }
  await Promise.all(pending);

  console.log(
    `\n${DRY ? "[DRY] " : ""}matched ${matched}, missing ${missing}, ` +
    `already-current ${unchanged}, ${DRY ? "would-update" : "updated"} ${updated}, failed ${failed}`,
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
