#!/usr/bin/env node
/**
 * Extract 10 test items from master manifest — 2 per grade.
 * Writes test CSVs for both audio and images.
 */
const fs = require("fs");
const path = require("path");
const m = require("./master_manifest.json");

const picks = [
  m.find(i => i.id === "RL.K.1-Q1"),     // K — normal story
  m.find(i => i.id === "RF.K.3a-Q1"),     // K — regen abstract (letter B)
  m.find(i => i.id === "RL.1.1-Q1"),      // 1st — normal
  m.find(i => i.id === "RL.1.2-Q1"),      // 1st — was desk scene
  m.find(i => i.id === "RL.2.1-Q1"),      // 2nd — normal
  m.find(i => i.id === "RL.2.2-Q1"),      // 2nd — was desk scene (ant/grasshopper)
  m.find(i => i.id === "RL.3.1-Q1"),      // 3rd — normal
  m.find(i => i.id === "RL.3.4-Q3"),      // 3rd — was desk scene
  m.find(i => i.id === "RL.4.1-Q1"),      // 4th — normal
  m.find(i => i.id === "L.2.4-Q5"),       // 2nd — was missing
];

function escapeCSV(val) {
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildAssetPath(id, level) {
  const folders = { Kindergarten: "kindergarten", "1st Grade": "1st-grade", "2nd Grade": "2nd-grade", "3rd Grade": "3rd-grade", "4th Grade": "4th-grade" };
  const grade = folders[level];
  const std = id.match(/^(.+)-Q\d+$/)?.[1] || id;
  return `${grade}/${std}`;
}

// Audio CSV
const audioLines = ["lesson_id,filename,script_text,voice_direction"];
for (const p of picks) {
  const folder = buildAssetPath(p.id, p.level);
  audioLines.push([folder, p.audio_filename, p.tts_ssml, p.tts_voice_direction].map(escapeCSV).join(","));
}
fs.writeFileSync(path.join(__dirname, "test_audio.csv"), audioLines.join("\n") + "\n");

// Image CSV
const imgLines = ["Folder,Filename,Prompt"];
for (const p of picks) {
  const folder = buildAssetPath(p.id, p.level);
  imgLines.push([folder, p.image_filename, p.image_prompt].map(escapeCSV).join(","));
}
fs.writeFileSync(path.join(__dirname, "test_images.csv"), imgLines.join("\n") + "\n");

console.log("Test items:");
for (const p of picks) {
  console.log(`  ${p.id} (${p.level})`);
  console.log(`    Image: ${p.image_prompt.slice(0, 80)}...`);
  console.log(`    Audio: ${p.tts_ssml.slice(0, 80)}...`);
  console.log();
}
console.log("Written: test_audio.csv (10 rows), test_images.csv (10 rows)");
