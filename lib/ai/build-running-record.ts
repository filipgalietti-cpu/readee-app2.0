/**
 * AI Running Record — solo, teacher-driven 1:1 reading analysis.
 *
 * Replaces the never-going-to-work small-group diarization pitch
 * with the workflow teachers actually run: pull one kid, hand them
 * a passage, hit record, listen for ~1-2 minutes, hit stop.
 *
 * Gemini multimodal returns a structured running record:
 *   - transcript (what the kid actually said)
 *   - WCPM (correct words per minute)
 *   - accuracy_pct
 *   - miscues, list of {expected, heard, kind, position}
 *     where kind ∈ substitution | omission | insertion | self_correction
 *   - focus_area, one specific decoding pattern to target tomorrow
 *
 * Margin: 1 multimodal call on 1-2 min audio ≈ $0.02-0.04. Charge
 * 5 credits per record. ~80% gross.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { logUsage, MODEL_ID } from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

const SYSTEM = `You are an expert reading specialist scoring a 1:1 oral reading record. The teacher gives you the target passage and an audio recording of one student reading it aloud. Return a structured running record.

Definitions:
- "miscue" is any deviation from the printed text. Kinds:
  - substitution, kid says a different word
  - omission, kid skips a word
  - insertion, kid adds a word that wasn't in the text
  - self_correction, kid initially says it wrong then fixes it (these are NOT counted as errors but ARE listed)
- "wcpm" is correct words per minute. correct_words = total_words_attempted minus errors (excluding self_corrections). Divide by minutes_elapsed.
- "accuracy_pct" is correct_words / total_words_attempted * 100, rounded to int.
- "focus_area" is ONE concrete decoding or fluency pattern the teacher should re-teach. Examples: "vowel digraphs ea/ee", "r-controlled vowels", "reading punctuation pauses", "words with -tion".

Anti-hallucination:
- Only flag miscues you actually hear in the audio. If audio is unclear, lower the accuracy estimate rather than inventing miscues.
- Do NOT score on a passage the kid never reached. If the kid only read half, base WCPM on the half they read.
- If audio quality is too poor to score, set accuracy_pct to 0 and explain in focus_area.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    transcript: { type: Type.STRING },
    wcpm: { type: Type.INTEGER },
    accuracy_pct: { type: Type.INTEGER },
    miscues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          expected: { type: Type.STRING },
          heard: { type: Type.STRING },
          kind: { type: Type.STRING },
          position: { type: Type.INTEGER },
        },
        required: ["kind"],
      },
    },
    focus_area: { type: Type.STRING },
    teacher_summary: { type: Type.STRING },
  },
  required: ["transcript", "wcpm", "accuracy_pct", "miscues", "focus_area"],
};

export type Miscue = {
  expected: string;
  heard: string;
  kind: "substitution" | "omission" | "insertion" | "self_correction";
  position: number;
};

export type RunningRecord = {
  transcript: string;
  wcpm: number;
  accuracyPct: number;
  miscues: Miscue[];
  focusArea: string;
  teacherSummary: string;
};

export async function analyzeRunningRecord(input: {
  teacherId: string;
  audioBase64: string;
  audioMimeType: string;
  passageText: string;
  passageWordCount: number;
  durationSeconds: number;
  gradeLevel?: string | null;
}): Promise<{ ok: true; record: RunningRecord } | { ok: false; error: string }> {
  const passage = input.passageText.trim();
  if (!passage) return { ok: false, error: "Passage required." };
  if (input.passageWordCount < 5) {
    return { ok: false, error: "Passage too short — need at least 5 words." };
  }
  if (input.durationSeconds < 5) {
    return { ok: false, error: "Recording too short — at least 5 seconds." };
  }

  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const userPrompt = [
    `Grade level: ${input.gradeLevel ?? "unknown"}.`,
    `Passage word count: ${input.passageWordCount}.`,
    `Recording duration: ${input.durationSeconds.toFixed(1)} seconds (${(input.durationSeconds / 60).toFixed(2)} minutes).`,
    "",
    "Target passage:",
    '"""',
    passage,
    '"""',
    "",
    "Score this 1:1 oral reading per the schema.",
  ].join("\n");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: input.audioMimeType,
                data: input.audioBase64,
              },
            },
            { text: userPrompt },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA as any,
        temperature: 0.2,
      },
    });

    const text = (response.text ?? "").trim();
    if (!text) throw new Error("Empty model response.");
    const parsed = JSON.parse(text) as {
      transcript?: string;
      wcpm?: number;
      accuracy_pct?: number;
      miscues?: any[];
      focus_area?: string;
      teacher_summary?: string;
    };

    const miscues: Miscue[] = (Array.isArray(parsed.miscues) ? parsed.miscues : [])
      .map((m, i) => ({
        expected: String(m?.expected ?? ""),
        heard: String(m?.heard ?? ""),
        kind:
          m?.kind === "omission" ||
          m?.kind === "insertion" ||
          m?.kind === "self_correction"
            ? m.kind
            : ("substitution" as const),
        position: Number.isFinite(m?.position) ? Number(m.position) : i,
      })) as Miscue[];

    const record: RunningRecord = {
      transcript: String(parsed.transcript ?? ""),
      wcpm: clampInt(parsed.wcpm ?? 0, 0, 500),
      accuracyPct: clampInt(parsed.accuracy_pct ?? 0, 0, 100),
      miscues,
      focusArea: String(parsed.focus_area ?? ""),
      teacherSummary: String(parsed.teacher_summary ?? ""),
    };

    await logUsage({
      teacherId: input.teacherId,
      kind: "passage_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.passage_generation,
      success: true,
      requestSummary: `running_record: ${passage.slice(0, 80)}`,
    });

    return { ok: true, record };
  } catch (e: any) {
    trackError(e, {
      route: "build-running-record.analyzeRunningRecord",
      userId: input.teacherId,
    });
    await logUsage({
      teacherId: input.teacherId,
      kind: "passage_generation",
      model: MODEL_ID,
      success: false,
      error: e?.message ?? String(e),
      requestSummary: `running_record: ${passage.slice(0, 80)}`,
    });
    return { ok: false, error: e?.message ?? "Analysis failed." };
  }
}

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
