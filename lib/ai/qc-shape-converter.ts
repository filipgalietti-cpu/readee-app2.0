/**
 * Shape converter — transforms a multiple-choice question into one
 * of the interactive shapes when the format-rescue judge says the
 * question would teach better as something else.
 *
 * Each target shape has a specific output schema:
 *   - missing_word     → sentence_words[], blank_index, missing_choices[], correct
 *   - sentence_build   → words[] (correct order), distractors[], correct (joined sentence)
 *   - category_sort    → categories[], category_items{}, items[], correct (any one for compat)
 *   - tap_to_pair      → left_items[], right_items[], correct_pairs{}
 *   - space_insertion  → jumbled (no-space string), correct (with spaces)
 *
 * Returns the FIELDS to merge into the question (the caller decides
 * which existing fields to drop — e.g. drop choices on missing_word).
 */

import { GoogleGenAI, Type } from "@google/genai";
import { getClient } from "@/lib/ai/readee-ai";

export type ConvertableShape =
  | "missing_word"
  | "sentence_build"
  | "category_sort"
  | "tap_to_pair"
  | "space_insertion";

export type ShapeFields = {
  type: ConvertableShape;
  prompt?: string;
  correct?: string;
  hint?: string;
  // missing_word
  sentence_words?: string[];
  blank_index?: number;
  missing_choices?: string[];
  // sentence_build
  words?: string[];
  distractors?: string[];
  // category_sort
  categories?: string[];
  category_items?: Record<string, string[]>;
  items?: string[];
  // tap_to_pair
  left_items?: string[];
  right_items?: string[];
  correct_pairs?: Record<string, string>;
  // space_insertion
  jumbled?: string;
};

