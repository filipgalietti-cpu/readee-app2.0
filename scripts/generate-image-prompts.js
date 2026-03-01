#!/usr/bin/env node

/**
 * Generate premium scene-based image prompts for Grades 1-4.
 * Uses Gemini to convert reading passages into visual scene descriptions.
 *
 * Usage: node scripts/generate-image-prompts.js
 */

const fs = require("fs");
const path = require("path");

const GEMINI_API_KEY = (() => {
  const envPath = path.resolve(__dirname, "..", ".env.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const m = line.match(/^GEMINI_API_KEY=(.*)$/);
    if (m) return m[1].trim();
  }
  return null;
})();

if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in .env.local");
  process.exit(1);
}

const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const STYLE_STRING =
  "Style: Soft digital watercolor children's book illustration, hand-drawn charcoal outlines, violet and indigo color palette, isolated on off-white paper texture, high-resolution, no text, no words, no letters.";

const SYSTEM_PROMPT = `You are an expert children's book illustrator writing image generation prompts.

Given a reading comprehension question for kids, extract ONE specific visual scene and write a concise image generation prompt (1-3 sentences max).

RULES:
- Keep the characters from the passage (Elena, Marcus, a frog, etc.) — do NOT replace them.
- Describe a single visual moment, not a summary of the story.
- NEVER mention text, words, letters, labels, signs, titles, or writing of any kind. Even books should have "unlabeled spines."
- For abstract/conceptual questions (like "What is a theme?" or "A theme is different from a topic because—"), describe a cozy study scene: a child at a wooden desk with an open storybook and a magnifying glass, warm lamplight, bookshelves in background.
- Keep it visual and concrete — colors, lighting, composition.
- Do NOT include any style instructions — just the scene description.
- Output ONLY the scene prompt, nothing else. No quotes, no prefixes.`;

const BATCH_SIZE = 20;
const DELAY_MS = 2000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateScenePrompts(items) {
  const numbered = items
    .map((item, i) => `${i + 1}. [${item.id}] ${item.prompt}`)
    .join("\n\n");

  const userPrompt = `Generate image scene prompts for these ${items.length} questions. Output exactly ${items.length} lines, one per question, numbered to match. Each line: just the number and the scene description.\n\n${numbered}`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini ${res.status}: ${text.slice(0, 500)}`);
  }

  const json = await res.json();
  const text =
    json.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Parse numbered lines
  const lines = text.split("\n").filter((l) => l.trim());
  const prompts = [];
  for (const line of lines) {
    const m = line.match(/^\d+\.\s*(.+)/);
    if (m) {
      prompts.push(m[1].trim());
    }
  }

  return prompts;
}

async function main() {
  const auditPath = "/Users/filipgalietti/Downloads/question-audit-2026-02-28 3.json";
  const allItems = JSON.parse(fs.readFileSync(auditPath, "utf-8"));

  const grades = ["1st Grade", "2nd Grade", "3rd Grade", "4th Grade"];
  const items = allItems.filter((d) => grades.includes(d.level));

  console.log(`Total items to process: ${items.length}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log(`Total batches: ${Math.ceil(items.length / BATCH_SIZE)}\n`);

  const results = [];
  let processed = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(items.length / BATCH_SIZE);

    console.log(
      `[Batch ${batchNum}/${totalBatches}] Processing ${batch.length} items (${batch[0].id} → ${batch[batch.length - 1].id})...`
    );

    let prompts;
    let retries = 0;
    while (true) {
      try {
        prompts = await generateScenePrompts(batch);
        break;
      } catch (err) {
        retries++;
        if (retries > 3) {
          console.error(`  ✗ FAILED after 3 retries: ${err.message}`);
          prompts = batch.map(() => "FAILED");
          break;
        }
        console.log(`  ⟳ Retry ${retries}: ${err.message}`);
        await sleep(5000);
      }
    }

    // Handle mismatch — pad or truncate
    if (prompts.length !== batch.length) {
      console.log(
        `  ⚠ Got ${prompts.length} prompts for ${batch.length} items, padding...`
      );
      while (prompts.length < batch.length) prompts.push("NEEDS_MANUAL_REVIEW");
    }

    for (let j = 0; j < batch.length; j++) {
      results.push({
        id: batch[j].id,
        level: batch[j].level,
        lesson: batch[j].lesson,
        original_prompt: batch[j].prompt,
        image_prompt: prompts[j] + " " + STYLE_STRING,
      });
    }

    processed += batch.length;
    console.log(`  ✓ Done (${processed}/${items.length})`);

    if (i + BATCH_SIZE < items.length) {
      await sleep(DELAY_MS);
    }
  }

  // Write JSON
  const outPath = path.resolve(
    __dirname,
    "..",
    "scripts",
    "premium_image_manifest_v3.json"
  );
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2) + "\n");

  // Write CSV too
  const csvPath = outPath.replace(".json", ".csv");
  const csvLines = ["id,level,lesson,image_prompt"];
  for (const r of results) {
    const escape = (s) =>
      s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    csvLines.push(
      [r.id, r.level, r.lesson, r.image_prompt].map(escape).join(",")
    );
  }
  fs.writeFileSync(csvPath, csvLines.join("\n") + "\n");

  const failed = results.filter(
    (r) =>
      r.image_prompt.includes("FAILED") ||
      r.image_prompt.includes("NEEDS_MANUAL_REVIEW")
  ).length;

  console.log(`\n=== DONE ===`);
  console.log(`Total: ${results.length}`);
  console.log(`Failed/needs review: ${failed}`);
  console.log(`JSON: ${outPath}`);
  console.log(`CSV:  ${csvPath}`);
}

main();
