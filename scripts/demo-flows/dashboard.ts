/**
 * Dashboard flow — 15-18 second parent dashboard tour.
 *
 * Story: parent dashboard loads → fox avatar + greeting → scroll to
 * progress / carrots / streak → scroll to Today's Goal → smart search
 * area. Shows the parent surface that drives kid handoff.
 *
 * This is the marketing-y "look at the polish" shot — no clicks
 * required, just smooth scroll through the page.
 */

import { smoothScrollTo, beat, type FlowCtx } from "./_helpers";

export async function run(ctx: FlowCtx): Promise<void> {
  const { page } = ctx;

  await page.goto(
    `${ctx.baseUrl}/dashboard?child=${encodeURIComponent(ctx.childId)}`,
    { waitUntil: "domcontentloaded" },
  );
  await beat(page, 2000, "dashboard loaded — greeting + avatar");

  // Scroll through the page in beats. Selectors are generous;
  // smoothScrollTo no-ops gracefully if the target isn't found.
  await smoothScrollTo(page, '[data-testid="today-goal"], h2:has-text("Today")');
  await beat(page, 2500, "today's goal in view");

  await smoothScrollTo(page, 'a[href*="/practice-hub"], h2:has-text("Practice")');
  await beat(page, 2500, "practice section");

  await smoothScrollTo(page, 'a[href*="/journey"], h2:has-text("Journey")');
  await beat(page, 2500, "journey section");

  // Back to top for a clean close shot.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await beat(page, 3500, "back at hero");
}

export const totalSeconds = 16;
