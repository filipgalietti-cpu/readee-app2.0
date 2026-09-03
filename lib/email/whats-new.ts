/**
 * "What's new" broadcast email — sent MANUALLY when new content/features ship.
 * Reuses the shared branded shell(), so it matches every other Readee email.
 * Respects the email_weekly_digest opt-in. Trigger it from
 * scripts/send-whats-new.ts (edit the content block, then run).
 */
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { shell, escapeHtml, BASE_URL } from "./lifecycle";

const FROM = "Readee <hello@readee.app>";

export interface WhatsNewContent {
  /** Uppercase eyebrow (default "What's new"). */
  eyebrow?: string;
  /** Headline, e.g. "New lessons just landed". */
  heading: string;
  /** One-line intro under the headline. */
  intro: string;
  /** Bullet list of what's new. */
  items: string[];
  ctaLabel?: string;
  ctaHref?: string;
  /** Bunny mascot filename (default "bunny-cheer.png"). */
  bunny?: string;
}

function unsub(parentId: string): string {
  const t = Buffer.from(`${parentId}:${new Date().toISOString().slice(0, 10)}`).toString("base64url");
  return `${BASE_URL}/account/unsubscribe/weekly?t=${t}&u=${parentId}`;
}

export function renderWhatsNew(c: WhatsNewContent, unsubscribeUrl: string): { subject: string; text: string; html: string } {
  const items = c.items.filter(Boolean);
  const ctaHref = c.ctaHref ?? `${BASE_URL}/dashboard`;
  const ctaLabel = c.ctaLabel ?? "See what's new";
  const subject = c.heading;
  const text = [
    "Hi there,", "", c.intro, "",
    ...items.map((i) => `  · ${i}`), "",
    `${ctaLabel}: ${ctaHref}`, "",
    `Unsubscribe: ${unsubscribeUrl}`, "- Readee",
  ].join("\n");
  const bodyHtml = `
    <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#3f3f46;text-align:center;">${escapeHtml(c.intro)}</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:14px;">
      ${items.map((i) => `<tr><td style="padding:5px 0;"><table cellpadding="0" cellspacing="0" role="presentation"><tr><td valign="top" style="color:#10b981;font-weight:900;padding-right:10px;line-height:1.55;">&#10003;</td><td style="font-size:14px;line-height:1.55;color:#3f3f46;font-weight:600;">${escapeHtml(i)}</td></tr></table></td></tr>`).join("")}
    </table>`;
  const html = shell({
    preheader: c.intro,
    parentName: null,
    eyebrow: c.eyebrow ?? "What's new",
    heading: c.heading,
    hero: c.bunny ?? "whats-new",
    bodyHtml,
    ctaHref,
    ctaLabel,
    unsubscribeUrl,
  });
  return { subject, text, html };
}

/** Broadcast to every opted-in parent. Returns counts. */
export async function sendWhatsNewToAll(content: WhatsNewContent): Promise<{ sent: number; failed: number }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");
  const resend = new Resend(apiKey);
  const admin = supabaseAdmin();
  const { data: parents } = await admin
    .from("profiles")
    .select("id, email")
    .eq("email_weekly_digest", true)
    .not("email", "is", null);

  let sent = 0, failed = 0;
  for (const p of (parents ?? []) as { id: string; email: string | null }[]) {
    if (!p.email) continue;
    const email = renderWhatsNew(content, unsub(p.id));
    try {
      const r = await resend.emails.send({ from: FROM, to: p.email, subject: email.subject, text: email.text, html: email.html });
      if ((r as { error?: unknown }).error) failed++; else sent++;
    } catch { failed++; }
    await new Promise((res) => setTimeout(res, 60)); // gentle pacing
  }
  return { sent, failed };
}
