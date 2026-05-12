/**
 * Audit pass — scan every grade's standards-questions JSON for
 * questions that are MISSING `audio_url` and/or `image_url` (vs the
 * existing q.audio_quality / q.image_quality findings which target
 * assets that exist but are judged bad). Emits:
 *
 *   1. A console summary by grade.
 *   2. `scripts/missing-audio-punchlist.csv` — one row per missing-
 *      audio question with the exact TTS script the original
 *      premium-revamp batch would have generated (passage + prompt
 *      + choices for K/1, passage + prompt only for G2-4).
 *   3. `scripts/missing-image-punchlist.csv` — one row per missing-
 *      image question with the prompt + a suggested Imagen brief.
 *
 * Why a punchlist instead of running TTS / Imagen directly: the
 * existing premium-revamp pipeline (`scripts/generate-audio.js` +
 * `scripts/generate-images.js`) already knows how to consume a CSV
 * and emit assets at the canonical Supabase paths. This audit
 * produces input that pipeline can consume verbatim, so we don't
 * fork the asset-generation logic.
 *
 *   npx tsx scripts/audit-missing-question-assets.ts
 *   npx tsx scripts/audit-missing-question-assets.ts --grade=1st
 *
 * Free to run — it never calls a model. Just reads JSON.
 */

import fs from "node:fs";
import path from "node:path";

type Question = {
  id: string;
  type: string;
  prompt: string;
  choices?: string[];
  audio_url?: string;
  image_url?: string;
};

type Standard = {
  standard_id: string;
  domain: string;
  questions: Question[];
};

type GradeFile = {
  key: "K" | "1st" | "2nd" | "3rd" | "4th";
  folder: "kindergarten" | "1st-grade" | "2nd-grade" | "3rd-grade" | "4th-grade";
  filename: string;
};

const GRADES: GradeFile[] = [
  { key: "K", folder: "kindergarten", filename: "kindergarten-standards-questions.json" },
  { key: "1st", folder: "1st-grade", filename: "1st-grade-standards-questions.json" },
  { key: "2nd", folder: "2nd-grade", filename: "2nd-grade-standards-questions.json" },
  { key: "3rd", folder: "3rd-grade", filename: "3rd-grade-standards-questions.json" },
  { key: "4th", folder: "4th-grade", filename: "4th-grade-standards-questions.json" },
];

const gradeArg = process.argv.find((a) => a.startsWith("--grade="));
const GRADE_FILTER = gradeArg ? gradeArg.split("=")[1] : null;

const DATA = path.join(process.cwd(), "app", "data");

/** Matches the convention from the original premium-revamp batch:
 *  K + G1 read the passage + prompt + choices aloud (emerging readers
 *  hear every option). G2-G4 hear passage + prompt only — they're
 *  expected to read the choices themselves. */
function buildExpectedTts(q: Question, gradeKey: GradeFile["key"]): string {
  const promptParts = String(q.prompt ?? "").split("\n\n");
  const passage = promptParts.length > 1 ? promptParts.slice(0, -1).join("\n\n") : "";
  const promptOnly = promptParts.length > 1 ? promptParts[promptParts.length - 1] : q.prompt;
  const choices = Array.isArray(q.choices) ? q.choices : [];
  const isKor1 = gradeKey === "K" || gradeKey === "1st";

  const passageSpoken = passage ? passage + "\n\n" : "";
  if (isKor1 && choices.length > 0) {
    return `${passageSpoken}${promptOnly}\n\n${choices.join("... ")}`;
  }
  return `${passageSpoken}${promptOnly}`;
}

/** Suggested Imagen brief — leans on the existing Readee style and
 *  pulls the most concrete noun from the prompt so the picture
 *  anchors on the question instead of a generic scene. */
function buildImageBrief(q: Question, standardId: string): string {
  const promptParts = String(q.prompt ?? "").split("\n\n");
  const stem = promptParts.length > 1 ? promptParts[0] : q.prompt;
  return `Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. Scene: ${stem.slice(0, 220).replace(/\n/g, " ")}. Standard ${standardId}.`;
}

