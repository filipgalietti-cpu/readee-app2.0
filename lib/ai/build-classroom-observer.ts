/**
 * Classroom Observer — multi-speaker reading-group analyzer.
 *
 * Teacher records a 5-min small-group reading session. Gemini
 * multimodal:
 *   - transcribes
 *   - identifies who said what (speaker A/B/C — teacher labels later)
 *   - flags reading errors per speaker
 *   - suggests targeted next practice for each kid
 *
 * Replaces a \$200 reading-specialist consult. Strong district sell.
 *
 * Margin: 1 multimodal call on a 5-min audio ≈ \$0.05. Charge 20
 * credits → ~75% gross. School/district SKU: "Coach Mode" at
 * \$3/teacher/year.
 *
 * The teacher can later relabel speaker_A → "Aiden" in the UI; the
 * kid-name mapping isn't sent to Gemini for privacy.
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

const SYSTEM = `You are an expert reading specialist analyzing audio of a small-group reading session. The teacher will tell you the passage; identify who reads what and flag errors and growth areas.

You CANNOT identify real names from the audio. Use generic speaker labels in order of first appearance: "speaker_A", "speaker_B", etc. The teacher will relabel later.

For each speaker, return:
  - speaker_label
  - approx_words_read
  - error_count (mispronounced + skipped + substituted, NOT including self-corrections)
  - self_correction_count
  - prosody_score (1-4 NAEP scale)
  - phrasing_score (1-4)
  - target_pattern (one specific phonics or comprehension focus, e.g. "blends -bl, -fl, -gl" or "context clues")
  - one_line_observation (kid-readable, parent-shareable)

ALSO return a teacher_summary (3-4 sentences): group-level fluency level, one strength, one focus area, one suggested grouping change for next session.

Anti-hallucination: if you can't tell two voices apart, lump them as one speaker. If audio is unclear, say so in teacher_summary rather than guessing.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    speakers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          speaker_label: { type: Type.STRING },
          approx_words_read: { type: Type.INTEGER },
          error_count: { type: Type.INTEGER },
          self_correction_count: { type: Type.INTEGER },
          prosody_score: { type: Type.INTEGER },
          phrasing_score: { type: Type.INTEGER },
          target_pattern: { type: Type.STRING },
          one_line_observation: { type: Type.STRING },
        },
        required: ["speaker_label", "error_count", "one_line_observation"],
      },
    },
    teacher_summary: { type: Type.STRING },
    transcript: { type: Type.STRING },
  },
  required: ["speakers", "teacher_summary"],
};

export type SpeakerObservation = {
  speakerLabel: string;
  approxWordsRead: number;
  errorCount: number;
  selfCorrectionCount: number;
  prosodyScore: number;
  phrasingScore: number;
  targetPattern: string;
  oneLineObservation: string;
};

export type ClassroomObservation = {
  speakers: SpeakerObservation[];
  teacherSummary: string;
  transcript: string;
};

export async function analyzeReadingGroup(input: {
  teacherId: string;
  audioBase64: string;
  audioMimeType: string;
  passageText: string;
  gradeLevel?: string | null;
}): Promise<{ ok: true; observation: ClassroomObservation } | { ok: false; error: string }> {
  if (!input.audioBase64) return { ok: false, error: "Audio required." };
  if (!input.passageText.trim()) return { ok: false, error: "Passage required." };

  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const userPrompt = [
    `Grade level: ${input.gradeLevel ?? "K-4"}`,
    "",
    `Passage the group was reading:`,
    `"""`,
    input.passageText,
    `"""`,
    "",
    "Analyze the audio and return per-speaker observations.",
  ].join("\n");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: input.audioMimeType, data: input.audioBase64 } },
            { text: userPrompt },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 0.3,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as Partial<{
      speakers: any[];
      teacher_summary: string;
      transcript: string;
    }>;
    const observation: ClassroomObservation = {
      speakers: ((parsed.speakers ?? []) as any[]).map((s) => ({
        speakerLabel: String(s.speaker_label ?? "speaker_?"),
        approxWordsRead: Number(s.approx_words_read ?? 0),
        errorCount: Number(s.error_count ?? 0),
        selfCorrectionCount: Number(s.self_correction_count ?? 0),
        prosodyScore: Math.max(1, Math.min(4, Number(s.prosody_score ?? 2))),
        phrasingScore: Math.max(1, Math.min(4, Number(s.phrasing_score ?? 2))),
        targetPattern: String(s.target_pattern ?? "").trim(),
        oneLineObservation: String(s.one_line_observation ?? "").trim(),
      })),
      teacherSummary: String(parsed.teacher_summary ?? "").trim(),
      transcript: String(parsed.transcript ?? "").trim(),
    };

    await logUsage({
      teacherId: input.teacherId,
      kind: "passage_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      // 5-min audio in + ~1K text out ≈ \$0.05 → 20 credits.
      creditsUsed: CREDIT_COST.passage_generation * 20,
      success: true,
      requestSummary: `classroom_observer: ${observation.speakers.length} speakers`,
    });

    return { ok: true, observation };
  } catch (e: any) {
    trackError(e, { route: "build-classroom-observer", userId: input.teacherId });
    return { ok: false, error: e?.message ?? "Couldn't analyze the recording." };
  }
}
