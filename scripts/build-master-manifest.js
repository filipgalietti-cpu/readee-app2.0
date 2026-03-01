#!/usr/bin/env node

/**
 * Build master manifest — single source of truth for every question.
 *
 * Merges:
 *   - Question data (prompt, choices, correct, hint) from grade JSON files
 *   - SSML TTS scripts (generated from current choice order)
 *   - Image generation prompts (v3 premium for Grades 1-4, cartoon for K)
 *   - ID-based audio/image URLs
 *
 * Exports:
 *   - scripts/master_manifest.json          — full manifest
 *   - scripts/master_tts.csv                — TTS CSV ready for generate-audio.js
 *   - scripts/master_image_prompts.csv      — Imagen CSV ready for generate-images.js
 *
 * Usage: node scripts/build-master-manifest.js
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.resolve(__dirname, "..", "app", "data");
const SCRIPTS_DIR = __dirname;
const SUPABASE_AUDIO_BASE =
  "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/audio";
const SUPABASE_IMAGE_BASE =
  "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/images";

const GRADE_FILES = [
  { file: "kindergarten-standards-questions.json", level: "Kindergarten" },
  { file: "1st-grade-standards-questions.json", level: "1st Grade" },
  { file: "2nd-grade-standards-questions.json", level: "2nd Grade" },
  { file: "3rd-grade-standards-questions.json", level: "3rd Grade" },
  { file: "4th-grade-standards-questions.json", level: "4th Grade" },
];

const VOICE_DIRECTION_K =
  "Read this like a cheerful, clear elementary school teacher reading to a small child:";
const VOICE_DIRECTION_UPPER =
  "Read this like a friendly, clear teacher reading to a student:";

/* ── Prompt sanitizer ─────────────────────────────────── */