function csvEscape(v: string): string {
  if (v.includes(",") || v.includes("\n") || v.includes('"')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

type Row = {
  grade: GradeFile["key"];
  folder: GradeFile["folder"];
  standardId: string;
  questionId: string;
  type: string;
  expectedTts?: string;
  imageBrief?: string;
};

const audioRows: Row[] = [];
const imageRows: Row[] = [];
const summary: Record<string, { qs: number; missingAudio: number; missingImage: number }> = {};

for (const g of GRADES) {
  if (GRADE_FILTER && g.key !== GRADE_FILTER) continue;
  const raw = fs.readFileSync(path.join(DATA, g.filename), "utf8");
  const parsed = JSON.parse(raw) as { standards: Standard[] };
  let qs = 0;
  let missingAudio = 0;
  let missingImage = 0;

  for (const s of parsed.standards) {
    for (const q of s.questions ?? []) {
      qs++;
      const hasAudio = !!q.audio_url && q.audio_url.startsWith("http");
      const hasImage = !!q.image_url && q.image_url.startsWith("http");
      if (!hasAudio) {
        missingAudio++;
        audioRows.push({
          grade: g.key,
          folder: g.folder,
          standardId: s.standard_id,
          questionId: q.id,
          type: q.type,
          expectedTts: buildExpectedTts(q, g.key),
        });
      }
      if (!hasImage) {
        missingImage++;
        imageRows.push({
          grade: g.key,
          folder: g.folder,
          standardId: s.standard_id,
          questionId: q.id,
          type: q.type,
          imageBrief: buildImageBrief(q, s.standard_id),
        });
      }
    }
  }

  summary[g.key] = { qs, missingAudio, missingImage };
}

// ── Output ─────────────────────────────────────────────────────────
console.log("\nCONTENT GAP — MISSING QUESTION ASSETS\n");
console.log("Grade  Q's   Missing Audio       Missing Image");
console.log("─────  ───   ─────────────       ─────────────");
let totalQ = 0,
  totalMA = 0,
  totalMI = 0;
for (const [key, s] of Object.entries(summary)) {
  totalQ += s.qs;
  totalMA += s.missingAudio;
  totalMI += s.missingImage;
  const audioPct = s.qs ? Math.round((s.missingAudio / s.qs) * 100) : 0;
  const imagePct = s.qs ? Math.round((s.missingImage / s.qs) * 100) : 0;
  console.log(
    `${key.padEnd(5)}  ${String(s.qs).padEnd(5)} ${String(s.missingAudio).padEnd(4)} (${audioPct}%)`.padEnd(40) +
      ` ${s.missingImage} (${imagePct}%)`,
  );
}
console.log("─────  ───   ─────────────       ─────────────");
console.log(
  `TOTAL  ${String(totalQ).padEnd(5)} ${String(totalMA).padEnd(4)} (${
    totalQ ? Math.round((totalMA / totalQ) * 100) : 0
  }%)`.padEnd(40) +
    ` ${totalMI} (${totalQ ? Math.round((totalMI / totalQ) * 100) : 0}%)`,
);

// CSVs land next to the existing regen CSVs so the operator pipeline
// can pick them up.
const audioCsv = path.join(process.cwd(), "scripts", "missing-audio-punchlist.csv");
const imageCsv = path.join(process.cwd(), "scripts", "missing-image-punchlist.csv");

const audioHeader = "grade,folder,standard_id,question_id,type,expected_path,tts_script\n";
const audioBody = audioRows
  .map((r) =>
    [
      r.grade,
      r.folder,
      r.standardId,
      r.questionId,
      r.type,
      `audio/${r.folder}/${r.standardId}/${r.questionId}.mp3`,
      r.expectedTts ?? "",
    ]
      .map(csvEscape)
      .join(","),
  )
  .join("\n");
fs.writeFileSync(audioCsv, audioHeader + audioBody + "\n");

const imageHeader = "grade,folder,standard_id,question_id,type,expected_path,imagen_brief\n";
const imageBody = imageRows
  .map((r) =>
    [
      r.grade,
      r.folder,
      r.standardId,
      r.questionId,
      r.type,
      `images/${r.folder}/${r.standardId}/${r.questionId}.png`,
      r.imageBrief ?? "",
    ]
      .map(csvEscape)
      .join(","),
  )
  .join("\n");
fs.writeFileSync(imageCsv, imageHeader + imageBody + "\n");

console.log(`\nWrote ${audioRows.length} audio rows → ${path.relative(process.cwd(), audioCsv)}`);
console.log(`Wrote ${imageRows.length} image rows → ${path.relative(process.cwd(), imageCsv)}`);

// Rough cost estimate so the operator knows what they're committing
// to before kicking off a generation batch.
const audioCost = (audioRows.length * 0.02).toFixed(2);
const imageCost = (imageRows.length * 0.04).toFixed(2);
console.log(`\nEstimated cost to fill all gaps:`);
console.log(`  Audio (Vertex TTS @ ~$0.02/clip):  $${audioCost}`);
console.log(`  Images (Imagen 4.0 @ ~$0.04/img):  $${imageCost}`);
console.log(`  Total:                              $${(parseFloat(audioCost) + parseFloat(imageCost)).toFixed(2)}\n`);
