/**
 * Quiz CSV template + import normalization.
 *
 * Template columns (case-insensitive on import):
 *   kind        — multiple_choice | true_false | fill_in_blank
 *   prompt      — the question text (max 2000 chars)
 *   choices     — for MCQ only: pipe-separated (`A|B|C|D`). Ignored for
 *                 true_false (we always render True/False) and
 *                 fill_in_blank.
 *   correct     — MCQ: the correct choice exactly. TF: True or False.
 *                 FIB: pipe-separated accepted answers.
 *   hint        — optional, shown after a wrong answer
 *   image_url   — optional public URL to an illustration
 *   audio_url   — optional public URL to an mp3/wav of the prompt
 *
 * The template includes 3 sample rows (one per kind) as a starting
 * point. Teachers download it, edit in Excel/Sheets, save as CSV
 * (UTF-8), and upload via /classroom/authoring/quiz/[id] →
 * "Import from CSV".
 */

import { csvRow } from "@/lib/csv/parse";

export const TEMPLATE_HEADERS = [
  "kind",
  "prompt",
  "choices",
  "correct",
  "hint",
  "image_url",
  "audio_url",
] as const;

const SAMPLE_ROWS: (string | null)[][] = [
  [
    "multiple_choice",
    "Max the dog ran to the park. He played fetch with a red ball.\n\nWhat did Max PLAY with?",
    "A stick|A toy car|A red ball|A bone",
    "A red ball",
    "Look at the second sentence — what did Max play fetch with?",
    "",
    "",
  ],
  [
    "true_false",
    "The story says Max ran to the park.",
    "",
    "True",
    "Re-read the first sentence carefully.",
    "",
    "",
  ],
  [
    "fill_in_blank",
    "Max played _____ in the park.",
    "",
    "fetch|catch",
    "What game do dogs love?",
    "",
    "",
  ],
];

export function buildTemplateCsv(): string {
  const header = csvRow(TEMPLATE_HEADERS as unknown as string[]);
  const rows = SAMPLE_ROWS.map((r) => csvRow(r));
  return [header, ...rows].join("\r\n") + "\r\n";
}

export type ParsedQuestion =
  | {
      kind: "multiple_choice";
      prompt: string;
      choices: string[];
      correct: string;
      hint: string | null;
      imageUrl: string | null;
      audioUrl: string | null;
    }
  | {
      kind: "true_false";
      prompt: string;
      correct: "True" | "False";
      hint: string | null;
      imageUrl: string | null;
      audioUrl: string | null;
    }
  | {
      kind: "fill_in_blank";
      prompt: string;
      correct: string[];
      hint: string | null;
      imageUrl: string | null;
      audioUrl: string | null;
    };

export type RowError = { row: number; message: string };

export type NormalizeResult = {
  questions: ParsedQuestion[];
  errors: RowError[];
};

/** Validate + normalize parsed CSV rows into our QuestionInput shape. */
export function normalizeRows(rows: string[][]): NormalizeResult {
  if (rows.length === 0) return { questions: [], errors: [{ row: 0, message: "CSV is empty." }] };
  const headerRow = rows[0].map((h) => h.trim().toLowerCase());
  const idx: Record<string, number> = {};
  for (let i = 0; i < headerRow.length; i++) idx[headerRow[i]] = i;

  const required = ["kind", "prompt", "correct"];
  for (const k of required) {
    if (!(k in idx)) {
      return {
        questions: [],
        errors: [{ row: 1, message: `Missing required column: "${k}"` }],
      };
    }
  }

  const questions: ParsedQuestion[] = [];
  const errors: RowError[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const get = (key: string) => (idx[key] !== undefined ? (row[idx[key]] ?? "").trim() : "");

    const kindRaw = get("kind").toLowerCase();
    const prompt = get("prompt");
    const choicesRaw = get("choices");
    const correctRaw = get("correct");
    const hint = get("hint");
    const imageUrl = get("image_url");
    const audioUrl = get("audio_url");

    if (!kindRaw && !prompt && !correctRaw) continue; // blank row, skip silently

    const rowNum = r + 1; // 1-indexed for human messages, header is row 1

    if (!["multiple_choice", "true_false", "fill_in_blank"].includes(kindRaw)) {
      errors.push({
        row: rowNum,
        message: `Unknown kind "${kindRaw}". Use multiple_choice, true_false, or fill_in_blank.`,
      });
      continue;
    }
    if (!prompt) {
      errors.push({ row: rowNum, message: "Prompt is required." });
      continue;
    }
    if (prompt.length > 2000) {
      errors.push({ row: rowNum, message: "Prompt is over 2,000 characters." });
      continue;
    }

    const hintVal = hint || null;
    const imgVal = imageUrl || null;
    const audVal = audioUrl || null;

    if (kindRaw === "multiple_choice") {
      const choices = choicesRaw
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      if (choices.length < 2) {
        errors.push({
          row: rowNum,
          message: "MCQ needs at least 2 choices, pipe-separated (A|B|C|D).",
        });
        continue;
      }
      if (choices.length > 6) {
        errors.push({ row: rowNum, message: "MCQ can have at most 6 choices." });
        continue;
      }
      if (!choices.includes(correctRaw)) {
        errors.push({
          row: rowNum,
          message: `Correct answer "${correctRaw}" must match one of the choices exactly.`,
        });
        continue;
      }
      questions.push({
        kind: "multiple_choice",
        prompt,
        choices,
        correct: correctRaw,
        hint: hintVal,
        imageUrl: imgVal,
        audioUrl: audVal,
      });
    } else if (kindRaw === "true_false") {
      const norm = correctRaw.toLowerCase();
      if (norm !== "true" && norm !== "false") {
        errors.push({
          row: rowNum,
          message: `True/false correct must be "True" or "False" (got "${correctRaw}").`,
        });
        continue;
      }
      questions.push({
        kind: "true_false",
        prompt,
        correct: norm === "true" ? "True" : "False",
        hint: hintVal,
        imageUrl: imgVal,
        audioUrl: audVal,
      });
    } else {
      const accepted = correctRaw
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      if (accepted.length === 0) {
        errors.push({
          row: rowNum,
          message: "Fill-in-blank needs at least one accepted answer.",
        });
        continue;
      }
      questions.push({
        kind: "fill_in_blank",
        prompt,
        correct: accepted,
        hint: hintVal,
        imageUrl: imgVal,
        audioUrl: audVal,
      });
    }
  }

  return { questions, errors };
}