function sanitizePrompt(prompt) {
  let p = prompt;
  p = p.replace(
    /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]+\s*/gu,
    ""
  );
  p = p.replace(/^Read:\s*/i, "");
  p = p.replace(/^"([\s\S]+?)"\s*(\n\n)/, "$1$2");
  if (p.startsWith('"') && p.endsWith('"')) {
    p = p.slice(1, -1);
  }
  // Step 1: Convert short single-quoted words (emphasis) → **word** for bold rendering
  // Matches 'word' where the inner text is short (≤20 chars, no sentence punctuation)
  p = p.replace(/(^|[\s(])'([^']{1,20}?)'([\s).,;:!?\n]|$)/gm, (match, pre, inner, post) => {
    // If it looks like dialogue/sentence (has .!? inside), keep as quote
    if (/[.!?]/.test(inner)) return `${pre}"${inner}"${post}`;
    return `${pre}**${inner}**${post}`;
  });
  // Step 2: Convert remaining single quotes (dialogue/passages) → double quotes
  p = p.replace(/(^|[\s(])'(?=\S)/gm, '$1"');
  p = p.replace(/(\S)'(?=$|[\s).,;:!?\n])/gm, '$1"');
  p = p.replace(/  +/g, " ").trim();
  return p;
}

/* ── SSML builder ─────────────────────────────────────── */

function escapeSSML(text) {
  return text
    .replace(/\*\*/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Strip phoneme slashes for TTS (e.g. /b/ → "b", /f/ /u/ /n/ → "f u n") */
function stripPhonemeSlashes(text) {
  return text.replace(/\//g, "");
}

function buildQuestionSSML(prompt, choices, level) {
  const parts = prompt.split("\n\n");
  const passage = parts.length > 1 ? parts.slice(0, -1).join(" ") : "";
  const question = parts[parts.length - 1];

  let ssml = "<speak>";

  if (passage) {
    const escapedPassage = stripPhonemeSlashes(escapeSSML(passage));
    const endsWithPunctuation = /[.!?]["']?$/.test(escapedPassage.trim());
    ssml += ` ${escapedPassage}${endsWithPunctuation ? "" : "."}`;
    ssml += "<break time='400ms'/>";
  }

  ssml += ` <emphasis level='moderate'>${stripPhonemeSlashes(escapeSSML(question))}</emphasis>`;
  ssml += "<break time='400ms'/>";

  if (choices && choices.length > 0) {
    choices.forEach((choice, i) => {
      let spoken = stripPhonemeSlashes(escapeSSML(choice));
      if (i < choices.length - 1) {
        ssml += ` ${spoken}? <break time='400ms'/>`;
      } else {
        ssml += ` or ${spoken}? <break time='400ms'/>`;
      }
    });
    ssml += " What do you think?";
  }

  ssml += "</speak>";
  return ssml;
}

function buildHintSSML(hint) {
  if (!hint) return "";
  return `<speak>Here's a hint! ${escapeSSML(hint)}</speak>`;
}

function applyFlowFix(ssml) {
  return ssml
    .replace(/\n/g, " ")
    .replace(/<break time='1s'\/>/g, "<break time='400ms'/>")
    .replace(/<break time='1000ms'\/>/g, "<break time='400ms'/>")
    .replace(/<break time='800ms'\/>/g, "<break time='400ms'/>")
    .replace(/<break time='600ms'\/>/g, "<break time='400ms'/>");
}

/* ── Kindergarten image prompt builder ────────────────── */

function buildKindergartenImagePrompt(prompt) {
  // Extract the passage (before \n\n) to derive a visual scene
  const parts = prompt.split("\n\n");
  const passage = parts.length > 1 ? parts[0] : prompt;

  // Extract key visual elements from the first sentence, strip newlines
  const firstSentence = passage.replace(/\n/g, " ").split(/\.\s*/)[0];

  return (
    `Cartoon picture of ${firstSentence.toLowerCase()}. ` +
    "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. " +
    "No text, no words, no letters."
  );
}

/* ── Grade folder mapping ────────────────────────────── */

const LEVEL_FOLDER = {
  Kindergarten: "kindergarten",
  "1st Grade": "1st-grade",
  "2nd Grade": "2nd-grade",
  "3rd Grade": "3rd-grade",
  "4th Grade": "4th-grade",
};

/* ── Asset URL builders (ID-based, grade-subfolder) ──── */

function buildStandardFolder(id) {
  const stdMatch = id.match(/^(.+)-Q\d+$/);
  if (stdMatch) return stdMatch[1];
  const lessonMatch = id.match(/^(\d+-L\d+)/);
  if (lessonMatch) return lessonMatch[1];
  return id;
}

function buildAssetPath(id, level) {
  const gradeFolder = LEVEL_FOLDER[level] || "other";
  const stdFolder = buildStandardFolder(id);
  return `${gradeFolder}/${stdFolder}`;
}

function buildAudioFilename(id) {
  return `${id}.mp3`;
}

function buildHintAudioFilename(id) {
  return `${id}-hint.mp3`;
}

function buildAudioUrl(id, level) {
  const assetPath = buildAssetPath(id, level);
  return `${SUPABASE_AUDIO_BASE}/${assetPath}/${id}.mp3`;
}

function buildHintAudioUrl(id, level, hasHint) {
  if (!hasHint) return "";
  const assetPath = buildAssetPath(id, level);
  return `${SUPABASE_AUDIO_BASE}/${assetPath}/${id}-hint.mp3`;
}

function buildImageFilename(id) {
  return `${id}.png`;
}

function buildImageUrl(id, level) {
  const assetPath = buildAssetPath(id, level);
  return `${SUPABASE_IMAGE_BASE}/${assetPath}/${id}.png`;
}

/* ── Verification ─────────────────────────────────────── */

function verifySuspiciousUrls(manifest) {
  const suspicious = [];
  for (const item of manifest) {
    const expectedPath = buildAssetPath(item.id, item.level);
    if (item.audio_url && !item.audio_url.includes(expectedPath)) {
      suspicious.push({
        id: item.id,
        issue: "audio_url folder mismatch",
        expected: expectedPath,
        got: item.audio_url,
      });
    }
    if (item.hint_audio_url && !item.hint_audio_url.includes(expectedPath)) {
      suspicious.push({
        id: item.id,
        issue: "hint_audio_url folder mismatch",
        expected: expectedPath,
        got: item.hint_audio_url,
      });
    }
    if (item.image_url && !item.image_url.includes(expectedPath)) {
      suspicious.push({
        id: item.id,
        issue: "image_url folder mismatch",
        expected: expectedPath,
        got: item.image_url,
      });
    }
  }
  return suspicious;
}

/* ── CSV helpers ──────────────────────────────────────── */

function escapeCSV(val) {
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/* ── Main ─────────────────────────────────────────────── */

function main() {
  // Load v3 premium image prompts for Grades 1-4
  const imagePromptsPath = path.join(SCRIPTS_DIR, "premium_image_manifest_v3.json");
  let imagePromptsMap = {};
  const WATERCOLOR_STYLE =
    "Style: Soft digital watercolor children's book illustration, hand-drawn charcoal outlines, violet and indigo color palette, isolated on off-white paper texture, high-resolution, no text, no words, no letters.";
  const CARTOON_STYLE =
    "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

  if (fs.existsSync(imagePromptsPath)) {
    const imageData = JSON.parse(fs.readFileSync(imagePromptsPath, "utf-8"));
    for (const item of imageData) {
      // Replace watercolor style with cartoon style
      imagePromptsMap[item.id] = item.image_prompt.replace(WATERCOLOR_STYLE, CARTOON_STYLE);
    }
    console.log(`Loaded ${imageData.length} premium image prompts (Grades 1-4, cartoon style)`);
  } else {
    console.log("⚠ No premium image prompts found");
  }

  // Load regen overrides (desk scenes, bad K prompts, missing)
  const regenPath = path.join(SCRIPTS_DIR, "regen_results.json");
  let regenMap = {};
  if (fs.existsSync(regenPath)) {
    regenMap = JSON.parse(fs.readFileSync(regenPath, "utf-8"));
    console.log(`Loaded ${Object.keys(regenMap).length} regen overrides`);
  }

  const manifest = [];

  for (const { file, level } of GRADE_FILES) {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠ Skipping ${file} — not found`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const voiceDir = level === "Kindergarten" ? VOICE_DIRECTION_K : VOICE_DIRECTION_UPPER;

    let count = 0;
    for (const std of data.standards) {
      const domain = std.domain || "";
      for (const q of std.questions) {
        const cleanPrompt = sanitizePrompt(q.prompt);

        // TTS
        const ttsSSML = applyFlowFix(buildQuestionSSML(cleanPrompt, q.choices, level));
        const hintSSML = q.hint ? buildHintSSML(q.hint) : "";

        // Image prompt — regen overrides first, then K builder, then premium v3
        let imagePrompt;
        if (regenMap[q.id]) {
          imagePrompt = regenMap[q.id];
        } else if (level === "Kindergarten") {
          imagePrompt = buildKindergartenImagePrompt(cleanPrompt);
        } else {
          imagePrompt = imagePromptsMap[q.id] || "";
        }

        // Asset URLs — grade/standard/ID-based
        const audioUrl = buildAudioUrl(q.id, level);
        const hintAudioUrl = buildHintAudioUrl(q.id, level, !!q.hint);
        const imageUrl = buildImageUrl(q.id, level);

        manifest.push({
          id: q.id,
          level,
          domain,
          lesson: `Standard ${q.id.split("-Q")[0]}`,
          prompt: cleanPrompt,
          choices: q.choices || [],
          correct: q.correct,
          hint: q.hint || "",
          difficulty: q.difficulty || "",
          tts_ssml: ttsSSML,
          tts_voice_direction: voiceDir,
          hint_tts_ssml: hintSSML,
          hint_tts_voice_direction: hintSSML ? voiceDir : "",
          image_prompt: imagePrompt,
          image_filename: buildImageFilename(q.id),
          image_url: imageUrl,
          audio_filename: buildAudioFilename(q.id),
          hint_audio_filename: q.hint ? buildHintAudioFilename(q.id) : "",
          audio_url: audioUrl,
          hint_audio_url: hintAudioUrl,
        });
        count++;
      }
    }

    console.log(`${level}: ${count} questions`);
  }

  // ── Write master manifest JSON ──
  const manifestPath = path.join(SCRIPTS_DIR, "master_manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

  // ── Export TTS CSV (for generate-audio.js) ──
  const ttsLines = ["lesson_id,filename,script_text,voice_direction"];
  for (const m of manifest) {
    const folder = buildAssetPath(m.id, m.level);
    // Question audio
    ttsLines.push(
      [folder, m.audio_filename, m.tts_ssml, m.tts_voice_direction]
        .map(escapeCSV)
        .join(",")
    );
    // Hint audio
    if (m.hint_tts_ssml) {
      ttsLines.push(
        [folder, m.hint_audio_filename, m.hint_tts_ssml, m.hint_tts_voice_direction]
          .map(escapeCSV)
          .join(",")
      );
    }
  }
  const ttsCsvPath = path.join(SCRIPTS_DIR, "master_tts.csv");
  fs.writeFileSync(ttsCsvPath, ttsLines.join("\n") + "\n");

  // ── Export Image CSV (for generate-images.js) ──
  const imgLines = ["Folder,Filename,Prompt"];
  for (const m of manifest) {
    if (!m.image_prompt) continue;
    const folder = buildAssetPath(m.id, m.level);
    imgLines.push(
      [folder, m.image_filename, m.image_prompt].map(escapeCSV).join(",")
    );
  }
  const imgCsvPath = path.join(SCRIPTS_DIR, "master_image_prompts.csv");
  fs.writeFileSync(imgCsvPath, imgLines.join("\n") + "\n");

  // ── Stats ──
  const withImage = manifest.filter((m) => m.image_prompt).length;
  const withTTS = manifest.filter((m) => m.tts_ssml).length;
  const withHint = manifest.filter((m) => m.hint_tts_ssml).length;
  const cleanedPrompts = manifest.filter(
    (m) => !m.prompt.startsWith("Read:") && !m.prompt.match(/^[\u{1F300}-\u{1FAFF}]/u)
  ).length;

  console.log(`\n=== MASTER MANIFEST ===`);
  console.log(`Total questions:     ${manifest.length}`);
  console.log(`With TTS SSML:       ${withTTS}`);
  console.log(`With hint SSML:      ${withHint}`);
  console.log(`With image prompt:   ${withImage} (K: ${manifest.filter(m => m.level === "Kindergarten" && m.image_prompt).length}, Grades 1-4: ${manifest.filter(m => m.level !== "Kindergarten" && m.image_prompt).length})`);
  console.log(`Clean prompts:       ${cleanedPrompts}/${manifest.length}`);

  // TTS CSV stats
  const ttsRows = ttsLines.length - 1;
  console.log(`\n=== EXPORTED FILES ===`);
  console.log(`TTS CSV:   ${ttsCsvPath} (${ttsRows} rows)`);
  console.log(`Image CSV: ${imgCsvPath} (${imgLines.length - 1} rows)`);
  console.log(`Manifest:  ${manifestPath}`);

  // Verification
  const suspicious = verifySuspiciousUrls(manifest);
  if (suspicious.length > 0) {
    console.log(`\n⚠ SUSPICIOUS URLs (${suspicious.length}):`);
    for (const s of suspicious) {
      console.log(`  ${s.id}: ${s.issue} — expected "${s.expected}" in ${s.got}`);
    }
  } else {
    console.log(`\n✓ All URLs verified — no mismatches`);
  }
}

main();
