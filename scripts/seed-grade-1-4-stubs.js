#!/usr/bin/env node
/**
 * Append empty lesson stubs (just title + grade + domain + standardId)
 * for every standard in grades 1-4 to sample-lessons.json.
 *
 * Slides arrays start empty — content is built lesson-by-lesson after audit.
 */

const fs = require("fs");
const path = require("path");

const TITLES = {
  // ── 1st Grade ───────────────────────────────────────────────
  "RL.1.1": "Asking Story Questions",
  "RL.1.2": "Retelling Stories",
  "RL.1.3": "Characters, Settings, and Events",
  "RL.1.4": "Words That Show Feelings",
  "RL.1.5": "Story Books vs Fact Books",
  "RL.1.6": "Who's Telling the Story?",
  "RL.1.7": "Pictures and Stories Together",
  "RL.1.9": "Comparing Story Adventures",
  "RI.1.1": "Asking Fact Questions",
  "RI.1.2": "Main Topic and Key Details",
  "RI.1.3": "Connecting Ideas in Facts",
  "RI.1.4": "Figuring Out New Words",
  "RI.1.5": "Parts of a Fact Book",
  "RI.1.6": "Pictures vs Words",
  "RI.1.7": "Pictures Show Key Ideas",
  "RI.1.8": "Reasons the Author Gives",
  "RI.1.9": "Comparing Two Fact Books",
  "RF.1.1a": "What Makes a Sentence",
  "RF.1.2b": "Blending Sounds Into Words",
  "RF.1.2c": "First, Middle, and Last Sounds",
  "RF.1.2d": "Breaking Words Into Sounds",
  "RF.1.4b": "Reading Out Loud",
  "RF.1.4c": "Using Clues to Read",
  "L.1.4": "Word Meaning Detective",
  "L.1.4a": "Sentence Clues",
  "L.1.4b": "Word Beginnings and Endings",
  "L.1.4c": "Root Word Magic",
  "L.1.5": "How Words Connect",
  "L.1.5a": "Sorting Words Into Groups",
  "L.1.5b": "Defining Words",
  "L.1.5c": "Real-Life Word Connections",
  "L.1.5d": "Strong vs Mild Words",
  "L.1.6": "Using Big Words",

  // ── 2nd Grade ───────────────────────────────────────────────
  "RL.2.1": "Story Detective Questions",
  "RL.2.2": "Tales and Their Lessons",
  "RL.2.3": "How Characters React",
  "RL.2.4": "Words That Sing",
  "RL.2.5": "The Shape of a Story",
  "RL.2.6": "Different Points of View",
  "RL.2.7": "Pictures Tell More",
  "RL.2.9": "Same Story, Different Versions",
  "RL.2.10": "Reading Stories All Year",
  "RI.2.1": "Asking Smart Fact Questions",
  "RI.2.2": "Finding the Big Idea",
  "RI.2.3": "Connecting History and Science",
  "RI.2.4": "Word Meanings in Texts",
  "RI.2.5": "Finding Information Fast",
  "RI.2.6": "Why Did the Author Write This?",
  "RI.2.7": "Pictures Help Explain",
  "RI.2.8": "How Authors Back Up Their Points",
  "RI.2.9": "Comparing Two Fact Books",
  "RI.2.10": "Reading Facts All Year",
  "RF.2.3": "Phonics and Word Skills",
  "RF.2.3a": "Long and Short Vowels",
  "RF.2.3b": "Vowel Team Sounds",
  "RF.2.3c": "Two-Syllable Words",
  "RF.2.3d": "Prefixes and Suffixes",
  "RF.2.3e": "Tricky Spellings",
  "RF.2.3f": "Sight Words 2",
  "RF.2.4": "Reading with Flow",
  "RF.2.4a": "Reading with Purpose",
  "RF.2.4b": "Smooth Out-Loud Reading",
  "RF.2.4c": "Self-Correcting While Reading",
  "L.2.4": "Word Meaning Detective",
  "L.2.4a": "Sentence Clues",
  "L.2.4b": "Prefix Power",
  "L.2.4c": "Root Word Help",
  "L.2.4d": "Compound Word Power",
  "L.2.4e": "Using a Glossary",
  "L.2.5": "Word Connections",
  "L.2.5a": "Words in Real Life",
  "L.2.5b": "Shades of Meaning",
  "L.2.6": "Using Smart Words",

  // ── 3rd Grade ───────────────────────────────────────────────
  "RL.3.1": "Asking Smart Story Questions",
  "RL.3.2": "Folktales and Their Lessons",
  "RL.3.3": "What Characters Are Like",
  "RL.3.4": "Word Meanings in Stories",
  "RL.3.5": "Parts of Stories and Poems",
  "RL.3.6": "My View vs the Narrator's",
  "RL.3.7": "Pictures and Mood",
  "RL.3.9": "Comparing Themes and Plots",
  "RL.3.10": "Reading Stories All Year",
  "RI.3.1": "Asking Smart Fact Questions",
  "RI.3.2": "Main Idea and Key Details",
  "RI.3.3": "Connecting Events and Ideas",
  "RI.3.4": "Academic Word Meanings",
  "RI.3.5": "Using Text Features",
  "RI.3.6": "Author's Point of View",
  "RI.3.7": "Illustrations Tell Stories Too",
  "RI.3.8": "Logical Connections",
  "RI.3.9": "Comparing Two Texts",
  "RI.3.10": "Reading Facts All Year",
  "RF.3.3": "Word Analysis Skills",
  "RF.3.3a": "Common Prefixes and Suffixes",
  "RF.3.3b": "Latin Suffixes",
  "RF.3.3c": "Multisyllable Words",
  "RF.3.3d": "Tricky Spelling Patterns",
  "RF.3.4": "Reading with Flow",
  "RF.3.4a": "Reading with Purpose",
  "RF.3.4b": "Reading Prose and Poetry",
  "RF.3.4c": "Self-Correcting While Reading",
  "L.3.4": "Word Meaning Detective",
  "L.3.4a": "Sentence Clues",
  "L.3.4b": "Prefix Power",
  "L.3.4c": "Root Word Help",
  "L.3.4d": "Using a Dictionary",
  "L.3.5": "Words With Hidden Meanings",
  "L.3.5a": "Real and Imaginary Meanings",
  "L.3.5b": "Words in Real Life",
  "L.3.5c": "Word Strength Levels",
  "L.3.6": "Using Conversation Words",

  // ── 4th Grade ───────────────────────────────────────────────
  "RL.4.1": "Finding Story Details",
  "RL.4.2": "Discovering Themes",
  "RL.4.3": "Deep Character Detail",
  "RL.4.4": "Word Meanings in Stories",
  "RL.4.5": "Poems, Drama, and Prose",
  "RL.4.6": "Different Storytelling Voices",
  "RL.4.7": "Stories Across Mediums",
  "RL.4.9": "Same Theme, Different Cultures",
  "RL.4.10": "Reading Big Stories",
  "RI.4.1": "Finding Fact Details",
  "RI.4.2": "Main Idea Mastery",
  "RI.4.3": "Explaining Procedures",
  "RI.4.4": "Academic Word Meanings",
  "RI.4.5": "How Texts Are Built",
  "RI.4.6": "Firsthand vs Secondhand",
  "RI.4.7": "Information Across Forms",
  "RI.4.8": "Author's Reasons and Evidence",
  "RI.4.9": "Combining Two Texts",
  "RI.4.10": "Reading Big Facts",
  "RF.4.3": "Word Decoding Skills",
  "RF.4.3a": "Letter-Sound Combos",
  "RF.4.4": "Smooth Reading Skills",
  "L.4.4": "Word Meaning Detective",
  "L.4.4a": "Sentence Clues",
  "L.4.4b": "Greek and Latin Roots",
  "L.4.4c": "Reference Materials",
  "L.4.5": "Figurative Language",
  "L.4.5a": "Similes and Metaphors",
  "L.4.5b": "Idioms and Sayings",
  "L.4.5c": "Word Strength Levels",
  "L.4.6": "Using Big Vocabulary",
};

