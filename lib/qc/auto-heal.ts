/**
 * Unified auto-heal loop for any content type that runs through QC.
 *
 * The pattern (Filip's sketch): generate → QC → if fail, classify what
 * failed → run targeted heal → re-QC → repeat with bounded attempts →
 * pass or quarantine.
 *
 * Before this primitive, every content type (daily question, discovery
 * article, leveled passage, future Animal of the Day, etc.) had to
 * hand-write its own heal dispatcher. That siloing made it hard to
 * a) prove the loop works at scale and b) add new content types
 * safely. This module gives every content type a single
 * `runAutoHealLoop` call. They each provide:
 *
 *   - the current findings (from their QC pipeline)
 *   - an ordered list of healers, each with a matcher + heal function
 *   - the maxAttempts budget
 *
 * In return they get: bounded retries, ordered execution (cheap heals
 * first), telemetry written to `qc_runs` (feeds /owner/qc-health),
 * and graceful quarantine when attempts are exhausted.
 *
 * Healer ordering: callers list healers in priority order (cheapest +
 * least-cascading first). Within a single attempt, the loop runs ONE
 * healer — the first whose `matches` returns true for any failing
 * finding. Then re-runs QC and loops. This prevents stomping (e.g.
 * regenerating the image AND the passage on the same attempt when the
 * passage regen would have also fixed the image).
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import { trackError } from "@/lib/observability/track";

export type Finding = {
  name: string;
  severity: "pass" | "warn" | "fail";
  message?: string;
};

export type Healer = {
  /** Human-readable label written to telemetry (e.g. "image", "passage"). */
  name: string;
  /** Predicate against a single finding. Return true if this healer
   *  knows how to fix it. The loop walks findings × healers and picks
   *  the FIRST healer whose match hits. */
  matches: (f: Finding) => boolean;
  /** Run the surgical regen. Returns whether the heal actually ran
   *  (some healers may bail out internally, e.g. nothing to do). */
  heal: () => Promise<{ ok: boolean; ran: boolean; error?: string }>;
};

export type AutoHealConfig = {
  /** Content type for telemetry. e.g. 'daily_question', 'animal_of_the_day'. */
  contentType: string;
  /** Stable id of the content row (uuid or date slug — caller's choice). */
  contentId: string;
  /** Re-runs the QC and returns the current findings. Called once before
   *  the loop and after every heal. The loop never assumes which fields
   *  the caller stores findings in — callers do the persistence + read. */
  refreshFindings: () => Promise<Finding[]>;
  /** Ordered healers, cheapest first. */
  healers: Healer[];
  /** Total heal attempts. Default 3. Each attempt runs at most one healer. */
  maxAttempts?: number;
  /** Optional extras written to qc_runs.meta. */
  meta?: Record<string, unknown>;
};

export type AutoHealResult = {
  outcome: "passed_first_try" | "healed" | "quarantined";
  attemptsUsed: number;
  initialFindings: Finding[];
  finalFindings: Finding[];
  healerSequence: string[];
  durationMs: number;
};

function hasFailing(findings: Finding[]): boolean {
  return findings.some((f) => f.severity === "fail");
}

/**
 * Lightweight one-shot telemetry write for builders that don't fully
 * adopt runAutoHealLoop yet (discovery, leveled, calibrated). Lets
 * their results flow into qc_runs so /owner/qc-health and the
 * adaptive cap engine have signal for those types.
 *
 * Call this AFTER the builder has persisted its final state. The
 * builder is the source of truth on whether it healed internally,
 * how many attempts it used, and what the final findings look like.
 */
export async function recordQcRun(input: {
  contentType: string;
  contentId: string;
  qcOverall: "pass" | "warn" | "fail";
  attempts: number;
  initialFindings?: Finding[];
  finalFindings?: Finding[];
  healerSequence?: string[];
  durationMs?: number;
  meta?: Record<string, unknown>;
}): Promise<void> {
  // Classify: pass on first try = passed_first_try; pass after heal
  // attempt(s) = healed; final fail = quarantined. Warn is treated
  // as a pass for outcome purposes (published_state='live' anyway).
  const cleanFinal = input.qcOverall !== "fail";
  const ranHealer = (input.healerSequence?.length ?? 0) > 0 || input.attempts > 1;
  const outcome: AutoHealResult["outcome"] = cleanFinal
    ? ranHealer
      ? "healed"
      : "passed_first_try"
    : "quarantined";

  try {
    const admin = supabaseAdmin();
    await admin.from("qc_runs").insert({
      content_type: input.contentType,
      content_id: input.contentId,
      outcome,
      attempts_used: Math.max(1, input.attempts),
      initial_findings: input.initialFindings ?? [],
      final_findings: input.finalFindings ?? [],
      healer_sequence: input.healerSequence ?? [],
      duration_ms: input.durationMs ?? null,
      meta: input.meta ?? null,
    });
  } catch (e) {
    // Telemetry is never load-bearing — never block the build path.
  }
}

