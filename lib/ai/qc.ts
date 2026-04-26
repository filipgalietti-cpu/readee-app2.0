/**
 * AI quality control for AI-generated content.
 *
 * Three layers per piece of content:
 *   1. Deterministic — cheap, instant: word counts, regex, Flesch-Kincaid,
 *      banned-word checks, character validation.
 *   2. LLM judge — 1 credit per content piece: pedagogical / coherence /
 *      answer-support / age-appropriateness rubric checks.
 *   3. Vision check (image only) — 1 credit: model describes the image and
 *      we check it against the expected scene + safety + no-text rules.
 *
 * Returns a unified QcReport. Severity routing decision lives at the
 * orchestrator: all-pass → auto-eligible, any fail → block, any warn →
 * Jennifer's review queue.
 */

import { Type } from "@google/genai";
import { getClient, MODEL_ID, logUsage } from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";

export type QcSeverity = "pass" | "warn" | "fail";

export type QcCheck = {
  name: string;
  severity: QcSeverity;
  message: string;
};

export type QcReport = {
  overall: QcSeverity;
  checks: QcCheck[];
  /** Total credits the QC pass cost. */
  creditsUsed: number;
  /** ISO timestamp when QC ran. */
  ranAt: string;
};

function rollUp(checks: QcCheck[]): QcSeverity {
  if (checks.some((c) => c.severity === "fail")) return "fail";
  if (checks.some((c) => c.severity === "warn")) return "warn";
  return "pass";
}

// ───── Grade-level expectations ─────────────────────────────────────

const GRADE_TARGETS: Record<
  string,
  { lexileMin: number; lexileMax: number; wordsMin: number; wordsMax: number; gradeFleschMin: number; gradeFleschMax: number }
> = {
  K: { lexileMin: 0, lexileMax: 300, wordsMin: 30, wordsMax: 120, gradeFleschMin: -1, gradeFleschMax: 1.5 },
  "1st": { lexileMin: 100, lexileMax: 450, wordsMin: 50, wordsMax: 180, gradeFleschMin: 0, gradeFleschMax: 2.5 },
  "2nd": { lexileMin: 300, lexileMax: 600, wordsMin: 80, wordsMax: 250, gradeFleschMin: 1, gradeFleschMax: 3.5 },
  "3rd": { lexileMin: 500, lexileMax: 800, wordsMin: 120, wordsMax: 350, gradeFleschMin: 2, gradeFleschMax: 4.5 },
  "4th": { lexileMin: 700, lexileMax: 1000, wordsMin: 180, wordsMax: 500, gradeFleschMin: 3, gradeFleschMax: 5.5 },
};

// ───── Deterministic helpers ────────────────────────────────────────

const SYLLABLE_VOWELS = /[aeiouy]+/gi;
function syllableCount(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return 0;
  let s = (w.match(SYLLABLE_VOWELS) ?? []).length;
  if (w.endsWith("e") && s > 1) s -= 1;
  return Math.max(1, s);
}

function fleschKincaidGrade(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => /[a-z]/i.test(w));
  if (sentences.length === 0 || words.length === 0) return 0;
  const syllables = words.reduce((sum, w) => sum + syllableCount(w), 0);
  return (
    0.39 * (words.length / sentences.length) +
    11.8 * (syllables / words.length) -
    15.59
  );
}

const BANNED_WORDS = [
  // Profanity / insults — kid-product, zero tolerance.
  "damn", "hell", "shit", "fuck", "bitch", "ass", "crap",
  // Trademarked / problematic brand mentions to avoid free promotion.
  "kahoot", "newsela",
];

function containsBannedWord(text: string): string | null {
  const lower = " " + text.toLowerCase() + " ";
  for (const w of BANNED_WORDS) {
    if (lower.includes(" " + w + " ")) return w;
  }
  return null;
}

// ───── Passage QC ───────────────────────────────────────────────────

