#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "..", "app", "data", "kindergarten-standards-questions.json");
const outputPath = path.join(__dirname, "kindergarten-questions-qa.csv");

const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

function escapeCSV(val) {
  if (val == null) return "";
  const str = String(val).replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function splitPrompt(prompt) {
  const parts = prompt.split("\n\n");
  if (parts.length >= 2) {
    return {
      passage: parts.slice(0, -1).join(" ").trim(),
      question: parts[parts.length - 1].trim(),
    };
  }
  return { passage: "", question: prompt.trim() };
}

const headers = [
  "standard_id",
  "question_number",
  "passage_text",
  "question_prompt",
  "choice_1",
  "choice_2",
  "choice_3",
  "choice_4",
  "correct_answer",
  "hint",
  "difficulty",
  "QA_Status",
  "QA_Notes",
  "Suggested_Rewrite",
];

const rows = [headers.join(",")];

for (const standard of data.standards) {
  standard.questions.forEach((q, idx) => {
    const { passage, question } = splitPrompt(q.prompt);
    const choices = q.choices || [];
    rows.push(
      [
        escapeCSV(standard.standard_id),
        idx + 1,
        escapeCSV(passage),
        escapeCSV(question),
        escapeCSV(choices[0]),
        escapeCSV(choices[1]),
        escapeCSV(choices[2]),
        escapeCSV(choices[3]),
        escapeCSV(q.correct),
        escapeCSV(q.hint),
        q.difficulty,
        "",
        "",
        "",
      ].join(",")
    );
  });
}

fs.writeFileSync(outputPath, rows.join("\n") + "\n", "utf-8");
console.log(`Exported ${rows.length - 1} questions to ${outputPath}`);
