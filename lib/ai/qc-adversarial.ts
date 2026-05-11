/**
 * Adversarial QC judge.
 *
 * The primary judges in lib/ai/qc.ts and lib/ai/qc-media.ts are
 * pass-biased — a single Gemini Flash call with a "be skeptical" hint
 * still leans toward approval (the well-documented LLM sycophancy
 * problem, plus same-model-judging-same-model bias). They miss whole
 * classes of failure the way a friendly proofreader does — they're
 * looking to confirm the piece works.
 *
 * This second judge runs alongside the primary and is prompted to be
 * HOSTILE. Its only job is to find what's wrong. If the primary
 * says pass but adversarial finds a real fault, the piece downgrades.
 * If both pass, we have higher confidence the piece is actually clean.
 *
 * Cost: ~$0.003 per piece (one extra Gemini Flash call). Cheap
 * insurance against sycophancy blindness.
 *
 * Severity merge rule (applied by the caller):
 *   primary pass + adversarial pass  → pass
 *   primary pass + adversarial warn  → warn
 *   primary pass + adversarial fail  → fail
 *   primary warn + adversarial pass  → warn (primary wins on its own findings)
 *   either fail                       → fail
 */

import { Type } from "@google/genai";
import { getClient, MODEL_ID } from "@/lib/ai/readee-ai";
import { trackError } from "@/lib/observability/track";

export type AdversarialVerdict = "pass" | "warn" | "fail";

export type AdversarialResult = {
  verdict: AdversarialVerdict;
  reason: string;
};

const ADVERSARIAL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    severity: { type: Type.STRING, enum: ["pass", "warn", "fail"] },
    reason: { type: Type.STRING },
  },
  required: ["severity", "reason"],
};

const ADVERSARIAL_SYSTEM = `You are a HOSTILE reviewer auditing AI-generated educational content for K-4 kids. Your job is to find what's wrong, not to praise what's right.

Be uncharitable. Be suspicious. Look for:
- Subtle factual errors (dates off by a year, wrong attribution, oversimplifications that mislead)
- Cultural bias (assumes one kid's background; uses idioms that exclude)
- Pedagogical thinness (passage teaches nothing concrete; questions test trivia not understanding)
- Topic drift (passage opens about X then shifts to Y)
- Distractor patterns in MCQs (answer is always the longest, or only one with a period, etc.)
- Misleading framing (winners-of-history narratives, dated/sexist/ageist patterns)
- Reading-level vs concept-level mismatch (short sentences with abstract ideas inappropriate for grade)
- Anything a thoughtful parent would call "this isn't great"

Return a single JSON object: { severity: "pass" | "warn" | "fail", reason: string }.

Severity rule:
- "pass" — you genuinely could not find anything to criticize. Use sparingly.
- "warn" — minor issue, not blocking but worth flagging. Most pieces should land here if you're doing your job.
- "fail" — concrete problem that would embarrass us if a paying parent saw it. A specific contradiction, a misleading claim, a culturally tone-deaf framing, a distractor pattern that hands kids the answer.

Reason MUST name the specific issue in one sentence. Don't summarize the piece; tell us the problem. If you said "pass," briefly justify what you checked.`;

export async function runAdversarialJudge(input: {
  /** Free-form material — passage + questions + image-scene description.
   *  The caller assembles this; we don't care about the shape. */
  payload: string;
  /** Tag like "discovery-article" or "daily-readee" — appears in
   *  logs, doesn't affect the prompt. */
  surface: string;
}): Promise<{ ok: true; result: AdversarialResult } | { ok: false; error: string }> {
  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: input.payload.slice(0, 8000),
      config: {
        systemInstruction: ADVERSARIAL_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: ADVERSARIAL_SCHEMA,
        temperature: 0.4,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as {
      severity?: AdversarialVerdict;
      reason?: string;
    };
    return {
      ok: true,
      result: {
        verdict: parsed.severity ?? "warn",
        reason: (parsed.reason ?? "").trim() || "(no reason returned)",
      },
    };
  } catch (e: any) {
    trackError(e, { route: "qc.adversarial", extra: { surface: input.surface } });
    return { ok: false, error: e?.message ?? "Adversarial judge failed." };
  }
}

/**
 * Build the adversarial payload for a daily Readee / discovery
 * article / leveled passage. Same shape across surfaces so the
 * adversarial judge prompt stays consistent.
 */
export function buildAdversarialPayload(input: {
  title: string;
  body: string;
  imageScene?: string | null;
  questions: Array<{ prompt: string; choices: string[]; correct: string }>;
}): string {
  const qBlock = input.questions
    .map(
      (q, i) =>
        `Q${i + 1}: ${q.prompt}\n  Choices: ${q.choices.join(" | ")}\n  Correct: ${q.correct}`,
    )
    .join("\n\n");
  return [
    `TITLE: ${input.title}`,
    ``,
    `PASSAGE:`,
    input.body,
    ``,
    input.imageScene ? `IMAGE BRIEF: ${input.imageScene}` : "",
    ``,
    `QUESTIONS:`,
    qBlock,
    ``,
    `Audit everything above as a hostile reviewer. Return the JSON object.`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Merge primary + adversarial verdicts using the severity table from
 * the file header. Returns the worse of the two; ties go to primary.
 */
export function mergeWithAdversarial(
  primary: AdversarialVerdict,
  adversarial: AdversarialVerdict,
): AdversarialVerdict {
  const sev = (s: AdversarialVerdict): number =>
    s === "fail" ? 2 : s === "warn" ? 1 : 0;
  return sev(primary) >= sev(adversarial) ? primary : adversarial;
}
