/**
 * ORION — Motivation Layer (feedback language + growth framing).
 *
 * Two research-backed levers, written once for every domain:
 *
 * 1. PROCESS PRAISE. Feedback effectiveness scales with information: naming the
 *    STRATEGY the learner used is d≈0.99; generic reinforcement ("good job") is
 *    d≈0.24 (Wisniewski/Hattie 2020). Person praise ("you're smart") is the
 *    WEAKEST level (Hattie) and actively backfires after failure (Dweck). So we
 *    always praise what the learner DID, never who they are, and vary the line
 *    so it never feels canned.
 *
 * 2. PERSONAL-GROWTH framing. Contingent tangible rewards undermine intrinsic
 *    motivation, worse for children (Deci/Koestner/Ryan 1999), and competitive
 *    leaderboards demotivate exactly the strugglers who most need to persist.
 *    Progress is framed SELF-referentially ("more than YOUR last time"), never
 *    against peers.
 *
 * Domain-general: the selection/gating logic is here; the actual words live in a
 * per-domain praise bank (part of the offline coaching bank).
 */

/** A concrete thing the learner DID well (praise the process, not the person). */
export type ProcessWin = {
  /** Domain-defined category (e.g. "sounded_out", "self_corrected"). */
  kind: string;
  /** Optional concrete detail slotted into "{detail}" (the word, the sound). */
  detail?: string;
};

/** Process-praise templates per win kind; "{detail}" is filled when present. */
export type PraiseBank = Record<string, string[]>;

const PLACEHOLDER = "{detail}";
const fill = (line: string, detail?: string) =>
  detail ? line.replaceAll(PLACEHOLDER, detail) : line.replace(new RegExp(`\\s*${PLACEHOLDER.replace(/[{}]/g, "\\$&")}`, "g"), "");

/**
 * Pick a specific, process-focused praise line for a win. Prefers templates
 * whose placeholder can be filled, avoids repeating `avoid` (variety), and is
 * deterministic when a `rand` is injected (for tests).
 */
export function pickProcessPraise(
  win: ProcessWin,
  bank: PraiseBank,
  opts: { avoid?: string; rand?: () => number } = {},
): string | null {
  const all = bank[win.kind];
  if (!all || all.length === 0) return null;
  const rand = opts.rand ?? Math.random;

  // If we have a detail, prefer templates that use it (more specific = more
  // information = stronger feedback). If not, prefer templates without it.
  const withPh = all.filter((l) => l.includes(PLACEHOLDER));
  const withoutPh = all.filter((l) => !l.includes(PLACEHOLDER));
  const preferred = win.detail ? (withPh.length ? withPh : withoutPh) : withoutPh.length ? withoutPh : withPh;

  // Drop the just-used line so we don't repeat, unless that empties the pool.
  const filledPreferred = preferred.map((l) => fill(l, win.detail));
  const fresh = filledPreferred.filter((l) => l !== opts.avoid);
  const pool = fresh.length ? fresh : filledPreferred;

  return pool[Math.floor(rand() * pool.length) % pool.length];
}

/**
 * Corrective framing that keeps the door open — "not yet", not "wrong" (Dweck's
 * power of yet). The domain adds the phonics/step cue after this.
 */
export function notYet(detail?: string): string {
  // Customer-facing spoken copy: hyphen, never an em-dash (app copy rule).
  return detail ? `Not yet - let's work out ${detail} together.` : "Not yet - let's figure it out together.";
}

/**
 * Self-referential growth: the learner vs. THEIR OWN last result, never peers.
 * Returns improved:false (delta 0) when there's no prior or no gain — we only
 * ever celebrate real growth, never announce a slowdown.
 */
export function personalGrowth(
  current: number,
  previous: number | null | undefined,
): { improved: boolean; delta: number } {
  if (previous == null || !Number.isFinite(previous) || !Number.isFinite(current)) {
    return { improved: false, delta: 0 };
  }
  const delta = Math.round(current) - Math.round(previous);
  return { improved: delta > 0, delta };
}
