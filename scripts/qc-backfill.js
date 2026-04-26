#!/usr/bin/env node
/**
 * QC backfill — runs the AI QC engine across the existing curated content
 * (master_manifest.json + sample-lessons.json) and writes a CSV of every
 * flagged item so Jennifer can sweep them before district demos.
 *
 * Usage:
 *   GEMINI_API_KEY=... node scripts/qc-backfill.js [--limit=50] [--source=manifest|lessons|all]
 *
 * Output:
 *   scripts/qc-backfill-{manifest,lessons}.csv with columns:
 *     id, kind, severity, check_name, message
 *
 * Cost: roughly $0.001 per LLM judge call. Manifest = ~911 questions →
 * ~$1-2. Lessons = ~200 → ~$0.50. Total well under $5.
 *
 * Skips:
 *   - Lesson stubs (slides: []) — nothing to check yet
 *   - Custom-quiz questions in manifest (these don't appear there)
 */

const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("ERROR: GEMINI_API_KEY env var required.");
  process.exit(1);
}

const args = process.argv.slice(2).reduce((acc, a) => {
  const [k, v] = a.replace(/^--/, "").split("=");
  acc[k] = v ?? true;
  return acc;
}, {});

const limit = args.limit ? parseInt(args.limit, 10) : Infinity;
const source = args.source ?? "all";

const client = new GoogleGenAI({ apiKey });
const MODEL_ID = "gemini-2.5-flash";

const PASSAGE_JUDGE_SYSTEM = `You are a senior K-4 reading specialist reviewing a reading passage for use with elementary students.
Return JSON: { "severity": "pass"|"warn"|"fail", "reason": "<one sentence>" }.
- pass: coherent, age-appropriate, kid-safe, factually correct, natural for the grade.
- warn: minor issue worth flagging — awkward phrasing, slightly off-topic, mild ambiguity.
- fail: blocking — factual errors, scary content, incoherent, grossly mismatched grade.
Be concrete about what is wrong.`;

const QUESTION_JUDGE_SYSTEM = `You are a senior K-4 reading specialist reviewing a reading-comprehension multiple-choice question.
Return JSON: { "severity": "pass"|"warn"|"fail", "reason": "<one sentence>" }.
Check ALL of:
1. Is the correct answer literally supported by the passage / prompt? (FAIL if not.)
2. Are the distractors plausible but unambiguously wrong? (WARN if any distractor is also defensible.)
3. Is the question prompt clear and answerable?
4. Does the hint help without giving away the answer?
Be concrete about which rule failed.`;

const SCHEMA = {
  type: "OBJECT",
  properties: {
    severity: { type: "STRING", enum: ["pass", "warn", "fail"] },
    reason: { type: "STRING" },
  },
  required: ["severity", "reason"],
};

const BANNED = ["damn", "hell", "shit", "fuck", "bitch", "ass", "crap"];

function syllableCount(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  let s = (w.match(/[aeiouy]+/g) ?? []).length;
  if (w.endsWith("e") && s > 1) s -= 1;
  return Math.max(1, s);
}

function fleschKincaid(text) {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length);
  const words = text.split(/\s+/).filter((w) => /[a-z]/i.test(w));
  if (!sentences.length || !words.length) return 0;
  const syl = words.reduce((s, w) => s + syllableCount(w), 0);
  return 0.39 * (words.length / sentences.length) + 11.8 * (syl / words.length) - 15.59;
}

const GRADE_TARGETS = {
  Kindergarten: { fkMin: -1, fkMax: 1.5 },
  K: { fkMin: -1, fkMax: 1.5 },
  "1st Grade": { fkMin: 0, fkMax: 2.5 },
  "1st": { fkMin: 0, fkMax: 2.5 },
  "2nd Grade": { fkMin: 1, fkMax: 3.5 },
  "2nd": { fkMin: 1, fkMax: 3.5 },
  "3rd Grade": { fkMin: 2, fkMax: 4.5 },
  "3rd": { fkMin: 2, fkMax: 4.5 },
  "4th Grade": { fkMin: 3, fkMax: 5.5 },
  "4th": { fkMin: 3, fkMax: 5.5 },
};

