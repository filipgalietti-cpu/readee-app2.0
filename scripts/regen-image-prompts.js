#!/usr/bin/env node

/**
 * Regenerate image prompts for items that need creative rewriting.
 * Uses Gemini 2.5 Flash to produce bright cartoon scene descriptions.
 *
 * Reads: scripts/regen_items.json
 * Writes: scripts/regen_results.json
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

const STYLE_SUFFIX =
  "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

const SYSTEM_PROMPT_SCENES = `You are an expert children's book illustrator writing image generation prompts for an AI image generator.

Given a reading comprehension question for kids, write a concise image generation prompt (1-2 sentences max) that describes ONE specific visual scene.

CRITICAL RULES:
- Describe the SETTING and ACTION from the passage — a park, a kitchen, a space station, an ocean, a garden, etc.
- Keep characters from the passage (Elena, Marcus, a frog, etc.) — do NOT replace them.
- NEVER mention text, words, letters, labels, signs, titles, writing, books with visible pages, scrolls, envelopes, or anything with readable content.
- NEVER describe "a child at a desk" or "a child reading" — that is the ONE thing you must avoid. Describe the story's world instead.
- For questions about themes, morals, or abstract literary concepts — describe a KEY MOMENT from the passage, not someone thinking about it.
- Keep it visual and concrete — colors, lighting, setting, action.
- Do NOT include any style instructions — just the scene description.
- Output ONLY the scene prompt, nothing else. No quotes, no prefixes.`;

const SYSTEM_PROMPT_K_ABSTRACT = `You are an expert children's book illustrator writing image generation prompts for an AI image generator.

Given a kindergarten-level question about an abstract concept (letters, words, phonics, punctuation, grammar), describe a CONCRETE, FUN OBJECT or SCENE that represents the concept.

CRITICAL RULES:
- For phonics/sounds: describe an animal or object that makes that sound (e.g., a buzzing bee for /z/, a hissing snake for /s/)
- For letters: describe a fun object shaped like the letter, or an animal whose name starts with it
- For rhyming: describe two objects that rhyme together (e.g., a cat in a hat)
- For syllables: describe objects being split into colorful parts
- For punctuation: describe a large, bright, friendly version of the punctuation mark as a cartoon character
- For grammar concepts (verbs, nouns): describe a character DOING the action or BEING the thing
- For sight words: describe a scene that illustrates the word's meaning
- For sorting/categories: describe colorful objects being sorted into bright bins
- NEVER mention text, words, letters as written symbols, books, pages, or anything with readable content
- Keep it simple, bright, and fun for 5-year-olds
- Output ONLY the scene prompt, nothing else. No quotes, no prefixes.`;

const BATCH_SIZE = 20;
const DELAY_MS = 2000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateBatch(items, systemPrompt) {
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
      parts: [{ text: systemPrompt }],
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
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";

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
  const items = JSON.parse(
    fs.readFileSync(path.join(__dirname, "regen_items.json"), "utf-8")
  );

  // Split by type
  const deskItems = items.filter((i) => i.reason === "desk_scene");
  const kItems = items.filter((i) => i.reason === "bad_k" || i.reason === "missing");

  console.log(`Desk scenes: ${deskItems.length}`);
  console.log(`K abstract + missing: ${kItems.length}`);
  console.log(`Total: ${items.length}`);
  console.log();

  const results = {};
  let processed = 0;

  // Process desk scenes
  const allBatches = [
    ...chunk(deskItems, BATCH_SIZE).map((b) => ({ batch: b, type: "scene" })),
    ...chunk(kItems, BATCH_SIZE).map((b) => ({ batch: b, type: "k_abstract" })),
  ];

  const totalBatches = allBatches.length;

  for (let i = 0; i < allBatches.length; i++) {
    const { batch, type } = allBatches[i];
    const systemPrompt =
      type === "scene" ? SYSTEM_PROMPT_SCENES : SYSTEM_PROMPT_K_ABSTRACT;

    console.log(
      `[Batch ${i + 1}/${totalBatches}] ${type} — ${batch.length} items (${batch[0].id} → ${batch[batch.length - 1].id})...`
    );

    let prompts;
    let retries = 0;
    while (true) {
      try {
        prompts = await generateBatch(batch, systemPrompt);
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

    if (prompts.length !== batch.length) {
      console.log(
        `  ⚠ Got ${prompts.length} prompts for ${batch.length} items, padding...`
      );
      while (prompts.length < batch.length) prompts.push("NEEDS_REVIEW");
    }

    for (let j = 0; j < batch.length; j++) {
      results[batch[j].id] = prompts[j] + " " + STYLE_SUFFIX;
    }

    processed += batch.length;
    console.log(`  ✓ Done (${processed}/${items.length})`);

    if (i < allBatches.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Save results
  const outPath = path.join(__dirname, "regen_results.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2) + "\n");

  const failed = Object.values(results).filter(
    (v) => v.includes("FAILED") || v.includes("NEEDS_REVIEW")
  ).length;

  console.log(`\n=== DONE ===`);
  console.log(`Total: ${Object.keys(results).length}`);
  console.log(`Failed: ${failed}`);
  console.log(`Saved: ${outPath}`);
}

function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

main();
