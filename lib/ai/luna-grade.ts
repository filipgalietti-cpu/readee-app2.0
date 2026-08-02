/**
 * Luna line-grader — a LEAN, fast per-sentence read check for the guided
 * tutoring loop. Unlike build-fluency's full analyzer (prosody, phrasing,
 * target patterns, teacher summary — great for a whole-passage report but
 * slow), this returns only what a single line needs: per-word status, a
 * disfluency flag (stutters/repeats/long pauses), and one short coaching
 * line. Small output + thinking disabled = much lower latency per turn.
 */
import { Type } from "@google/genai";
import { getClient, logUsage, MODEL_ID } from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";

const SYSTEM = `You are a warm K-4 reading coach grading ONE sentence a child just read aloud.
You get the AUDIO and the exact SENTENCE they were supposed to read.

‼️ THIS IS A READING CHECK, NOT A SPEECH-THERAPY EXAM. Young children very often have
developmental articulation patterns or speech impediments. If the child clearly READ THE RIGHT
WORD but pronounced it with one of these, it is CORRECT — never flag it and never "correct" their
pronunciation:
- r → w  (so "run" sounds like "wun", "rabbit" like "wabbit")
- l → w  ("light" → "wight")
- th → f/d  ("three" → "free", "that" → "dat")
- s/z lisp; dropped or softened final consonants; typical toddler/kindergarten pronunciation.
When a spoken attempt is phonetically CLOSE to the target word (an articulation variant), mark it
"correct" and assume they meant the target — do NOT match it to a different real word just because
the sounds drifted (e.g. "wun" for "run" is CORRECT, it is NOT the word "one").

Mark for EACH word:
- "correct" — read the right word (including with an articulation variant as above),
- "missed" — skipped or truly unintelligible,
- "substituted" — read a genuinely DIFFERENT word (put what you heard in "heard"),
- "self_corrected" — misread then fixed it.
- Set "disfluent" true only for real fluency issues — stutters, repeated words, long hesitations —
  NOT for articulation/accent differences.
- words_correct = count of "correct" + "self_corrected".
- Write ONE short coaching line ("coach") for a young child:
  - If everything was smooth and correct: a brief, genuine praise (max 8 words).
  - If a word was wrong/missed OR they were disfluent: name the specific word and tell them to try
    that line again, e.g. 'That word is "dog", not "cat". Let\\'s read the line again.' Keep it under
    18 words, warm, never shaming.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    word_annotations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          status: { type: Type.STRING, enum: ["correct", "missed", "substituted", "self_corrected"] },
          heard: { type: Type.STRING },
        },
        required: ["word", "status"],
      },
    },
    words_correct: { type: Type.NUMBER },
    words_total: { type: Type.NUMBER },
    duration_seconds: { type: Type.NUMBER },
    disfluent: { type: Type.BOOLEAN },
    coach: { type: Type.STRING },
  },
  required: ["word_annotations", "words_correct", "words_total", "disfluent", "coach"],
};

export type LineGrade = {
  wordAnnotations: { word: string; status: string; heard?: string }[];
  wordsCorrect: number;
  wordsTotal: number;
  durationSeconds: number;
  disfluent: boolean;
  coach: string;
};

export async function gradeLine(input: {
  callerId: string;
  audioBase64: string;
  audioMimeType: string;
  sentenceText: string;
  gradeLevel?: string | null;
}): Promise<{ ok: true; grade: LineGrade } | { ok: false; error: string }> {
  if (!input.audioBase64) return { ok: false, error: "Missing audio." };
  if (!input.sentenceText.trim()) return { ok: false, error: "Missing sentence." };

  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: [
        {
          role: "user",
          parts: [
            { text: `Grade level: ${input.gradeLevel ?? "unspecified"}\nSentence:\n"""\n${input.sentenceText}\n"""\nGrade the audio.` },
            { inlineData: { data: input.audioBase64, mimeType: input.audioMimeType } },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 0.1,
        // Disable Gemini 2.5 Flash "thinking" — this is a structured grading
        // call, not a reasoning task, and thinking adds seconds of latency.
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const p = JSON.parse(response.text || "{}") as any;
    const wa = Array.isArray(p.word_annotations) ? p.word_annotations : [];
    const grade: LineGrade = {
      wordAnnotations: wa,
      wordsTotal: Number(p.words_total ?? wa.length),
      wordsCorrect: Number(p.words_correct ?? 0),
      durationSeconds: Number(p.duration_seconds ?? 0),
      disfluent: Boolean(p.disfluent),
      coach: String(p.coach ?? "Nice reading!"),
    };

    void logUsage({
      teacherId: input.callerId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: `luna line: ${input.sentenceText.slice(0, 50)}`,
    });

    return { ok: true, grade };
  } catch (e: any) {
    trackError(e, { route: "luna-grade", userId: input.callerId });
    return { ok: false, error: e.message ?? "Grading failed." };
  }
}
