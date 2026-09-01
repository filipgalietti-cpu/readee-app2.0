/**
 * One-time: move child greeting clips out of the PUBLIC `audio` bucket into
 * the PRIVATE `child-audio` bucket, rewrite children.greeting_audio_url to the
 * object path, and delete the now-orphaned public object. Idempotent — rows
 * already holding a path are skipped. (fluency/ recordings: 0 rows, nothing to
 * move.)  Usage: npx tsx scripts/migrate-child-audio.ts
 */
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: ".env.local" });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data: kids, error } = await sb
    .from("children")
    .select("id, greeting_audio_url")
    .not("greeting_audio_url", "is", null);
  if (error) throw error;

  let moved = 0, skipped = 0, missing = 0;
  for (const k of kids ?? []) {
    const url: string = k.greeting_audio_url;
    if (!url.startsWith("http")) { skipped++; continue; } // already a path
    const path = `greetings/${k.id}.wav`;

    const dl = await sb.storage.from("audio").download(path);
    if (dl.error || !dl.data) { missing++; console.warn(`⚠ ${k.id}: no public object`); continue; }
    const bytes = Buffer.from(await dl.data.arrayBuffer());

    const up = await sb.storage.from("child-audio").upload(path, bytes, { contentType: "audio/wav", upsert: true });
    if (up.error) { console.error(`✗ ${k.id}: upload ${up.error.message}`); continue; }

    const upd = await sb.from("children").update({ greeting_audio_url: path }).eq("id", k.id);
    if (upd.error) { console.error(`✗ ${k.id}: db ${upd.error.message}`); continue; }

    await sb.storage.from("audio").remove([path]); // drop the public copy
    moved++;
  }
  console.log(`\nmoved ${moved}, already-path ${skipped}, missing-object ${missing}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
