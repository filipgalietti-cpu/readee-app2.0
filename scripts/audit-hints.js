#!/usr/bin/env node
/**
 * audit-hints — focused QC pass on JUST the hint field.
 *
 * The QC backfill found a systemic K pattern: hints literally state
 * the answer ("the answer is red ball" instead of "look at the second
 * sentence"). This script does a tight per-question audit using an
 * AI judge specifically tuned to catch hint/answer leakage.
 *
 * Usage:
 *   GEMINI_API_KEY=... node scripts/audit-hints.js [--limit=N] [--rewrite]
 *
 * Without --rewrite: outputs scripts/hint-audit.csv with severity
 *   "fail" (hint reveals the answer) or "warn" (hint barely guides)
 *   so Jennifer can review.
 *
 * With --rewrite: also calls the AI to propose a NEW hint for each
 *   failing row and writes them to scripts/hint-rewrites.json. Apply
 *   them to the manifest with scripts/apply-hint-rewrites.js (separate
 *   step so the human can review the diff).
 *
 * Cost: ~$0.001 per question (single judge call). Manifest = ~$1.
 *   --rewrite doubles it (one rewrite call per failing row).
 *
 * Note: hint AUDIO is intentionally NOT regenerated. The product
 * surfaces hints as text-only popups now; hint audio is in the
 * backlog.
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
const doRewrite = !!args.rewrite;

const client = new GoogleGenAI({ apiKey });
const MODEL_ID = "gemini-2.5-flash";

const JUDGE_SYSTEM = `You are reviewing a single hint that a child sees AFTER getting a multiple-choice reading comprehension question wrong.

A good hint POINTS the child back to where the answer lives in the passage WITHOUT stating the answer. Examples:
  GOOD: "Look at what Max played with in the second sentence."
  BAD:  "Max played with a red ball." (states the answer outright)

Return JSON: { "severity": "pass" | "warn" | "fail", "reason": "<one short sentence>" }.

Rules:
- fail: the hint literally states or paraphrases the correct answer ("the answer is X", "X did Y") — the child can copy the hint into the choice.
- warn: the hint hints heavily but stops just short of stating the answer.
- pass: the hint guides re-reading without revealing.

Be strict — for K-2 especially, kids will copy whatever the hint says.`;

const REWRITE_SYSTEM = `You are rewriting a hint that gives away the answer to a children's reading comprehension question.

Input: the prompt, choices, correct answer, and the BAD original hint.
Output: a single JSON object: { "hint": "<new hint>" }.

The new hint must:
- Be one short sentence under 100 characters.
- Point the child back to a specific part of the passage / prompt to re-read.
- NEVER state, define, or paraphrase the correct answer.
- Match the kid-friendly tone of the original prompt.

Examples of good rewrites:
- "Look at what Max played with in the second sentence."
- "Re-read the part where Lily put on her coat."
- "Think about where you go in the morning to learn."`;

const SCHEMA_JUDGE = {
  type: "OBJECT",
  properties: {
    severity: { type: "STRING", enum: ["pass", "warn", "fail"] },
    reason: { type: "STRING" },
  },
  required: ["severity", "reason"],
};

const SCHEMA_REWRITE = {
  type: "OBJECT",
  properties: { hint: { type: "STRING" } },
  required: ["hint"],
};

function csvEscape(s) {
  if (s == null) return "";
  const str = String(s).replace(/"/g, '""');
  return /[",\n]/.test(str) ? `"${str}"` : str;
}

async function judgeHint(item) {
  try {
    const userText = `Prompt: ${item.prompt}\nChoices: ${(item.choices ?? []).join(" / ")}\nCorrect: ${item.correct}\nHint: ${item.hint}`;
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userText,
      config: {
        systemInstruction: JUDGE_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA_JUDGE,
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

async function rewriteHint(item) {
  try {
    const userText = `Prompt: ${item.prompt}\nChoices: ${(item.choices ?? []).join(" / ")}\nCorrect: ${item.correct}\nBad original hint: ${item.hint}`;
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userText,
      config: {
        systemInstruction: REWRITE_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA_REWRITE,
        temperature: 0.5,
      },
    });
    const parsed = JSON.parse(response.text || "{}");
    return parsed.hint || null;
  } catch (e) {
    return null;
  }
}

(async () => {
  const manifestPath = path.join(__dirname, "master_manifest.json");
  const items = JSON.parse(fs.readFileSync(manifestPath, "utf8")).slice(0, limit);
  console.log(`Auditing hints on ${items.length} questions${doRewrite ? " + rewriting fails" : ""}…`);

  const csvLines = ["id,level,severity,reason,old_hint,new_hint"];
  const rewrites = {}; // id -> new hint
  let pass = 0,
    warn = 0,
    fail = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.hint) {
      pass += 1;
      continue;
    }

    const judge = await judgeHint(item);
    if (judge.severity === "pass") {
      pass += 1;
    } else if (judge.severity === "warn") {
      warn += 1;
    } else {
      fail += 1;
    }

    let newHint = "";
    if (doRewrite && judge.severity === "fail") {
      const rew = await rewriteHint(item);
      if (rew) {
        newHint = rew;
        rewrites[item.id] = rew;
      }
    }

    if (judge.severity !== "pass") {
      csvLines.push(
        [item.id, item.level, judge.severity, judge.reason, item.hint, newHint]
          .map(csvEscape)
          .join(","),
      );
    }

    if ((i + 1) % 25 === 0 || i + 1 === items.length) {
      const pct = Math.round(((i + 1) / items.length) * 100);
      process.stdout.write(`\r  ${i + 1}/${items.length} (${pct}%)  pass=${pass} warn=${warn} fail=${fail}      `);
      fs.writeFileSync(path.join(__dirname, "hint-audit.csv"), csvLines.join("\n"));
      if (doRewrite) {
        fs.writeFileSync(
          path.join(__dirname, "hint-rewrites.json"),
          JSON.stringify(rewrites, null, 2),
        );
      }
    }
  }
  process.stdout.write("\n");
  console.log(`\n  PASS=${pass}  WARN=${warn}  FAIL=${fail}`);
  console.log(`  → scripts/hint-audit.csv (${csvLines.length - 1} flagged rows)`);
  if (doRewrite) {
    console.log(`  → scripts/hint-rewrites.json (${Object.keys(rewrites).length} rewrites)`);
    console.log(`\nNext: review the CSV, then run scripts/apply-hint-rewrites.js to patch the manifest.`);
  }
})();
