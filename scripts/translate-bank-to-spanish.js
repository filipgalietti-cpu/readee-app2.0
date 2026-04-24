#!/usr/bin/env node

/**
 * Bilingual content pipeline — English K-4 question bank → Spanish.
 *
 * Reads each `app/data/{grade}-standards-questions.json`, calls Gemini
 * 2.5 Flash with a structured translation prompt, writes out a
 * matching `-es.json` with the same shape. The runtime loader
 * (lib/data/standards.ts -> getStandardBySlugLocalized) picks up the
 * ES file automatically when a child's profile.language is 'es'.
 *
 * Usage:
 *   GEMINI_API_KEY=... node scripts/translate-bank-to-spanish.js
 *   GEMINI_API_KEY=... node scripts/translate-bank-to-spanish.js --grade=kindergarten
 *   GEMINI_API_KEY=... node scripts/translate-bank-to-spanish.js --standard=RL.K.1
 *
 * Cost (Gemini 2.5 Flash, rough): ~$0.005 per question → 911 questions
 * × $0.005 ≈ $5 total. Very cheap.
 *
 * Quality approach — translations preserve:
 *   - Reading level (simpler Spanish for K-1, richer for 3-4)
 *   - Comprehension intent (the right answer stays the right answer)
 *   - Phonics targeting WHERE POSSIBLE — when an English short-a
 *     question becomes Spanish, the short-a specific phonics goal is
 *     noted but can't be preserved directly. We tag translated
 *     phonics questions with a note for Jennifer/admin review.
 *   - Cultural appropriateness — names and scenarios adapted (Lily →
 *     Lucia, Max → Max/Maxi) to feel native.
 *
 * Script is idempotent — re-running only translates questions not
 * already in the ES output file. Delete the ES file to regenerate
 * from scratch.
 */

const fs = require("fs");
const path = require("path");

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY environment variable is required.");
  process.exit(1);
}

const MODEL = "gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const DATA_DIR = path.join(__dirname, "..", "app", "data");
const GRADE_FILES = [
  "kindergarten-standards-questions.json",
  "1st-grade-standards-questions.json",
  "2nd-grade-standards-questions.json",
  "3rd-grade-standards-questions.json",
  "4th-grade-standards-questions.json",
];

function parseArgs() {
  const out = {};
  for (const a of process.argv.slice(2)) {
    const m = a.match(/^--([^=]+)=(.+)$/);
    if (m) out[m[1]] = m[2];
    else if (a.startsWith("--")) out[a.slice(2)] = true;
  }
  return out;
}

async function translateQuestion(englishQ, standardContext) {
  const system = `You translate K-4 reading comprehension questions from English to Spanish for Hispanic/Latino elementary students in the US.

Rules:
- Preserve the COMPREHENSION INTENT — the question should test the same skill.
- Keep reading level grade-appropriate: K-1 = very simple vocabulary, 2-4 = richer but kid-friendly.
- Adapt names and cultural references to feel native Spanish (Lily → Lucía, Max → Max/Maxi, Emma → Emma, etc.) — don't hispanicize in a way that feels forced.
- If the question tests English phonics (short-a, silent-e, digraphs), translate the scenario but note in a "phonics_note" field that the English phonics pattern doesn't carry over directly.
- Return ONLY valid JSON matching this schema:
  {
    "prompt": "...Spanish prompt...",
    "choices": ["...","...","...","..."] (same order as English, same index is correct),
    "correct": "...the correct Spanish choice exactly...",
    "hint": "...Spanish hint...",
    "phonics_note": "..." (optional, only if phonics doesn't transfer)
  }

The "correct" field MUST match one of the translated choices exactly.`;

  const user = `Standard: ${standardContext.standard_id} — ${standardContext.standard_description}
Domain: ${standardContext.domain}

English question:
Prompt: ${englishQ.prompt}
Choices: ${JSON.stringify(englishQ.choices)}
Correct: ${englishQ.correct}
Hint: ${englishQ.hint}

Translate to Spanish.`;

  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini ${res.status}: ${t.slice(0, 300)}`);
  }
  const j = await res.json();
  const text = j?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response");
  return JSON.parse(text);
}

async function translateStandard(standard, standardContext) {
  const out = {
    ...standard,
    questions: [],
  };
  console.log(`  · ${standard.standard_id} — ${standard.questions.length} questions`);
  for (const q of standard.questions) {
    try {
      const translated = await translateQuestion(q, standardContext);
      out.questions.push({
        ...q,
        prompt: translated.prompt,
        choices: translated.choices,
        correct: translated.correct,
        hint: translated.hint,
        phonics_note: translated.phonics_note ?? undefined,
        // Keep the English asset URLs; we'll regenerate audio in Spanish
        // as a separate pass (scripts/generate-audio-es.js — TODO).
        audio_url: null,
        hint_audio_url: null,
      });
    } catch (e) {
      console.error(`    ! ${q.id}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 200)); // gentle rate limit
  }
  return out;
}

async function processFile(fileName, filterGrade, filterStd) {
  const englishPath = path.join(DATA_DIR, fileName);
  const spanishPath = englishPath.replace(/\.json$/, "-es.json");
  const english = JSON.parse(fs.readFileSync(englishPath, "utf-8"));

  let existing = { grade: english.grade, standards: [] };
  if (fs.existsSync(spanishPath)) {
    existing = JSON.parse(fs.readFileSync(spanishPath, "utf-8"));
  }
  const existingIds = new Set((existing.standards ?? []).map((s) => s.standard_id));

  if (filterGrade && english.grade !== filterGrade) return;

  console.log(`\n== ${english.grade} ==`);
  for (const s of english.standards ?? []) {
    if (filterStd && s.standard_id !== filterStd) continue;
    if (existingIds.has(s.standard_id)) {
      console.log(`  · ${s.standard_id} — already translated, skipping`);
      continue;
    }
    const translated = await translateStandard(s, s);
    existing.standards.push(translated);
    // Persist after each standard so we don't lose work on a crash.
    fs.writeFileSync(spanishPath, JSON.stringify(existing, null, 2));
  }
  console.log(`  → wrote ${spanishPath}`);
}

async function main() {
  const args = parseArgs();
  for (const fileName of GRADE_FILES) {
    await processFile(fileName, args.grade, args.standard);
  }
  console.log("\nDone. Run `node scripts/generate-audio-es.js` next if you want Spanish audio.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
