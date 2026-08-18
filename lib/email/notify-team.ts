import { Resend } from "resend";

/**
 * Fire-and-forget internal alert to the Readee team inbox — new signups,
 * subscriptions, cancellations, contact/feedback. Sends FROM notify@ (never
 * hello@ -> hello@, which self-bounces) TO TEAM_INBOX_EMAIL, defaulting to
 * hello@readee.app. Best-effort: logs and swallows any error so it can never
 * break the flow that called it (a webhook, a signup, etc.).
 */
export async function notifyTeam(subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[notifyTeam] RESEND_API_KEY not set - skipping:", subject);
    return;
  }
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Readee <notify@readee.app>",
      to: process.env.TEAM_INBOX_EMAIL || "hello@readee.app",
      subject,
      html,
    });
    if (error) console.error("[notifyTeam] Resend error:", error);
  } catch (e) {
    console.error("[notifyTeam] threw:", e);
  }
}
