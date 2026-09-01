/**
 * ORION TUTORING ENGINE — Learner Model (the ADAPT brain, and the moat).
 *
 * Decides WHAT a learner should work on next from their per-skill memory. One
 * profile spans every domain (reading skills, math skills, …), so the more a
 * child uses, the sharper the model — a cross-domain signal no single-subject
 * competitor can build. Domain-general: a "skill" is just an id + mastery +
 * due-date; reading plugs in phonics patterns, math plugs in problem types.
 *
 * Selection policy (matches the SM-2 ordering Luna's pages compute inline, now
 * in one tested place):
 *   1. brand-new skills first, in teaching order (don't skip the sequence)
 *   2. then DUE before not-yet-due (spaced review)
 *   3. then WEAKEST mastery first (spend time where it's needed)
 * plus interleaving — rotate off the just-served skill so we don't block-drill
 * one pattern (interleaving beats blocking, Rohrer 2020 d=0.83).
 */

export type SkillState = {
  id: string;
  /** Teaching-sequence order (lower = introduced earlier). */
  order: number;
  totalCorrect: number;
  totalAttempted: number;
  /** When it's next due for review. ISO string or epoch ms; null/absent = due now. */
  nextDue?: string | number | null;
};

export const mastery = (s: SkillState): number =>
  s.totalAttempted > 0 ? s.totalCorrect / s.totalAttempted : 0;

export const isAttempted = (s: SkillState): boolean => (s.totalAttempted ?? 0) > 0;

export function isDue(s: SkillState, now: number): boolean {
  if (s.nextDue == null) return true;
  const t = typeof s.nextDue === "number" ? s.nextDue : Date.parse(s.nextDue);
  return Number.isNaN(t) ? true : t <= now;
}

/** The comparator behind the policy above (stable, total order). */
function compare(a: SkillState, b: SkillState, now: number): number {
  const au = !isAttempted(a), bu = !isAttempted(b);
  if (au !== bu) return au ? -1 : 1; // unattempted first
  if (au && bu) return a.order - b.order; // both brand-new → teaching order
  const ad = isDue(a, now), bd = isDue(b, now);
  if (ad !== bd) return ad ? -1 : 1; // due before not-due
  const dm = mastery(a) - mastery(b);
  if (dm !== 0) return dm; // weakest first
  return a.order - b.order; // tie-break: teaching order (deterministic)
}

/** Skills ordered by what to work next (best first). Pure; does not mutate. */
export function rankSkills(skills: SkillState[], now: number): SkillState[] {
  return [...skills].sort((a, b) => compare(a, b, now));
}

/**
 * The next skill to work. `avoidId` rotates off the skill just served so we
 * interleave instead of block-drilling — but only when a real alternative
 * exists (never starves the one skill that genuinely needs work).
 */
export function pickNextSkill(
  skills: SkillState[],
  now: number,
  opts: { avoidId?: string } = {},
): SkillState | null {
  const ranked = rankSkills(skills, now);
  if (ranked.length === 0) return null;
  if (opts.avoidId && ranked[0].id === opts.avoidId && ranked.length > 1) {
    return ranked[1];
  }
  return ranked[0];
}
