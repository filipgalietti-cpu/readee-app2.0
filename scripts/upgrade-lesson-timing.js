#!/usr/bin/env node

/**
 * Upgrades unaudited K lessons to match the audited lesson patterns:
 * - Adds displayText where missing on intro/teach steps
 * - Converts flat displayDelay to displayParts with progressive reveals
 * - Estimates timing from TTS word count (~150ms per word)
 * - Adds emphasis keywords to displayText
 * - Adds interaction descriptions for checkmarks/X marks on examples
 *
 * Run: node scripts/upgrade-lesson-timing.js
 * Output: writes updated sample-lessons.json
 */

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.resolve(__dirname, "..", "app", "data", "sample-lessons.json");
const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

const AUDITED = new Set(["RL.K.1", "RF.K.2a", "RI.K.1", "RL.K.2", "RL.K.5"]);
const MS_PER_WORD = 155; // average pace for Autonoe voice reading to kids

function estimateMs(text) {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.round(words * MS_PER_WORD);
}

// Extract the key phrase from a TTS script for display
function extractDisplayText(tts) {
  if (!tts) return null;
  // If TTS is short (< 10 words), use it as-is
  const words = tts.trim().split(/\s+/);
  if (words.length <= 8) return tts.trim();
  // Otherwise, try to find a quotable phrase or key concept
  // Look for text after "called", "means", "are", "is"
  const patterns = [
    /called\s+(.{5,40})[.!,]/i,
    /means\s+(.{5,30})[.!,]/i,
    /['"](.{3,40})['"]/,
    /:\s*(.{5,40})[.!]/,
  ];
  for (const p of patterns) {
    const m = tts.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

// Upgrade a single lesson
function upgradeLesson(lesson) {
  if (!lesson.slides) return;

  lesson.slides.forEach((slide, si) => {
    if (!slide.steps) return;

    slide.steps.forEach((step, stIdx) => {
      const tts = step.ttsScript || "";
      const ttsMs = estimateMs(tts);

      // RULE 1: Intro steps without displayText — add one from TTS
      if (slide.type === "intro" && !step.displayText && !step.displayParts && stIdx > 0) {
        const extracted = extractDisplayText(tts);
        if (extracted) {
          step.displayText = extracted;
          step.displayDelay = Math.max(1000, Math.round(ttsMs * 0.4));
        }
      }

      // RULE 2: Teach/tip steps with displayDelay but no displayParts
      // If the displayText contains multiple concepts (commas, "and"), split into parts
      if ((slide.type === "teach" || slide.type === "tip") && step.displayText && step.displayDelay && !step.displayParts) {
        const parts = step.displayText.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
          // Convert to displayParts with staggered timing
          const spacing = Math.round(ttsMs / parts.length);
          step.displayParts = parts.map((text, i) => ({
            text,
            delay: Math.round(spacing * i * 0.5) + 300,
          }));
          delete step.displayDelay;
        } else {
          // Single text — ensure delay is reasonable (at least 40% through TTS)
          step.displayDelay = Math.max(500, Math.min(step.displayDelay, Math.round(ttsMs * 0.5)));
        }
      }

      // RULE 3: Example slides — if displayText has a sentence to read,
      // add line-by-line displayParts
      if (slide.type === "example" && step.displayText && !step.displayParts) {
        const lines = step.displayText.split("\n").filter(Boolean);
        if (lines.length >= 2) {
          step.displayParts = lines.map((text, i) => ({
            text,
            delay: i === 0 ? 0 : estimateMs(lines.slice(0, i).join(" ")) + 500,
          }));
          delete step.displayDelay;
          delete step.displayText;
        }
      }

      // RULE 4: Example follow-up steps (Who? What? Where? patterns)
      // If TTS asks a question then answers it, create Q+A displayParts
      if (slide.type === "example" && !step.displayParts && tts) {
        const qaMatch = tts.match(/^(.{5,40}\?)\s+(.{3,60}[!.])/);
        if (qaMatch && !step.displayText) {
          const question = qaMatch[1].trim();
          const answer = qaMatch[2].trim();
          const qMs = estimateMs(question);
          step.displayParts = [
            { text: question, delay: 300 },
            { text: answer, delay: qMs + 800 },
          ];
          // Add checkmark interaction if it looks like a correct answer
          if (!step.interaction || !step.interaction.includes("check")) {
            step.interaction = (step.interaction || "") + " Highlights with a checkmark.";
          }
        }
      }

      // RULE 5: Ensure all displayDelays are at least 500ms
      if (step.displayDelay && step.displayDelay < 500) {
        step.displayDelay = 500;
      }
    });
  });
}

// Process only unaudited K lessons
let upgraded = 0;
data.forEach((lesson) => {
  if (lesson.grade === "Kindergarten" && !AUDITED.has(lesson.standardId)) {
    upgradeLesson(lesson);
    upgraded++;
  }
});

// Write back
fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
console.log(`Upgraded ${upgraded} lessons. Written to ${DATA_PATH}`);
