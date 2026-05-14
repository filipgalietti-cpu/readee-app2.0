/**
 * Practice flow — 20-25 second feature demo.
 *
 * Story: kid lands on practice hub → picks a skill → answers a
 * question → green tick + carrots fly in. Highlights the practice
 * loop with feedback.
 */

import { clickWithPulse, beat, signInAsParent, type FlowCtx } from "./_helpers";

export async function run(ctx: FlowCtx): Promise<void> {
  const { page } = ctx;

  await signInAsParent(ctx);
  await beat(page, 600);
  await page.goto(`${ctx.baseUrl}/practice-hub`, { waitUntil: "domcontentloaded" });
  await beat(page, 1500, "practice hub loaded");

  // Click a skill / standard card.
  const skillCard = [
    'a[href*="/practice?"]',
    'button:has-text("Practice")',
    '[data-testid="skill-card"]',
  ].join(", ");
  await clickWithPulse(page, skillCard, { timeout: 6_000 }).catch(() => {});
  await beat(page, 2200, "skill loaded");

  // Wait for question to render, then pick a choice. Any answer is
  // fine for the demo — we want the feedback animation either way.
  const choiceSelector = [
    'button:has-text("A:")',
    'button[data-choice]',
    'button.choice-button',
    'button[type="button"]:not([disabled]):visible',
  ].join(", ");
  await beat(page, 800);
  await clickWithPulse(page, choiceSelector, { timeout: 6_000 }).catch(() => {});

  // Feedback + carrots animation
  await beat(page, 2500, "feedback animation");
  await beat(page, 3000, "next question fade-in");
}

export const totalSeconds = 22;
