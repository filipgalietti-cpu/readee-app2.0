/**
 * Lesson flow — 22-28 second tour of the karaoke slideshow.
 *
 * Story: enter a rich K lesson → slide 1 reveals → tap forward →
 * slide 2 → tap → slide 3. Three beats of karaoke animation are
 * the most distinctive visual the app has — show it.
 */

import { clickWithPulse, beat, type FlowCtx } from "./_helpers";

const DEMO_LESSON_STANDARD = process.env.DEMO_LESSON_STANDARD ?? "RF.K.3d";

export async function run(ctx: FlowCtx): Promise<void> {
  const { page } = ctx;

  // `?child=<id>` is required on /learn — without it the route bails
  // to the "We lost track of which reader" fallback.
  await page.goto(
    `${ctx.baseUrl}/learn?standard=${encodeURIComponent(DEMO_LESSON_STANDARD)}&child=${encodeURIComponent(ctx.childId)}`,
    { waitUntil: "domcontentloaded" },
  );
  await beat(page, 2500, "slide 1 reveals");
  await beat(page, 3000, "karaoke text staggers");

  // Advance — covers Next button + tap-anywhere overlay.
  const advance = [
    'button:has-text("Next")',
    'button[aria-label="Next slide"]',
    '[data-testid="slide-next"]',
    '.slide-tap-overlay',
    'main',
  ].join(", ");

  await clickWithPulse(page, advance, { timeout: 6000 }).catch(() => {});
  await beat(page, 4000, "slide 2 reveals");

  await clickWithPulse(page, advance, { timeout: 5000 }).catch(() => {});
  await beat(page, 4000, "slide 3 reveals");

  await clickWithPulse(page, advance, { timeout: 5000 }).catch(() => {});
  await beat(page, 4000, "slide 4 lingers");
}

export const totalSeconds = 24;
