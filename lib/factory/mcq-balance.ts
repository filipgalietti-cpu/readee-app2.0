/**
 * Anti-gameability checks for batched MCQs. The big failure modes:
 *  1. Length cheat: correct answer 3x longer than every distractor
 *     (kids learn "pick the long one")
 *  2. Slot bias: correct always at A or always last
 *     (kids learn "pick A")
 *  3. Distractor obviousness: distractors so wrong any kid would
 *     dismiss them without reading the passage
 *
 * (3) is the LLM-judge's job (already in runFullQuizQc). (1) and (2)
 * are pure-functional checks we can run on a batch in microseconds.
 */

export type GameabilityCheck =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Reject if the correct answer is >2x as long (in chars) as the SHORTEST
 * distractor. Heuristic mirrors the audit threshold from
 * scripts/balance-mcq-choices.js.
 */
export function checkLengthBalance(
  choices: string[],
  correct: string,
): GameabilityCheck {
  if (choices.length < 2) return { ok: true };
  const correctLen = correct.length;
  const distractorLens = choices
    .filter((c) => c !== correct)
    .map((c) => c.length);
  if (distractorLens.length === 0) return { ok: true };
  const shortestDistractor = Math.min(...distractorLens);
  if (shortestDistractor === 0) return { ok: true };
  const ratio = correctLen / shortestDistractor;
  if (ratio > 2.0) {
    return {
      ok: false,
      reason: `Correct answer (${correctLen} chars) is ${ratio.toFixed(1)}x the shortest distractor (${shortestDistractor} chars). Likely gameable by length.`,
    };
  }
  return { ok: true };
}

/**
 * Across a batch of N questions, the correct-answer slot distribution
 * should be roughly uniform. If 70%+ of correct answers land in slot
 * A (or any one slot), reject the batch. This is the slot-bias check.
 *
 * Threshold: any single slot above 0.45 in a batch of 5+ is a flag.
 */
export function checkSlotDistribution(input: {
  questions: { choices: string[]; correct: string }[];
}): GameabilityCheck {
  const slots = new Map<number, number>();
  let total = 0;
  for (const q of input.questions) {
    const idx = q.choices.indexOf(q.correct);
    if (idx === -1) continue;
    slots.set(idx, (slots.get(idx) ?? 0) + 1);
    total++;
  }
  if (total < 5) return { ok: true }; // not enough signal
  for (const [slot, count] of slots) {
    const ratio = count / total;
    if (ratio > 0.45) {
      const letter = String.fromCharCode(65 + slot);
      return {
        ok: false,
        reason: `Slot bias: ${(ratio * 100).toFixed(0)}% of correct answers fall in slot ${letter} (${count}/${total}). Reshuffle before shipping.`,
      };
    }
  }
  return { ok: true };
}

/**
 * Reshuffle one MCQ to land the correct answer at the requested slot
 * (deterministic). Used to even out a batch's distribution before the
 * batch ships, instead of regenerating.
 */
export function shuffleToSlot(
  choices: string[],
  correct: string,
  targetSlot: number,
): { choices: string[]; correct: string } {
  if (targetSlot < 0 || targetSlot >= choices.length) {
    return { choices, correct };
  }
  const others = choices.filter((c) => c !== correct);
  const out = [...others];
  out.splice(targetSlot, 0, correct);
  return { choices: out, correct };
}

/** Round-robin balancer: walk the batch and force each correct answer
 * into the next slot in rotation. Use this to hit ~25/25/25/25 across
 * a batch without re-running the AI. */
export function rebalanceBatch<
  T extends { choices: string[]; correct: string },
>(questions: T[]): T[] {
  let counter = 0;
  return questions.map((q) => {
    if (q.choices.length === 0) return q;
    const targetSlot = counter % q.choices.length;
    counter++;
    const r = shuffleToSlot(q.choices, q.correct, targetSlot);
    return { ...q, choices: r.choices, correct: r.correct };
  });
}
