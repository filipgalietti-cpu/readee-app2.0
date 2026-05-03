/**
 * Format-rescue judge.
 *
 * The audit + regen pipeline is great at fixing image / audio quality
 * when the underlying format is right. But some questions are
 * fundamentally mismatched with our generation tools — e.g. a
 * heteronym question where TTS can't pronounce two senses
 * differently, or a bar-graph question where Imagen can't render
 * numerical labels reliably. Retrying regen burns credits without
 * solving anything.
 *
 * judgeFormatRescue takes a question's CURRENT shape PLUS the
 * specific failure reason from the audit and recommends an
 * actionable format change: drop the audio, drop the image, render
 * the chart via CSS instead of Imagen, convert to a different
 * question kind, or keep-as-is if the failure is fixable.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { getClient } from "@/lib/ai/readee-ai";

export type FormatRescueAction =
  | "keep_as_is"
  | "drop_audio"
  | "drop_image"
  | "regenerate_audio_with_constraint"
  | "regenerate_image_with_constraint"
  | "convert_to_text_only"
  | "convert_to_missing_word"
  | "convert_to_sentence_build"
  | "convert_to_category_sort"
  | "convert_to_tap_to_pair"
  | "convert_to_space_insertion"
  | "render_chart_via_css"
  | "drop_question_entirely";

export type FormatRescueResult = {
  action: FormatRescueAction;
  reason: string;
  /** When action involves a regen-with-constraint, what the new
   *  brief should say. */
  constraint?: string;
};

const SYSTEM = `You are a curriculum-design + AI-tooling expert helping fix questions in a K-4 reading app.

Each question can have:
  - text prompt + multiple choices (kind="multiple_choice")
  - optional read-aloud audio (Gemini TTS)
  - optional illustration (Imagen 4 / Gemini Flash Image)
  - alternative interactive kinds: missing_word, sentence_build,
    category_sort, tap_to_pair, space_insertion

Generation tools have limits:
  - TTS naturalizes pronunciation. It can't reliably:
      • Articulate sentence-spacing differences ("Ilikedogs" vs "I like dogs")
      • Pronounce non-word phonics fragments ("Thoght", "tern", "-tion" alone)
      • Pronounce heteronyms differently within one audio (wind/wind, lead/lead)
      • Read non-IPA phonetic spellings as written
  - Imagen / Flash Image can't reliably:
      • Render specific text labels (signs, signs of words, captions)
      • Draw charts/graphs with accurate numerical labels
      • Spell words on objects (book covers, chalkboards)
  - Both can fail on edge cases that retry won't fix.

Your job: read the question, the current format, and the SPECIFIC failure reason. Recommend ONE action that actually solves the underlying mismatch.

Action vocabulary and when to use each:
  - "keep_as_is" — failure looks like a transient hiccup; one more regen probably succeeds
  - "drop_audio" — the question is testing visual / spatial / spelling concepts that TTS can't represent (sentence spacing, sight-word recognition, syllable boundary identification)
  - "drop_image" — the image isn't load-bearing for the question; image-text bugs would distract more than help
  - "regenerate_audio_with_constraint" — audio is salvageable with a stricter brief (e.g. "spell letter-by-letter, do not naturalize")
  - "regenerate_image_with_constraint" — image is salvageable with a stricter brief (e.g. "no text in image", "use only abstract shapes")
  - "convert_to_text_only" — drop both audio and image; question stands alone in text
  - "convert_to_missing_word" — fill-in-the-blank fits better (vocabulary in context, grammar identification)
  - "convert_to_sentence_build" — drag-words-to-build fits better (sentence structure, word order)
  - "convert_to_category_sort" — sort-into-buckets fits better (parts of speech, contrasting concepts)
  - "convert_to_tap_to_pair" — match-pairs fits better (synonym/antonym, cause-effect, vocab-to-meaning)
  - "convert_to_space_insertion" — tap-where-spaces-go fits better (sentence spacing, punctuation, capitalization location)
  - "render_chart_via_css" — quantitative visual that needs accurate labels (bar graph, table) — generate inline with HTML/SVG instead of Imagen
  - "drop_question_entirely" — the question can't be saved; it's bad pedagogy or untestable with current tools

Return strict JSON:
  { "action": "...", "reason": "...", "constraint": "..." (optional) }

If recommending a regenerate-with-constraint, the constraint field MUST contain the new prompt-line to feed the model.

If recommending convert_to_X, the reason must explain how the existing prompt + choices map onto the new format.

Be decisive. Don't waste a credit suggesting "keep_as_is" unless you're confident the regen pipeline will actually succeed next time.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    action: { type: Type.STRING },
    reason: { type: Type.STRING },
    constraint: { type: Type.STRING },
  },
  required: ["action", "reason"],
  propertyOrdering: ["action", "reason", "constraint"],
};

const VALID_ACTIONS: FormatRescueAction[] = [
  "keep_as_is",
  "drop_audio",
  "drop_image",
  "regenerate_audio_with_constraint",
  "regenerate_image_with_constraint",
  "convert_to_text_only",
  "convert_to_missing_word",
  "convert_to_sentence_build",
  "convert_to_category_sort",
  "convert_to_tap_to_pair",
  "convert_to_space_insertion",
  "render_chart_via_css",
  "drop_question_entirely",
];

export async function judgeFormatRescue(input: {
  targetId: string;
  standardId: string | null;
  standardDescription?: string | null;
  kind: string;
  prompt: string;
  choices?: string[];
  correct?: string;
  hasAudio: boolean;
  hasImage: boolean;
  failureReason: string;
  failureType: string; // "q.audio_quality", "q.image_quality", etc.
  attemptCount: number;
}): Promise<{ ok: true; result: FormatRescueResult } | { ok: false; error: string }> {
  let ai: GoogleGenAI;
  try {
    ai = getClient();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const userMsg = [
    `Target id: ${input.targetId}`,
    `Standard: ${input.standardId ?? "(unknown)"}${input.standardDescription ? ` — ${input.standardDescription}` : ""}`,
    `Current question kind: ${input.kind}`,
    `Has audio: ${input.hasAudio}`,
    `Has image: ${input.hasImage}`,
    `Attempts so far: ${input.attemptCount}`,
    "",
    `Prompt: ${input.prompt}`,
    input.choices && input.choices.length > 0
      ? `Choices: ${input.choices.map((c, i) => `(${String.fromCharCode(65 + i)}) ${c}`).join("  ")}`
      : "",
    input.correct ? `Correct: ${input.correct}` : "",
    "",
    `RECURRING FAILURE (${input.failureType}): ${input.failureReason}`,
    "",
    "What action solves this? Return JSON.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMsg,
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 0.2,
      },
    });
    const text = response.text;
    if (!text) return { ok: false, error: "Empty response" };
    const parsed = JSON.parse(text) as {
      action?: string;
      reason?: string;
      constraint?: string;
    };
    const action = (
      VALID_ACTIONS.includes(parsed.action as FormatRescueAction)
        ? parsed.action
        : "keep_as_is"
    ) as FormatRescueAction;
    return {
      ok: true,
      result: {
        action,
        reason: String(parsed.reason ?? "").trim(),
        constraint: parsed.constraint?.trim() || undefined,
      },
    };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Format-rescue judge failed." };
  }
}