const GRADE_LABEL = {
  "1": "1st Grade",
  "2": "2nd Grade",
  "3": "3rd Grade",
  "4": "4th Grade",
};

function domainFor(prefix) {
  if (prefix === "RL") return "Reading Literature";
  if (prefix === "RI") return "Reading Informational Text";
  if (prefix === "RF") return "Foundational Skills";
  if (prefix === "L") return "Language";
  return "Unknown";
}

function gradeNumberFromStandardId(id) {
  const m = id.match(/^[A-Z]+\.(\d)\./);
  return m ? m[1] : null;
}

function loadGradeStandards(gradeKey, file) {
  const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", file), "utf-8"));
  return data.standards.map((s) => s.standard_id);
}

const sources = [
  { grade: "1", file: "app/data/1st-grade-standards-questions.json" },
  { grade: "2", file: "app/data/2nd-grade-standards-questions.json" },
  { grade: "3", file: "app/data/3rd-grade-standards-questions.json" },
  { grade: "4", file: "app/data/4th-grade-standards-questions.json" },
];

const lessonsPath = path.resolve(__dirname, "..", "app/data/sample-lessons.json");
const lessons = JSON.parse(fs.readFileSync(lessonsPath, "utf-8"));
const existing = new Set(lessons.map((l) => l.standardId));

let added = 0;
let missingTitle = [];

for (const { grade, file } of sources) {
  const ids = loadGradeStandards(grade, file);
  for (const id of ids) {
    if (existing.has(id)) continue;
    const prefix = id.split(".")[0];
    const title = TITLES[id];
    if (!title) {
      missingTitle.push(id);
      continue;
    }
    lessons.push({
      standardId: id,
      grade: GRADE_LABEL[grade],
      domain: domainFor(prefix),
      title,
      slides: [],
    });
    added++;
  }
}

fs.writeFileSync(lessonsPath, JSON.stringify(lessons, null, 2) + "\n");

console.log(`Added ${added} stub lessons.`);
if (missingTitle.length) {
  console.log(`\nMissing titles for ${missingTitle.length} standards:`);
  missingTitle.forEach((id) => console.log("  " + id));
}
console.log(`Total lessons in sample-lessons.json: ${lessons.length}`);