export async function qcPassage(input: {
  teacherId: string;
  passageTitle: string;
  passageBody: string;
  gradeLevel: string;
  isInformational?: boolean;
}): Promise<{ checks: QcCheck[]; creditsUsed: number }> {
  const checks: QcCheck[] = [];
  let creditsUsed = 0;

  const text = (input.passageTitle + " " + input.passageBody).trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const target = GRADE_TARGETS[input.gradeLevel] ?? GRADE_TARGETS["2nd"];
  const fk = fleschKincaidGrade(text);

  // Word count band
  if (wordCount < target.wordsMin) {
    checks.push({
      name: "passage.length",
      severity: "warn",
      message: `Passage is short for ${input.gradeLevel} (${wordCount} words; expected ${target.wordsMin}+)`,
    });
  } else if (wordCount > target.wordsMax) {
    checks.push({
      name: "passage.length",
      severity: "warn",
      message: `Passage is long for ${input.gradeLevel} (${wordCount} words; expected up to ${target.wordsMax})`,
    });
  } else {
    checks.push({
      name: "passage.length",
      severity: "pass",
      message: `${wordCount} words — in range for ${input.gradeLevel}`,
    });
  }

  // Flesch-Kincaid grade
  if (fk < target.gradeFleschMin) {
    checks.push({
      name: "passage.reading_level",
      severity: "warn",
      message: `Reads easier than ${input.gradeLevel} (Flesch-Kincaid grade ${fk.toFixed(1)})`,
    });
  } else if (fk > target.gradeFleschMax) {
    checks.push({
      name: "passage.reading_level",
      severity: "warn",
      message: `Reads harder than ${input.gradeLevel} (Flesch-Kincaid grade ${fk.toFixed(1)})`,
    });
  } else {
    checks.push({
      name: "passage.reading_level",
      severity: "pass",
      message: `Flesch-Kincaid grade ${fk.toFixed(1)} — appropriate for ${input.gradeLevel}`,
    });
  }

  // Banned words
  const banned = containsBannedWord(text);
  if (banned) {
    checks.push({
      name: "passage.banned_words",
      severity: "fail",
      message: `Contains banned word "${banned}"`,
    });
  } else {
    checks.push({
      name: "passage.banned_words",
      severity: "pass",
      message: "No banned vocabulary",
    });
  }

  // Markdown leakage (passages should be plain text — markdown often
  // means the model was told to be conversational and started using **)
  if (/\*\*|^#{1,6}\s/m.test(input.passageBody)) {
    checks.push({
      name: "passage.no_markdown",
      severity: "warn",
      message: "Passage contains markdown formatting — should be plain text",
    });
  } else {
    checks.push({
      name: "passage.no_markdown",
      severity: "pass",
      message: "Plain text — no stray markdown",
    });
  }

  // LLM judge
  const judge = await llmJudgePassage(input);
  if (judge) {
    checks.push(judge.check);
    creditsUsed += judge.creditsUsed;
  }

  return { checks, creditsUsed };
}

const PASSAGE_JUDGE_SYSTEM = `You are a senior K-4 reading specialist reviewing an AI-generated reading passage for use with elementary students.

You will return a single JSON object with: { severity: "pass" | "warn" | "fail", reason: string }.

Severity rules:
- pass: passage is coherent, age-appropriate, kid-safe, free of factual errors (if informational), and natural-sounding for the target grade.
- warn: minor issue worth flagging — awkward phrasing, slightly off-topic, mild factual ambiguity, abrupt ending. Still usable but Jennifer should glance at it.
- fail: blocking issue — factually wrong if informational, scary/inappropriate content, incoherent narrative, or grossly mismatched to the grade level.

Reason must be a single sentence. Be specific about WHAT is wrong, not just that something is.`;

const PASSAGE_JUDGE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    severity: { type: Type.STRING, enum: ["pass", "warn", "fail"] },
    reason: { type: Type.STRING },
  },
  required: ["severity", "reason"],
};

async function llmJudgePassage(input: {
  teacherId: string;
  passageTitle: string;
  passageBody: string;
  gradeLevel: string;
  isInformational?: boolean;
}): Promise<{ check: QcCheck; creditsUsed: number } | null> {
  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: `Grade level: ${input.gradeLevel}\nGenre: ${input.isInformational ? "informational" : "narrative"}\n\nTitle: ${input.passageTitle}\n\nPassage:\n${input.passageBody}`,
      config: {
        systemInstruction: PASSAGE_JUDGE_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: PASSAGE_JUDGE_SCHEMA,
        temperature: 0.2,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as {
      severity?: QcSeverity;
      reason?: string;
    };
    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: `qc.passage: ${input.passageTitle.slice(0, 80)}`,
    });
    return {
      check: {
        name: "passage.judge",
        severity: parsed.severity ?? "warn",
        message: parsed.reason ?? "(no reason returned)",
      },
      creditsUsed: CREDIT_COST.quiz_generation,
    };
  } catch (e: any) {
    trackError(e, { route: "qc.llmJudgePassage", userId: input.teacherId });
    return null;
  }
}

