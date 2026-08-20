/**
 * Wire the batch-2 avatars into the app's data files from
 * scripts/avatars-batch-2.json:
 *   - SHOP_ITEMS + ITEM_CATCHPHRASES in lib/data/shop-items.ts
 *   - AVATAR_IMAGES in lib/utils/get-child-avatar.ts
 * Idempotent: skips a file if avatar_panda is already present.
 *
 *   node scripts/wire-avatars-batch-2.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const defs = JSON.parse(readFileSync(resolve(ROOT, "scripts/avatars-batch-2.json"), "utf8"));
const esc = (s) => String(s).replace(/"/g, '\\"');

function describe(subject) {
  let core = subject.replace(/^an?\s+/i, "").replace(/cartoon\s+/i, "").split(",")[0].trim();
  const article = /^[aeiou]/i.test(core) ? "An" : "A";
  return `${article} ${core}`;
}

const shopLines = defs
  .map((d) => `  { id: "${d.id}", name: "${esc(d.name)}", icon: "${d.icon}", category: "avatars", price: ${d.price}, description: "${esc(describe(d.subject))}" },`)
  .join("\n");
const phraseLines = defs.map((d) => `  ${d.id}: "${esc(d.phrase)}",`).join("\n");
const imgLines = defs.map((d) => `  ${d.id}: "/images/avatars/${d.id}.png",`).join("\n");

// ── shop-items.ts ──
const shopPath = resolve(ROOT, "lib/data/shop-items.ts");
let shop = readFileSync(shopPath, "utf8");
if (shop.includes('"avatar_panda"') || shop.includes("avatar_panda:")) {
  console.log("shop-items.ts already wired, skipping");
} else {
  shop = shop.replace(
    "\n\n  // ── Readee Outfits ──",
    `\n\n  // ── Avatars (batch 2) ──\n${shopLines}\n\n  // ── Readee Outfits ──`,
  );
  shop = shop.replace(
    "\n\n  // ── Outfits ──",
    `\n${phraseLines}\n\n  // ── Outfits ──`,
  );
  writeFileSync(shopPath, shop);
  console.log("shop-items.ts wired (SHOP_ITEMS + ITEM_CATCHPHRASES)");
}

// ── get-child-avatar.ts ──
const avPath = resolve(ROOT, "lib/utils/get-child-avatar.ts");
let av = readFileSync(avPath, "utf8");
if (av.includes("avatar_panda:")) {
  console.log("get-child-avatar.ts already wired, skipping");
} else {
  const anchor = '  avatar_lion: "/images/avatars/avatar_lion.png",';
  av = av.replace(anchor, `${anchor}\n  // Batch 2\n${imgLines}`);
  writeFileSync(avPath, av);
  console.log("get-child-avatar.ts wired (AVATAR_IMAGES)");
}

console.log(`done: ${defs.length} avatars`);
