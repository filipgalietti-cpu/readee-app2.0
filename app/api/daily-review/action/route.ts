import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { runReviewAction } from "@/lib/daily/run-review-action";
import { isReviewAction, reviewTokenValid, ACTION_LABEL } from "@/lib/daily/review-actions";

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
 * Answers immediately and does the work in the background, because a redraw
 * takes minutes and nobody should watch a browser tab spin for it.
 */
function page(title: string, body: string, tone: "ok" | "bad"): NextResponse {
  const accent = tone === "ok" ? "#4c1d95" : "#a8301f";
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title></head>
<body style="margin:0;background:#f0f0e4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="max-width:520px;margin:12vh auto;padding:0 20px;">
  <div style="background:#fff;border:1px solid #e6e6d6;border-radius:18px;padding:30px 26px;">
    <h1 style="margin:0 0 10px;font-size:22px;color:${accent};">${title}</h1>
    <p style="margin:0;font-size:16px;line-height:1.6;color:#3f3f46;">${body}</p>
  </div>
</div></body></html>`,
    { status: tone === "ok" ? 200 : 400, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("date") ?? "";
  const action = url.searchParams.get("a") ?? "";
  const token = url.searchParams.get("t") ?? "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(slug) || !isReviewAction(action)) {
    return page("That link is not valid", "Check the address, or use the buttons in the newest daily email.", "bad");
  }
  if (!reviewTokenValid(slug, action, token)) {
    return page("That link has expired or was changed", "Use the buttons in the daily email itself.", "bad");
  }

  after(async () => {
    await runReviewAction(slug, action);
  });

  return page(
    "On it",
    `${ACTION_LABEL[action]} for <strong>${slug}</strong> is running now. It takes a few minutes. You will get the new version in tomorrow's email, or refresh the day to see it sooner.`,
    "ok",
  );
}
