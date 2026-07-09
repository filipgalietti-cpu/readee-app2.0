/**
 * Hero flow — 10-12 second cold open for the landing page top fold.
 *
 * Story: kid surface, lesson is loading → karaoke text reveals →
 * second beat. Auth comes from the cached storageState so the
 * recording starts on the magic, not the login form.
 *
 * Competitor pattern: lead with VISUAL motion. No headers explaining
 * what the user is about to see — just show it.
 */

import { beat, type FlowCtx } from "./_helpers";

export async function run(ctx: FlowCtx): Promise<void> {
  const { page } = ctx;

  // Deep-link into a rich K lesson (RF.K.3d "Look-Alike Words" — 8
  // slides, dense displayParts + highlightPills, K canon quality).
  // `?child=<id>` is required — without it /learn shows the
  // "We lost track of which reader" fallback.
  await page.goto(
    `${ctx.baseUrl}/learn?standard=RF.K.3d&child=${encodeURIComponent(ctx.childId ?? "")}`,
    { waitUntil: "domcontentloaded" },
  );
  await beat(page, 1500, "slide 1 fades in");
  await beat(page, 4500, "karaoke reveal");
  await beat(page, 4000, "linger on the visual");
}

export const totalSeconds = 10;
