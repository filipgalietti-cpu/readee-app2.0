#!/usr/bin/env node
/**
 * Author RF.1.1a — What Makes a Sentence
 *
 * Systematic per-lesson builder. Writes:
 *   1. Patched entry in app/data/sample-lessons.json
 *   2. scripts/regen-rf-1-1a-audio.csv (empty voice_direction — no hallucination bleed)
 *   3. scripts/regen-rf-1-1a-imgs.csv
 *
 * Run upload/generate separately.
 */
const fs = require("fs");
const path = require("path");

const STANDARD_ID = "RF.1.1a";
const FOLDER = `lessons/${STANDARD_ID}`;

const lesson = {
  standardId: STANDARD_ID,
  grade: "1st Grade",
  domain: "Foundational Skills",
  title: "What Makes a Sentence",
  slides: [
    {
      slide: 1,
      type: "intro",
      steps: [
        { sub: "a", audioFile: `audio/${FOLDER}/S1a.mp3`, ttsScript: "Look! Let us talk about sentences.", interaction: "Heading fades in.", displayText: "Sentences!", displayDelay: 1500 },
        { sub: "b", audioFile: `audio/${FOLDER}/S1b.mp3`, ttsScript: "A sentence is a group of words that tells a whole idea.", interaction: "Pill lands.", displayText: "A whole idea", displayDelay: 2000 },
        { sub: "c", audioFile: `audio/${FOLDER}/S1c.mp3`, ttsScript: "Every sentence has two special rules. Let us learn them!", interaction: "Pill lands.", displayText: "Two rules", displayDelay: 2500 },
      ],
      heading: "What Makes a Sentence",
      imagePrompt: "A small group of cheerful cartoon kids of different skin tones and hair styles sitting on a colorful rug, reading from open picture books and smiling. Clean pastel background. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.",
      imageFile: `images/${FOLDER}/S1.png`,
    },
    {
      slide: 2,
      type: "teach",
      steps: [
        { sub: "a", audioFile: `audio/${FOLDER}/S2a.mp3`, ttsScript: "Rule one. Every sentence starts with a capital letter.", interaction: "Heading pill.", displayText: "Rule 1: Start with a capital", displayDelay: 1800 },
        { sub: "b", audioFile: `audio/${FOLDER}/S2b.mp3`, ttsScript: "Look at this sentence. The dog runs.", interaction: "Sentence pill lands.", displayText: "The dog runs.", displayDelay: 1800 },
        { sub: "c", audioFile: `audio/${FOLDER}/S2c.mp3`, ttsScript: "The first word is The. See the big capital T at the beginning?", interaction: "Tile The pulses.", displayDiagram: { letters: [{ text: "The" }], delay: 1500 } },
      ],
      heading: "Rule 1: Start Big",
      imagePrompt: "A friendly cartoon capital letter T character wearing a small gold crown, standing proudly at the front of a short parade of lowercase letters. Clean pastel background. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.",
      imageFile: `images/${FOLDER}/S2.png`,
    },
    {
      slide: 3,
      type: "teach",
      steps: [
        { sub: "a", audioFile: `audio/${FOLDER}/S3a.mp3`, ttsScript: "Rule two. Every sentence ends with a mark.", interaction: "Heading pill.", displayText: "Rule 2: End with a mark", displayDelay: 1800 },
        { sub: "b", audioFile: `audio/${FOLDER}/S3b.mp3`, ttsScript: "A period. A question mark. Or an exclamation mark!", interaction: "Three marks appear.", displayDiagram: { letters: [{ text: "." }, { text: "?" }, { text: "!" }], delay: 1500, revealCount: 3 } },
        { sub: "c", audioFile: `audio/${FOLDER}/S3c.mp3`, ttsScript: "A period ends a telling sentence.", interaction: "Sentence with period.", displayText: "The dog runs.", displayDelay: 1500 },
        { sub: "d", audioFile: `audio/${FOLDER}/S3d.mp3`, ttsScript: "A question mark ends a question.", interaction: "Sentence with question mark.", displayText: "Is the dog fast?", displayDelay: 1500 },
        { sub: "e", audioFile: `audio/${FOLDER}/S3e.mp3`, ttsScript: "And an exclamation mark ends an excited sentence!", interaction: "Sentence with exclamation.", displayText: "The dog is so fast!", displayDelay: 1500 },
      ],
      heading: "Rule 2: End With a Mark",
      imagePrompt: "Three cheerful cartoon punctuation mark characters standing in a row, a period, a question mark, and an exclamation mark, each with a big happy face and waving. Clean pastel background. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.",
      imageFile: `images/${FOLDER}/S3.png`,
    },
    {
      slide: 4,
      type: "example",
      steps: [
        { sub: "a", audioFile: `audio/${FOLDER}/S4a.mp3`, ttsScript: "Watch. Here is a sentence that is missing its rules.", interaction: "Broken sentence shown.", displayText: "the dog runs", displayDelay: 1500 },
        { sub: "b", audioFile: `audio/${FOLDER}/S4b.mp3`, ttsScript: "First, make the t a capital T.", interaction: "Capital T swap.", displayText: "The dog runs", displayDelay: 1800 },
        { sub: "c", audioFile: `audio/${FOLDER}/S4c.mp3`, ttsScript: "Then add a period at the end. Now it follows both rules!", interaction: "Period added.", displayText: "The dog runs.", displayDelay: 2000 },
        { sub: "d", audioFile: `audio/${FOLDER}/S4d.mp3`, ttsScript: "Now you are ready to practice! Find the sentences that follow the rules.", interaction: "Tap to continue.", displayText: "You got it!", displayDelay: 1500 },
      ],
      heading: "Fix It Up",
      imagePrompt: "A cheerful cartoon child wearing round glasses, smiling and holding a big red marker, fixing a piece of paper with sparkles around it. Clean pastel background. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.",
      imageFile: `images/${FOLDER}/S4.png`,
    },
    { slide: 5, type: "mcq", mcqId: "RF.1.1a-Q1" },
    { slide: 6, type: "mcq", mcqId: "RF.1.1a-Q2" },
    { slide: 7, type: "mcq", mcqId: "RF.1.1a-Q3" },
    { slide: 8, type: "mcq", mcqId: "RF.1.1a-Q4" },
    { slide: 9, type: "mcq", mcqId: "RF.1.1a-Q5" },
  ],
};

