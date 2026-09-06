/** Read-only: list every lessons-v2 object in both buckets, paginated. Writes a TSV. */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(url, key, { auth: { persistSession: false } });
const OUT = process.argv[2];

async function walk(bucket: string, prefix: string, out: string[]) {
  let offset = 0;
  for (;;) {
    const { data, error } = await admin.storage.from(bucket).list(prefix, { limit: 1000, offset });
    if (error) throw new Error(`${bucket}/${prefix}: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const e of data) {
      const p = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.id === null) await walk(bucket, p, out);          // folder
      else out.push(`${bucket}\t${p}\t${(e.metadata as any)?.size ?? ""}`);
    }
    if (data.length < 1000) break;
    offset += data.length;
  }
}

(async () => {
  const rows: string[] = [];
  for (const b of ["audio", "images"]) {
    const before = rows.length;
    await walk(b, "lessons-v2", rows);
    console.error(`  ${b}: ${rows.length - before} objects`);
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, rows.sort().join("\n") + "\n");
  console.error(`  wrote ${rows.length} rows -> ${OUT}`);
})();
