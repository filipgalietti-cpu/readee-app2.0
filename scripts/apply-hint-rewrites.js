#!/usr/bin/env node
/**
 * apply-hint-rewrites — patches the per-grade data files
 * (app/data/*-standards-questions.json) with the rewrites produced by
 * audit-hints.js --rewrite.
 *
 * Reads scripts/hint-rewrites.json (id → new hint), finds each
 * question across the 5 per-grade files, and updates the `hint` field
 * in place. Backs up each modified file first.
 *
 * Usage:
 *   node scripts/apply-hint-rewrites.js [--dry]
 *
 * Hint AUDIO is intentionally NOT regenerated — hints are text-only
 * popups in the product now. The hint_audio_url field is left as-is
 * (stale URLs that just won't be used at runtime).
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2).reduce((acc, a) => {
  acc[a.replace(/^--/, "")] = true;
  return acc;
}, {});
const dry = !!args.dry;

const PER_GRADE_FILES = [
  "kindergarten-standards-questions.json",
  "1st-grade-standards-questions.json",
  "2nd-grade-standards-questions.json",
  "3rd-grade-standards-questions.json",
  "4th-grade-standards-questions.json",
];

const rewritesPath = path.join(__dirname, "hint-rewrites.json");
if (!fs.existsSync(rewritesPath)) {
  console.error("ERROR: scripts/hint-rewrites.json not found.");
  console.error("Run: GEMINI_API_KEY=... node scripts/audit-hints.js --rewrite");
  process.exit(1);
}

const rewrites = JSON.parse(fs.readFileSync(rewritesPath, "utf8"));
const ids = Object.keys(rewrites);
console.log(`Loaded ${ids.length} rewrites from hint-rewrites.json`);

const dataDir = path.join(__dirname, "..", "app", "data");
let totalPatched = 0;
const found = new Set();

for (const fileName of PER_GRADE_FILES) {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) continue;
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let patched = 0;
  for (const standard of data.standards ?? []) {
    for (const q of standard.questions ?? []) {
      if (rewrites[q.id]) {
        if (!dry) q.hint = rewrites[q.id];
        patched += 1;
        found.add(q.id);
      }
    }
  }
  if (patched > 0) {
    if (!dry) {
      const backup = filePath + "." + Date.now() + ".bak";
      fs.copyFileSync(filePath, backup);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`  ${fileName}: patched ${patched}, backup → ${path.basename(backup)}`);
    } else {
      console.log(`  ${fileName}: would patch ${patched}`);
    }
    totalPatched += patched;
  }
}

const missing = ids.filter((id) => !found.has(id));
if (missing.length > 0) {
  console.warn(`\nWARN: ${missing.length} rewrite IDs not found in any per-grade file:`);
  for (const id of missing.slice(0, 10)) console.warn(`  - ${id}`);
  if (missing.length > 10) console.warn(`  ...and ${missing.length - 10} more`);
}

console.log(`\nTotal: ${totalPatched} hints patched across ${PER_GRADE_FILES.length} per-grade files.`);
if (dry) console.log("(dry run — no files written)");
