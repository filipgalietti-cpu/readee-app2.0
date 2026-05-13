/**
 * Multi-judge committee for soft QC checks (Phase 2 of the
 * no-human-review gameplan).
 *
 * Why this exists: today's audit pass surfaced ~17 false-positive
 * slide.judge / q.should_be_asked findings because a single judge
 * (Gemini 2.5 Flash) had one wrong interpretation of a standard and
 * applied it consistently. With two different model providers judging
 * the same content + the CCSS calibration anchor in the prompt, both
 * have to be wrong in the same way for a false positive to ship.
 *
 * Contract per CONTENT_SPEC §5.2:
 *   - 2+ different models judge the same content.
 *   - Both must agree on `pass` for the content to publish.
 *   - Agreement on `warn` → publish-but-flagged.
 *   - Both `fail` → quarantine.
 *   - Disagreement → `warn` (conservative bias: when judges disagree,
 *     err on the side of flagging for review).
 *
 * Cost note: doubling judge calls roughly doubles audit AI spend.
 * Today's audit cost is ~$0.002 per question × ~1,000 questions =
 * ~$2/night. With committee = ~$4/night. Negligible at our volume.
 */

import { generateText, type TextProvider } from "./llm";

export type CommitteeVerdict = "pass" | "warn" | "fail";

export type JudgeRun<TVerdict extends string> = {
  ok: boolean;
  provider: TextProvider;
  model: string;
  verdict: TVerdict | null;
  severity: CommitteeVerdict | null;
  reason: string;
  error?: string;
};

export type CommitteeResult<TVerdict extends string> = {
  /** Final committee severity after consensus rules. */
  severity: CommitteeVerdict;
  /** Combined reason (each judge's reason on its own line). */
  reason: string;
  /** Did the judges agree on the same verdict? */
  agreement: "unanimous" | "split";
  /** Per-judge breakdown for audit-trail logging. */
  runs: JudgeRun<TVerdict>[];
};

export type JudgeSpec<TVerdict extends string> = {
  provider: TextProvider;
  model: string;
  /** Optional override for max output tokens. */
  maxTokens?: number;
};

/**
 * Run a single judge: call the LLM, parse JSON, map verdict → severity.
 * Returns a JudgeRun describing what happened (success or error).
 */
async function runOneJudge<TVerdict extends string>(
  spec: JudgeSpec<TVerdict>,
  systemPrompt: string,
  userPrompt: string,
  parse: (raw: string) => { verdict: TVerdict | null; reason: string },
  verdictToSeverity: (v: TVerdict) => CommitteeVerdict,
): Promise<JudgeRun<TVerdict>> {
  const res = await generateText({
    provider: spec.provider,
    model: spec.model,
    systemPrompt,
    userPrompt,
    temperature: 0,
    maxTokens: spec.maxTokens ?? 512,
  });
  if (!res.ok) {
    return {
      ok: false,
      provider: spec.provider,
      model: spec.model,
      verdict: null,
      severity: null,
      reason: "",
      error: res.error,
    };
  }
  const parsed = parse(res.text);
  if (!parsed.verdict) {
    return {
      ok: false,
      provider: spec.provider,
      model: spec.model,
      verdict: null,
      severity: null,
      reason: parsed.reason || "Could not parse verdict from model output.",
      error: "parse_failure",
    };
  }
  return {
    ok: true,
    provider: spec.provider,
    model: spec.model,
    verdict: parsed.verdict,
    severity: verdictToSeverity(parsed.verdict),
    reason: parsed.reason,
  };
}

/**
 * Consensus rule:
 *   - All judges errored → "warn" (conservative; we don't know the truth).
 *   - All judges agree on a severity → that severity.
 *   - Disagreement: take the MORE severe of the two (fail > warn > pass).
 *     Failing safely: if one judge says "fail" we don't ship it; if one
 *     says "warn" we surface it.
 */
function consensusOf<TVerdict extends string>(
  runs: JudgeRun<TVerdict>[],
): { severity: CommitteeVerdict; agreement: "unanimous" | "split" } {
  const successes = runs.filter((r) => r.ok && r.severity);
  if (successes.length === 0) {
    return { severity: "warn", agreement: "split" };
  }
  const severities = successes.map((r) => r.severity as CommitteeVerdict);
  const allSame = severities.every((s) => s === severities[0]);
  if (allSame) {
    return { severity: severities[0], agreement: "unanimous" };
  }
  // Disagreement — take the most severe.
  const rank = { fail: 2, warn: 1, pass: 0 } as const;
  const worst = severities.reduce(
    (acc, s) => (rank[s] > rank[acc] ? s : acc),
    "pass" as CommitteeVerdict,
  );
  return { severity: worst, agreement: "split" };
}

/**
 * Run a judge committee. Parallelizes calls; aggregates verdicts.
 *
 * `parse` receives the raw LLM output and returns the verdict + reason.
 * Each provider's structured-output story is different (Gemini has a
 * schema field; Claude / OpenAI return free text we have to JSON-parse
 * out of). `parse` lives in the caller because the verdict enum is
 * judge-specific.
 */
export async function runCommittee<TVerdict extends string>(args: {
  judges: JudgeSpec<TVerdict>[];
  systemPrompt: string;
  userPrompt: string;
  parse: (raw: string) => { verdict: TVerdict | null; reason: string };
  verdictToSeverity: (v: TVerdict) => CommitteeVerdict;
}): Promise<CommitteeResult<TVerdict>> {
  const runs = await Promise.all(
    args.judges.map((spec) =>
      runOneJudge(
        spec,
        args.systemPrompt,
        args.userPrompt,
        args.parse,
        args.verdictToSeverity,
      ),
    ),
  );
  const { severity, agreement } = consensusOf(runs);
  const reason = runs
    .map((r) => {
      if (!r.ok) return `[${r.model}] ERROR: ${r.error ?? "unknown"}`;
      return `[${r.model} → ${r.severity}] ${r.reason}`;
    })
    .join("\n");
  return { severity, reason, agreement, runs };
}

/**
 * Helper for callers whose LLM output is JSON. Strips common wrappers
 * (markdown fences, leading text) before parsing. Returns null on
 * failure so the caller can fall back gracefully.
 */
export function safeJsonParse<T = unknown>(raw: string): T | null {
  if (!raw) return null;
  // Strip ```json fences if present.
  const cleaned = raw
    .replace(/^[\s\S]*?```(?:json)?\s*/i, "")
    .replace(/```[\s\S]*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Last-ditch: find the first { ... } block.
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}
