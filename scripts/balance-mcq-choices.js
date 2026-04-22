#!/usr/bin/env node
/**
 * Balance MCQ correct-answer letter positions across all grade banks.
 *
 * Audit found a strong A-bias (38% correct = A across 908 questions).
 * For each MCQ, picks a target slot for the correct answer based on
 * a round-robin counter so the final distribution lands ~25/25/25/25.
 *
 * Skips:
 *  - questions whose choices_audio_urls are positional (shuffling
 *    those would point at the wrong audio)
 *  - missing_word questions (already small distractor pools, less impact)
 *
 * Usage: node scripts/balance-mcq-choices.js
 */
const fs = require("fs");
const path = require("path");

const GRADES = ["kindergarten", "1st-grade", "2nd-grade", "3rd-grade", "4th-grade"];

// Round-robin: distribute correct answers across A/B/C/D slots evenly per grade
function rebalance(grade) {
  const file = path.resolve(__dirname, "..", "app", "data", `${grade}-standards-questions.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  let touched = 0, skipped = 0, byLetter = { A: 0, B: 0, C: 0, D: 0 };
  let counter = 0;

  for (const std of data.standards) {
    for (const q of std.questions) {
      if (!q.choices || q.choices.length !== 4 || !q.correct) continue;
      // Skip if positional audio is wired
      if (q.choices_audio_urls && q.choices_audio_urls.length) {
        skipped++;
        const idx = q.choices.indexOf(q.correct);
        if (idx >= 0) byLetter["ABCD"[idx]]++;
        continue;
      }
      const targetSlot = counter % 4;
      counter++;
      const correctText = q.correct;
      const others = q.choices.filter((c) => c !== correctText);
      if (others.length !== 3) { skipped++; continue; }
      // Build new array: slot in distractors, then drop correct at targetSlot
      const newChoices = [...others];
      newChoices.splice(targetSlot, 0, correctText);
      q.choices = newChoices;
      byLetter["ABCD"[targetSlot]]++;
      touched++;
    }
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  const t = touched + skipped;
  console.log(`${grade}: rebalanced ${touched} / skipped ${skipped} (positional audio) — final: A ${byLetter.A} (${Math.round(byLetter.A/t*100)}%) B ${byLetter.B} (${Math.round(byLetter.B/t*100)}%) C ${byLetter.C} (${Math.round(byLetter.C/t*100)}%) D ${byLetter.D} (${Math.round(byLetter.D/t*100)}%)`);
}

for (const g of GRADES) rebalance(g);
console.log("\nDone. Re-run the audit query to verify.");
