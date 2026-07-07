/**
 * Apply de-slop text swaps (Pass 2) — surgical old->new replacements of
 * transcript-y on-screen text with terse anchors. Audio is NOT touched
 * (ttsScript + audioFile unchanged). Reads scripts/deslop-fixes.json:
 *   [{ std, fixes:[{old, new}] }]
 *
 *   npx tsx scripts/merge-deslop.ts --dry
 *   npx tsx scripts/merge-deslop.ts
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";

const SAMPLE = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const FIXES = path.resolve(process.cwd(), "scripts/deslop-fixes.json");
const DRY = process.argv.includes("--dry");
const norm = (s: string) => String(s ?? "").replace(/\s+/g, " ").trim();

async function main() {
  const lessons: any[] = JSON.parse(await fs.readFile(SAMPLE, "utf-8"));
  const fixes: any[] = JSON.parse(await fs.readFile(FIXES, "utf-8"));
  const byStd = new Map(lessons.map((l) => [l.standardId, l]));
  let applied = 0, unmatched = 0;

  for (const lf of fixes) {
    const l = byStd.get(lf.std);
    if (!l) continue;
    for (const fix of lf.fixes ?? []) {
      const oldN = norm(fix.old);
      if (!oldN || !fix.new) continue;
      let hit = false;
      for (const s of l.slides ?? []) {
        if (s.type === "interactive") continue; // forks handled separately
        for (const st of s.steps ?? []) {
          if (typeof st.displayText === "string" && norm(st.displayText) === oldN) { st.displayText = fix.new; hit = true; }
          if (Array.isArray(st.displayParts)) {
            // single part match
            for (const p of st.displayParts) if (norm(p.text) === oldN) { p.text = fix.new; hit = true; }
            // whole-multipart match (review-input joins parts with " / ") —
            // collapse the transcript-split parts into one clean anchor.
            const joined = norm(st.displayParts.map((p: any) => p.text).join(" / "));
            if (!hit && joined === oldN) { st.displayParts = [{ text: fix.new, delay: 0 }]; hit = true; }
          }
        }
      }
      if (hit) { applied++; if (DRY) console.log(`  ${lf.std}: "${fix.old.slice(0, 40)}" -> "${fix.new}"`); }
      else { unmatched++; if (DRY) console.log(`  ${lf.std}: ⚠ no match for "${fix.old.slice(0, 50)}"`); }
    }
  }

  if (DRY) { console.log(`\n(dry — ${applied} would apply, ${unmatched} unmatched)`); return; }
  await fs.writeFile(SAMPLE, JSON.stringify(lessons, null, 2));
  console.log(`✓ applied ${applied} anchor swaps (${unmatched} unmatched). Audio untouched. wrote sample-lessons.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
