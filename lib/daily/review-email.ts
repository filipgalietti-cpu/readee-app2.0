import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugForDate } from "@/lib/daily/themes";
import { wordCount } from "@/lib/daily/lengths";
import { REVIEW_ACTIONS, ACTION_LABEL, reviewToken } from "@/lib/daily/review-actions";
import type { DailyEasyVariant } from "@/lib/daily/build-daily";

/**
 * The morning proof: what shipped today, in an inbox, before a parent sees it.
 *
 * Filip, 18 Sep 2026: "can you send me a daily email when our daily readee is
 * created, send it to hello@readee.app. Make sure to include the picture, the
 * text (short/long). I should be able to respond and say 'fix image' or
 * something like that to update it from my email. To make sure our slop isn't
 * too apparent."
 *
 * So this is a proof sheet, not a notification. It carries the things you can
 * only judge by looking: the picture at a size you can actually see, both
 * renditions with their word counts side by side (the gap between them is a
 * real defect that has shipped twice), and every QC check that did not pass.
 *
 * Every action is one tap, and the same actions answer a plain reply.
 */

const FROM = "Readee Daily <notify@readee.app>";
const APP = "https://learn.readee.app";

type Row = {
  date: string;
  theme: string | null;
  subject: string | null;
  medium: string | null;
  passage_title: string | null;
  passage_body: string | null;
  image_url: string | null;
  qc_overall: string | null;
  qc_report: { checks?: { name: string; severity: string; message: string }[] } | null;
  easy_variant: DailyEasyVariant | null;
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Paragraphs, preserved, so the email reads the way the page does. */
function paragraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 12px;font-size:16px;line-height:1.65;color:#27272a;">${esc(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

function actionUrl(slug: string, action: (typeof REVIEW_ACTIONS)[number]): string {
  return `${APP}/api/daily-review/action?date=${slug}&a=${action}&t=${reviewToken(slug, action)}`;
}

function verdictChip(overall: string | null): string {
  const v = overall ?? "unknown";
  const tone =
    v === "pass" ? { bg: "#e4efe7", fg: "#2f6b46" } : v === "warn" ? { bg: "#f7eeda", fg: "#8a5a11" } : { bg: "#f7e6e2", fg: "#a8301f" };
  return `<span style="display:inline-block;padding:3px 10px;border-radius:999px;background:${tone.bg};color:${tone.fg};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">${esc(v)}</span>`;
}

export function buildReviewEmail(row: Row): { subject: string; html: string } {
  const slug = row.date;
  const title = row.passage_title ?? "Untitled";
  const full = row.passage_body ?? "";
  const easy = row.easy_variant?.passage_body ?? "";
  const fullWords = full ? wordCount(full) : 0;
  const easyWords = easy ? wordCount(easy) : 0;
  const checks = (row.qc_report?.checks ?? []).filter((c) => c.severity !== "pass");

  const pretty = new Date(`${slug}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  const subject = `Daily Readee · ${pretty} · ${title} · ${row.qc_overall ?? "unknown"}`;

  const rendition = (label: string, text: string, words: number, note: string) => `
    <div style="margin-top:22px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#71717a;">
        ${esc(label)} &middot; ${words} words${note ? ` &middot; ${esc(note)}` : ""}
      </p>
      <div style="border-left:3px solid #ddd6fe;padding-left:14px;">
        ${text ? paragraphs(text) : '<p style="margin:0;font-size:16px;color:#a1a1aa;">Not generated.</p>'}
      </div>
    </div>`;

  // The gap between the two renditions is the thing to eyeball. A short read
  // that is nearly as long as the full one has shipped before.
  const gapNote =
    fullWords && easyWords
      ? `${Math.round((easyWords / fullWords) * 100)}% of the full read`
      : "";

  const buttons = REVIEW_ACTIONS.map(
    (a) => `<a href="${actionUrl(slug, a)}" style="display:inline-block;margin:0 8px 8px 0;padding:11px 16px;border-radius:12px;background:#f4f4f5;color:#4c1d95;font-size:14px;font-weight:700;text-decoration:none;border:1px solid #e4e4e7;">${esc(ACTION_LABEL[a])}</a>`,
  ).join("");

  const qcBlock = checks.length
    ? `<div style="margin-top:22px;padding:14px 16px;border-radius:12px;background:#faf9f7;border:1px solid #ececf0;">
         <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#71717a;">What QC flagged</p>
         ${checks
           .map(
             (c) =>
               `<p style="margin:0 0 6px;font-size:14px;line-height:1.5;color:#3f3f46;"><strong>${esc(c.severity)}</strong> &middot; ${esc(c.name)}<br/>${esc(c.message)}</p>`,
           )
           .join("")}
       </div>`
    : "";

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f0f0e4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:28px 14px;background:#f0f0e4;"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">
      <tr><td style="background:#ffffff;border:1px solid #e6e6d6;border-radius:18px;padding:26px 24px;">

        <p style="margin:0 0 4px;font-size:13px;color:#71717a;">${esc(pretty)} &middot; ${verdictChip(row.qc_overall)}</p>
        <h1 style="margin:0 0 2px;font-size:24px;font-weight:800;color:#1e1b4b;line-height:1.2;">${esc(title)}</h1>
        <p style="margin:0 0 18px;font-size:13px;color:#71717a;">${esc(row.theme ?? "")}${row.medium ? ` &middot; ${esc(row.medium)}` : ""}</p>

        ${
          row.image_url
            ? `<img src="${esc(row.image_url)}" alt="" width="552" style="display:block;width:100%;max-width:552px;height:auto;border-radius:14px;border:1px solid #ececf0;" />`
            : `<p style="margin:0;padding:24px;text-align:center;border-radius:14px;background:#faf9f7;color:#a1a1aa;font-size:14px;">No image on this row.</p>`
        }

        ${rendition("Full read", full, fullWords, "")}
        ${rendition("Short read", easy, easyWords, gapNote)}
        ${qcBlock}

        <div style="margin-top:26px;padding-top:18px;border-top:1px solid #ececf0;">
          <p style="margin:0 0 10px;font-size:14px;color:#3f3f46;">
            Something off? <strong>Just reply to this email</strong> and say what to fix, for example
            <em>fix image</em> or <em>rewrite the passage</em>. Or tap:
          </p>
          ${buttons}
          <p style="margin:12px 0 0;font-size:13px;">
            <a href="${APP}/today/${esc(slug)}" style="color:#6d28d9;">See it the way a child does</a>
          </p>
        </div>

      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  return { subject, html };
}

/**
 * Send the proof sheet. Best-effort by design: a mail failure must never mark a
 * day's build as failed, because the content is already live and correct.
 */
export async function sendDailyReviewEmail(date: Date): Promise<{ ok: boolean; reason?: string }> {
  const slug = slugForDate(date);
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: "RESEND_API_KEY not set" };

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("daily_questions")
    .select("date, theme, subject, medium, passage_title, passage_body, image_url, qc_overall, qc_report, easy_variant")
    .eq("date", slug)
    .maybeSingle();
  if (error || !data) return { ok: false, reason: `no row for ${slug}` };

  const { subject, html } = buildReviewEmail(data as Row);
  // Replies land here, and the day is carried in the address so the webhook
  // knows which row to act on without trusting the subject line. Unset until
  // the MX record exists, and then the email simply has no reply route while
  // its buttons keep working.
  const replyTo = process.env.DAILY_REVIEW_REPLY_TO
    ? process.env.DAILY_REVIEW_REPLY_TO.replace("@", `+${slug}@`)
    : undefined;

  try {
    const resend = new Resend(apiKey);
    const { error: sendError } = await resend.emails.send(
      {
        from: FROM,
        to: process.env.TEAM_INBOX_EMAIL || "hello@readee.app",
        subject,
        html,
        ...(replyTo ? { replyTo } : {}),
      },
      // One review per day, however many times the cron runs.
      { idempotencyKey: `daily-review-${slug}` },
    );
    if (sendError) return { ok: false, reason: String(sendError.message ?? sendError) };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}
