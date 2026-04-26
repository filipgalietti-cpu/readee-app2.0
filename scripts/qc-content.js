#!/usr/bin/env node
/**
 * qc-content — engineer-facing QC CLI for B2C content batches.
 *
 * Same checks the live "Build with AI" wizard runs, exposed as a CLI
 * so backend scripts (master_manifest builders, lesson seeders, story
 * library expansions, Spanish translations) can audit before shipping.
 *
 * Usage:
 *   node scripts/qc-content.js <file> [--gate] [--type=auto|questions|lessons|manifest]
 *
 * Examples:
 *   # One-off audit
 *   node scripts/qc-content.js scripts/master_manifest.json
 *
 *   # CI / pre-commit gate — exits 1 on any FAIL
 *   node scripts/qc-content.js app/data/3rd-grade-standards-questions.json --gate
 *
 *   # Cap items for cheap smoke test
 *   node scripts/qc-content.js scripts/master_manifest.json --limit=20
 *
 * Output:
 *   - Colored CLI table with pass/warn/fail counts and worst-10 list
 *   - {input}.qc.csv next to the input file
 *   - Exit 0 if all pass / warn-only, exit 1 with --gate if any FAIL
 *
 * Cost: ~$0.001 per item (one Gemini text call + cheap deterministic
 * checks). 911-question manifest sweep ≈ $1-2.
 */

const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

// ───── ANSI colors (no chalk dep) ───────────────────────────────────
const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function bail(msg, code = 1) {
  console.error(`${c.red}ERROR:${c.reset} ${msg}`);
  process.exit(code);
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) bail("GEMINI_API_KEY env var is required.");

const argv = process.argv.slice(2);
if (argv.length === 0 || argv[0].startsWith("--")) {
  bail(
    "Pass a JSON file: node scripts/qc-content.js <file> [--gate] [--limit=N] [--type=...]",
  );
}

const inputPath = path.resolve(argv[0]);
if (!fs.existsSync(inputPath)) bail(`File not found: ${inputPath}`);

const flags = argv.slice(1).reduce((acc, a) => {
  const [k, v] = a.replace(/^--/, "").split("=");
  acc[k] = v ?? true;
  return acc;
}, {});

const gate = !!flags.gate;
const limit = flags.limit ? parseInt(flags.limit, 10) : Infinity;
const explicitType = flags.type ?? "auto";

const client = new GoogleGenAI({ apiKey });
const MODEL_ID = "gemini-2.5-flash";

// ───── Shared check shapes (lifted from lib/ai/qc.ts) ──────────────

const SCHEMA = {
  type: "OBJECT",
  properties: {
    severity: { type: "STRING", enum: ["pass", "warn", "fail"] },
    reason: { type: "STRING" },
  },
  required: ["severity", "reason"],
};

const QUESTION_JUDGE_SYSTEM = `You are a senior K-4 reading specialist reviewing a comprehension question.
Return JSON: { "severity": "pass"|"warn"|"fail", "reason": "<one sentence>" }.
Check ALL of:
1. Is the correct answer literally supported by the prompt / passage shown? (FAIL if not.)
2. Are the distractors plausible but unambiguously wrong? (WARN if any is also defensible.)
3. Is the prompt clear and answerable for the grade?
4. Does the hint help without giving away the answer?`;

const PASSAGE_JUDGE_SYSTEM = `You are a senior K-4 reading specialist reviewing a reading passage / lesson narration.
Return JSON: { "severity": "pass"|"warn"|"fail", "reason": "<one sentence>" }.
- pass: coherent, age-appropriate, kid-safe, factually correct.
- warn: minor issue worth flagging.
- fail: blocking — factual errors, scary content, incoherent, grossly mismatched grade.`;

const BANNED = ["damn", "hell", "shit", "fuck", "bitch", "ass", "crap"];

const GRADE_FK = {
  K: [-1, 1.5],
  Kindergarten: [-1, 1.5],
  "1st": [0, 2.5],
  "1st Grade": [0, 2.5],
  "2nd": [1, 3.5],
  "2nd Grade": [1, 3.5],
  "3rd": [2, 4.5],
  "3rd Grade": [2, 4.5],
  "4th": [3, 5.5],
  "4th Grade": [3, 5.5],
};

