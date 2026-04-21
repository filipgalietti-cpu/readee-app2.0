/**
 * Shared per-lesson authoring helper.
 *
 * Pattern a builder file uses:
 *   const build = require("./_lib");
 *   build({
 *     standardId: "RF.1.2b",
 *     grade: "1st Grade",
 *     domain: "Foundational Skills",
 *     title: "Blending Sounds Into Words",
 *     slides: [ {heading, type, imagePrompt, steps:[{sub, tts, ...}] }, ... ],
 *     mcqIds: ["RF.1.2b-Q1","RF.1.2b-Q2","RF.1.2b-Q3","RF.1.2b-Q4","RF.1.2b-Q5"],
 *   });
 *
 * Writes:
 *   - patched entry in app/data/sample-lessons.json
 *   - scripts/regen-<slugified id>-audio.csv
 *   - scripts/regen-<slugified id>-imgs.csv
 */
const fs = require("fs");
const path = require("path");

const SAMPLE_PATH = path.resolve(__dirname, "..", "..", "app", "data", "sample-lessons.json");

function slug(id) { return id.toLowerCase().replace(/\./g, "-"); }

function csvEscape(s) {
  return `"${String(s).replace(/"/g, '""')}"`;
}

module.exports = function build({ standardId, grade, domain, title, slides, mcqIds = [] }) {
  const folder = `lessons/${standardId}`;

  // Materialize lesson object
  const fullSlides = slides.map((s, slideIdx) => {
    const num = slideIdx + 1;
    const steps = (s.steps || []).map((step) => {
      const out = {
        sub: step.sub,
        audioFile: `audio/${folder}/S${num}${step.sub}.mp3`,
        ttsScript: step.tts,
        interaction: step.interaction || "",
      };
      if (step.displayText !== undefined) out.displayText = step.displayText;
      if (step.displayDelay !== undefined) out.displayDelay = step.displayDelay;
      if (step.displayParts) out.displayParts = step.displayParts;
      if (step.displayDiagram) out.displayDiagram = step.displayDiagram;
      if (step.displayDiagramSwap) out.displayDiagramSwap = step.displayDiagramSwap;
      if (step.displayAlphabetGrid) out.displayAlphabetGrid = step.displayAlphabetGrid;
      if (step.afterPhonemes) out.afterPhonemes = step.afterPhonemes;
      if (step.phonemeLetterIndices) out.phonemeLetterIndices = step.phonemeLetterIndices;
      if (step.imageFile) out.imageFile = `images/${folder}/${step.imageFile}`;
      return out;
    });
    const slide = {
      slide: num,
      type: s.type,
      steps,
      heading: s.heading,
      imagePrompt: s.imagePrompt,
      imageFile: `images/${folder}/S${num}.png`,
    };
    return slide;
  });

  const lesson = {
    standardId,
    grade,
    domain,
    title,
    slides: [
      ...fullSlides,
      ...mcqIds.map((id, i) => ({ slide: fullSlides.length + 1 + i, type: "mcq", mcqId: id })),
    ],
  };

  // Patch sample-lessons.json
  const all = JSON.parse(fs.readFileSync(SAMPLE_PATH, "utf-8"));
  const idx = all.findIndex((l) => l.standardId === standardId);
  if (idx === -1) throw new Error(`${standardId} not found in sample-lessons.json`);
  all[idx] = lesson;
  fs.writeFileSync(SAMPLE_PATH, JSON.stringify(all, null, 2));

  // Build audio CSV (empty voice_direction — no hallucination bleed)
  const audioRows = [["lesson_id", "filename", "script_text", "voice_direction"]];
  for (const slide of fullSlides) {
    for (const step of slide.steps) {
      const filename = `S${slide.slide}${step.sub}`;
      audioRows.push([folder, filename, step.ttsScript, ""]);
    }
  }
  const audioCsv = audioRows.map((r) => r.map(csvEscape).join(",")).join("\n") + "\n";
  fs.writeFileSync(path.resolve(__dirname, "..", `regen-${slug(standardId)}-audio.csv`), audioCsv);

  // Build image CSV — per-slide image + any per-step imageFile overrides
  const imgRows = [["Folder", "Filename", "Prompt"]];
  for (const slide of fullSlides) {
    imgRows.push([folder, `S${slide.slide}.png`, slide.imagePrompt]);
  }
  // Per-step imageFile overrides: collect prompts from the raw input slides
  slides.forEach((rawSlide, si) => {
    (rawSlide.steps || []).forEach((step) => {
      if (step.imageFile && step.imagePrompt) {
        imgRows.push([folder, step.imageFile, step.imagePrompt]);
      }
    });
  });
  const imgCsv = imgRows.map((r) => r.map(csvEscape).join(",")).join("\n") + "\n";
  fs.writeFileSync(path.resolve(__dirname, "..", `regen-${slug(standardId)}-imgs.csv`), imgCsv);

  const audioCount = audioRows.length - 1;
  const imgCount = imgRows.length - 1;
  console.log(`${standardId}: ${fullSlides.length} teach slides + ${mcqIds.length} MCQs. ${audioCount} audio, ${imgCount} images queued.`);
  return { audioCount, imgCount, slug: slug(standardId) };
};
