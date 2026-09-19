import { Resend } from "resend";
import { BASE_URL, escapeHtml } from "@/lib/email/lifecycle";
import { renderWhatsNew } from "@/lib/email/whats-new";
import type { Announcement } from "@/lib/data/announcements";
import { ANNOUNCE_ACTIONS, ANNOUNCE_LABEL, announceToken } from "./approval";
import { askFor, type FamilyStage } from "./audience";

/**
 * "This is what the new email blast will look like."
 *
 * The proof goes to the team inbox, never to a family. It shows the real
 * rendered email, the closing line and button each kind of family would get,
 * what the in-app popup will say on the same day, how many people it reaches,
 * and three buttons.
 *
 * Deliberately the actual HTML that would be sent, not a description of it. A
 * preview that is rendered differently from the thing it previews will
 * eventually disagree with it, and the disagreement will be found by a parent.
 */

const STAGE_NAME: Record<FamilyStage, string> = {
  unassessed: "Added a child, never assessed",
  assessed: "Assessed, never opened a lesson",
  reading: "Reading, not paying",
  paying: "Paying",
};

export type AudienceCounts = Record<FamilyStage, number>;

function actionUrl(id: string, action: (typeof ANNOUNCE_ACTIONS)[number]): string {
  return `${BASE_URL}/api/announcements/action?id=${encodeURIComponent(id)}&a=${action}&t=${announceToken(id, action)}`;
}

export function buildAnnouncementPreview(
  a: Announcement,
  bannerUrl: string | null,
  counts: AudienceCounts,
): { subject: string; html: string } {
  const e = a.email!;
  const fallback = { ctaLabel: e.ctaLabel ?? "Open Readee", ctaHref: e.ctaHref ?? `${BASE_URL}/dashboard` };
  const total = Object.values(counts).reduce((n, v) => n + v, 0);
  // "generated" is an instruction, not a file. If the draw failed it must not
  // be handed to the shell as though it were a banner name.
  const drawFailed = e.banner === "generated" && !bannerUrl;
  const today = new Date().toISOString().slice(0, 10);

  // The email as the largest group will actually receive it.
  const lead = (Object.entries(counts) as [FamilyStage, number][]).sort((x, y) => y[1] - x[1])[0]?.[0] ?? "unassessed";
  const ask = askFor(lead, null, fallback);
  const sample = renderWhatsNew(
    {
      eyebrow: "What's new",
      heading: e.heading,
      intro: e.intro,
      items: e.items,
      ctaLabel: ask.ctaLabel,
      ctaHref: ask.ctaHref,
      bunny: bannerUrl ?? (drawFailed ? undefined : e.banner),
      nextStepLine: ask.line,
    },
    `${BASE_URL}/account/unsubscribe/weekly`,
  );

  const rows = (Object.keys(STAGE_NAME) as FamilyStage[])
    .map((stage) => {
      const s = askFor(stage, null, fallback);
      return `<tr>
        <td style="padding:8px 10px 8px 0;border-top:1px solid #ececf0;vertical-align:top;font-size:13px;color:#3f3f46;"><strong>${escapeHtml(STAGE_NAME[stage])}</strong><br/><span style="color:#71717a;">${counts[stage]} ${counts[stage] === 1 ? "family" : "families"}</span></td>
        <td style="padding:8px 0;border-top:1px solid #ececf0;vertical-align:top;font-size:13px;color:#3f3f46;">${s.line ? escapeHtml(s.line) + "<br/>" : ""}<span style="color:#6d28d9;font-weight:700;">${escapeHtml(s.ctaLabel)}</span></td>
      </tr>`;
    })
    .join("");

  const buttons = ANNOUNCE_ACTIONS.map((action) => {
    const primary = action === "approve";
    return `<a href="${actionUrl(a.id, action)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 18px;border-radius:12px;background:${primary ? "#6d28d9" : "#f4f4f5"};color:${primary ? "#ffffff" : "#4c1d95"};font-size:14px;font-weight:700;text-decoration:none;border:1px solid ${primary ? "#6d28d9" : "#e4e4e7"};">${escapeHtml(ANNOUNCE_LABEL[action])}</a>`;
  }).join("");

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f0f0e4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:28px 14px;"><tr><td align="center">
    <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;width:100%;">
      <tr><td style="background:#ffffff;border:1px solid #e6e6d6;border-radius:18px;padding:24px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#71717a;">Waiting for your approval</p>
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#1e1b4b;">${escapeHtml(e.heading)}</h1>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#3f3f46;">
          Goes to <strong>${total}</strong> opted-in ${total === 1 ? "family" : "families"} on or after <strong>${escapeHtml(e.emailDate)}</strong>. Nothing sends until you approve.
        </p>
        ${drawFailed ? `<p style="margin:0 0 14px;padding:10px 12px;border-radius:10px;background:#fef3c7;font-size:13px;line-height:1.5;color:#78350f;"><strong>The picture could not be drawn.</strong> Use "Draw a different picture" to try again. If you approve as it is, the email goes out with the standard Readee banner.</p>` : ""}
        ${buttons}

        <h2 style="margin:22px 0 8px;font-size:15px;color:#1e1b4b;">The same news, a different ask</h2>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${rows}</table>

        <h2 style="margin:22px 0 8px;font-size:15px;color:#1e1b4b;">In the app, ${a.date <= today ? "since" : "on"} ${escapeHtml(a.date)}</h2>
        <p style="margin:0;font-size:14px;line-height:1.55;color:#3f3f46;"><strong>${escapeHtml(a.title)}</strong><br/>${escapeHtml(a.body)}<br/><span style="color:#6d28d9;font-weight:700;">${escapeHtml(a.cta.label)}</span></p>

        <h2 style="margin:22px 0 8px;font-size:15px;color:#1e1b4b;">The email, as the largest group gets it</h2>
      </td></tr>
      <tr><td style="padding-top:14px;">${sample.html.replace(/<!doctype html>|<\/?html>|<\/?body[^>]*>/gi, "")}</td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  return { subject: `Approve? · ${e.heading}`, html };
}

export async function sendAnnouncementPreview(
  a: Announcement,
  bannerUrl: string | null,
  counts: AudienceCounts,
): Promise<{ ok: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: "RESEND_API_KEY not set" };
  const { subject, html } = buildAnnouncementPreview(a, bannerUrl, counts);
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: "Readee Updates <notify@readee.app>",
      to: process.env.TEAM_INBOX_EMAIL || "hello@readee.app",
      subject,
      html,
    });
    return error ? { ok: false, reason: String(error.message ?? error) } : { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}