// ───── Question QC ──────────────────────────────────────────────────

type QuestionForQc =
  | {
      kind: "multiple_choice";
      prompt: string;
      choices: string[];
      correct: string;
      hint?: string | null;
    }
  | {
      kind: "true_false";
      prompt: string;
      correct: "True" | "False";
      hint?: string | null;
    };

export async function qcQuestion(input: {
  teacherId: string;
  passageBody: string | null;
  question: QuestionForQc;
  index: number;
}): Promise<{ checks: QcCheck[]; creditsUsed: number }> {
  const checks: QcCheck[] = [];
  let creditsUsed = 0;
  const tag = `q${input.index + 1}`;

  // Deterministic
  if (input.question.kind === "multiple_choice") {
    const q = input.question;
    if (!q.choices.includes(q.correct)) {
      checks.push({
        name: `${tag}.correct_present`,
        severity: "fail",
        message: "Correct answer doesn't match any choice verbatim",
      });
    } else {
      checks.push({
        name: `${tag}.correct_present`,
        severity: "pass",
        message: "Correct answer matches a choice exactly",
      });
    }
    if (new Set(q.choices.map((c) => c.toLowerCase().trim())).size !== q.choices.length) {
      checks.push({
        name: `${tag}.unique_choices`,
        severity: "fail",
        message: "Choices contain duplicates",
      });
    }
    if (/\b(all|none) of the above\b/i.test(q.choices.join(" "))) {
      checks.push({
        name: `${tag}.no_trick_choices`,
        severity: "fail",
        message: '"All / none of the above" is banned',
      });
    }
  }

  if (input.question.prompt.length > 350) {
    checks.push({
      name: `${tag}.prompt_length`,
      severity: "warn",
      message: `Prompt is long (${input.question.prompt.length} chars; recommend < 350)`,
    });
  }

  const banned = containsBannedWord(input.question.prompt);
  if (banned) {
    checks.push({
      name: `${tag}.banned_words`,
      severity: "fail",
      message: `Question contains banned word "${banned}"`,
    });
  }

  // LLM judge — only if a passage exists to ground the answer.
  if (input.passageBody && input.passageBody.length > 50) {
    const judge = await llmJudgeQuestion(
      input.teacherId,
      input.passageBody,
      input.question,
      tag,
    );
    if (judge) {
      checks.push(judge.check);
      creditsUsed += judge.creditsUsed;
    }
  }

  return { checks, creditsUsed };
}

const QUESTION_JUDGE_SYSTEM = `You are a senior K-4 reading specialist reviewing an AI-generated comprehension question.

You will return a single JSON object: { severity: "pass" | "warn" | "fail", reason: string }.

Check ALL of:
1. Is the correct answer literally supported by the passage? (FAIL if not — most important rule.)
2. For multiple choice: are the distractors plausible but unambiguously wrong? (WARN if a distractor is also defensible.)
3. Is the question prompt clear and answerable without re-reading the entire passage three times?
4. If a hint is provided, does it help a struggling reader without giving away the answer?

Reason must be a single sentence. Be concrete about which rule failed.`;