const SCHEMA_BY_SHAPE: Record<ConvertableShape, any> = {
  missing_word: {
    type: Type.OBJECT,
    properties: {
      prompt: { type: Type.STRING },
      sentence_words: { type: Type.ARRAY, items: { type: Type.STRING } },
      blank_index: { type: Type.INTEGER },
      missing_choices: { type: Type.ARRAY, items: { type: Type.STRING } },
      correct: { type: Type.STRING },
      hint: { type: Type.STRING },
    },
    required: ["prompt", "sentence_words", "blank_index", "missing_choices", "correct", "hint"],
  },
  sentence_build: {
    type: Type.OBJECT,
    properties: {
      prompt: { type: Type.STRING },
      words: { type: Type.ARRAY, items: { type: Type.STRING } },
      distractors: { type: Type.ARRAY, items: { type: Type.STRING } },
      correct: { type: Type.STRING },
      hint: { type: Type.STRING },
    },
    required: ["prompt", "words", "correct", "hint"],
  },
  category_sort: {
    type: Type.OBJECT,
    properties: {
      prompt: { type: Type.STRING },
      categories: { type: Type.ARRAY, items: { type: Type.STRING } },
      category_items: {
        type: Type.OBJECT,
        properties: {
          a: { type: Type.ARRAY, items: { type: Type.STRING } },
          b: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
      items: { type: Type.ARRAY, items: { type: Type.STRING } },
      correct: { type: Type.STRING },
      hint: { type: Type.STRING },
    },
    required: ["prompt", "categories", "items", "correct", "hint"],
  },
  tap_to_pair: {
    type: Type.OBJECT,
    properties: {
      prompt: { type: Type.STRING },
      left_items: { type: Type.ARRAY, items: { type: Type.STRING } },
      right_items: { type: Type.ARRAY, items: { type: Type.STRING } },
      correct: { type: Type.STRING },
      hint: { type: Type.STRING },
    },
    required: ["prompt", "left_items", "right_items", "correct", "hint"],
  },
  space_insertion: {
    type: Type.OBJECT,
    properties: {
      prompt: { type: Type.STRING },
      jumbled: { type: Type.STRING },
      correct: { type: Type.STRING },
      hint: { type: Type.STRING },
    },
    required: ["prompt", "jumbled", "correct", "hint"],
  },
};

const SYSTEM_BY_SHAPE: Record<ConvertableShape, string> = {
  missing_word: `Convert a K-4 multiple-choice question into a fill-in-the-blank.
- "sentence_words" is the FULL sentence broken into individual word strings, with EXACTLY ONE element being "___" (the blank).
- "blank_index" is the integer index (0-based) of "___" in sentence_words.
- "missing_choices" is exactly 4 distinct words that could plausibly fit the blank — one is correct, three are distractors.
- "correct" must equal one of missing_choices verbatim.
- Hint = one short sentence pointing at context clues.`,
  sentence_build: `Convert a K-4 multiple-choice question into a drag-words-to-build-a-sentence task.
- "words" is the correct ordered list of word strings that make up the target sentence.
- "distractors" is 1-3 extra word strings the kid should NOT use.
- "correct" is the full sentence with words joined by single spaces (and final punctuation, if natural).
- Hint = one short clue about word order.`,
  category_sort: `Convert a K-4 multiple-choice question into a sort-into-buckets task.
- "categories" is exactly 2 short bucket names (≤3 words each).
- "items" is 4-6 unique word/phrase strings to be sorted.
- "category_items" maps each category name to its correct subset of items. Every item in "items" must appear in exactly one category.
- "correct" must be one item that belongs to the FIRST category (back-compat).
- Hint = one short clue about how to tell the buckets apart.`,
  tap_to_pair: `Convert a K-4 multiple-choice question into a match-the-pairs task.
- "left_items" is 3-4 short strings.
- "right_items" is the SAME count of short strings, the matching partners.
- BOTH lists may be in any order. The kid taps left → right to pair them.
- "correct" should be left_items[0] joined to right_items index 0 with " = " ("left = right") for back-compat. Make sure left_items[i] is the partner for right_items[i] in the source ordering you produce.
- Hint = one short clue.`,
  space_insertion: `Convert a K-4 multiple-choice question into a tap-where-spaces-go task.
- "correct" is a short clear sentence with normal spacing and end punctuation.
- "jumbled" is the SAME sentence with all internal spaces removed but punctuation kept (e.g. "My dog is big." → "Mydogisbig.").
- "prompt" should instruct the kid to tap between letters to add spaces.
- Hint = one short clue (e.g. "There are X words").`,
};

export async function convertToShape(input: {
  shape: ConvertableShape;
  sourcePrompt: string;
  sourceChoices?: string[];
  sourceCorrect?: string;
  sourceHint?: string;
  standardId?: string | null;
  standardDescription?: string | null;
  rescueReason?: string;
  rescueConstraint?: string;
}): Promise<{ ok: true; fields: ShapeFields } | { ok: false; error: string }> {
  let ai: GoogleGenAI;
  try {
    ai = getClient();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const userMsg = [
    `Standard: ${input.standardId ?? "(unknown)"}${input.standardDescription ? ` — ${input.standardDescription}` : ""}`,
    "",
    `Source question (multiple_choice):`,
    `Prompt: ${input.sourcePrompt}`,
    input.sourceChoices && input.sourceChoices.length > 0
      ? `Choices: ${input.sourceChoices.map((c, i) => `(${String.fromCharCode(65 + i)}) ${c}`).join("  ")}`
      : "",
    input.sourceCorrect ? `Correct: ${input.sourceCorrect}` : "",
    input.sourceHint ? `Hint: ${input.sourceHint}` : "",
    "",
    input.rescueReason
      ? `Why we're converting (rescue judge):\n${input.rescueReason}`
      : "",
    input.rescueConstraint
      ? `Specific constraint:\n${input.rescueConstraint}`
      : "",
    "",
    `Convert this question to the schema below. Preserve the testable skill — the kid must still demonstrate the same reading concept, just via the new interaction.`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMsg,
      config: {
        systemInstruction: SYSTEM_BY_SHAPE[input.shape],
        responseMimeType: "application/json",
        responseSchema: SCHEMA_BY_SHAPE[input.shape] as any,
        temperature: 0.4,
      },
    });
    const text = response.text;
    if (!text) return { ok: false, error: "Empty conversion response" };
    const parsed = JSON.parse(text) as ShapeFields;
    return { ok: true, fields: { ...parsed, type: input.shape } };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Conversion failed." };
  }
}

/** Generate a chart_data spec for render_chart_via_css action.
 *  Returns a structured chart description (kind, title, axis labels,
 *  series). The kid runner renders this with SVG/CSS instead of an
 *  Imagen-generated image. */
export async function buildChartSpec(input: {
  prompt: string;
  constraint?: string;
}): Promise<
  | {
      ok: true;
      chart: {
        kind: "bar" | "line" | "pie";
        title: string;
        xLabel?: string;
        yLabel?: string;
        series: { label: string; value: number }[];
      };
    }
  | { ok: false; error: string }
> {
  let ai: GoogleGenAI;
  try {
    ai = getClient();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const SYSTEM = `You extract a chart specification from a K-4 reading-question prompt that references one. Return strict JSON with kind ("bar"|"line"|"pie"), title, optional xLabel + yLabel, and series (array of { label, value }). Use small whole numbers when the prompt allows. If the prompt names specific values, use those exactly.`;

  const SCHEMA = {
    type: Type.OBJECT,
    properties: {
      kind: { type: Type.STRING },
      title: { type: Type.STRING },
      xLabel: { type: Type.STRING },
      yLabel: { type: Type.STRING },
      series: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            value: { type: Type.NUMBER },
          },
          required: ["label", "value"],
        },
      },
    },
    required: ["kind", "title", "series"],
  };

  const userMsg = [
    `Prompt: ${input.prompt}`,
    input.constraint ? `Constraint: ${input.constraint}` : "",
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
        responseSchema: SCHEMA as any,
        temperature: 0.2,
      },
    });
    const text = response.text;
    if (!text) return { ok: false, error: "Empty chart response" };
    const parsed = JSON.parse(text) as any;
    const kind: "bar" | "line" | "pie" =
      ["bar", "line", "pie"].includes(parsed.kind) ? parsed.kind : "bar";
    return {
      ok: true,
      chart: {
        kind,
        title: String(parsed.title ?? ""),
        xLabel: parsed.xLabel ? String(parsed.xLabel) : undefined,
        yLabel: parsed.yLabel ? String(parsed.yLabel) : undefined,
        series: Array.isArray(parsed.series)
          ? parsed.series
              .map((s: any) => ({
                label: String(s?.label ?? ""),
                value: Number(s?.value ?? 0),
              }))
              .filter((s: any) => s.label && Number.isFinite(s.value))
          : [],
      },
    };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Chart spec failed." };
  }
}
