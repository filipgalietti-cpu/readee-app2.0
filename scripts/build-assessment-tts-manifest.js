#!/usr/bin/env node

/**
 * Build TTS manifest + CSV for mixed-format K-4 assessment bank.
 *
 * Ported from build-master-manifest.js patterns:
 *   - stripPhonemeSlashes (not regex word/word which breaks /t/)
 *   - Stimulus punctuation enforcement
 *   - Per-type SSML builders with proper category enumeration
 *   - URL verification pass
 *   - Detailed stats
 *
 * Inputs:
 *   - lib/assessment/mixed-bank-k4.json
 *
 * Outputs:
 *   - scripts/assessment_mixed_manifest.json
 *   - scripts/assessment_mixed_tts.csv
 *   - scripts/assessment_image_prompts.csv
 *
 * Usage:
 *   node scripts/build-assessment-tts-manifest.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INPUT_PATH = path.join(ROOT, "lib", "assessment", "mixed-bank-k4.json");
const OUTPUT_MANIFEST_PATH = path.join(__dirname, "assessment_mixed_manifest.json");
const OUTPUT_CSV_PATH = path.join(__dirname, "assessment_mixed_tts.csv");
const OUTPUT_IMAGE_CSV_PATH = path.join(__dirname, "assessment_image_prompts.csv");
const OUTPUT_WORD_CSV_PATH = path.join(__dirname, "assessment_word_tts.csv");
const WORDS_DIR = path.join(ROOT, "public", "audio", "words");

const SUPABASE_IMAGE_BASE =
  "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/images";

const SUPABASE_AUDIO_BASE =
  "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/audio";

const GRADE_META = {
  kindergarten: {
    level: "Kindergarten",
    folder: "kindergarten",
    voiceDirection:
      "Read this like a cheerful, clear elementary school teacher reading to a small child:",
  },
  "1st": {
    level: "1st Grade",
    folder: "1st-grade",
    voiceDirection: "Read this like a friendly, clear teacher reading to a student:",
  },
  "2nd": {
    level: "2nd Grade",
    folder: "2nd-grade",
    voiceDirection: "Read this like a friendly, clear teacher reading to a student:",
  },
  "3rd": {
    level: "3rd Grade",
    folder: "3rd-grade",
    voiceDirection: "Read this like a friendly, clear teacher reading to a student:",
  },
  "4th": {
    level: "4th Grade",
    folder: "4th-grade",
    voiceDirection: "Read this like a friendly, clear teacher reading to a student:",
  },
};

/* ── Shared helpers (from build-master-manifest.js) ──── */

