import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { Resend } from "resend";
import { verifySvixSignature } from "@/lib/email/svix-signature";
import { parseReviewCommand, ACTION_LABEL } from "@/lib/daily/review-actions";
import { runReviewAction } from "@/lib/daily/run-review-action";
import { notifyTeam } from "@/lib/email/notify-team";
import { reportFailure } from "@/lib/observability/critical";

export const dynamic = "force-dynamic";
export const maxDuration = 800;

/**
 * Replying to the daily review email.
 *
 * Filip, 18 Sep 2026: "I should be able to respond and say 'fix image' or
 * something like that to update it from my email."
 *
 * SETUP THIS NEEDS, and it is one step: Resend receives mail on a domain that
 * owns the MX record, and readee.app's MX already points at the Porkbun
 * forwarder that makes hello@ work. Two services cannot both own it. So
 * receiving runs on a SUBDOMAIN, and the daily email sets Reply-To to an
 * address there, carrying the day:
 *
 *   DAILY_REVIEW_REPLY_TO   daily@inbox.readee.app
 *   RESEND_WEBHOOK_SECRET   whsec_... from the webhook's page
 *   DAILY_REVIEW_SENDERS    the addresses allowed to command it
 *
 * Until those exist, the email simply has no reply route and its buttons do
 * the same three things.
 *
 * ‼️ FAILS CLOSED. An unsigned request, an unknown sender, or a reply this
 * cannot parse does nothing. Every action here spends AI credits and replaces
 * a live day, so silence is the right answer to anything uncertain.
 */

function addr(value: string): string {
  // "Filip <filip@example.com>" -> "filip@example.com"
  const m = /<([^>]+)>/.exec(value);
  return (m ? m[1] : value).trim().toLowerCase();
}

/** Which day the reply is about, from the plus-address the email was sent to. */
function slugFromRecipients(to: string[]): string | null {
  for (const raw of to ?? []) {
    const m = /\+(\d{4}-\d{2}-\d{2})@/.exec(addr(raw));
    if (m) return m[1];
  }
  return null;
}

function allowedSender(from: string): boolean {
  const list = (process.env.DAILY_REVIEW_SENDERS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!list.length) return false; // fail closed until someone is named
  return list.includes(addr(from));
}

/** A reply is often html only; the typed part still has to be readable. */
function toText(html: string): string {
  return html
    .replace(/<blockquote[\s\S]*?<\/blockquote>/gi, " ") // the quoted original
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ");
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  // 200 on purpose: a missing secret is our misconfiguration, and making Resend
  // retry it forever helps nobody.
  if (!secret) return NextResponse.json({ ok: false, reason: "not configured" });

  const raw = await req.text();
  const ok = verifySvixSignature({
    body: raw,
    id: req.headers.get("svix-id"),
    timestamp: req.headers.get("svix-timestamp"),
    signature: req.headers.get("svix-signature"),
    secret,
  });
  if (!ok) return NextResponse.json({ ok: false, reason: "bad signature" }, { status: 401 });

  let event: { type?: string; data?: { email_id?: string; from?: string; to?: string[] } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, reason: "bad json" }, { status: 400 });
  }
  if (event.type !== "email.received") return NextResponse.json({ ok: true, ignored: event.type });

  const from = event.data?.from ?? "";
  const emailId = event.data?.email_id ?? "";
  const slug = slugFromRecipients(event.data?.to ?? []);
  if (!allowedSender(from)) {
    console.warn("[resend-inbound] ignoring reply from", addr(from));
    return NextResponse.json({ ok: true, ignored: "sender" });
  }
  if (!slug || !emailId) return NextResponse.json({ ok: true, ignored: "no day or id" });

  // The webhook carries metadata only, never the body.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, reason: "no api key" });
  let text = "";
  try {
    const received = await new Resend(apiKey).emails.receiving.get(emailId);
    const data = (received as { data?: { text?: string | null; html?: string | null } }).data;
    text = data?.text?.trim() || toText(data?.html ?? "");
  } catch (e) {
    reportFailure("daily.review.inbound", e, { route: "/api/webhooks/resend-inbound" });
    return NextResponse.json({ ok: false, reason: "could not read the reply" });
  }

  const action = parseReviewCommand(text);
  if (!action) {
    // Say so, rather than leaving someone waiting on a fix that is not coming.
    await notifyTeam(
      `Daily ${slug}: reply not understood`,
      `<p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;color:#27272a;">
         Nothing was changed. Try <em>fix image</em>, <em>rewrite the passage</em>, or <em>rebuild</em>, or use the buttons in the daily email.
       </p>`,
      `daily-review-${slug}-unparsed-${emailId}`,
    );
    return NextResponse.json({ ok: true, ignored: "no command" });
  }

  after(async () => {
    await runReviewAction(slug, action);
  });
  console.info(`[resend-inbound] ${slug}: ${ACTION_LABEL[action]} requested by ${addr(from)}`);
  return NextResponse.json({ ok: true, slug, action });
}
