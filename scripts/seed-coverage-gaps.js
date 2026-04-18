#!/usr/bin/env node
/**
 * Add empty lesson stubs for the 23 CCSS Reading+Language standards
 * we don't currently cover, taking grade K-4 catalog from ~86% → ~98%.
 *
 * Skips Writing strand entirely (Readee scope = Reading + Language).
 *
 * Gaps filled:
 *  - RF.1.3a-g (1st-grade phonics — biggest single hole)
 *  - RF.1.4a (1st-grade fluency with purpose)
 *  - L.x.1 / L.x.2 / L.x.3 across grades 1-4 (grammar/conventions/usage)
 *  - RL.K.10, RI.K.10, RL.1.10, RI.1.10 (range-of-reading breadth)
 */

const fs = require("fs");
const path = require("path");

const NEW_LESSONS = [
  // 1st-grade phonics (RF.1.3 branch)
  { id: "RF.1.3a", grade: "1st Grade", domain: "Foundational Skills", title: "Two-Letter Sounds" },
  { id: "RF.1.3b", grade: "1st Grade", domain: "Foundational Skills", title: "Sounding Out Short Words" },
  { id: "RF.1.3c", grade: "1st Grade", domain: "Foundational Skills", title: "The Magic E" },
  { id: "RF.1.3d", grade: "1st Grade", domain: "Foundational Skills", title: "Counting Syllables" },
  { id: "RF.1.3e", grade: "1st Grade", domain: "Foundational Skills", title: "Two-Syllable Words" },
  { id: "RF.1.3f", grade: "1st Grade", domain: "Foundational Skills", title: "Word Endings" },
  { id: "RF.1.3g", grade: "1st Grade", domain: "Foundational Skills", title: "Tricky Sight Words" },
  { id: "RF.1.4a", grade: "1st Grade", domain: "Foundational Skills", title: "Reading with Purpose" },

  // Language conventions across grades 1-4
  { id: "L.1.1", grade: "1st Grade", domain: "Language", title: "Grammar Power" },
  { id: "L.1.2", grade: "1st Grade", domain: "Language", title: "Capitals and Periods" },
  { id: "L.2.1", grade: "2nd Grade", domain: "Language", title: "Sentence Skills" },
  { id: "L.2.2", grade: "2nd Grade", domain: "Language", title: "Apostrophes and Commas" },
  { id: "L.2.3", grade: "2nd Grade", domain: "Language", title: "Choosing Words to Sound Right" },
  { id: "L.3.1", grade: "3rd Grade", domain: "Language", title: "Verb Tenses and More" },
  { id: "L.3.2", grade: "3rd Grade", domain: "Language", title: "Quotes and Commas" },
  { id: "L.3.3", grade: "3rd Grade", domain: "Language", title: "Picking the Best Words" },
  { id: "L.4.1", grade: "4th Grade", domain: "Language", title: "Pronouns and Grammar Rules" },
  { id: "L.4.2", grade: "4th Grade", domain: "Language", title: "Punctuation Mastery" },
  { id: "L.4.3", grade: "4th Grade", domain: "Language", title: "Word Choice for Style" },

  // Range-of-reading breadth standards (K-1)
  { id: "RL.K.10", grade: "Kindergarten", domain: "Reading Literature", title: "Storytime All Year" },
  { id: "RI.K.10", grade: "Kindergarten", domain: "Reading Informational Text", title: "Fact Books All Year" },
  { id: "RL.1.10", grade: "1st Grade", domain: "Reading Literature", title: "Storytime All Year" },
  { id: "RI.1.10", grade: "1st Grade", domain: "Reading Informational Text", title: "Fact Books All Year" },
];

const lessonsPath = path.resolve(__dirname, "..", "app/data/sample-lessons.json");
const lessons = JSON.parse(fs.readFileSync(lessonsPath, "utf-8"));
const existing = new Set(lessons.map((l) => l.standardId));

let added = 0;
let skipped = 0;
for (const l of NEW_LESSONS) {
  if (existing.has(l.id)) { skipped++; continue; }
  lessons.push({
    standardId: l.id,
    grade: l.grade,
    domain: l.domain,
    title: l.title,
    slides: [],
  });
  added++;
}

fs.writeFileSync(lessonsPath, JSON.stringify(lessons, null, 2) + "\n");

console.log(`Added ${added} stubs (${skipped} already existed).`);
console.log(`Total lessons in sample-lessons.json: ${lessons.length}`);
