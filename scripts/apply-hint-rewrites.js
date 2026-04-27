#!/usr/bin/env node
/**
 * apply-hint-rewrites — patches master_manifest.json with the rewrites
 * produced by audit-hints.js --rewrite.
 *
 * Reads scripts/hint-rewrites.json (id → new hint) and updates the
 * `hint` field on each matching question. Backs up the manifest first.
 *
 * Usage:
 *   node scripts/apply-hint-rewrites.js [--dry]
 *
 * After running, rebuild the per-grade data files:
 *   node scripts/build-master-manifest.js  (or whatever the rebuild script is)
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

const manifestPath = path.join(__dirname, "master_manifest.json");
const rewritesPath = path.join(__dirname, "hint-rewrites.json");

if (!fs.existsSync(rewritesPath)) {
  console.error("ERROR: scripts/hint-rewrites.json not found.");
  console.error("Run: GEMINI_API_KEY=... node scripts/audit-hints.js --rewrite");
  process.exit(1);
}

const rewrites = JSON.parse(fs.readFileSync(rewritesPath, "utf8"));
const ids = Object.keys(rewrites);
console.log(`Loaded ${ids.length} rewrites from hint-rewrites.json`);

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
let patched = 0;
let missing = 0;

for (const item of manifest) {
  if (rewrites[item.id]) {
    if (!dry) item.hint = rewrites[item.id];
    patched += 1;
  }
}

for (const id of ids) {
  if (!manifest.find((m) => m.id === id)) {
    console.warn(`  WARN: rewrite for "${id}" — id not in manifest`);
    missing += 1;
  }
}

console.log(`Patched ${patched} hints (${missing} ids missing in manifest).`);

if (!dry) {
  const backupPath = manifestPath + "." + Date.now() + ".bak";
  fs.copyFileSync(manifestPath, backupPath);
  console.log(`Backup → ${backupPath}`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Wrote ${manifestPath}`);
  console.log("\nNext: rebuild per-grade data files (scripts/build-master-manifest.js).");
} else {
  console.log("\n(dry run — no files written)");
}
