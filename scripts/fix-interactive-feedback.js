#!/usr/bin/env node
/**
 * fix-interactive-feedback.js
 *
 * Applies audit feedback across all grades:
 * 1. tap_to_pair: Capitalize left_items + scramble right_items
 * 2. sentence_build (ordered): Scramble words array
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "app", "data");

/* ── Seeded shuffle ──────────────────────────────────── */

function seededShuffle(arr, seed) {
  const result = [...arr];
  let s = 0;
  for (const c of seed) s = ((s << 5) - s + c.charCodeAt(0)) | 0;
  // Ensure we get a different order — retry with salt if shuffle is identity
  for (let attempt = 0; attempt < 5; attempt++) {
    const out = [...result];
    let h = s + attempt * 7919;
    for (let i = out.length - 1; i > 0; i--) {
      h = (h * 1103515245 + 12345) & 0x7fffffff;
      const j = h % (i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    // Check it's actually different from input
    const same = out.every((v, i) => v === result[i]);
    if (!same) return out;
  }
  // Fallback: just reverse
  return result.reverse();
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ── Fix a single grade file ─────────────────────────── */

function fixGrade(filename) {
  console.log(`\n── ${filename} ──`);
  const filePath = path.join(DATA_DIR, filename);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let fixes = 0;

  for (const standard of data.standards) {
    for (let i = 0; i < standard.questions.length; i++) {
      const q = standard.questions[i];

      /* ── Fix tap_to_pair ──────────────────────────── */
      if (q.type === "tap_to_pair") {
        // 1. Capitalize left_items
        const newLeft = q.left_items.map(capitalize);

        // 2. Rebuild correct_pairs with capitalized keys
        const newPairs = {};
        for (let j = 0; j < q.left_items.length; j++) {
          const oldKey = q.left_items[j];
          const newKey = newLeft[j];
          newPairs[newKey] = q.correct_pairs[oldKey];
        }

        // 3. Scramble right_items
        const newRight = seededShuffle(q.right_items, q.id);

        // 4. Rebuild correct string
        const correctStr = newLeft
          .map((l) => `${l}→${newPairs[l]}`)
          .join(", ");

        q.left_items = newLeft;
        q.right_items = newRight;
        q.correct_pairs = newPairs;
        q.correct = correctStr;

        console.log(`  ✓ ${q.id} tap_to_pair: capitalized + scrambled`);
        fixes++;
      }

      /* ── Fix sentence_build (ordered) ─────────────── */
      if (q.type === "sentence_build" && q.ordered) {
        const scrambled = seededShuffle(q.words, q.id);
        q.words = scrambled;
        console.log(
          `  ✓ ${q.id} sentence_build: scrambled [${scrambled.join(", ")}]`
        );
        fixes++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  console.log(`  ${fixes} fixes applied`);
}

/* ── Run ─────────────────────────────────────────────── */

console.log("=== Applying interactive audit feedback (all grades) ===");

fixGrade("1st-grade-standards-questions.json");
fixGrade("2nd-grade-standards-questions.json");
fixGrade("3rd-grade-standards-questions.json");
fixGrade("4th-grade-standards-questions.json");

console.log("\n=== Done! ===");