function syllableCount(w) {
  const x = w.toLowerCase().replace(/[^a-z]/g, "");
  if (!x) return 0;
  let s = (x.match(/[aeiouy]+/g) || []).length;
  if (x.endsWith("e") && s > 1) s -= 1;
  return Math.max(1, s);
}
function fleschKincaid(text) {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length);
  const words = text.split(/\s+/).filter((w) => /[a-z]/i.test(w));
  if (!sentences.length || !words.length) return 0;
  const syl = words.reduce((s, w) => s + syllableCount(w), 0);
  return (
    0.39 * (words.length / sentences.length) +
    11.8 * (syl / words.length) -
    15.59
  );
}

function bannedHits(text) {
  const lower = " " + (text || "").toLowerCase() + " ";
  return BANNED.filter((w) => lower.includes(" " + w + " "));
}

// ───── Type detection ──────────────────────────────────────────────

function detectType(input) {
  // Master manifest = top-level array of {id, prompt, choices, correct}.
  if (Array.isArray(input) && input[0]?.prompt && input[0]?.choices) {
    return "manifest";
  }
  // Lesson seed file = top-level array of {standardId, slides}.
  if (Array.isArray(input) && input[0]?.standardId && input[0]?.slides) {
    return "lessons";
  }
  // Standards questions JSON = { standards: [{ standard_id, questions: [...] }] }
  if (input?.standards && Array.isArray(input.standards)) {
    return "standards_questions";
  }
  return "unknown";
}

function flatten(input, type) {
  if (type === "manifest") return input;
  if (type === "lessons") {
    return input.map((l) => ({
      id: l.standardId,
      level: l.grade,
      kind: "lesson",
      title: l.title,
      slides: l.slides,
    }));
  }
  if (type === "standards_questions") {
    const out = [];
    for (const s of input.standards) {
      for (const q of s.questions ?? []) {
        out.push({
          id: q.id,
          level: input.grade ?? input.gradeLevel ?? s.grade ?? "2nd",
          prompt: q.prompt ?? q.question ?? "",
          choices: q.choices ?? null,
          correct: q.correct ?? null,
          hint: q.hint ?? null,
          standardId: s.standard_id,
        });
      }
    }
    return out;
  }
  return [];
}

// ───── Per-item checks ─────────────────────────────────────────────

async function checkQuestion(item) {
  const checks = [];
  const text = `${item.prompt ?? ""} ${(item.choices ?? []).join(" ")}`;

  // Deterministic
  const banned = bannedHits(text);
  for (const w of banned) {
    checks.push({ severity: "fail", name: "banned_words", message: `Contains "${w}"` });
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
      checks.push({
        severity: "fail",
        name: "unique_choices",
        message: "Duplicate choices",
      });
    }
    if (/\b(all|none) of the above\b/i.test(item.choices.join(" "))) {
      checks.push({
        severity: "fail",
        name: "no_trick_choices",
        message: '"All / none of the above" is banned',
      });
    }
  }
  const target = GRADE_FK[item.level] ?? [1, 3.5];
  const fk = fleschKincaid(text);
  if (fk < target[0]) {
    checks.push({
      severity: "warn",
      name: "reading_level",
      message: `Reads easier than ${item.level} (FK ${fk.toFixed(1)})`,
    });
  } else if (fk > target[1]) {
    checks.push({
      severity: "warn",
      name: "reading_level",
      message: `Reads harder than ${item.level} (FK ${fk.toFixed(1)})`,
    });
  }

  // LLM judge
  const judge = await llmJudge(QUESTION_JUDGE_SYSTEM, [
    `Grade: ${item.level ?? "?"}`,
    `Prompt: ${item.prompt}`,
    `Choices: ${(item.choices ?? []).join(" / ")}`,
    `Correct: ${item.correct ?? "?"}`,
    `Hint: ${item.hint ?? "(none)"}`,
  ].join("\n"));
  checks.push({
    severity: judge.severity,
    name: "judge",
    message: judge.reason,
  });

  return checks;
}

