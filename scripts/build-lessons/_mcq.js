/**
 * Shared MCQ authoring helper.
 *
 * Usage:
 *   const addMCQs = require("./_mcq");
 *   addMCQs({
 *     standardId: "RF.1.3a",
 *     grade: "1st Grade",        // passed to know which *-standards-questions.json
 *     description: "Know the spelling-sound correspondences for common consonant digraphs",
 *     parentTip: "Quick phonics parent tip",
 *     questions: [
 *       { type: "multiple_choice", prompt: "...", choices: ["A","B","C","D"], correct: "A",
 *         hint: "hint text", difficulty: 1, imagePrompt: "..." },
 *       ...
 *     ],
 *   });
 *
 * Writes:
 *   - patches the standards-questions JSON for the grade with 5 full question records
 *     (id, type, prompt, choices, correct, hint, difficulty, audio_url, hint_audio_url,
 *      image_url)
 *   - scripts/regen-<slug>-mcq-audio.csv  (question audio + hint audio)
 *   - scripts/regen-<slug>-mcq-imgs.csv   (one image per question)
 */
const fs = require("fs");
const path = require("path");

const GRADE_FOLDER = {
  Kindergarten: "kindergarten",
  "1st Grade": "1st-grade",
  "2nd Grade": "2nd-grade",
  "3rd Grade": "3rd-grade",
  "4th Grade": "4th-grade",
};
const GRADE_FILE = {
  Kindergarten: "kindergarten-standards-questions.json",
  "1st Grade": "1st-grade-standards-questions.json",
  "2nd Grade": "2nd-grade-standards-questions.json",
  "3rd Grade": "3rd-grade-standards-questions.json",
  "4th Grade": "4th-grade-standards-questions.json",
};

const SUPABASE_STORAGE = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public";

function csvEscape(s) { return `"${String(s).replace(/"/g, '""')}"`; }

module.exports = function addMCQs({ standardId, grade, description, parentTip, domain, questions }) {
  const gradeFolder = GRADE_FOLDER[grade];
  const questionsFile = GRADE_FILE[grade];
  if (!gradeFolder || !questionsFile) throw new Error(`Unknown grade: ${grade}`);

  const qPath = path.resolve(__dirname, "..", "..", "app", "data", questionsFile);
  const qData = JSON.parse(fs.readFileSync(qPath, "utf-8"));

  // Materialize full question records
  const fullQs = questions.map((q, i) => {
    const qId = `${standardId}-Q${i + 1}`;
    return {
      id: qId,
      type: q.type,
      prompt: q.prompt,
      ...(q.choices ? { choices: q.choices } : {}),
      ...(q.sentence_words ? { sentence_words: q.sentence_words } : {}),
      ...(q.blank_index !== undefined ? { blank_index: q.blank_index } : {}),
      ...(q.missing_choices ? { missing_choices: q.missing_choices } : {}),
      correct: q.correct,
      hint: q.hint,
      difficulty: q.difficulty ?? 1,
      hint_audio_url: `${SUPABASE_STORAGE}/audio/${gradeFolder}/${standardId}/${qId}-hint.mp3`,
      audio_url: `${SUPABASE_STORAGE}/audio/${gradeFolder}/${standardId}/${qId}.mp3`,
      image_url: `${SUPABASE_STORAGE}/images/${gradeFolder}/${standardId}/${qId}.png`,
    };
  });

  // Insert or replace the standard
  const existingIdx = qData.standards.findIndex((s) => s.standard_id === standardId);
  const standardRecord = {
    standard_id: standardId,
    standard_description: description,
    domain: domain || "Foundational Skills",
    parent_tip: parentTip || "",
    questions: fullQs,
  };
  if (existingIdx === -1) qData.standards.push(standardRecord);
  else qData.standards[existingIdx] = standardRecord;
  fs.writeFileSync(qPath, JSON.stringify(qData, null, 2));

  // Build audio CSV (question + hint for each MCQ). No voice_direction.
  const slug = standardId.toLowerCase().replace(/\./g, "-");
  const folder = `${gradeFolder}/${standardId}`;
  const audioRows = [["lesson_id", "filename", "script_text", "voice_direction"]];
  for (let i = 0; i < fullQs.length; i++) {
    const q = fullQs[i];
    const qScript = questions[i].questionAudio || (q.prompt.replace(/\*\*/g, "").replace(/\n/g, " "));
    const hintScript = questions[i].hintAudio || q.hint;
    audioRows.push([folder, `${q.id}`, qScript, ""]);
    audioRows.push([folder, `${q.id}-hint`, hintScript, ""]);
  }
  const audioCsv = audioRows.map((r) => r.map(csvEscape).join(",")).join("\n") + "\n";
  fs.writeFileSync(path.resolve(__dirname, "..", `regen-${slug}-mcq-audio.csv`), audioCsv);

  // Build image CSV (one per MCQ)
  const imgRows = [["Folder", "Filename", "Prompt"]];
  for (let i = 0; i < fullQs.length; i++) {
    const q = fullQs[i];
    imgRows.push([folder, `${q.id}.png`, questions[i].imagePrompt]);
  }
  const imgCsv = imgRows.map((r) => r.map(csvEscape).join(",")).join("\n") + "\n";
  fs.writeFileSync(path.resolve(__dirname, "..", `regen-${slug}-mcq-imgs.csv`), imgCsv);

  console.log(`${standardId}: ${fullQs.length} MCQs written to ${questionsFile}. Audio/img CSVs: regen-${slug}-mcq-*.csv`);
};
