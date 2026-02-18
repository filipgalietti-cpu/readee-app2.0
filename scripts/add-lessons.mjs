import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Read existing lessons
const data = JSON.parse(readFileSync('lib/data/lessons.json', 'utf-8'));

// Read user-provided gap-fill lessons
const gapFill = JSON.parse(
  readFileSync(resolve(process.env.HOME, 'Downloads/updated lessonfiles/readee-gap-fill-lessons.json'), 'utf-8')
);

// 1. Update config to per-grade lesson counts
data.lesson_config.lessons_per_level = {
  "pre-k": 7, "kindergarten": 8, "1st": 8, "2nd": 9, "3rd": 10
};

// 2. Add standards to ALL existing lessons
const standardsMap = {
  "pk-L1": ["RF.K.1.d"], "pk-L2": ["RF.K.1.d"], "pk-L3": ["RF.K.2.d"],
  "pk-L4": ["RF.K.2.a"], "pk-L5": ["RF.K.1.d"],
  "k-L1": ["RF.K.3.a"], "k-L2": ["RF.K.3.b"], "k-L3": ["RF.K.2.d", "RF.K.3.b"],
  "k-L4": ["RF.K.3.c"], "k-L5": ["RF.K.2.c", "RF.K.3.d"],
  "1-L1": ["RF.1.3.b"], "1-L2": ["RF.1.3.a"], "1-L3": ["RF.1.3.c"],
  "1-L4": ["RF.1.4.a"], "1-L5": ["RF.1.3.g"],
  "2-L1": ["RF.2.3.b"], "2-L2": ["L.2.4.d"], "2-L3": ["RF.2.3.d"],
  "2-L4": ["RL.2.1"], "2-L5": ["RF.2.3.d"],
  "3-L1": ["RF.3.3.d"], "3-L2": ["RL.3.2", "RI.3.2"], "3-L3": ["RL.3.4", "RF.3.4.c"],
  "3-L4": ["RI.3.8"], "3-L5": ["RL.3.4", "RL.3.5"],
};

for (const level of Object.values(data.levels)) {
  for (const lesson of level.lessons) {
    if (standardsMap[lesson.id]) lesson.standards = standardsMap[lesson.id];
  }
}

// 3. Append new lessons from gap-fill file
const gradeKeys = ["pre-k", "kindergarten", "1st", "2nd", "3rd"];
for (const grade of gradeKeys) {
  const newLessons = gapFill.gap_fill_lessons[grade];
  if (newLessons) {
    data.levels[grade].lessons.push(...newLessons);
  }
}

// Write the updated file
writeFileSync('lib/data/lessons.json', JSON.stringify(data, null, 2) + '\n');
console.log('Done! Updated lessons.json with:');
const total = Object.values(data.levels).reduce((sum, l) => sum + l.lessons.length, 0);
console.log(`- Standards added to all existing lessons`);
console.log(`- ${total} total lessons`);
for (const grade of gradeKeys) {
  console.log(`  ${grade}: ${data.levels[grade].lessons.length} lessons`);
}
