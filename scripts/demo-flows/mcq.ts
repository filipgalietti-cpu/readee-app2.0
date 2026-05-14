/**
 * MCQ flow — 18-22 second feature demo of the practice question loop.
 *
 * Story: kid lands on practice for a specific standard → 4 choice
 * cards visible → kid taps an answer → green check + carrots fly.
 *
 * Deep-link to a known good MCQ so the recording isn't at the mercy
 * of recommender randomness.
 */

import { clickWithPulse, beat, type FlowCtx } from "./_helpers";

export async function run(ctx: FlowCtx): Promise<void> {
  const { page } = ctx;

  // Land on a specific standard's practice. Pinning standard keeps
  // the question set deterministic per run. `?child=<id>` is required —
  // without it /practice redirects to /practice-hub (parent surface).
  await page.goto(
    `${ctx.baseUrl}/practice?standard=RL.K.1&child=${encodeURIComponent(ctx.childId)}`,
    { waitUntil: "domcontentloaded" },
  );
  // /practice gates on a "Tap to Start" screen before the first
  // question renders (kid welcome card + XP preview). Tap through it.
  await beat(page, 1500, "kid welcome card · Tap to Start");
  await clickWithPulse(page, 'button:has-text("Tap to Start")', { timeout: 4000 }).catch(() => {});
  await beat(page, 2000, "question + 4 choices render");

  // Tap any visible answer choice — recorder doesn't care which is
  // correct, we want the feedback animation either way. Practice page
  // renders choices as <motion.button> in a `grid-cols-2 gap-2.5` div
  // (app/(protected)/practice/page.tsx:1241); scope to that grid to
  // avoid catching the feedback FAB or sidebar buttons.
  const choiceSelector = '.grid.grid-cols-2 > button:visible';
  await clickWithPulse(page, choiceSelector, { timeout: 6000 }).catch(() => {});

  await beat(page, 2500, "green tick + carrot animation");
  await beat(page, 1500, "feedback dissolves");

  // Try to advance to the next question for a second beat of the
  // loop. Selectors cover Next button, tap-anywhere overlay, etc.
  const nextSelector = [
    'button:has-text("Next")',
    'button[aria-label="Next question"]',
    '[data-testid="next-question"]',
  ].join(", ");
  await clickWithPulse(page, nextSelector, { timeout: 4000 }).catch(() => {});
  await beat(page, 2500, "next question fades in");
  await beat(page, 4000, "second question lingers");
}

export const totalSeconds = 20;
