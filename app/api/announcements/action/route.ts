import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { findCampaign, canRedraw, type Campaign } from "@/lib/announcements/campaigns";
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
 * The buttons in an approval preview: a product update, or a new family email
 * such as the assessment reminder (lib/announcements/campaigns.ts lists them).
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
type Checked = { ok: true; c: Campaign; action: AnnounceAction } | { ok: false; res: NextResponse };

function check(req: NextRequest): Checked {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const action = url.searchParams.get("a") ?? "";
  const token = url.searchParams.get("t") ?? "";

  const c = findCampaign(id);
  // "redraw" on something with no generated picture is not a real link.
  if (!c || !isAnnounceAction(action) || (action === "redraw" && !canRedraw(c))) {
    return { ok: false, res: resultPage("That link is not valid", "Use the buttons in the newest preview email.", false) };
  }
  if (!announceTokenValid(id, action, token)) {
    return { ok: false, res: resultPage("That link was changed or has expired", "Use the buttons in the preview email itself.", false) };
  }
  return { ok: true, c, action };
}

const QUESTION: Record<AnnounceAction, (heading: string, when: string) => string> = {
  approve: (h, w) => `<strong>${h}</strong> will go to families ${w}. Nothing has been sent yet.`,
  redraw: (h) => `A new picture will be drawn for <strong>${h}</strong> and a fresh preview sent to you. Families get nothing.`,
  cancel: (h) => `<strong>${h}</strong> will not be sent to anyone.`,
};

export async function GET(req: NextRequest) {
  const r = check(req);
  if (!r.ok) return r.res;
  return confirmPage(ANNOUNCE_LABEL[r.action] + "?", QUESTION[r.action](escapeHtml(r.c.heading), escapeHtml(r.c.when)), ANNOUNCE_LABEL[r.action]);
}

export async function POST(req: NextRequest) {
  const r = check(req);
  if (!r.ok) return r.res;
  const { c, action } = r;
  const heading = escapeHtml(c.heading);

  if (action === "approve") {
    await approve(c.id);
    return resultPage("Approved", `<strong>${heading}</strong> will go to families ${escapeHtml(c.when)}. You can cancel it from the same email.`);
  }
  if (action === "cancel") {
    await cancel(c.id);
    return resultPage("Cancelled", `<strong>${heading}</strong> will not be sent. Approving it from the same email undoes this.`);
  }

  const a = c.announcement!; // check() only lets "redraw" through for an announcement

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