async function logRun(
  config: AutoHealConfig,
  result: AutoHealResult,
): Promise<void> {
  try {
    const admin = supabaseAdmin();
    await admin.from("qc_runs").insert({
      content_type: config.contentType,
      content_id: config.contentId,
      outcome: result.outcome,
      attempts_used: result.attemptsUsed,
      initial_findings: result.initialFindings,
      final_findings: result.finalFindings,
      healer_sequence: result.healerSequence,
      duration_ms: result.durationMs,
      meta: config.meta ?? null,
    });
  } catch (e) {
    // Telemetry write must never break the heal loop. Surface to
    // Sentry but swallow the throw.
    trackError(e, {
      route: "auto-heal.telemetry",
      tags: { content_type: config.contentType },
      extra: { content_id: config.contentId },
    });
  }
}

/**
 * Run the heal loop end-to-end. Caller is responsible for generation
 * (the loop assumes the content already exists with QC findings ready
 * to read via `refreshFindings`).
 *
 * Loop shape:
 *   1. Read initial findings.
 *   2. If no failing finding → log 'passed_first_try', return.
 *   3. Pick the FIRST healer whose matcher hits any failing finding.
 *   4. Run it. Re-read findings.
 *   5. Repeat up to maxAttempts. Track which healers we've already run
 *      — don't re-fire the same one twice in a single loop (avoids
 *      infinite "image bad → regen image → still bad" cycles).
 *   6. Exit with 'healed' if findings clean, 'quarantined' otherwise.
 */
export async function runAutoHealLoop(
  config: AutoHealConfig,
): Promise<AutoHealResult> {
  const startedAt = Date.now();
  const maxAttempts = config.maxAttempts ?? 3;

  const initialFindings = await config.refreshFindings();
  if (!hasFailing(initialFindings)) {
    const result: AutoHealResult = {
      outcome: "passed_first_try",
      attemptsUsed: 1,
      initialFindings,
      finalFindings: initialFindings,
      healerSequence: [],
      durationMs: Date.now() - startedAt,
    };
    await logRun(config, result);
    return result;
  }

  let currentFindings = initialFindings;
  const healersRun = new Set<string>();
  const healerSequence: string[] = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Find the first failing finding and the first healer for it.
    let picked: Healer | null = null;
    for (const finding of currentFindings) {
      if (finding.severity !== "fail") continue;
      for (const healer of config.healers) {
        if (healersRun.has(healer.name)) continue;
        if (healer.matches(finding)) {
          picked = healer;
          break;
        }
      }
      if (picked) break;
    }

    if (!picked) {
      // Either no failing finding (clean) or all matching healers
      // already ran. Either way, exit the loop and let the post-check
      // classify the result.
      break;
    }

    healersRun.add(picked.name);
    healerSequence.push(picked.name);
    try {
      const r = await picked.heal();
      if (!r.ok) {
        trackError(new Error(r.error ?? "healer returned ok=false"), {
          route: "auto-heal.healer.failed",
          tags: { healer: picked.name, content_type: config.contentType },
          extra: { content_id: config.contentId, attempt },
        });
      }
    } catch (e) {
      trackError(e, {
        route: "auto-heal.healer.threw",
        tags: { healer: picked.name, content_type: config.contentType },
        extra: { content_id: config.contentId, attempt },
      });
      // Keep going — maybe a later healer can clean up.
    }

    currentFindings = await config.refreshFindings();
    if (!hasFailing(currentFindings)) break;
  }

  const cleaned = !hasFailing(currentFindings);
  const result: AutoHealResult = {
    outcome: cleaned ? "healed" : "quarantined",
    attemptsUsed: Math.max(1, healerSequence.length),
    initialFindings,
    finalFindings: currentFindings,
    healerSequence,
    durationMs: Date.now() - startedAt,
  };
  await logRun(config, result);
  return result;
}
