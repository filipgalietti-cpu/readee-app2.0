#!/usr/bin/env node
/**
 * Regenerate MCQ question + incorrect-answer audio for the specified grades.
 *
 * Usage: node scripts/regen-mcq-audio.js 1st-grade 2nd-grade 4th-grade
 *
 * For each MCQ in the listed grades, writes:
 *   - regen-mcq-q-{grade}.csv   — prompt + 4 choices in current array order, no letter labels
 *   - regen-mcq-i-{grade}.csv   — "The correct answer is {text}.", no letter labels
 *
 * Skips MCQs whose choices_audio_urls are positional (those don't use the
 * combined question audio file path the same way).
 *
 * After running this, you generate audio:
 *   node scripts/generate-audio.js --csv=regen-mcq-q-1st-grade.csv
 *   node scripts/generate-audio.js --csv=regen-mcq-i-1st-grade.csv
 * Then upload via:
 *   node scripts/upload-mcq.js 1st-grade <STANDARD_ID>   (per standard)
 *
 * Output filenames in the CSV map to: public/audio/{grade}/{standard}/{id}.mp3
 *                                     public/audio/{grade}/{standard}/{id}-incorrect.mp3
 */
const fs = require("fs");
const path = require("path");

function csvEscape(s) { return `"${String(s).replace(/"/g, '""')}"`; }

// Strip markdown emphasis (**word**) and quote chars from a prompt before TTS
function cleanForTTS(s) {
  return s
    .replace(/\*\*/g, "")           // drop ** emphasis markers
    .replace(/[\u201C\u201D]/g, '"') // smart quotes -> straight
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\n+/g, ". ")           // newlines become sentence breaks
    .replace(/\s+/g, " ")
    .trim();
}

const grades = process.argv.slice(2);
if (grades.length === 0) {
  console.error("Usage: node scripts/regen-mcq-audio.js <grade-folder> [<grade-folder> ...]");
  process.exit(1);
}

let qTotal = 0, iTotal = 0;

for (const grade of grades) {
  const file = path.resolve(__dirname, "..", "app", "data", `${grade}-standards-questions.json`);
  if (!fs.existsSync(file)) { console.warn(`skip ${grade} — no JSON`); continue; }
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));

  const qRows = [["lesson_id", "filename", "script_text", "voice_direction"]];
  const iRows = [["lesson_id", "filename", "script_text", "voice_direction"]];

  for (const std of data.standards) {
    for (const q of std.questions) {
      if (!q.choices || q.choices.length !== 4 || !q.correct) continue;
      // Skip positional audio MCQs
      if (q.choices_audio_urls && q.choices_audio_urls.length) continue;

      const folder = `${grade}/${std.standard_id}`;
      const promptClean = cleanForTTS(q.prompt);
      const choices = q.choices.map(cleanForTTS);
      const correct = cleanForTTS(q.correct);

      // Question audio: prompt then four choices in order, no letter labels
      const qScript = `${promptClean} ${choices[0]}. ${choices[1]}. ${choices[2]}. ${choices[3]}.`;
      qRows.push([folder, q.id, qScript, ""]);

      // Incorrect-answer audio: "The correct answer is X."
      const iScript = `The correct answer is ${correct}.`;
      iRows.push([folder, `${q.id}-incorrect`, iScript, ""]);
    }
  }

  const qOut = path.resolve(__dirname, `regen-mcq-q-${grade}.csv`);
  const iOut = path.resolve(__dirname, `regen-mcq-i-${grade}.csv`);
  fs.writeFileSync(qOut, qRows.map(r => r.map(csvEscape).join(",")).join("\n") + "\n");
  fs.writeFileSync(iOut, iRows.map(r => r.map(csvEscape).join(",")).join("\n") + "\n");

  console.log(`${grade}: ${qRows.length - 1} question audio + ${iRows.length - 1} incorrect audio queued`);
  qTotal += qRows.length - 1;
  iTotal += iRows.length - 1;
}

console.log(`\nTotal: ${qTotal} question + ${iTotal} incorrect = ${qTotal + iTotal} audio files to generate`);
