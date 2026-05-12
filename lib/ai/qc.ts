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

export function containsBannedWord(text: string): string | null {
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

  // Flesch-Kincaid grade. Tiered severity by mission:
  //  - Above max by ≤1.5 → warn (mild — kid will need scaffolding)
  //  - Above max by >1.5 → fail (passage is unreadable to target kid;
  //    May 6 2026 shipped a 4.7 FK to a 2nd-grade target — exactly
  //    the class of failure that defeats the whole product)
  //  - Below min by ≤1.5 → warn (easier-than-target is less harmful
  //    for confidence-building but still off-spec)
  //  - Below min by >1.5 → warn (still not fail — we'd rather a kid
  //    breeze through than not finish at all)
  const HARD_DRIFT = 1.5;
  if (fk < target.gradeFleschMin) {
    checks.push({
      name: "passage.reading_level",
      severity: "warn",
      message: `Reads easier than ${input.gradeLevel} (Flesch-Kincaid grade ${fk.toFixed(1)})`,
    });
  } else if (fk > target.gradeFleschMax + HARD_DRIFT) {
    checks.push({
      name: "passage.reading_level",
      severity: "fail",
      message: `Reads much harder than ${input.gradeLevel} (Flesch-Kincaid grade ${fk.toFixed(1)}, max for grade is ${target.gradeFleschMax}). Kid can't read this — rewrite required.`,
    });
  } else if (fk > target.gradeFleschMax) {
    checks.push({
      name: "passage.reading_level",
      severity: "warn",
      message: `Reads slightly harder than ${input.gradeLevel} (Flesch-Kincaid grade ${fk.toFixed(1)})`,
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

  // Self-leakage check: the answer is leaked in the QUESTION portion
  // of the prompt (not the embedded passage, where it's expected to
  // be by design — comprehension questions DO have answers in the
  // passage).
  //
  // Two real leak patterns we catch:
  //   1. Highlighted-target pattern: prompt highlights a word with
  //      ** or quotes AND asks "how is it spelled / what letters".
  //   2. Question portion (after the last \n\n) literally contains
  //      the correct answer — no passage to hide behind.
  if (input.question.kind === "multiple_choice") {
    const q = input.question;
    const parts = q.prompt.split("\n\n");
    const questionPart = parts[parts.length - 1];
    const questionStripped = questionPart
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase()
      .trim();
    const answerStripped = q.correct.toLowerCase().replace(/\s+/g, " ").trim();
    const answerCompact = answerStripped.replace(/\s+/g, "");
    // Phonics MCQs intentionally show the target word and ask about
    // a letter / sound: "Tap the letter that says /b/ in 'bat'" with
    // correct = "b". The single letter "b" appears in "bat" — but
    // that's the question, not a leak. Skip the substring check for
    // single-letter answers when the prompt is clearly phonics-shaped.
    const isPhonicsContext =
      /\b(letter|letters|sound|sounds|phoneme|spell|spells)\b/i.test(questionPart);
    const isSingleLetterAnswer = answerStripped.length === 1;
    const leakedWord =
      answerStripped.length >= 2 &&
      questionStripped.includes(answerStripped) &&
      !(isPhonicsContext && isSingleLetterAnswer);
    const leakedLetters =
      answerCompact.length >= 3 &&
      /\b[a-z](?:[\s\-][a-z])+\b/.test(q.correct.toLowerCase()) &&
      questionStripped.includes(answerCompact);
    const promptHighlightsTarget =
      /["**'](.{1,30})["**']/.test(q.prompt) &&
      /how (is|do you) (it )?spell|how is it spelled|what letters/i.test(q.prompt);
    if (leakedWord || leakedLetters || promptHighlightsTarget) {
      checks.push({
        name: `${tag}.no_self_leak`,
        severity: "fail",
        message: promptHighlightsTarget
          ? "Prompt highlights the target word AND asks how it's spelled — the answer is given in the question."
          : `Question portion literally contains the correct answer ("${q.correct}").`,
      });
    } else {
      checks.push({
        name: `${tag}.no_self_leak`,
        severity: "pass",
        message: "Question portion does not leak the answer.",
      });
    }
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

const IMAGE_JUDGE_SYSTEM = `You are reviewing an AI-generated children's educational illustration. Your job is to catch defects BEFORE a parent or kid sees the image. Be skeptical, not generous.

Return a single JSON object: { severity: "pass" | "warn" | "fail", reason: string }.

Check ALL of these in order. Stop at the FIRST issue you spot:

1. ANATOMY — look at every person, animal, or character carefully:
   • Faces: every face must have two eyes, a nose, and a mouth. FAIL if eyes are missing, melted, or one is mid-forehead. FAIL if the mouth is sealed shut on a smiling figure or has extra teeth/no teeth where teeth should be.
   • Hands: count fingers on every visible hand. FAIL on 6+ fingers, 3 or fewer fingers, fused fingers, hands that look like flippers, or hands attached at wrong angles.
   • Bodies: limbs must be proportional. FAIL on extra limbs, missing limbs, or limbs that bend impossibly. FAIL on a head that's not connected to the body or floats.
   • Animals: same rules — count legs, check faces.

2. TEXT — does the image contain ANY readable letters, numbers, words, signs, or watermarks? FAIL — passage images must be text-free. (One exception: a single number on a clock face or a jersey if it's relevant to the scene; describe in the reason.)

3. SCENE FIDELITY — does the image show what the expected-scene description requested?
   • FAIL if the subject is TOTALLY UNRELATED (asked for a runner, got a fish; asked for a bunny eating an acorn, got a city skyline).
   • FAIL if the image shows a RECOGNIZABLE real person who is NOT the figure the passage is about. A passage about Thomas Edison illustrated with a portrait that anyone literate in US history would recognize as Harriet Tubman, Abraham Lincoln, MLK, etc., is a FAIL — kids will be confused about who they're reading about. This is much worse than a generic stand-in.
   • WARN if the image is THEMATICALLY ALIGNED but not the exact subject (asked for "Roger Bannister running a 4-minute mile", got a generic runner crossing a finish line at a 1950s track meet — the theme is right, the specific person isn't). AI image generators can't reliably render specific named historical figures or copyrighted characters; thematic stand-ins are an OK trade-off as long as the scene is on-topic AND the depicted person isn't a recognizable DIFFERENT real figure.
   • WARN if minor details drift (jersey color wrong, background a beach instead of a track) but the subject is right.

4. SAFETY — kid-safe and school-appropriate?
   • FAIL on weapons, blood, scary monsters, romantic/sexual content, drugs, alcohol, profanity in any visible text.

5. STYLE — bright 2D cartoon, bold outlines, vibrant colors?
   • WARN if photorealistic, muddy, washed out, or inconsistent line weight.

Severity rule:
   • Any anatomy issue (#1) → FAIL.
   • Any text or signage (#2) → FAIL.
   • Totally unrelated subject (#3) → FAIL.
   • Thematic stand-in for a specific named person/character (#3) → WARN.
   • Other drifting details (#3) → WARN.
   • Style only → WARN.
   • All clean → PASS.

Reason must be a single specific sentence — name the body part / location / what's wrong.`;

export async function qcImage(input: {
  teacherId: string;
  imageUrl: string;
  expectedScene: string;
  /** The passage the image accompanies. When present the judge gets
   *  to cross-check "image identity matches passage topic" — catches
   *  the Edison/Tubman class directly. Optional for backward compat. */
  passageBody?: string | null;
  /** Passage title — used by the Wikipedia portrait compare to
   *  resolve which figure (if any) the passage names. */
  passageTitle?: string | null;
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
    const passageBlock = input.passageBody
      ? `\n\nThe passage this image accompanies (use to cross-check identity + topic):\n"""\n${input.passageBody.slice(0, 1200)}\n"""`
      : "";
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: [
        {
          role: "user",
          parts: [
            { text: `Expected scene: ${input.expectedScene}${passageBlock}` },
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

    // Wikipedia portrait compare. If the passage names a real
    // figure with a Wikipedia article, fetch their portrait and ask
    // the vision model directly: "are these the same person?" This
    // is the visual proof layer behind the prompt-reasoning layer
    // above. Catches the Edison/Tubman class with side-by-side
    // evidence even if the prompt judge gets fooled.
    if (input.passageBody && input.passageTitle) {
      try {
        const { resolveHistoricalImage } = await import(
          "./historical-artifacts"
        );
        const { comparePortraitToImage } = await import("./qc-media");
        // resolveHistoricalImage runs detectHistoricalFigure +
        // anti-hallucination token check + Wikipedia portrait fetch
        // in one call. When kind='royalty_free', we have a verified
        // reference portrait URL for the figure named in the passage.
        const resolved = await resolveHistoricalImage(
          input.passageTitle,
          input.passageBody,
        );
        if (resolved.kind === "royalty_free" && resolved.imageUrl) {
          const cmp = await comparePortraitToImage({
            referenceUrl: resolved.imageUrl,
            candidateUrl: input.imageUrl,
            figureName: resolved.figureName,
          });
          if (cmp.ok) {
            checks.push({
              name: "image.portrait_match",
              severity: cmp.severity,
              message: `vs Wikipedia portrait of ${resolved.figureName}: ${cmp.reason}`,
            });
            creditsUsed += CREDIT_COST.quiz_generation;
          }
        }
      } catch (e: any) {
        // Don't block on this — log and continue.
        trackError(e, { route: "qc.image.portraitCompare" });
      }
    }
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

// ───── Fact-check (non-fiction grounding) ──────────────────────────

const FACT_CHECK_SYSTEM = `You are a fact-checker comparing an AI-generated children's reading passage against an authoritative source (a Wikipedia article summary).

You will return a single JSON object: { severity: "pass" | "warn" | "fail", reason: string }.

Your job: identify factual contradictions between the passage's claims and the source. Be specific.

- pass: every concrete claim in the passage (dates, places, relationships, events, roles) is supported by or consistent with the source. The passage may compress, simplify, or omit, but it doesn't invent or contradict.
- warn: minor ambiguity or oversimplification that could mislead a child but isn't a flat contradiction (e.g., "he invented the lightbulb" — Edison improved an existing design; an 8-year-old can grasp the simpler claim without it being "wrong").
- fail: at least one direct factual contradiction (wrong date, wrong country, wrong relationship, fabricated event/quote). A kid would walk away believing something false.

Reason must name the specific contradiction in one sentence, OR confirm what was checked if no issue.`;

const FACT_CHECK_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    severity: { type: Type.STRING, enum: ["pass", "warn", "fail"] },
    reason: { type: Type.STRING },
  },
  required: ["severity", "reason"],
};

/**
 * Fact-check a non-fiction passage against Wikipedia. Detects named
 * figures via the existing detectHistoricalFigure (free if the image
 * pipeline already ran), pulls the Wikipedia summary, and asks the
 * model to compare claims. Skips silently when no named figure is
 * present or Wikipedia has no article — fact-checking against the
 * model's own training data is circular and gives false confidence.
 *
 * Why this exists: Gemini Flash will confidently state wrong dates,
 * places, or relationships for lesser-known figures. Pre-this check
 * we shipped passage.judge='pass' on a passage that put George
 * Washington at the wrong battle — the judge wasn't grounded.
 */
export async function qcFactCheck(input: {
  teacherId: string;
  passageTitle: string;
  passageBody: string;
}): Promise<{ checks: QcCheck[]; creditsUsed: number }> {
  const checks: QcCheck[] = [];
  let creditsUsed = 0;
  try {
    const { detectHistoricalFigure, fetchWikipediaSummary } = await import(
      "./historical-artifacts"
    );
    const figure = await detectHistoricalFigure(
      input.passageTitle,
      input.passageBody,
    );
    if (!figure?.name) {
      // No named figure — fiction or topic-only passage. Skip
      // silently (not warn — fiction doesn't need a fact check).
      return { checks, creditsUsed };
    }
    const summary = await fetchWikipediaSummary(figure.name);
    if (!summary) {
      checks.push({
        name: "passage.fact_check",
        severity: "warn",
        message: `No Wikipedia article found for "${figure.name}" — could not ground passage claims against an authoritative source.`,
      });
      return { checks, creditsUsed };
    }
    const client = getClient();
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: `Named figure: ${figure.name}\n\nSource (Wikipedia summary):\n"""\n${summary.slice(0, 2400)}\n"""\n\nPassage to fact-check:\n"""\n${input.passageBody.slice(0, 1800)}\n"""\n\nReturn the JSON object.`,
      config: {
        systemInstruction: FACT_CHECK_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: FACT_CHECK_SCHEMA,
        temperature: 0.0,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as {
      severity?: QcSeverity;
      reason?: string;
    };
    creditsUsed += CREDIT_COST.quiz_generation;
    checks.push({
      name: "passage.fact_check",
      severity: parsed.severity ?? "warn",
      message: parsed.reason ?? "(no reason returned)",
    });
  } catch (e: any) {
    trackError(e, { route: "qc.qcFactCheck" });
    checks.push({
      name: "passage.fact_check",
      severity: "warn",
      message: `Fact-check error: ${e.message}`,
    });
  }
  return { checks, creditsUsed };
}

// ───── Learning-objective (MCQs assess the passage's teaching) ────

const LEARNING_OBJECTIVE_SYSTEM = `You are a senior K-4 reading specialist evaluating whether a passage and its comprehension questions form a coherent learning experience.

You will return a single JSON object: { severity: "pass" | "warn" | "fail", reason: string }.

The contract: a passage should teach ONE concrete thing (a fact, a concept, a story arc). The questions should COLLECTIVELY assess whether the kid understood that thing — not just whether they can copy-paste words from the passage.

- pass: the passage has a clear teachable point AND at least 2 of the 3 questions probe understanding of that point (cause/effect, main idea, vocabulary in context, why something matters). Questions distributed across literal/inferential is ideal.
- warn: passage has a clear point but the questions are heavy on pure recall ("what color was the bird") with little assessment of comprehension. Still usable but pedagogically thin.
- fail: passage has no clear teachable point (a list of disconnected facts, or a rambling narrative), OR the questions test something the passage doesn't actually cover, OR every question is trivial recall of a single sentence. Kid finishes the piece without having LEARNED anything assessable.

Reason must name the teachable point you identified AND comment on whether the questions assess it.`;

const LEARNING_OBJECTIVE_SCHEMA = FACT_CHECK_SCHEMA;

/**
 * Learning-objective check. Reads passage + 3 MCQs and asks: does
 * this piece TEACH something, and do the questions ASSESS that
 * something? Catches the failure mode where Gemini writes a coherent
 * passage and 3 grammatically-correct MCQs that all happen to be
 * trivial recall — kid "passes" without learning anything.
 *
 * Mission-critical for the daily Readee and discovery articles: every
 * piece ships under the banner "Unlock Reading with Readee", so every
 * piece needs to actually unlock something.
 */
export async function qcLearningObjective(input: {
  teacherId: string;
  passageTitle: string;
  passageBody: string;
  questions: QuestionForQc[];
}): Promise<{ checks: QcCheck[]; creditsUsed: number }> {
  const checks: QcCheck[] = [];
  let creditsUsed = 0;
  if (input.questions.length === 0) {
    return { checks, creditsUsed };
  }
  try {
    const client = getClient();
    const qBlock = input.questions
      .map((q, i) => {
        const choicesLine =
          q.kind === "multiple_choice"
            ? `\n  Choices: ${q.choices.join(" | ")}`
            : `\n  Type: True/False`;
        return `Q${i + 1}: ${q.prompt}${choicesLine}\n  Correct: ${q.correct}`;
      })
      .join("\n\n");
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: `Title: ${input.passageTitle}\n\nPassage:\n"""\n${input.passageBody.slice(0, 1800)}\n"""\n\nQuestions:\n${qBlock}\n\nReturn the JSON object.`,
      config: {
        systemInstruction: LEARNING_OBJECTIVE_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: LEARNING_OBJECTIVE_SCHEMA,
        temperature: 0.0,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as {
      severity?: QcSeverity;
      reason?: string;
    };
    creditsUsed += CREDIT_COST.quiz_generation;
    checks.push({
      name: "lesson.learning_objective",
      severity: parsed.severity ?? "warn",
      message: parsed.reason ?? "(no reason returned)",
    });
  } catch (e: any) {
    trackError(e, { route: "qc.qcLearningObjective" });
    checks.push({
      name: "lesson.learning_objective",
      severity: "warn",
      message: `Learning-objective check error: ${e.message}`,
    });
  }
  return { checks, creditsUsed };
}

// ───── Audio QC ────────────────────────────────────────────────────

/**
 * Audio QC for daily passages. Runs the audio judge against the TTS
 * output to catch garbled reads, wrong text, cut-off audio, etc.
 * Pre-May 10 we shipped TTS entirely blind — kid-facing audio could
 * be malformed for days before someone listened.
 */
export async function qcAudio(input: {
  audioUrl: string;
  expectedText: string;
}): Promise<{ checks: QcCheck[]; creditsUsed: number }> {
  const checks: QcCheck[] = [];
  let creditsUsed = 0;
  try {
    const { judgeAudioFile } = await import("./qc-media");
    const j = await judgeAudioFile({
      audioUrl: input.audioUrl,
      expectedText: input.expectedText,
    });
    if (!j.ok) {
      checks.push({
        name: "audio.judge",
        severity: "warn",
        message: `Couldn't run audio check: ${j.error}`,
      });
      return { checks, creditsUsed };
    }
    checks.push({
      name: "audio.judge",
      severity: j.severity,
      message: j.reason || "(no reason returned)",
    });
    creditsUsed += CREDIT_COST.quiz_generation;
  } catch (e: any) {
    trackError(e, { route: "qc.qcAudio" });
    checks.push({
      name: "audio.judge",
      severity: "warn",
      message: `Audio judge error: ${e.message}`,
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
  /** Optional audio URL — when present, runs the audio judge against
   *  the passage text so we don't ship garbled TTS to kids who
   *  depend on it (early readers, ELLs, low-vision).  */
  audioUrl?: string | null;
  /** Optional SceneSpec — when present, runs the structured per-
   *  character image judge (qc-scene.ts) alongside the legacy
   *  prompt-vs-image judge. Caller decides whether to provide it.
   *  Typed loosely as `any` here to avoid a module import cycle
   *  between qc.ts and scene-spec.ts; runtime contract is the
   *  SceneSpec exported from lib/ai/scene-spec.ts. */
  sceneSpec?: any;
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

    // Fact-check non-fiction passages with named figures against
    // Wikipedia. Skips silently for fiction / no-figure passages.
    const fc = await qcFactCheck({
      teacherId: input.teacherId,
      passageTitle: input.passageTitle,
      passageBody: input.passageBody,
    });
    checks.push(...fc.checks);
    creditsUsed += fc.creditsUsed;
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
      passageBody: input.passageBody,
      passageTitle: input.passageTitle,
    });
    checks.push(...r.checks);
    creditsUsed += r.creditsUsed;

    // Layer the structured per-character judge on top whenever a
    // SceneSpec was supplied. The legacy qcImage above grades prose
    // against image; this one grades atomic yes/no per named species
    // + setting. They're independent — disagreement between them is
    // a useful signal we surface in the report rather than collapse.
    if (input.sceneSpec) {
      try {
        const { qcImageStructured } = await import("./qc-scene");
        const sr = await qcImageStructured({
          teacherId: input.teacherId,
          imageUrl: input.imageUrl,
          spec: input.sceneSpec,
        });
        checks.push(...sr.checks);
        creditsUsed += sr.creditsUsed;
      } catch (e: any) {
        trackError(e, {
          route: "qc.runFullQuizQc.structuredImage",
          userId: input.teacherId,
        });
      }
    }
  }

  if (input.audioUrl && input.passageBody) {
    const r = await qcAudio({
      audioUrl: input.audioUrl,
      expectedText: input.passageBody,
    });
    checks.push(...r.checks);
    creditsUsed += r.creditsUsed;
  }

  // Learning-objective: does this piece TEACH something + do the
  // MCQs ASSESS that something? Catches the "coherent passage, valid
  // MCQs, but pure trivial recall" failure mode.
  if (input.passageBody && input.passageTitle && input.questions.length > 0) {
    const lo = await qcLearningObjective({
      teacherId: input.teacherId,
      passageTitle: input.passageTitle,
      passageBody: input.passageBody,
      questions: input.questions,
    });
    checks.push(...lo.checks);
    creditsUsed += lo.creditsUsed;
  }

  // Adversarial second judge — catches what the pass-biased primary
  // judges miss. Runs last so it sees the same material the kid will.
  // Verdict folds into the merged report as the meta.adversarial
  // check; a fail here is a fail overall via rollUp.
  if (input.passageBody && input.passageTitle && input.questions.length > 0) {
    try {
      const { runAdversarialJudge, buildAdversarialPayload } = await import(
        "./qc-adversarial"
      );
      const payload = buildAdversarialPayload({
        title: input.passageTitle,
        body: input.passageBody,
        imageScene: input.imageScene,
        questions: input.questions
          .filter((q) => q.kind === "multiple_choice")
          .map((q) => ({
            prompt: q.prompt,
            choices: (q as any).choices ?? [],
            correct: String(q.correct ?? ""),
          })),
      });
      const adv = await runAdversarialJudge({
        payload,
        surface: "runFullQuizQc",
      });
      if (adv.ok) {
        checks.push({
          name: "meta.adversarial",
          severity: adv.result.verdict,
          message: adv.result.reason,
        });
        creditsUsed += CREDIT_COST.quiz_generation;
      } else {
        checks.push({
          name: "meta.adversarial",
          severity: "warn",
          message: `Adversarial judge errored: ${adv.error}`,
        });
      }
    } catch (e: any) {
      trackError(e, { route: "qc.adversarial.wire" });
      checks.push({
        name: "meta.adversarial",
        severity: "warn",
        message: `Adversarial judge wire error: ${e.message}`,
      });
    }
  }

  return {
    overall: rollUp(checks),
    checks,
    creditsUsed,
    ranAt: new Date().toISOString(),
  };
}
