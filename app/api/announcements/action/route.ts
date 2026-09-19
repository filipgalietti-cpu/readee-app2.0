import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { ANNOUNCEMENTS, type Announcement } from "@/lib/data/announcements";
import {
  ANNOUNCE_LABEL,
  announceTokenValid,
  approve,
  cancel,
  clearPreview,
  isAnnounceAction,
  markPreviewSent,
  ownerProfileId,
  type AnnounceAction,
} from "@/lib/announcements/approval";
import { generateBanner } from "@/lib/announcements/banner";
import { loadAudience, countByStage } from "@/lib/announcements/audience";
import { sendAnnouncementPreview } from "@/lib/announcements/preview";
import { isDeliverable, escapeHtml } from "@/lib/email/lifecycle";
import { confirmPage, resultPage } from "@/lib/email/action-page";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * The three buttons in a product-update preview.
 *
 * Signed per (announcement, action), so a link cannot be pointed at a different
 * announcement or turned from "cancel" into "approve". No session is read: the
 * team inbox is the credential, the same way it is for the daily review.
 *
 * Two steps. The link in the email (GET) only shows what is about to happen;
 * the button on that page (POST) does it. See lib/email/action-page.ts for why
 * a link on its own must never be enough to email every family.
 *
 * Approve does NOT send. It marks the announcement approved, and the lifecycle
 * cron sends it on or after its date. That keeps one code path responsible for
 * reaching families, with its per-family idempotency, rather than two.
 */
type Checked = { ok: true; a: Announcement; action: AnnounceAction } | { ok: false; res: NextResponse };

function check(req: NextRequest): Checked {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const action = url.searchParams.get("a") ?? "";
  const token = url.searchParams.get("t") ?? "";

  const a = ANNOUNCEMENTS.find((x) => x.id === id);
  if (!a?.email || !isAnnounceAction(action)) {
    return { ok: false, res: resultPage("That link is not valid", "Use the buttons in the newest preview email.", false) };
  }
  if (!announceTokenValid(id, action, token)) {
    return { ok: false, res: resultPage("That link was changed or has expired", "Use the buttons in the preview email itself.", false) };
  }
  return { ok: true, a, action };
}

const QUESTION: Record<AnnounceAction, (heading: string, date: string) => string> = {
  approve: (h, d) => `<strong>${h}</strong> will go to every opted-in family on or after ${d}. Nothing has been sent yet.`,
  redraw: (h) => `A new picture will be drawn for <strong>${h}</strong> and a fresh preview sent to you. Families get nothing.`,
  cancel: (h) => `<strong>${h}</strong> will not be sent to anyone.`,
};

export async function GET(req: NextRequest) {
  const c = check(req);
  if (!c.ok) return c.res;
  const e = c.a.email!;
  return confirmPage(ANNOUNCE_LABEL[c.action] + "?", QUESTION[c.action](escapeHtml(e.heading), escapeHtml(e.emailDate)), ANNOUNCE_LABEL[c.action]);
}

export async function POST(req: NextRequest) {
  const c = check(req);
  if (!c.ok) return c.res;
  const { a, action } = c;
  const e = a.email!;
  const heading = escapeHtml(e.heading);

  if (action === "approve") {
    await approve(a.id);
    return resultPage("Approved", `<strong>${heading}</strong> will go to families on or after ${escapeHtml(e.emailDate)}. You can still cancel it from the same email until then.`);
  }
  if (action === "cancel") {
    await cancel(a.id);
    return resultPage("Cancelled", `<strong>${heading}</strong> will not be sent. Approving it from the same email undoes this.`);
  }

  // redraw: a new picture, then a fresh preview asking the question again.
  after(async () => {
    const owner = ownerProfileId();
    if (!owner) return;
    const drawn = await generateBanner(a, owner);
    // A failed draw keeps the old picture and the old question, rather than
    // sending a preview with no banner in it.
    if (!drawn.ok) return;
    await clearPreview(a.id);
    const audience = await loadAudience(isDeliverable);
    const sent = await sendAnnouncementPreview(a, drawn.url, countByStage(audience));
    if (sent.ok) await markPreviewSent(a.id);
  });
  return resultPage(ANNOUNCE_LABEL.redraw, "Drawing a new picture now. A fresh preview will arrive in a minute or two, and nothing is sent to families in the meantime.");
}
