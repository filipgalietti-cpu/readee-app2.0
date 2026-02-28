#!/usr/bin/env node

const fs = require("fs");

const FILES = [
  "app/data/kindergarten-standards-questions.json",
  "app/data/1st-grade-standards-questions.json",
  "app/data/2nd-grade-standards-questions.json",
  "app/data/3rd-grade-standards-questions.json",
  "app/data/4th-grade-standards-questions.json",
];

const LETTERS = ["A", "B", "C", "D"];

// Seeded PRNG for reproducibility
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function isCompleteSentence(s) {
  return /[.!?]$/.test(s.trim()) && s.trim().split(/\s+/).length > 3;
}

function cleanOption(s) {
  let c = s.trim();
  c = capitalize(c);
  // Remove trailing period unless it's a complete sentence
  if (c.endsWith(".") && !isCompleteSentence(c)) {
    c = c.slice(0, -1);
  }
  return c;
}

const rng = mulberry32(42);
const grade3Examples = [];

for (const file of FILES) {
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  const isGrade3 = file.includes("3rd");

  for (const std of data.standards) {
    for (const q of std.questions) {
      if (!q.choices) continue;

      const beforeIdx = q.choices.indexOf(q.correct);
      const beforeLetter = LETTERS[beforeIdx] || "?";

      // Clean options
      q.choices = q.choices.map(cleanOption);
      q.correct = cleanOption(q.correct);

      // Shuffle
      const shuffled = shuffle(q.choices, rng);
      const afterIdx = shuffled.indexOf(q.correct);
      const afterLetter = LETTERS[afterIdx] || "?";

      q.choices = shuffled;

      // Collect grade 3 examples where before=B/C and after=A/D
      if (
        isGrade3 &&
        (beforeLetter === "B" || beforeLetter === "C") &&
        (afterLetter === "A" || afterLetter === "D")
      ) {
        grade3Examples.push({
          id: q.id,
          beforeLetter,
          afterLetter,
          correct: q.correct,
        });
      }
    }
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

// Show 3 examples
console.log("Grade 3 verification (before=B/C, after=A/D):\n");
for (const ex of grade3Examples.slice(0, 3)) {
  console.log(
    `  ${ex.id}: was ${ex.beforeLetter} → now ${ex.afterLetter}  (${JSON.stringify(ex.correct)})`
  );
}
console.log(`\n  (${grade3Examples.length} total matches found)`);

// Show new distribution
console.log("\nNew distribution:");
for (const file of FILES) {
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  const counts = [0, 0, 0, 0];
  for (const std of data.standards) {
    for (const q of std.questions) {
      if (!q.choices) continue;
      const idx = q.choices.indexOf(q.correct);
      if (idx >= 0) counts[idx]++;
    }
  }
  console.log(
    "  " +
      file.split("/").pop() +
      ": " +
      counts.map((c, i) => LETTERS[i] + "=" + c).join(" ")
  );
}
