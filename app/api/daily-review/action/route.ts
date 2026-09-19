import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { runReviewAction } from "@/lib/daily/run-review-action";
import { isReviewAction, reviewTokenValid, ACTION_LABEL, type ReviewAction } from "@/lib/daily/review-actions";
import { confirmPage, resultPage } from "@/lib/email/action-page";

export const dynamic = "force-dynamic";
// A rebuild is the full daily pipeline. The work runs in `after`, but the
// function has to stay alive for it.
export const maxDuration = 800;

/**
 * The one-tap half of the daily review email.
 *
 * A signed link per (day, action), so a link cannot be pointed at another day
 * or escalated into a different action, and nothing here reads a session: the
 * inbox is the credential. This is what makes the feature work on the day it
 * ships, before any MX record exists for the reply route.
 *
 * ‼️ Two steps since 19 Sep 2026. This used to redraw on the GET itself, and a
 * mail scanner fetching the links in the review email is indistinguishable
 * from Filip tapping them. A live picture that changes with nobody asking is
 * the exact complaint this email exists to prevent. The link now shows a
 * confirmation and the button on it (a POST) does the work.
 *
 * Answers immediately and does the work in the background, because a redraw
 * takes minutes and nobody should watch a browser tab spin for it.
 */
type Checked = { ok: true; slug: string; action: ReviewAction } | { ok: false; res: NextResponse };

function check(req: NextRequest): Checked {
  const url = new URL(req.url);
  const slug = url.searchParams.get("date") ?? "";
  const action = url.searchParams.get("a") ?? "";
  const token = url.searchParams.get("t") ?? "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(slug) || !isReviewAction(action)) {
    return { ok: false, res: resultPage("That link is not valid", "Check the address, or use the buttons in the newest daily email.", false) };
  }
  if (!reviewTokenValid(slug, action, token)) {
    return { ok: false, res: resultPage("That link has expired or was changed", "Use the buttons in the daily email itself.", false) };
  }
  return { ok: true, slug, action };
}

export async function GET(req: NextRequest) {
  const c = check(req);
  if (!c.ok) return c.res;
  return confirmPage(
    `${ACTION_LABEL[c.action]}?`,
    `This changes the live Daily Readee for <strong>${c.slug}</strong>. It takes a few minutes, and you will get an updated email when it is done.`,
    ACTION_LABEL[c.action],
  );
}

export async function POST(req: NextRequest) {
  const c = check(req);
  if (!c.ok) return c.res;
  const { slug, action } = c;

  after(async () => {
    await runReviewAction(slug, action);
  });

  return resultPage(
    "On it",
    `${ACTION_LABEL[action]} for <strong>${slug}</strong> is running now. It takes a few minutes. You will get an updated email when it is done, or refresh the day to see it sooner.`,
  );
}
