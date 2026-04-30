/**
 * Meta-level QC for existing questions: not "is the answer in the
 * choices?" but "should this question even exist, and is it the right
 * shape?"
 *
 * Two LLM judges:
 *
 * 1. judgeShouldBeAsked — pedagogical validity. Catches questions that
 *    are trivia-noise, lookable from the prompt, or test the wrong
 *    skill for the standard.
 *
 * 2. judgeBetterFormat — recommends a different question type when
 *    MCQ is the wrong shape. The kid-facing app supports:
 *    multiple_choice, missing_word, sentence_build, category_sort,
 *    tap_to_pair, sound_machine, space_insertion. Some questions are
 *    pedagogically better as one of those (e.g. "put these in order"
 *    → sentence_build).
 */

import { GoogleGenAI, Type } from "@google/genai";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

const SHOULD_BE_ASKED_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    verdict: {
      type: Type.STRING,
      enum: ["valid", "weak", "drop"],
    },
    reason: { type: Type.STRING },
  },
  required: ["verdict", "reason"],
};

const SHOULD_BE_ASKED_SYSTEM = `You are a senior K-4 reading specialist auditing a single multiple-choice question.

Decide: should this question exist in a kid's practice library?

Verdicts:
- valid: the question develops the skill the standard targets, isn't gameable, isn't trivia-noise. Worth keeping.
- weak: the question kinda tests the standard but is shallow — recall noise ("how many lions?"), too literal, distractors trivial, or the answer is obvious from the prompt without reading the passage. The library can do better; recommend revising.
- drop: the question shouldn't exist. Examples: it asks "what letter does it start with" while the word is in the prompt; it asks for a fact unrelated to the standard; it tests memorization of a single noun; it's circular ("the boy ran. who ran? the boy"); or it's a question a kid couldn't reasonably learn from.

Be strict. K-4 practice time is precious — questions that don't build skill don't belong in the library. The reason field MUST cite WHAT the question demands and WHY it does or doesn't develop the standard's skill.`;

const BETTER_FORMAT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    recommendation: {
      type: Type.STRING,
      enum: [
        "keep_mcq",
        "missing_word",
        "sentence_build",
        "category_sort",
        "tap_to_pair",
        "sound_machine",
        "space_insertion",
      ],
    },
    reason: { type: Type.STRING },
  },
  required: ["recommendation", "reason"],
};

const BETTER_FORMAT_SYSTEM = `You are reviewing an MCQ to decide whether it would be more pedagogically effective in a different interactive format. The Readee K-4 app supports these question types:

- multiple_choice: pick one correct from 4 distractors. Standard MCQ.
- missing_word: fill in a blank in a sentence. Best for vocabulary-in-context, sight words.
- sentence_build: drag/tap words to form a sentence. Best for syntax, sequencing, retell.
- category_sort: drag items into 2-3 buckets. Best for genre/category/sound classification.
- tap_to_pair: match left-side items to right-side items. Best for matching pairs (rhyme, definition, synonym).
- sound_machine: tap letters to build a target word from its phonemes. Best for decoding practice.
- space_insertion: tap between letters to insert a space and split a run-on. Best for word boundary work.

Verdicts:
- keep_mcq: the question is genuinely a "pick the best answer" question. MCQ is right.
- {one of the alternatives}: the question is forcing a non-MCQ skill into MCQ shape. Recommend the better format.

Examples:
- "What's the order of these events: First Anna ran. Then she..." → sentence_build (sequencing is a build skill)
- "Which words rhyme with 'cat'?" → tap_to_pair (rhyme matching)
- "Sort these into animals and plants" → category_sort
- "What sounds make the word 'bat'?" → sound_machine
- "What does 'tired' mean? a) happy b) sleepy c) hungry d) angry" → keep_mcq (real best-answer)

Reason must cite the specific format and why.`;

export type ShouldBeAskedVerdict = "valid" | "weak" | "drop";
export type BetterFormatVerdict =
  | "keep_mcq"
  | "missing_word"
  | "sentence_build"
  | "category_sort"
  | "tap_to_pair"
  | "sound_machine"
  | "space_insertion";

export async function judgeShouldBeAsked(input: {
  standardId: string;
  standardDescription: string;
  prompt: string;
  choices: string[];
  correct: string;
  passageBody?: string | null;
}): Promise<
  | { ok: true; verdict: ShouldBeAskedVerdict; reason: string }
  | { ok: false; error: string }
> {
  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const userMsg = [
    `Standard: ${input.standardId} — ${input.standardDescription}`,
    input.passageBody ? `\nPassage:\n"""\n${input.passageBody.slice(0, 1500)}\n"""\n` : "",
    `Question: ${input.prompt}`,
    `Choices: ${input.choices.map((c, i) => `(${String.fromCharCode(65 + i)}) ${c}`).join("  ")}`,
    `Correct: ${input.correct}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMsg,
      config: {
        systemInstruction: SHOULD_BE_ASKED_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SHOULD_BE_ASKED_SCHEMA,
        temperature: 0.0,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as {
      verdict?: string;
      reason?: string;
    };
    const verdict: ShouldBeAskedVerdict = (
      ["valid", "weak", "drop"] as const
    ).includes(parsed.verdict as ShouldBeAskedVerdict)
      ? (parsed.verdict as ShouldBeAskedVerdict)
      : "weak";
    return {
      ok: true,
      verdict,
      reason: String(parsed.reason ?? "").trim(),
    };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Should-be-asked judge failed." };
  }
}

export async function judgeBetterFormat(input: {
  standardId: string;
  standardDescription: string;
  prompt: string;
  choices: string[];
  correct: string;
}): Promise<
  | { ok: true; recommendation: BetterFormatVerdict; reason: string }
  | { ok: false; error: string }
> {
  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const userMsg = [
    `Standard: ${input.standardId} — ${input.standardDescription}`,
    `Question: ${input.prompt}`,
    `Choices: ${input.choices.map((c, i) => `(${String.fromCharCode(65 + i)}) ${c}`).join("  ")}`,
    `Correct: ${input.correct}`,
  ].join("\n");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMsg,
      config: {
        systemInstruction: BETTER_FORMAT_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: BETTER_FORMAT_SCHEMA,
        temperature: 0.0,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as {
      recommendation?: string;
      reason?: string;
    };
    const recommendation: BetterFormatVerdict = (
      [
        "keep_mcq",
        "missing_word",
        "sentence_build",
        "category_sort",
        "tap_to_pair",
        "sound_machine",
        "space_insertion",
      ] as const
    ).includes(parsed.recommendation as BetterFormatVerdict)
      ? (parsed.recommendation as BetterFormatVerdict)
      : "keep_mcq";
    return {
      ok: true,
      recommendation,
      reason: String(parsed.reason ?? "").trim(),
    };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Better-format judge failed." };
  }
}
