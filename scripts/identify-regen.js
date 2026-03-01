#!/usr/bin/env node
const m = require("./master_manifest.json");
const fs = require("fs");

// 1. Desk scenes (Grades 1-4)
const deskPattern = /child.*(?:desk|wooden|storybook.*magnifying|magnifying.*storybook|lamplight|bookshel)/i;
const deskScenes = m.filter(i => i.level !== "Kindergarten" && i.image_prompt && deskPattern.test(i.image_prompt));

// 2. Bad K prompts — abstract/question-based
const kItems = m.filter(i => i.level === "Kindergarten");
const badKPattern = /^cartoon picture of (which|what|where|when|how|who|why|put the|break the|read this|you say|a verb|sort these|the person|the back cover|the title|a book about|the text says|the word|sound does)/i;
const badK = kItems.filter(i => badKPattern.test(i.image_prompt));

// 3. K prompts referencing letters/words/text that will cause text rendering
const textRefPattern = /^cartoon picture of .*\b(letter|word|words|text|written|writing|title|sign|label)\b/i;
const textRefK = kItems.filter(i => textRefPattern.test(i.image_prompt) && !badK.includes(i));

// 4. Missing prompt
const missing = m.filter(i => !i.image_prompt);

// Build regen list
const regenItems = [];
for (const item of deskScenes) {
  regenItems.push({ id: item.id, level: item.level, prompt: item.prompt, reason: "desk_scene", current: item.image_prompt });
}
for (const item of [...badK, ...textRefK]) {
  regenItems.push({ id: item.id, level: item.level, prompt: item.prompt, reason: "bad_k", current: item.image_prompt });
}
for (const item of missing) {
  regenItems.push({ id: item.id, level: item.level, prompt: item.prompt, reason: "missing", current: "" });
}

// Deduplicate by id
const seen = new Set();
const deduped = regenItems.filter(i => {
  if (seen.has(i.id)) return false;
  seen.add(i.id);
  return true;
});

console.log("Desk scenes to rewrite:", deskScenes.length);
console.log("Bad K prompts (abstract/question):", badK.length);
console.log("K prompts with text references:", textRefK.length);
console.log("Missing prompts:", missing.length);
console.log("TOTAL to regenerate:", deduped.length);

// Show some examples
console.log("\n--- Sample desk scenes ---");
for (const item of deskScenes.slice(0, 3)) {
  console.log(`  ${item.id}: ${item.image_prompt.slice(0, 80)}...`);
}
console.log("\n--- Sample bad K ---");
for (const item of badK.slice(0, 3)) {
  console.log(`  ${item.id}: ${item.image_prompt.slice(0, 80)}...`);
}

fs.writeFileSync("scripts/regen_items.json", JSON.stringify(deduped, null, 2) + "\n");
console.log("\nSaved to scripts/regen_items.json");
