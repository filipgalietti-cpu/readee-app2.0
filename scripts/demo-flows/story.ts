/**
 * Story flow — 18-20 second demo of the decodable-story reader.
 *
 * Story: kid lands in the stories library → covers fan out → kid
 * picks one → reader opens with title + cover → first sentence
 * highlights as TTS reads (silently, but the visual karaoke shows).
 */

import { clickWithPulse, beat, type FlowCtx } from "./_helpers";

export async function run(ctx: FlowCtx): Promise<void> {
  const { page } = ctx;

  await page.goto(
    `${ctx.baseUrl}/stories?child=${encodeURIComponent(ctx.childId)}`,
    { waitUntil: "domcontentloaded" },
  );
  await beat(page, 2000, "story library renders");

  // Story cards render as `<motion.button>` inside the active grade
  // group (app/(protected)/stories/page.tsx:592). Active grade auto-
  // expands for the child's reading level. Target by title text —
  // selectors that just match "button with image" can land on the
  // sidebar or other chrome instead.
  const storyCard = [
    'button:has-text("The Big Red Hat")',
    'button:has-text("Dan and the Dog")',
    'main .grid button:has(img)',
  ].join(", ");
  await clickWithPulse(page, storyCard, { timeout: 6000 }).catch(() => {});

  await beat(page, 2500, "reader opens · cover + title");
  await beat(page, 4000, "first sentence highlights");
  await beat(page, 4500, "next sentence");
  await beat(page, 4000, "linger on illustration");
}

export const totalSeconds = 18;