async function checkLesson(item) {
  const checks = [];
  const text = (item.slides ?? [])
    .flatMap((s) => (s.steps ?? []).map((st) => st.ttsScript ?? ""))
    .filter(Boolean)
    .join(" ");
  if (!text) {
    checks.push({
      severity: "warn",
      name: "empty_lesson",
      message: "No slide narration found",
    });
    return checks;
  }

  for (const w of bannedHits(text)) {
    checks.push({
      severity: "fail",
      name: "banned_words",
      message: `Lesson contains "${w}"`,
    });
  }

  const judge = await llmJudge(
    PASSAGE_JUDGE_SYSTEM,
    `Grade: ${item.level}\nLesson: ${item.title}\n\nNarration:\n${text.slice(0, 3000)}`,
  );
  checks.push({
    severity: judge.severity,
    name: "judge",
    message: judge.reason,
  });
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
    const parsed = JSON.parse(response.text || "{}");
    return {
      severity: parsed.severity || "warn",
      reason: parsed.reason || "(no reason)",
    };
  } catch (e) {
    return { severity: "warn", reason: `judge_error: ${e.message}` };
  }
}

// ───── CSV ─────────────────────────────────────────────────────────

function csvEscape(s) {
  if (s == null) return "";
  const str = String(s).replace(/"/g, '""');
  return /[",\n]/.test(str) ? `"${str}"` : str;
}

// ───── Main ────────────────────────────────────────────────────────

(async () => {
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const detectedType = explicitType === "auto" ? detectType(raw) : explicitType;
  if (detectedType === "unknown") {
    bail(
      "Could not detect content type. Pass --type=manifest|lessons|standards_questions.",
    );
  }

  const items = flatten(raw, detectedType).slice(0, limit);
  console.log(
    `${c.bold}qc-content${c.reset} ${c.dim}(${detectedType})${c.reset} → ${items.length} items from ${path.basename(inputPath)}`,
  );

  const csvLines = ["id,level,severity,check_name,message"];
  let pass = 0,
    warn = 0,
    fail = 0;
  const flagged = [];

  let i = 0;
  for (const item of items) {
    i += 1;
    const checks =
      detectedType === "lessons" ? await checkLesson(item) : await checkQuestion(item);
    const overall = checks.some((c) => c.severity === "fail")
      ? "fail"
      : checks.some((c) => c.severity === "warn")
      ? "warn"
      : "pass";
    if (overall === "pass") pass += 1;
    else if (overall === "warn") warn += 1;
    else fail += 1;

    for (const ck of checks) {
      if (ck.severity === "pass") continue;
      csvLines.push(
        [item.id, item.level, ck.severity, ck.name, ck.message]
          .map(csvEscape)
          .join(","),
      );
      flagged.push({ id: item.id, level: item.level, ...ck });
    }

    if (i % 25 === 0 || i === items.length) {
      const pct = Math.round((i / items.length) * 100);
      process.stdout.write(`\r${c.dim}  ${i}/${items.length} (${pct}%)${c.reset}      `);
      // Flush CSV incrementally so a kill -9 doesn't lose progress.
      const out = inputPath + ".qc.csv";
      fs.writeFileSync(out, csvLines.join("\n"));
    }
  }
  process.stdout.write("\n");

  const csvOut = inputPath + ".qc.csv";
  fs.writeFileSync(csvOut, csvLines.join("\n"));

  // Summary table
  console.log("");
  console.log(`${c.bold}Summary${c.reset}`);
  console.log(`  ${c.green}PASS${c.reset}  ${pass.toString().padStart(5)}`);
  console.log(`  ${c.yellow}WARN${c.reset}  ${warn.toString().padStart(5)}`);
  console.log(`  ${c.red}FAIL${c.reset}  ${fail.toString().padStart(5)}`);
  console.log(`  ${c.dim}TOTAL ${items.length}${c.reset}`);
  console.log(`  ${c.cyan}→ ${csvOut}${c.reset}`);

  if (flagged.length > 0) {
    console.log("");
    console.log(`${c.bold}Worst 10:${c.reset}`);
    const worst = flagged
      .sort((a, b) => (a.severity === "fail" ? -1 : 1))
      .slice(0, 10);
    for (const f of worst) {
      const tone = f.severity === "fail" ? c.red : c.yellow;
      console.log(
        `  ${tone}${f.severity.toUpperCase()}${c.reset} ${c.dim}${f.id}${c.reset} ${c.gray}${f.name}${c.reset} — ${f.message}`,
      );
    }
  }

  if (gate && fail > 0) {
    console.log(
      `\n${c.red}${c.bold}GATE FAIL:${c.reset} ${fail} items have blocking issues. Refusing to proceed.`,
    );
    process.exit(1);
  }
  console.log(`\n${c.green}Done.${c.reset}`);
})();
