import { buildDailyQuestion, targetedImageRegen, targetedPassageRegen } from "@/lib/daily/build-daily";
import { notifyTeam } from "@/lib/email/notify-team";
import { trackError } from "@/lib/observability/track";
import type { ReviewAction } from "@/lib/daily/review-actions";

/**
 * Carry out what was asked, from a tap or from a reply, and say what happened.
 *
 * ‼️ NEVER PASS A BARE DATE STRING TO THE PIPELINE. `new Date("2026-09-18")`
 * parses as UTC midnight, which is the previous day in Eastern time, and
 * that is how a rebuild once overwrote a live day's content. Noon UTC lands on
 * the intended day everywhere the app runs.
 */
export function dayFromSlug(slug: string): Date {
  return new Date(`${slug}T12:00:00Z`);
}

export async function runReviewAction(
  slug: string,
  action: ReviewAction,
): Promise<{ ok: boolean; detail: string }> {
  const date = dayFromSlug(slug);
  try {
    if (action === "image") {
      // force, because the judge passing is exactly the case a human is
      // overruling: they are looking at something QC called fine.
      const r = await targetedImageRegen({ date, force: true });
      return report(slug, action, r.ok ? (r.regenerated ? `redrawn, qc ${r.newOverall}` : `no change: ${r.reason}`) : `failed: ${r.error}`, r.ok);
    }
    if (action === "passage") {
      const r = await targetedPassageRegen({ date });
      return report(slug, action, r.ok ? (r.regenerated ? `rewritten, qc ${r.newOverall}` : `no change: ${r.reason}`) : `failed: ${r.error}`, r.ok);
    }
    const r = await buildDailyQuestion({ date, force: true });
    return report(slug, action, r.ok ? `rebuilt, qc ${r.qcOverall}` : `failed: ${r.error}`, r.ok);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    trackError(e instanceof Error ? e : new Error(detail), { route: "daily-review-action", extra: { slug, action } });
    return report(slug, action, `threw: ${detail}`, false);
  }
}

/** Close the loop in the same inbox the request came from. */
async function report(slug: string, action: ReviewAction, detail: string, ok: boolean) {
  await notifyTeam(
    `Daily ${slug}: ${action} ${ok ? "done" : "failed"}`,
    `<p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;color:#27272a;">
       <strong>${action}</strong> on <strong>${slug}</strong>: ${detail}.
     </p>
     <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;">
       <a href="https://learn.readee.app/today/${slug}">Look at it</a>
     </p>`,
    // One report per attempt, not per retry of the same attempt.
    `daily-review-${slug}-${action}-${ok ? "ok" : "err"}`,
  );
  return { ok, detail };
}
