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
import { runCommittee, safeJsonParse, type CommitteeVerdict } from "./judge-committee";
import {
  getCalibrationBundle,
  renderCalibrationForJudge,
} from "../qc/calibration";

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

/**
 * Multi-judge committee for question pedagogy. Runs Gemini + Claude
 * in parallel with the CCSS calibration anchor (CCS standard text +
 * 3 hand-audited K-canon reference questions) baked into the prompt.
 *
 * Why two providers: a single judge with a wrong interpretation of
 * the standard applies it consistently. Two different models trained
 * on different data have to be wrong in the same way for a false
 * positive to publish. Today's audit had 4 false-positive
 * q.should_be_asked findings; this kills that pattern.
 *
 * Consensus rules (lib/ai/judge-committee.ts):
 *   - both agree → that verdict
 *   - disagree → take the more severe (fail safe)
 *   - both error → fall back to legacy single-judge call below
 */
export async function judgeShouldBeAskedCommittee(input: {
  standardId: string;
  standardDescription: string;
  prompt: string;
  choices: string[];
  correct: string;
  passageBody?: string | null;
}): Promise<
  | {
      ok: true;
      verdict: ShouldBeAskedVerdict;
      severity: CommitteeVerdict;
      reason: string;
      agreement: "unanimous" | "split";
    }
  | { ok: false; error: string }
