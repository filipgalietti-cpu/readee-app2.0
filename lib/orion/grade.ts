/**
 * ORION TUTORING ENGINE — GRADE stage (the diagnosis contract).
 *
 * A grader's job is not to hand back a score — it's to DIAGNOSE: what did the
 * learner get wrong, how confident are we, and how bad is it. That diagnosis is
 * what everything downstream needs: the help-ladder picks rungs for the
 * confident errors, the learner model updates mastery, the motivation layer
 * frames the feedback.
 *
 * Domain-general: a per-domain grader (reading ASR miscue, math symbolic check,
 * essay rubric) produces this shape; the engine never sees phonemes or numbers.
 */

export type Severity = "clean" | "minor" | "major";

export type Diagnosis = {
  /** No real error — the learner got it right (recognizer/grader noise ignored). */
  correct: boolean;
  /**
   * clean = right; minor = a few pinpointed errors → teach those specifically;
   * major = heavy or unclear → model the whole thing, don't drill specifics we
   * can't confirm.
   */
  severity: Severity;
  /** Items we're CONFIDENT were wrong — the only ones safe to teach specifically. */
  confident: string[];
  /** Items that MIGHT be wrong but read like noise — surfaced, never drilled. */
  uncertain: string[];
};

/** Standard severity from confident/uncertain counts, so graders agree. */
export function severityOf(diagnosis: Omit<Diagnosis, "severity">, heavy: boolean): Severity {
  if (diagnosis.correct) return "clean";
  return heavy ? "major" : "minor";
}