function deterministicChecks(item) {
  const checks = [];
  const text = `${item.prompt ?? ""} ${(item.choices ?? []).join(" ")}`;
  const lower = " " + text.toLowerCase() + " ";
  for (const w of BANNED) {
    if (lower.includes(" " + w + " ")) {
      checks.push({ severity: "fail", name: "banned_words", message: `Contains "${w}"` });
    }
  }
  if (item.choices && item.correct && !item.choices.includes(item.correct)) {
    checks.push({
      severity: "fail",
      name: "correct_present",
      message: "Correct answer not in choices verbatim",
    });
  }
  if (item.choices) {
    const dedup = new Set(item.choices.map((c) => c.toLowerCase().trim()));
    if (dedup.size !== item.choices.length) {
      checks.push({ severity: "fail", name: "unique_choices", message: "Duplicate choices" });
    }
    if (/\b(all|none) of the above\b/i.test(item.choices.join(" "))) {
      checks.push({
        severity: "fail",
        name: "no_trick_choices",
        message: "All / none of the above is banned",
      });
    }
  }
  const target = GRADE_TARGETS[item.level] ?? GRADE_TARGETS["2nd Grade"];
  const fk = fleschKincaid(text);
  if (fk < target.fkMin) {
    checks.push({
      severity: "warn",
      name: "reading_level",
      message: `Reads easier than ${item.level} (FK grade ${fk.toFixed(1)})`,
    });
  } else if (fk > target.fkMax) {
    checks.push({
      severity: "warn",
      name: "reading_level",
      message: `Reads harder than ${item.level} (FK grade ${fk.toFixed(1)})`,
    });
  }
  return checks;
}

async function llmJudge(systemInstruction, userText) {
  try {
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 0.1,
      },
    });
    const txt = response.text || "{}";
    const parsed = JSON.parse(txt);
    return { severity: parsed.severity || "warn", reason: parsed.reason || "" };
  } catch (e) {
    return { severity: "warn", reason: `judge_error: ${e.message}` };
  }
}

function csvEscape(s) {
  if (s == null) return "";
  const str = String(s).replace(/"/g, '""');
  return /[",\n]/.test(str) ? `"${str}"` : str;
}

async function backfillManifest() {
  const manifestPath = path.join(__dirname, "master_manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error("master_manifest.json not found, skipping manifest backfill.");
    return;
  }
  const items = JSON.parse(fs.readFileSync(manifestPath, "utf8")).slice(0, limit);
  console.log(`Manifest: ${items.length} questions to QC`);

  const out = ["id,level,severity,check_name,message"];
  let i = 0;
  for (const item of items) {
    i += 1;
    const det = deterministicChecks(item);
    const judge = await llmJudge(
      QUESTION_JUDGE_SYSTEM,
      `Grade: ${item.level}\nPrompt: ${item.prompt}\nChoices: ${(item.choices ?? []).join(" / ")}\nCorrect: ${item.correct}\nHint: ${item.hint ?? "(none)"}`,
    );
    const all = [...det, { name: "judge", severity: judge.severity, message: judge.reason }];
    for (const c of all) {
      if (c.severity === "pass") continue;
      out.push(
        [item.id, item.level, c.severity, c.name, c.message].map(csvEscape).join(","),
      );
    }
    if (i % 25 === 0) {
      console.log(`  ${i}/${items.length}`);
      fs.writeFileSync(path.join(__dirname, "qc-backfill-manifest.csv"), out.join("\n"));
    }
  }
  fs.writeFileSync(path.join(__dirname, "qc-backfill-manifest.csv"), out.join("\n"));
  console.log(`Manifest done. ${out.length - 1} flagged items → scripts/qc-backfill-manifest.csv`);
}

async function backfillLessons() {
  const lessonsPath = path.join(
    __dirname,
    "..",
    "app",
    "data",
    "sample-lessons.json",
  );
  const lessons = JSON.parse(fs.readFileSync(lessonsPath, "utf8")).slice(0, limit);
  const built = lessons.filter((l) => Array.isArray(l.slides) && l.slides.length > 0);
  console.log(`Lessons: ${built.length} built lessons to QC (skipping stubs)`);

  const out = ["lessonId,grade,severity,check_name,message"];
  let i = 0;
  for (const lesson of built) {
    i += 1;
    // Concatenate slide TTS scripts as the "passage" for QC purposes.
    const text = (lesson.slides ?? [])
      .flatMap((s) => (s.steps ?? []).map((st) => st.ttsScript ?? ""))
      .filter(Boolean)
      .join(" ");
    if (!text) continue;
    const judge = await llmJudge(
      PASSAGE_JUDGE_SYSTEM,
      `Grade: ${lesson.grade}\nLesson: ${lesson.title}\n\nNarration:\n${text.slice(0, 3000)}`,
    );
    if (judge.severity === "pass") continue;
    out.push(
      [
        lesson.standardId,
        lesson.grade,
        judge.severity,
        "lesson.judge",
        judge.reason,
      ]
        .map(csvEscape)
        .join(","),
    );
    if (i % 10 === 0) {
      console.log(`  ${i}/${built.length}`);
      fs.writeFileSync(path.join(__dirname, "qc-backfill-lessons.csv"), out.join("\n"));
    }
  }
  fs.writeFileSync(path.join(__dirname, "qc-backfill-lessons.csv"), out.join("\n"));
  console.log(`Lessons done. ${out.length - 1} flagged items → scripts/qc-backfill-lessons.csv`);
}

(async () => {
  if (source === "all" || source === "manifest") await backfillManifest();
  if (source === "all" || source === "lessons") await backfillLessons();
})();