async function llmJudgeQuestion(
  teacherId: string,
  passage: string,
  question: QuestionForQc,
  tag: string,
): Promise<{ check: QcCheck; creditsUsed: number } | null> {
  try {
    const client = getClient();
    const qBlock =
      question.kind === "multiple_choice"
        ? `Question: ${question.prompt}\nChoices:\n- ${question.choices.join("\n- ")}\nCorrect: ${question.correct}\nHint: ${question.hint ?? "(none)"}`
        : `Question (true/false): ${question.prompt}\nCorrect: ${question.correct}\nHint: ${question.hint ?? "(none)"}`;
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: `Passage:\n${passage.slice(0, 1800)}\n\n${qBlock}`,
      config: {
        systemInstruction: QUESTION_JUDGE_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: PASSAGE_JUDGE_SCHEMA,
        temperature: 0.1,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as {
      severity?: QcSeverity;
      reason?: string;
    };
    await logUsage({
      teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: `qc.question[${tag}]: ${question.prompt.slice(0, 80)}`,
    });
    return {
      check: {
        name: `${tag}.judge`,
        severity: parsed.severity ?? "warn",
        message: parsed.reason ?? "(no reason returned)",
      },
      creditsUsed: CREDIT_COST.quiz_generation,
    };
  } catch (e: any) {
    trackError(e, { route: "qc.llmJudgeQuestion", userId: teacherId });
    return null;
  }
}

// ───── Image QC ─────────────────────────────────────────────────────

const IMAGE_JUDGE_SYSTEM = `You are reviewing an AI-generated children's educational illustration.

Return a single JSON object: { severity: "pass" | "warn" | "fail", reason: string }.

Check ALL of:
1. Does the image plausibly match the expected scene description? (FAIL if it shows a totally different subject; WARN if details drift.)
2. Is it kid-safe and school-appropriate? (FAIL on any weapon, blood, scary creature, romantic content.)
3. Does it contain readable text or watermarks? (FAIL — passage images must have no text.)
4. Is the style consistent (bright 2D cartoon, clean outlines)? (WARN if photorealistic or muddy.)

Reason must be a single sentence.`;

export async function qcImage(input: {
  teacherId: string;
  imageUrl: string;
  expectedScene: string;
}): Promise<{ checks: QcCheck[]; creditsUsed: number }> {
  const checks: QcCheck[] = [];
  let creditsUsed = 0;

  // Fetch image bytes for the vision model.
  let base64: string | null = null;
  let mimeType = "image/png";
  try {
    const r = await fetch(input.imageUrl);
    if (!r.ok) {
      checks.push({
        name: "image.fetch",
        severity: "fail",
        message: `Image URL returned ${r.status}`,
      });
      return { checks, creditsUsed };
    }
    mimeType = r.headers.get("content-type") ?? "image/png";
    const buf = Buffer.from(await r.arrayBuffer());
    base64 = buf.toString("base64");
  } catch (e: any) {
    checks.push({
      name: "image.fetch",
      severity: "fail",
      message: `Could not fetch image: ${e.message}`,
    });
    return { checks, creditsUsed };
  }

  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: [
        {
          role: "user",
          parts: [
            { text: `Expected scene: ${input.expectedScene}` },
            { inlineData: { data: base64, mimeType } },
          ],
        },
      ],
      config: {
        systemInstruction: IMAGE_JUDGE_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: PASSAGE_JUDGE_SCHEMA,
        temperature: 0.2,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as {
      severity?: QcSeverity;
      reason?: string;
    };
    await logUsage({
      teacherId: input.teacherId,
      kind: "image_generation", // QC of an image is image-tier work
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: `qc.image: ${input.expectedScene.slice(0, 80)}`,
    });
    checks.push({
      name: "image.judge",
      severity: parsed.severity ?? "warn",
      message: parsed.reason ?? "(no reason returned)",
    });
    creditsUsed += CREDIT_COST.quiz_generation;
  } catch (e: any) {
    trackError(e, { route: "qc.qcImage", userId: input.teacherId });
    checks.push({
      name: "image.judge",
      severity: "warn",
      message: `Couldn't run vision check: ${e.message}`,
    });
  }

  return { checks, creditsUsed };
}

// ───── Whole-quiz orchestration ────────────────────────────────────

export async function runFullQuizQc(input: {
  teacherId: string;
  passageTitle: string | null;
  passageBody: string | null;
  gradeLevel: string;
  questions: QuestionForQc[];
  imageUrl: string | null;
  imageScene: string | null;
}): Promise<QcReport> {
  const checks: QcCheck[] = [];
  let creditsUsed = 0;

  if (input.passageBody && input.passageTitle) {
    const r = await qcPassage({
      teacherId: input.teacherId,
      passageTitle: input.passageTitle,
      passageBody: input.passageBody,
      gradeLevel: input.gradeLevel,
    });
    checks.push(...r.checks);
    creditsUsed += r.creditsUsed;
  }

  for (let i = 0; i < input.questions.length; i++) {
    const r = await qcQuestion({
      teacherId: input.teacherId,
      passageBody: input.passageBody,
      question: input.questions[i],
      index: i,
    });
    checks.push(...r.checks);
    creditsUsed += r.creditsUsed;
  }

  if (input.imageUrl && input.imageScene) {
    const r = await qcImage({
      teacherId: input.teacherId,
      imageUrl: input.imageUrl,
      expectedScene: input.imageScene,
    });
    checks.push(...r.checks);
    creditsUsed += r.creditsUsed;
  }

  return {
    overall: rollUp(checks),
    checks,
    creditsUsed,
    ranAt: new Date().toISOString(),
  };
}
