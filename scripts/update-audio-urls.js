#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const INPUT_PATH = path.join(__dirname, "..", "app", "data", "kindergarten-standards-questions.json");
const AUDIO_DIR = path.join(__dirname, "..", "public", "audio", "kindergarten");

function splitPrompt(prompt) {
  const parts = prompt.split("\n\n");
  if (parts.length >= 2) {
    return { passage: parts.slice(0, -1).join(" ").trim(), question: parts[parts.length - 1].trim() };
  }
  return { passage: "", question: prompt.trim() };
}

const data = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));
let added = 0;

for (const std of data.standards) {
  for (let qIdx = 0; qIdx < std.questions.length; qIdx++) {
    const q = std.questions[qIdx];
    const qNum = qIdx + 1;
    const prefix = `${std.standard_id}-q${qNum}`;
    const { passage } = splitPrompt(q.prompt);

    // Passage audio
    if (passage) {
      const file = path.join(AUDIO_DIR, `${prefix}-passage.mp3`);
      if (fs.existsSync(file)) {
        q.passage_audio_url = `/audio/kindergarten/${prefix}-passage.mp3`;
        added++;
      }
    }

    // Prompt audio
    const promptFile = path.join(AUDIO_DIR, `${prefix}-prompt.mp3`);
    if (fs.existsSync(promptFile)) {
      q.prompt_audio_url = `/audio/kindergarten/${prefix}-prompt.mp3`;
      added++;
    }

    // Choice audio
    const choiceUrls = q.choices.map((_, cIdx) => {
      const file = path.join(AUDIO_DIR, `${prefix}-choice${cIdx + 1}.mp3`);
      if (fs.existsSync(file)) {
        added++;
        return `/audio/kindergarten/${prefix}-choice${cIdx + 1}.mp3`;
      }
      return null;
    });
    // Only set if all choices have audio
    if (choiceUrls.every((u) => u !== null)) {
      q.choices_audio_urls = choiceUrls;
    }

    // Hint audio
    const hintFile = path.join(AUDIO_DIR, `${prefix}-hint.mp3`);
    if (fs.existsSync(hintFile)) {
      q.hint_audio_url = `/audio/kindergarten/${prefix}-hint.mp3`;
      added++;
    }
  }
}

fs.writeFileSync(INPUT_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
console.log(`Updated JSON with ${added} audio URL references.`);