// Patch sample-lessons.json
const sampleLessonsPath = path.resolve(__dirname, "..", "..", "app", "data", "sample-lessons.json");
const all = JSON.parse(fs.readFileSync(sampleLessonsPath, "utf-8"));
const idx = all.findIndex((l) => l.standardId === STANDARD_ID);
if (idx === -1) throw new Error(`${STANDARD_ID} stub not found`);
all[idx] = lesson;
fs.writeFileSync(sampleLessonsPath, JSON.stringify(all, null, 2));

// Build audio CSV
const audioRows = [["lesson_id", "filename", "script_text", "voice_direction"]];
for (const slide of lesson.slides) {
  if (!slide.steps) continue;
  for (const step of slide.steps) {
    const filename = step.audioFile.match(/S\d+[a-z]/)[0];
    audioRows.push([FOLDER, filename, step.ttsScript, ""]);
  }
}
const audioCsv = audioRows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
fs.writeFileSync(path.resolve(__dirname, "..", `regen-rf-1-1a-audio.csv`), audioCsv + "\n");

// Build image CSV (one per slide that has an imageFile)
const imgRows = [["Folder", "Filename", "Prompt"]];
for (const slide of lesson.slides) {
  if (!slide.imageFile) continue;
  const filename = slide.imageFile.split("/").pop();
  imgRows.push([FOLDER, filename, slide.imagePrompt]);
}
const imgCsv = imgRows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
fs.writeFileSync(path.resolve(__dirname, "..", `regen-rf-1-1a-imgs.csv`), imgCsv + "\n");

console.log(`Authored ${STANDARD_ID}: ${lesson.slides.filter((s) => s.steps).length} teaching slides, ${lesson.slides.filter((s) => s.type === "mcq").length} MCQs wired.`);
console.log(`Audio rows: ${audioRows.length - 1}, image rows: ${imgRows.length - 1}`);