function escapeSSML(text) {
  return String(text || "")
    .replace(/\*\*/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Strip phoneme slashes: /b/ → b, /ee/ → ee  (same as master) */
function stripPhonemeSlashes(text) {
  return String(text || "").replace(/\//g, "");
}

/**
 * Speak-safe text: strip phoneme slashes then SSML-escape.
 * For label pairs like "Cause/Effect", call speakLabel instead.
 */
function speakText(text) {
  return escapeSSML(stripPhonemeSlashes(text));
}

/**
 * Speak a category/choice label that may contain "/" as a separator
 * (e.g. "cat/hat", "Cause/Effect", "ai/ay").
 * Converts word/word → "word and word" BEFORE stripping remaining slashes.
 */
function speakLabel(text) {
  const labeled = String(text || "").replace(
    /([A-Za-z]+)\s*\/\s*([A-Za-z]+)/g,
    "$1 and $2"
  );
  return escapeSSML(stripPhonemeSlashes(labeled));
}

function applyFlowFix(ssml) {
  return String(ssml)
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/<break time='1s'\/>/g, "<break time='400ms'/>")
    .replace(/<break time='1000ms'\/>/g, "<break time='400ms'/>")
    .replace(/<break time='800ms'\/>/g, "<break time='400ms'/>")
    .replace(/<break time='600ms'\/>/g, "<break time='400ms'/>")
    .trim();
}

function sanitizeFolderName(value) {
  return String(value || "general")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeCSV(val) {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/* ── Image prompt builder ──────────────────────────── */

const CARTOON_STYLE =
  "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters, no names, no labels.";

function buildImagePrompt(item) {
  // Per-question override from bank
  if (item.imagePromptOverride) {
    return item.imagePromptOverride;
  }

  // MCQ with stimulus (story) → illustrate the scene
  if (item.type === "mcq" && item.stimulus) {
    const firstSentence = item.stimulus.replace(/\n/g, " ").split(/\.\s*/)[0];
    return `Cartoon picture of ${firstSentence.toLowerCase()}. ${CARTOON_STYLE}`;
  }

  // MCQ without stimulus → illustrate the subject matter
  if (item.type === "mcq") {
    const p = item.prompt.toLowerCase();
    // Phonics / letter questions
    if (/letter|sound|starts with|rhyme|vowel|prefix|suffix/.test(p)) {
      const subject = (item.correct || "").replace(/\//g, " ");
      return `Cartoon picture of a cheerful child holding a big colorful letter block showing "${subject}". ${CARTOON_STYLE}`;
    }
    // Vocabulary / word meaning
    if (/synonym|opposite|meaning|metaphor|simile/.test(p)) {
      return `Cartoon picture of a child reading a big open book with colorful words floating out. ${CARTOON_STYLE}`;
    }
    // Text features
    if (/text feature|index|glossary|heading/.test(p)) {
      return `Cartoon picture of an open textbook showing a glossary page and index with a magnifying glass. ${CARTOON_STYLE}`;
    }
    // Default MCQ
    return `Cartoon picture of a curious child thinking with a question mark thought bubble. ${CARTOON_STYLE}`;
  }

  // Category sort → no image needed (word-only activity)
  if (item.type === "category_sort") {
    return "";
  }

  // Tap to pair / word builder → use override or no image
  if (item.type === "tap_to_pair" || item.type === "word_builder") {
    return "";
  }

  // Missing word → illustrate the sentence context
  if (item.type === "missing_word") {
    const choices = Array.isArray(item.missingChoices) ? item.missingChoices : [];
    const isOnset = choices.length > 0 && choices.every((c) => c.length === 1);
    if (isOnset) {
      // Onset blending: "c at" → the word is "cat"
      const word = (item.correctSentence || "").replace(/\s+/g, "");
      return `Cartoon picture of a ${word}. ${CARTOON_STYLE}`;
    }
    const sentence = (item.correctSentence || (item.sentenceWords || []).join(" "));
    return `Cartoon picture showing: ${sentence.toLowerCase()}. ${CARTOON_STYLE}`;
  }

  // Sentence build → illustrate the completed sentence scene
  if (item.type === "sentence_build") {
    const sentence = (item.correctSentence || (item.words || []).join(" "));
    return `Cartoon picture showing: ${sentence.toLowerCase()}. ${CARTOON_STYLE}`;
  }

  return `Cartoon picture of a child doing a fun reading activity. ${CARTOON_STYLE}`;
}

/* ── SSML builders (per question type) ─────────────── */

function buildMCQ_SSML(item) {
  if (item.ttsOverride) {
    return applyFlowFix(`<speak>${escapeSSML(item.ttsOverride)}</speak>`);
  }

  let ssml = "<speak>";

  // Optional intro (definitions like "A synonym is a word that means the same.")
  if (item.ttsIntro) {
    ssml += ` ${escapeSSML(item.ttsIntro)}`;
    ssml += "<break time='400ms'/>";
  }

  // Stimulus = passage (same role as \n\n-split passage in master)
  if (item.stimulus) {
    const escaped = speakText(item.stimulus);
    const endsWithPunctuation = /[.!?]["']?$/.test(escaped.trim());
    ssml += ` ${escaped}${endsWithPunctuation ? "" : "."}`;
    ssml += "<break time='400ms'/>";
  }

  // Second stimulus for dual_text
  if (item.stimulus2) {
    const escaped2 = speakText(item.stimulus2);
    const endsWithPunctuation2 = /[.!?]["']?$/.test(escaped2.trim());
    ssml += ` ${escaped2}${endsWithPunctuation2 ? "" : "."}`;
    ssml += "<break time='400ms'/>";
  }

  ssml += ` <emphasis level='moderate'>${speakText(item.prompt)}</emphasis>`;
  ssml += "<break time='400ms'/>";

  if (!item.skipChoiceAudio) {
    const choices = Array.isArray(item.choices) ? item.choices : [];
    // Detect single-letter choices → read as letter names via say-as
    const allSingleChar = choices.length > 0 && choices.every((c) => c.length === 1);
    choices.forEach((choice, i) => {
      const spoken = allSingleChar
        ? `<say-as interpret-as="characters">${escapeSSML(choice)}</say-as>`
        : speakLabel(choice);
      if (i < choices.length - 1) {
        ssml += ` ${spoken}? <break time='400ms'/>`;
      } else {
        ssml += ` or ${spoken}? <break time='400ms'/>`;
      }
    });
  }
  ssml += " What do you think?</speak>";
  return applyFlowFix(ssml);
}

function buildCategorySort_SSML(item) {
  if (item.ttsOverride) {
    return applyFlowFix(`<speak>${escapeSSML(item.ttsOverride)}</speak>`);
  }

  let ssml = "<speak>";

  ssml += ` <emphasis level='moderate'>${speakText(item.prompt)}</emphasis>`;
  ssml += "<break time='400ms'/>";

  // Read category definitions if available, then category names
  const categories = Array.isArray(item.categories) ? item.categories : [];
  const defs = item.categoryDefinitions || {};

  categories.forEach((cat) => {
    const def = defs[cat];
    if (def) {
      ssml += ` ${escapeSSML(def)}`;
      ssml += "<break time='400ms'/>";
    }
  });

  if (categories.length === 2) {
    ssml += ` Sort the words into two groups: ${speakLabel(categories[0])} and ${speakLabel(categories[1])}.`;
  } else {
    categories.forEach((cat, i) => {
      ssml += ` Group ${i + 1}: ${speakLabel(cat)}.`;
    });
  }
  ssml += "<break time='400ms'/>";

  // Don't list individual items — per-word audio handles that
  ssml += " Tap each word to hear it, then drag it to the right group.</speak>";
  return applyFlowFix(ssml);
}

function buildMissingWord_SSML(item) {
  let ssml = "<speak>";

  // Optional intro
  if (item.ttsIntro) {
    ssml += ` ${escapeSSML(item.ttsIntro)}`;
    ssml += "<break time='400ms'/>";
  }

  ssml += ` <emphasis level='moderate'>${speakText(item.prompt)}</emphasis>`;
  ssml += "<break time='400ms'/>";

  // Build sentence with blank
  const words = Array.isArray(item.sentenceWords) ? [...item.sentenceWords] : [];
  const blankIdx = typeof item.blankIndex === "number" ? item.blankIndex : -1;
  const choices = Array.isArray(item.missingChoices) ? item.missingChoices : [];

  // Detect onset-blending: blank markers like "_" or "___" with single-letter choices
  const isOnset =
    choices.length > 0 && choices.every((c) => c.length === 1) && blankIdx === 0;

  if (isOnset && words.length >= 2) {
    // Read as "What is the beginning sound in the word <fullword>?"
    const fullWord = speakText((item.correctSentence || "").replace(/\s+/g, ""));
    ssml += ` What is the beginning sound in the word ${fullWord}?<break time='400ms'/>`;
  } else {
    // Standard: replace blank marker with "blank"
    if (blankIdx >= 0 && blankIdx < words.length) {
      words[blankIdx] = "blank";
    }
    ssml += ` ${speakText(words.join(" "))}.<break time='400ms'/>`;
  }

  // Read choices
  choices.forEach((choice, i) => {
    const spoken = speakText(choice);
    if (i < choices.length - 1) {
      ssml += ` ${spoken}? <break time='400ms'/>`;
    } else {
      ssml += ` or ${spoken}? <break time='400ms'/>`;
    }
  });

  const tail = isOnset
    ? " Which sound completes the word?"
    : " Pick the word that fits best.";
  ssml += `${tail}</speak>`;
  return applyFlowFix(ssml);
}

function buildSentenceBuild_SSML(item) {
  let ssml = "<speak>";

  // Optional intro (e.g. "A conjunction is a word that joins two ideas.")
  if (item.ttsIntro) {
    ssml += ` ${escapeSSML(item.ttsIntro)}`;
    ssml += "<break time='400ms'/>";
  }

  // All grades: read the prompt but do NOT reveal the target sentence.
  // Words play audio individually when the child taps them.
  ssml += ` <emphasis level='moderate'>${speakText(item.prompt)}</emphasis>`;
  ssml += "<break time='400ms'/>";
  ssml += " Tap each word to hear it.";

  ssml += "</speak>";
  return applyFlowFix(ssml);
}

function buildTapToPair_SSML(item) {
  let ssml = "<speak>";

  if (item.ttsIntro) {
    ssml += ` ${escapeSSML(item.ttsIntro)}`;
    ssml += "<break time='400ms'/>";
  }

  ssml += ` <emphasis level='moderate'>${speakText(item.prompt)}</emphasis>`;
  ssml += "<break time='400ms'/>";
  ssml += " Tap a word on the left, then tap the matching word on the right.</speak>";
  return applyFlowFix(ssml);
}

function buildWordBuilder_SSML(item) {
  if (item.ttsOverride) {
    return applyFlowFix(`<speak>${escapeSSML(item.ttsOverride)}</speak>`);
  }
  let ssml = "<speak>";
  ssml += ` <emphasis level='moderate'>${speakText(item.prompt)}</emphasis>`;
  ssml += "</speak>";
  return applyFlowFix(ssml);
}

function buildQuestionSSML(item) {
  switch (item.type) {
    case "mcq":
      return buildMCQ_SSML(item);
    case "category_sort":
      return buildCategorySort_SSML(item);
    case "missing_word":
      return buildMissingWord_SSML(item);
    case "sentence_build":
      return buildSentenceBuild_SSML(item);
    case "tap_to_pair":
      return buildTapToPair_SSML(item);
    case "word_builder":
      return buildWordBuilder_SSML(item);
    default:
      return `<speak>${speakText(item.prompt)}</speak>`;
  }
}

/* ── Hint SSML ─────────────────────────────────────── */

function buildHintSSML(item) {
  // Custom hint overrides generic
  if (item.hint) {
    const hintText = escapeSSML(item.hint);
    return applyFlowFix(`<speak>Here's a hint! ${hintText}</speak>`);
  }

  let hint = "";

  if (item.type === "mcq") {
    const p = (item.prompt || "").toLowerCase();
    // Context-aware hints based on prompt content
    if (/rhyme/.test(p)) {
      hint = "Say each pair out loud. Which words end with the same sound?";
    } else if (/synonym/.test(p)) {
      hint = "Which word means almost the same thing?";
    } else if (/opposite/.test(p)) {
      hint = "Think about which words mean the complete opposite of each other.";
    } else if (/simile/.test(p)) {
      hint = "Look for the sentence that uses the word like or as to compare two things.";
    } else if (/metaphor/.test(p)) {
      hint = "A metaphor says something IS something else. Which sentence does that without using like or as?";
    } else if (/prefix|re-|un-|tele-/.test(p)) {
      hint = "Think about what the prefix adds to the word's meaning.";
    } else if (/starts with/.test(p)) {
      hint = "Say each word out loud. Listen to the very first sound.";
    } else if (/vowel|ea saying|short [aeiou]|long [aeiou]/.test(p)) {
      hint = "Say each word slowly and listen to the vowel sound in the middle.";
    } else if (/letter|sound/.test(p) && !item.stimulus) {
      hint = "Say each choice out loud and listen carefully.";
    } else if (/main idea|main topic/.test(p)) {
      hint = "What is the whole passage mostly about?";
    } else if (/theme|lesson|message/.test(p)) {
      hint = "Think about what the characters learned or what the story teaches.";
    } else if (/detail.*support|support.*detail|best show/.test(p)) {
      hint = "Go back to the text and find the detail that best answers the question.";
    } else if (/text feature|index|glossary|heading/.test(p)) {
      hint = "Think about which part of a book helps you find that information.";
    } else if (/synthesis|text a.*text b/i.test(p)) {
      hint = "Think about what both texts say together. What big idea do they share?";
    } else if (/color/.test(p)) {
      hint = "Think about what you see when you look around. Which word names a color?";
    } else if (/supported by the text|supported by/.test(p)) {
      hint = "Go back to the text. Which choice matches exactly what it says?";
    } else if (item.stimulus) {
      hint = "Listen to the story again and look for clues that help answer the question.";
    } else {
      hint = "Read each choice carefully and pick the one that best answers the question.";
    }
  } else if (item.type === "category_sort") {
    const cats = Array.isArray(item.categories) ? item.categories : [];
    if (cats.length === 2) {
      hint = `Say each word out loud. Does it belong in ${speakLabel(cats[0])} or ${speakLabel(cats[1])}?`;
    } else {
      hint = "Say each word out loud and think about which group it belongs to.";
    }
  } else if (item.type === "missing_word") {
    const choices = Array.isArray(item.missingChoices) ? item.missingChoices : [];
    const isOnset = choices.length > 0 && choices.every((c) => c.length === 1);
    hint = isOnset
      ? "Try each sound at the beginning and see which one makes a real word."
      : "Read the sentence with each choice and pick the one that sounds right.";
  } else if (item.type === "sentence_build") {
    hint = "Which word sounds like it comes first? Start there and read it out loud.";
  } else if (item.type === "tap_to_pair") {
    hint = "Say each word out loud and listen for the ones that go together.";
  } else if (item.type === "word_builder") {
    hint = `Try different letters at the beginning. Which ones make a real word that ends with ${speakText(item.wordEnding || "at")}?`;
  } else {
    hint = "Take your time and use the clues in the question.";
  }

  if (String(item.difficulty).toLowerCase() === "hard") {
    hint += " Think carefully — this one is a little tricky!";
  }

  return applyFlowFix(`<speak>Here's a hint! ${escapeSSML(hint)}</speak>`);
}

/* ── Manifest field helpers ────────────────────────── */

function collectChoices(item) {
  if (item.type === "mcq") return Array.isArray(item.choices) ? item.choices : [];
  if (item.type === "missing_word") return Array.isArray(item.missingChoices) ? item.missingChoices : [];
  return [];
}

/* ── Verification (from master) ────────────────────── */

function verifyManifest(manifest) {
  const issues = [];

  for (const item of manifest) {
    // Check SSML is valid (has <speak> tags, no raw slashes in phoneme context)
    if (!item.tts_ssml.startsWith("<speak>") || !item.tts_ssml.endsWith("</speak>")) {
      issues.push({ id: item.id, issue: "SSML missing <speak> wrapper" });
    }

    // Check for leftover phoneme slashes (e.g. /t/ not stripped)
    if (/\/[a-z]{1,3}\//i.test(item.tts_ssml)) {
      issues.push({ id: item.id, issue: "Leftover phoneme slashes in SSML", ssml: item.tts_ssml });
    }

    // Check for "and and" or "and or" garbled joins
    if (/\band\s+and\b/i.test(item.tts_ssml)) {
      issues.push({ id: item.id, issue: '"and and" detected in SSML' });
    }

    // Check audio URL structure
    const expectedFolder = `assessment/${item.audio_url.split("assessment/")[1]?.split("/")[0]}`;
    if (!item.audio_url.includes("/assessment/")) {
      issues.push({ id: item.id, issue: "audio_url missing /assessment/ path" });
    }

    // Check hint audio URL
    if (!item.hint_audio_url.includes("/assessment/")) {
      issues.push({ id: item.id, issue: "hint_audio_url missing /assessment/ path" });
    }

    // Empty SSML body
    if (item.tts_ssml === "<speak></speak>") {
      issues.push({ id: item.id, issue: "Empty SSML body" });
    }

    // Image prompt sanity (category_sort and tap_to_pair don't need images)
    if (!item.image_prompt && item.type !== "category_sort" && item.type !== "tap_to_pair" && item.type !== "word_builder") {
      issues.push({ id: item.id, issue: "Missing image prompt" });
    }
    if (item.image_url && !item.image_url.includes("/assessment/")) {
      issues.push({ id: item.id, issue: "image_url missing /assessment/ path" });
    }
  }

  return issues;
}

/* ── Main ─────────────────────────────────────────── */

function main() {
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`Input file not found: ${INPUT_PATH}`);
    process.exit(1);
  }

  const source = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));
  const grades = source.grades || {};

  const manifest = [];
  const ttsLines = ["lesson_id,filename,script_text,voice_direction"];

  for (const [gradeKey, items] of Object.entries(grades)) {
    const grade = GRADE_META[gradeKey];
    if (!grade) continue;
    if (!Array.isArray(items)) continue;

    let count = 0;
    for (const item of items) {
      const standardFolder = sanitizeFolderName(item.standard || "general");
      const lessonId = `assessment/${grade.folder}/${standardFolder}`;
      const audioFilename = `${item.id}.mp3`;
      const hintAudioFilename = `${item.id}-hint.mp3`;

      const ttsSSML = buildQuestionSSML(item);
      const hintSSML = buildHintSSML(item);
      const imagePrompt = buildImagePrompt(item);
      const imageFilename = `${item.id}.png`;
      const imagePath = `assessment/${grade.folder}/${standardFolder}`;

      manifest.push({
        id: item.id,
        level: grade.level,
        grade_key: gradeKey,
        standard: item.standard || "",
        type: item.type,
        difficulty: item.difficulty,
        prompt: item.prompt,
        stimulus: item.stimulus || "",
        stimulus2: item.stimulus2 || "",
        choices: collectChoices(item),
        categories: Array.isArray(item.categories) ? item.categories : [],
        items: Array.isArray(item.items) ? item.items : [],
        sentence_words: Array.isArray(item.sentenceWords) ? item.sentenceWords : [],
        words: Array.isArray(item.words) ? item.words : [],
        left_items: Array.isArray(item.leftItems) ? item.leftItems : [],
        right_items: Array.isArray(item.rightItems) ? item.rightItems : [],
        correct_pairs: item.correctPairs || {},
        word_ending: item.wordEnding || "",
        valid_words: Array.isArray(item.validWords) ? item.validWords : [],
        max_attempts: item.maxAttempts || 0,
        correct: item.correct || item.correctSentence || "",
        tts_ssml: ttsSSML,
        tts_voice_direction: grade.voiceDirection,
        hint_tts_ssml: hintSSML,
        hint_tts_voice_direction: grade.voiceDirection,
        audio_filename: audioFilename,
        hint_audio_filename: hintAudioFilename,
        audio_url: `${SUPABASE_AUDIO_BASE}/${lessonId}/${audioFilename}`,
        hint_audio_url: `${SUPABASE_AUDIO_BASE}/${lessonId}/${hintAudioFilename}`,
        image_prompt: imagePrompt,
        image_filename: imageFilename,
        image_url: `${SUPABASE_IMAGE_BASE}/${imagePath}/${imageFilename}`,
      });

      // CSV rows (same format as master — compatible with generate-audio.js)
      ttsLines.push(
        [lessonId, audioFilename, ttsSSML, grade.voiceDirection]
          .map(escapeCSV)
          .join(",")
      );
      ttsLines.push(
        [lessonId, hintAudioFilename, hintSSML, grade.voiceDirection]
          .map(escapeCSV)
          .join(",")
      );

      count++;
    }

    console.log(`${grade.level}: ${count} questions`);
  }

  // ── Write outputs ──
  fs.writeFileSync(OUTPUT_MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  fs.writeFileSync(OUTPUT_CSV_PATH, ttsLines.join("\n") + "\n");

  // Image CSV (Folder,Filename,Prompt — compatible with generate-images.js)
  const imgLines = ["Folder,Filename,Prompt"];
  for (const m of manifest) {
    if (m.image_prompt) {
      const folder = `assessment/${GRADE_META[m.grade_key].folder}/${sanitizeFolderName(m.standard)}`;
      imgLines.push([folder, m.image_filename, m.image_prompt].map(escapeCSV).join(","));
    }
  }
  fs.writeFileSync(OUTPUT_IMAGE_CSV_PATH, imgLines.join("\n") + "\n");

  // Per-word audio CSV (for category_sort items that don't already have audio)
  const allWords = new Set();
  for (const m of manifest) {
    if (m.type === "category_sort" && m.items.length > 0) {
      for (const word of m.items) {
        allWords.add(word);
      }
    }
    if (m.type === "tap_to_pair") {
      for (const word of m.left_items) allWords.add(word);
      for (const word of m.right_items) allWords.add(word);
    }
  }

  const existingWords = new Set();
  if (fs.existsSync(WORDS_DIR)) {
    for (const f of fs.readdirSync(WORDS_DIR)) {
      if (f.endsWith(".mp3")) {
        existingWords.add(f.replace(/\.mp3$/, ""));
      }
    }
  }

  const missingWords = [...allWords].filter((w) => !existingWords.has(w.toLowerCase())).sort();
  const wordVoice = "Read this like a friendly, clear teacher reading to a student:";
  const wordLines = ["lesson_id,filename,script_text,voice_direction"];
  for (const word of missingWords) {
    const ssml = `<speak>${escapeSSML(word)}</speak>`;
    wordLines.push(
      ["words", `${word.toLowerCase()}.mp3`, ssml, wordVoice]
        .map(escapeCSV)
        .join(",")
    );
  }
  fs.writeFileSync(OUTPUT_WORD_CSV_PATH, wordLines.join("\n") + "\n");

  // ── Stats ──
  const byType = {};
  const byGrade = {};
  for (const m of manifest) {
    byType[m.type] = (byType[m.type] || 0) + 1;
    byGrade[m.grade_key] = (byGrade[m.grade_key] || 0) + 1;
  }
  const withImage = manifest.filter((m) => m.image_prompt).length;

  console.log(`\n=== ASSESSMENT MANIFEST ===`);
  console.log(`Total items:     ${manifest.length}`);
  console.log(`By type:         ${Object.entries(byType).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  console.log(`By grade:        ${Object.entries(byGrade).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  console.log(`TTS CSV rows:    ${ttsLines.length - 1} (${manifest.length} questions + ${manifest.length} hints)`);
  console.log(`Image prompts:   ${withImage}`);
  console.log(`Image CSV rows:  ${imgLines.length - 1}`);
  console.log(`Word audio:      ${allWords.size} total, ${missingWords.length} missing`);
  if (missingWords.length > 0) {
    console.log(`  Missing words: ${missingWords.join(", ")}`);
  }

  console.log(`\n=== EXPORTED FILES ===`);
  console.log(`Manifest:  ${OUTPUT_MANIFEST_PATH}`);
  console.log(`TTS CSV:   ${OUTPUT_CSV_PATH}`);
  console.log(`Image CSV: ${OUTPUT_IMAGE_CSV_PATH}`);
  console.log(`Word CSV:  ${OUTPUT_WORD_CSV_PATH}`);

  // ── Verification ──
  const issues = verifyManifest(manifest);
  if (issues.length > 0) {
    console.log(`\n⚠ ISSUES FOUND (${issues.length}):`);
    for (const iss of issues) {
      console.log(`  ${iss.id}: ${iss.issue}${iss.ssml ? ` → ${iss.ssml.slice(0, 80)}…` : ""}`);
    }
  } else {
    console.log(`\n✓ All ${manifest.length} items verified — no issues`);
  }
}

main();
