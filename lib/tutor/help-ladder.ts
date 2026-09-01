/**
 * FULCRUM TUTORING KERNEL — Help-Ladder Engine (the COACH stage).
 *
 * Domain-general escalation policy for corrective feedback. Every validated
 * reading program (UFLI, Wilson, Intervention Central, Pause-Prompt-Praise) and
 * CMU's Project LISTEN converge on the same shape when a learner is stuck:
 *
 *   escalate ONE rung at a time, least → most support, stop at the first
 *   success, keep help SHORT, and after a couple of tries MODEL it and move on
 *   (no spiral — momentum beats perfectionism, and kids abort long "educational"
 *   help 47-75% of the time per Project LISTEN's 189k-trial data).
 *
 * The domain provides the RUNGS (reading: recue-in-context → onset-rime →
 * sound-out → syllabify → say-the-word; math: hint → worked step → full step),
 * each tagged with a support `level` and whether it's `feasible` for this item
 * (word length, homograph, phoneme count, etc.). This engine only orders and
 * paces them. It never mentions phonemes.
 */

export type RungId = string; // domain-defined (e.g. "sound-out", "onset-rime")

export type HelpRung = {
  id: RungId;
  /** Support amount: 0 = lightest touch (a nudge/recue) … higher = more (model). */
  level: number;
  /** Does this rung even apply to this item? (Domain decides.) */
  feasible: boolean;
};

/** What's happened on THIS item so far. */
export type LadderState = {
  /** Rung ids already delivered for this item, in order. */
  triedRungs: RungId[];
};

export type LadderStep =
  | { kind: "help"; rung: HelpRung } // deliver this rung, then let them retry
  | { kind: "model" } // "my turn": model the answer, learner reproduces it
  | { kind: "move-on" }; // stop helping — keep momentum, log for spaced review

/** Sentinel recorded in triedRungs once the answer has been modeled. */
export const MODELED = "__modeled__";

export type LadderOpts = {
  /**
   * Max distinct help rungs before we stop escalating and just model it.
   * Keep this small (default 2) — long help chains get abandoned.
   */
  maxHelps?: number;
};

/**
 * Given the item's feasible rungs and what's been tried, decide the next move.
 * Call this each time the learner stalls or gets it wrong again; record the
 * returned rung's id (or MODELED) into `triedRungs` before the next call.
 */
export function nextLadderStep(
  rungs: HelpRung[],
  state: LadderState,
  opts: LadderOpts = {},
): LadderStep {
  const maxHelps = opts.maxHelps ?? 2;
  const tried = state.triedRungs;

  if (tried.includes(MODELED)) {
    // We've already modeled it once and they're still stuck → move on.
    return { kind: "move-on" };
  }

  const feasibleSorted = rungs
    .filter((r) => r.feasible)
    .sort((a, b) => a.level - b.level);
  const untried = feasibleSorted.filter((r) => !tried.includes(r.id));
  const helpsGiven = tried.filter((id) => id !== MODELED).length;

  // Helped enough, or run out of applicable rungs → model it (my turn), once.
  if (helpsGiven >= maxHelps || untried.length === 0) {
    return { kind: "model" };
  }

  // Otherwise give the lightest untried rung and let them try again.
  return { kind: "help", rung: untried[0] };
}