> {
  // Render the calibration anchor: CCS text + 3 K-canon reference Qs
  // for this standard. Without an anchor the judge guesses what the
  // standard covers; with the anchor it COMPARES — same baseline that
  // kept K canon at 100% pass.
  const calibration = input.standardId ? getCalibrationBundle(input.standardId, 3) : null;
  const anchorBlock = calibration
    ? `\n\n${renderCalibrationForJudge(calibration)}\n\nJudge the candidate against these reference questions. They establish the bar for scope, difficulty, and pedagogical focus.`
    : "";

  const userMsg = [
    `Standard: ${input.standardId} — ${input.standardDescription}`,
    input.passageBody ? `\nPassage:\n"""\n${input.passageBody.slice(0, 1500)}\n"""\n` : "",
    `Question: ${input.prompt}`,
    `Choices: ${input.choices.map((c, i) => `(${String.fromCharCode(65 + i)}) ${c}`).join("  ")}`,
    `Correct: ${input.correct}`,
    `\nReturn a JSON object: { "verdict": "valid" | "weak" | "drop", "reason": "..." }. No markdown, no extra text.`,
    anchorBlock,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await runCommittee<ShouldBeAskedVerdict>({
    judges: [
      { provider: "gemini", model: "gemini-2.5-flash" },
      { provider: "claude", model: "claude-haiku-4-5" },
    ],
    systemPrompt: SHOULD_BE_ASKED_SYSTEM,
    userPrompt: userMsg,
    parse: (raw) => {
      const parsed = safeJsonParse<{ verdict?: string; reason?: string }>(raw);
      if (!parsed) return { verdict: null, reason: "Could not parse JSON output." };
      const v = parsed.verdict;
      const verdict: ShouldBeAskedVerdict | null = (
        ["valid", "weak", "drop"] as const
      ).includes(v as ShouldBeAskedVerdict)
        ? (v as ShouldBeAskedVerdict)
        : null;
      return { verdict, reason: String(parsed.reason ?? "").trim() };
    },
    verdictToSeverity: (v) => (v === "valid" ? "pass" : v === "weak" ? "warn" : "fail"),
  });

  // Successful committee result if at least one judge returned a
  // parseable verdict (consensusOf already handled the all-error case
  // by returning warn). If neither judge succeeded, fall back to the
  // legacy single-judge implementation so the audit still records
  // something.
  const anyOk = result.runs.some((r) => r.ok);
  if (!anyOk) {
    const fb = await judgeShouldBeAsked(input);
    if (!fb.ok) return fb;
    return {
      ok: true,
      verdict: fb.verdict,
      severity: fb.verdict === "valid" ? "pass" : fb.verdict === "weak" ? "warn" : "fail",
      reason: `[fallback single-judge] ${fb.reason}`,
      agreement: "split" as const,
    };
  }

  // Map severity back to verdict the rest of the audit code expects.
  // Severity is the source of truth; verdict is just for back-compat.
  const verdict: ShouldBeAskedVerdict =
    result.severity === "pass" ? "valid" : result.severity === "warn" ? "weak" : "drop";

  return {
    ok: true,
    verdict,
    severity: result.severity,
    reason: result.reason,
    agreement: result.agreement,
  };
}

/**
 * Legacy single-judge implementation. Kept as a fallback when the
 * committee can't reach any judge (network issues, missing API keys,
 * etc.) so the audit never silently skips a question.
 */
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

  // Single-judge path still uses the calibration anchor — even when
  // there's only one voice, the anchor cuts false positives.
  const calibration = input.standardId ? getCalibrationBundle(input.standardId, 3) : null;
  const anchorBlock = calibration
    ? `\n\n${renderCalibrationForJudge(calibration)}\n\nJudge the candidate against these reference questions.`
    : "";

  const userMsg = [
    `Standard: ${input.standardId} — ${input.standardDescription}`,
    input.passageBody ? `\nPassage:\n"""\n${input.passageBody.slice(0, 1500)}\n"""\n` : "",
    `Question: ${input.prompt}`,
    `Choices: ${input.choices.map((c, i) => `(${String.fromCharCode(65 + i)}) ${c}`).join("  ")}`,
    `Correct: ${input.correct}`,
    anchorBlock,
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

/**
 * Multi-judge committee for question format recommendation. Same
 * pattern as judgeShouldBeAskedCommittee — Gemini + Claude judging
 * in parallel. Format choice is genuinely subjective (e.g. "should
 * this MCQ become missing_word?"), so two-model agreement is worth
 * the doubled call cost (~$0.004 per question vs $0.002 single).
 *
 * Falls back to legacy single-judge when both providers error.
 */
export async function judgeBetterFormatCommittee(input: {
  standardId: string;
  standardDescription: string;
  prompt: string;
  choices: string[];
  correct: string;
}): Promise<
  | {
      ok: true;
      recommendation: BetterFormatVerdict;
      severity: CommitteeVerdict;
      reason: string;
      agreement: "unanimous" | "split";
    }
  | { ok: false; error: string }
> {
  const userMsg = [
    `Standard: ${input.standardId} — ${input.standardDescription}`,
    `Question: ${input.prompt}`,
    `Choices: ${input.choices.map((c, i) => `(${String.fromCharCode(65 + i)}) ${c}`).join("  ")}`,
    `Correct: ${input.correct}`,
    "",
    `Return a JSON object: { "recommendation": "keep_mcq" | "missing_word" | "sentence_build" | "category_sort" | "tap_to_pair" | "sound_machine" | "space_insertion", "reason": "..." }. No markdown.`,
  ].join("\n");

  const result = await runCommittee<BetterFormatVerdict>({
    judges: [
      { provider: "gemini", model: "gemini-2.5-flash" },
      { provider: "claude", model: "claude-haiku-4-5" },
    ],
    systemPrompt: BETTER_FORMAT_SYSTEM,
    userPrompt: userMsg,
    parse: (raw) => {
      const parsed = safeJsonParse<{ recommendation?: string; reason?: string }>(raw);
      if (!parsed) return { verdict: null, reason: "Could not parse JSON output." };
      const r = parsed.recommendation;
      const verdict: BetterFormatVerdict | null = (
        [
          "keep_mcq",
          "missing_word",
          "sentence_build",
          "category_sort",
          "tap_to_pair",
          "sound_machine",
          "space_insertion",
        ] as const
      ).includes(r as BetterFormatVerdict)
        ? (r as BetterFormatVerdict)
        : null;
      return { verdict, reason: String(parsed.reason ?? "").trim() };
    },
    // Severity here is "should we surface this?" — keep_mcq = no
    // recommendation needed = pass; anything else = warn.
    verdictToSeverity: (v) => (v === "keep_mcq" ? "pass" : "warn"),
  });

  const anyOk = result.runs.some((r) => r.ok);
  if (!anyOk) {
    const fb = await judgeBetterFormat(input);
    if (!fb.ok) return fb;
    return {
      ok: true,
      recommendation: fb.recommendation,
      severity: fb.recommendation === "keep_mcq" ? "pass" : "warn",
      reason: `[fallback single-judge] ${fb.reason}`,
      agreement: "split" as const,
    };
  }

  // Map severity back to recommendation enum the rest of the audit
  // expects. If committee said "warn" we pick the first non-keep_mcq
  // verdict we can find in the runs; if pass, recommendation stays
  // keep_mcq.
  let recommendation: BetterFormatVerdict = "keep_mcq";
  if (result.severity !== "pass") {
    const nonKeep = result.runs.find(
      (r) => r.ok && r.verdict && r.verdict !== "keep_mcq",
    );
    if (nonKeep?.verdict) recommendation = nonKeep.verdict as BetterFormatVerdict;
  }

  return {
    ok: true,
    recommendation,
    severity: result.severity,
    reason: result.reason,
    agreement: result.agreement,
  };
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
