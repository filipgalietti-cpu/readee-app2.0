/**
 * Fluency reading-buddy. Kid reads a passage aloud, browser captures
 * audio, this orchestrator hands the audio + expected text to Gemini
 * and gets back per-word accuracy, an encouragement message for the
 * kid, and a teacher-facing summary.
 *
 * Replaces the manual running-record assessment K-2 teachers do 1:1
 * — the most time-consuming job in early-grade instruction.
 *
 * Cost per recording analysis: 1 quiz_generation credit (text in / out).
 * Audio bytes sent inline as base64.
 */

import { Type } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getClient, logUsage, MODEL_ID } from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";
import { randomUUID } from "crypto";

const SYSTEM = `You are an early-reading specialist evaluating a recording of a child reading a passage aloud.

You will receive:
- AUDIO of the child reading
- The exact PASSAGE text they were supposed to read
- Their grade level

Your job:
1. Transcribe what you actually heard.
2. For each word in the original passage, decide:
   - "correct" — read accurately
   - "missed" — skipped or unintelligible
   - "substituted" — child said a different word (provide the heard word)
   - "self_corrected" — child mis-read then corrected themselves
3. Compute words_correct (count of "correct" + "self_corrected").
4. Compute duration_seconds from the audio length.
5. Compute WCPM = words_correct / duration_minutes (rounded to 1 decimal).
6. Write a kid-friendly encouragement (2 sentences max). Lead with what went well, then ONE specific word to practice. Use a warm, age-appropriate voice. Don't shame.
7. Write a teacher-facing 1-sentence summary of fluency level + any concerns (e.g. "Strong WCPM at 78; struggled on multi-syllable words like 'beautiful' — recommend syllable-chunking practice.").

Output JSON with: transcript, word_annotations array, words_total, words_correct, duration_seconds, wcpm, encouragement, teacher_summary.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    transcript: { type: Type.STRING },
    word_annotations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          status: {
            type: Type.STRING,
            enum: ["correct", "missed", "substituted", "self_corrected"],
          },
          heard: { type: Type.STRING },
        },
        required: ["word", "status"],
      },
    },
    words_total: { type: Type.NUMBER },
    words_correct: { type: Type.NUMBER },
    duration_seconds: { type: Type.NUMBER },
    wcpm: { type: Type.NUMBER },
    encouragement: { type: Type.STRING },
    teacher_summary: { type: Type.STRING },
  },
  required: [
    "transcript",
    "word_annotations",
    "words_total",
    "words_correct",
    "duration_seconds",
    "wcpm",
    "encouragement",
    "teacher_summary",
  ],
};

export type FluencyAnalysis = {
  transcript: string;
  wordAnnotations: { word: string; status: string; heard?: string }[];
  wordsTotal: number;
  wordsCorrect: number;
  durationSeconds: number;
  wcpm: number;
  encouragement: string;
  teacherSummary: string;
};

export async function analyzeFluencyReading(input: {
  childId: string;
  callerId: string; // parent or teacher running the analysis
  audioBase64: string;
  audioMimeType: string;
  passageText: string;
  passageGradeLevel: string | null;
  /** When the reading satisfies a teacher assignment, link it back. */
  assignmentId?: string | null;
}): Promise<
  | { ok: true; readingId: string; analysis: FluencyAnalysis; audioUrl: string }
  | { ok: false; error: string }
> {
  if (!input.audioBase64) return { ok: false, error: "Missing audio." };
  if (!input.passageText.trim()) return { ok: false, error: "Missing passage." };

  const admin = supabaseAdmin();

  // 1) Upload the audio to Supabase Storage so we can replay later.
  const audioBuffer = Buffer.from(input.audioBase64, "base64");
  const ext =
    input.audioMimeType.includes("webm")
      ? "webm"
      : input.audioMimeType.includes("mp4")
        ? "m4a"
        : input.audioMimeType.includes("wav")
          ? "wav"
          : "bin";
  const readingId = randomUUID();
  const storagePath = `fluency/${input.childId}/${readingId}.${ext}`;
  const upload = await admin.storage
    .from("audio")
    .upload(storagePath, audioBuffer, {
      contentType: input.audioMimeType,
      upsert: false,
    });
  if (upload.error) {
    return { ok: false, error: `Audio upload failed: ${upload.error.message}` };
  }
  const { data: pub } = admin.storage.from("audio").getPublicUrl(storagePath);
  const audioUrl = pub?.publicUrl ?? "";

  // 2) Hand the audio to Gemini for analysis.
  const userPrompt = `Grade level: ${input.passageGradeLevel ?? "unspecified"}

Passage the child was reading:
"""
${input.passageText}
"""

Transcribe and analyze the audio now.`;

  let analysis: FluencyAnalysis;
  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: [
        {
          role: "user",
          parts: [
            { text: userPrompt },
            {
              inlineData: {
                data: input.audioBase64,
                mimeType: input.audioMimeType,
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || "{}") as any;
    analysis = {
      transcript: parsed.transcript ?? "",
      wordAnnotations: Array.isArray(parsed.word_annotations)
        ? parsed.word_annotations
        : [],
      wordsTotal: Number(parsed.words_total ?? 0),
      wordsCorrect: Number(parsed.words_correct ?? 0),
      durationSeconds: Number(parsed.duration_seconds ?? 0),
      wcpm: Number(parsed.wcpm ?? 0),
      encouragement:
        parsed.encouragement ?? "Great effort! Try reading it again.",
      teacherSummary:
        parsed.teacher_summary ?? "Reading recorded; review for full analysis.",
    };

    await logUsage({
      teacherId: input.callerId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: `fluency: ${input.childId} ${input.passageText.slice(0, 60)}`,
    });
  } catch (e: any) {
    trackError(e, { route: "build-fluency", userId: input.callerId });
    return { ok: false, error: e.message ?? "Fluency analysis failed." };
  }

  // 3) Persist the row.
  const { data: row, error: rowErr } = await admin
    .from("fluency_readings")
    .insert({
      id: readingId,
      child_id: input.childId,
      audio_url: audioUrl,
      passage_text: input.passageText,
      passage_grade_level: input.passageGradeLevel,
      transcript: analysis.transcript,
      word_annotations: analysis.wordAnnotations,
      words_total: analysis.wordsTotal,
      words_correct: analysis.wordsCorrect,
      duration_seconds: analysis.durationSeconds,
      wcpm: analysis.wcpm,
      encouragement: analysis.encouragement,
      teacher_summary: analysis.teacherSummary,
      assignment_id: input.assignmentId ?? null,
    })
    .select("id")
    .single();
  if (rowErr || !row) {
    return { ok: false, error: `Persist failed: ${rowErr?.message}` };
  }

  // 4) If this satisfied an assignment, mark it complete.
  if (input.assignmentId) {
    const scorePercent =
      analysis.wordsTotal > 0
        ? Math.round((analysis.wordsCorrect / analysis.wordsTotal) * 100)
        : null;
    await admin.from("assignment_submissions").upsert(
      {
        assignment_id: input.assignmentId,
        child_id: input.childId,
        completed_at: new Date().toISOString(),
        score_percent: scorePercent,
        carrots_earned: 0,
      },
      { onConflict: "assignment_id,child_id" },
    );
  }

  return { ok: true, readingId, analysis, audioUrl };
}
