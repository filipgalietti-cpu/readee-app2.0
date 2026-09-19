import { Resend } from "resend";
import { BASE_URL, escapeHtml, shell } from "@/lib/email/lifecycle";
import { askFor } from "@/lib/announcements/audience";
import { ANNOUNCE_LABEL, announceToken } from "@/lib/announcements/approval";

/**
 * The email for a family that signed up and never took the reading assessment.
 *
 * ‼️ Until 19 Sep 2026 these families got the weekly re-engage email instead:
 * "Tariq hasn't logged a lesson in 14 days. Reading streaks rebuild fast", with
 * links to stories and practice. About 78 of the 105 families on the list had
 * never been assessed, so for three quarters of its readers that email
 * described a streak that never existed and never once asked for the first
 * step of the product. 400 of them were sent.
 *
 * Filip, 19 Sep: "Lets align it to our pricing, our paywall, and our product."
 * The free assessment IS the top of the funnel, so it is what a family that has
 * not started gets asked for, by a teacher, twice at most.
 *
 * Every claim in the copy is something the product does: about ten minutes,
 * read aloud, a report with a level, the skills checked, a plan and home tips
 * (lib/email/placement-report.ts). It is a letter: her photo, her words, her
 * signature, and a reply reaches the team inbox.
 *
 * No "free, no card, works on any device" line. Filip cut those from the site
 * on 17 Sep as reading like a pitch; the only "free" here is Jennifer's own.
 */

/** Approval is recorded against this id, the same way an announcement's is. */
export const ASSESS_NUDGE_ID = "assess-nudge-v1";
/** Two, then silence. The second one says it is the last. */
export const ASSESS_NUDGE_CAP = 2;
export const ASSESS_NUDGE_GAP_DAYS = 14;
/** Welcome (day 1) and the placement nudge (day 3) own the first week. */
export const ASSESS_NUDGE_MIN_AGE_DAYS = 7;

const P = 'style="margin:14px 0 0;font-size:16px;line-height:1.65;color:#3f3f46;"';

/**
 * ‼️ JENNIFER'S OWN WORDS. These three are copied from the note she wrote for
 * the landing page (readee-site-next components/FounderNote.tsx), which that
 * file says was "sent verbatim, and should stay that way". The first draft of
 * this email had me writing in her voice, and Filip sent it back: "needs to be
 * more personal ... we have her signature and picture to use."
 *
 * The honest way to make a letter from a real person more personal is to use
 * what she actually said, not to get better at imitating her. The only edit
 * is her "your child" becoming the child's name when we know it. If she
 * rewrites the note on the site, change it here to match.
 */
const JEN = {
  who: "I'm a reading teacher with over 6 years of experience teaching kindergarten through 5th grade, and I'm currently teaching 3rd grade.",
  why: "I created Readee because I've seen too many children struggle with reading simply because they haven't been taught the skills they need.",
  ask: (who: string) =>
    `If you're wondering where ${who} stands or what they should be working on, start with our free assessment. You'll get a clear picture of their reading skills and what to work on next.`,
  close: "Every child deserves to feel confident when they read.",
};

/** Her real signature and her name, the way the landing page closes her note. */
function signOff(): string {
  return `
    <p style="margin:22px 0 0;"><img src="${BASE_URL}/images/email/jen-signature.png" alt="Ms. Jennifer Klingerman" width="200" style="display:block;width:200px;height:auto;border:0;" /></p>
    <p style="margin:8px 0 0;font-size:15px;line-height:1.5;color:#1e1b4b;"><strong>Jennifer Klingerman</strong><br/><span style="font-size:13px;color:#71717a;">Reading teacher and co-founder of Readee. M.Ed. Reading, Slippery Rock.</span></p>`;
}

export function renderAssessNudge(opts: {
  parentName: string | null;
  kidName: string | null;
  childId: string | null;
  nth: 1 | 2;
  unsubscribeUrl: string;
}): { subject: string; text: string; html: string } {
  const who = opts.kidName ?? "your child";
  const ask = askFor("unassessed", opts.childId, { ctaLabel: "", ctaHref: "" });
  const hi = opts.parentName ? `Hi ${opts.parentName},` : "Hi there,";

  const first = opts.nth === 1;
  const subject = first ? `Wondering where ${who} stands in reading?` : `One last note about ${who}'s reading assessment`;
  const preheader = first ? "A note from Jen, Readee's reading teacher." : "What the report shows you, and then I'll stop.";

  const gets = [
    `A reading level, next to the grade ${who} is in`,
    `How ${who} did on each skill we checked`,
    "A plan of lessons built from the results",
    "A few things to try at home",
  ];
  const reply = "If you have a question, just reply to this email.";

  // Before and after the list (the first letter has no list).
  const before = first
    ? [JEN.who, JEN.why, JEN.ask(who), `It takes about ten minutes. Find a quiet spot and let ${who} read aloud.`, reply, JEN.close]
    : [`I wrote to you a couple of weeks ago about ${who}'s reading assessment. It hasn't been taken yet, so here is what you get from it.`];
  const after = first ? [] : ["It takes about ten minutes. This is the last reminder I'll send about it.", reply];

  const para = (p: string) => `<p ${P}>${escapeHtml(p)}</p>`;
  const list = `<ul style="margin:12px 0 0;padding-left:20px;font-size:16px;line-height:1.6;color:#3f3f46;">${gets.map((g) => `<li style="margin:4px 0;">${escapeHtml(g)}</li>`).join("")}</ul>`;
  const bodyHtml = before.map(para).join("") + (first ? "" : list) + after.map(para).join("") + signOff();

  const blank = (lines: string[]) => lines.flatMap((l) => [l, ""]);
  const text = [
    hi,
    "",
    ...blank(before),
    ...(first ? [] : [...gets.map((g) => `  - ${g}`), ""]),
    ...blank(after),
    `${ask.ctaLabel}: ${ask.ctaHref}`,
    "",
    "Jen",
    "Jennifer Klingerman",
    "Reading teacher and co-founder of Readee",
    "",
    `Unsubscribe: ${opts.unsubscribeUrl}`,
  ].join("\n");

  // No headline: a letter opens with the reader's name, and the shell falls
  // back to "Hi Dana," when it is given no heading.
  const html = shell({
    preheader,
    parentName: opts.parentName,
    bodyHtml,
    ctaHref: ask.ctaHref,
    ctaLabel: ask.ctaLabel,
    unsubscribeUrl: opts.unsubscribeUrl,
    eyebrow: "A note from Jen",
    portrait: { file: "jen-headshot.jpg", alt: "Jennifer Klingerman" },
  });
  return { subject, text, html };
}

/** Who is due one: pure, so the spacing and the cap can be tested without a database. */
export function assessNudgeDue(input: {
  approved: boolean;
  ageDays: number;
  sentCount: number;
  daysSinceLast: number | null;
}): { due: false } | { due: true; nth: 1 | 2 } {
  if (!input.approved) return { due: false };
  if (input.ageDays < ASSESS_NUDGE_MIN_AGE_DAYS) return { due: false };
  if (input.sentCount >= ASSESS_NUDGE_CAP) return { due: false };
  if (input.sentCount > 0 && (input.daysSinceLast ?? 0) < ASSESS_NUDGE_GAP_DAYS) return { due: false };
  return { due: true, nth: input.sentCount === 0 ? 1 : 2 };
}

/**
 * The proof for the team inbox: both versions exactly as a family would get
 * them, how many families the first morning reaches, and Approve / Cancel.
 * These go out in Jennifer's name, so she should have read them first.
 */
export function buildAssessNudgePreview(dueNow: number): { subject: string; html: string } {
  const sample = (nth: 1 | 2) =>
    renderAssessNudge({ parentName: "Dana", kidName: "Maya", childId: null, nth, unsubscribeUrl: `${BASE_URL}/account/unsubscribe/weekly` });
  const strip = (html: string) => html.replace(/<!doctype html>|<\/?html>|<\/?body[^>]*>/gi, "");
  const button = (action: "approve" | "cancel") => {
    const primary = action === "approve";
    const href = `${BASE_URL}/api/announcements/action?id=${ASSESS_NUDGE_ID}&a=${action}&t=${announceToken(ASSESS_NUDGE_ID, action)}`;
    return `<a href="${href}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 18px;border-radius:12px;background:${primary ? "#6d28d9" : "#f4f4f5"};color:${primary ? "#ffffff" : "#4c1d95"};font-size:14px;font-weight:700;text-decoration:none;border:1px solid ${primary ? "#6d28d9" : "#e4e4e7"};">${escapeHtml(ANNOUNCE_LABEL[action])}</a>`;
  };
  const [one, two] = [sample(1), sample(2)];
  const h2 = 'style="margin:22px 0 8px;font-size:15px;color:#1e1b4b;"';

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f0f0e4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:28px 14px;"><tr><td align="center">
    <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;width:100%;">
      <tr><td style="background:#ffffff;border:1px solid #e6e6d6;border-radius:18px;padding:24px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#71717a;">Waiting for your approval</p>
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#1e1b4b;">The reading assessment reminder, from Jennifer</h1>
        <p style="margin:0 0 10px;font-size:14px;line-height:1.55;color:#3f3f46;">
          For families who signed up at least ${ASSESS_NUDGE_MIN_AGE_DAYS} days ago and have never taken the assessment. <strong>${dueNow}</strong> ${dueNow === 1 ? "family is" : "families are"} due the first one the morning after you approve, then each new family as it reaches day ${ASSESS_NUDGE_MIN_AGE_DAYS}. The second goes ${ASSESS_NUDGE_GAP_DAYS} days after the first, and then it stops.
        </p>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#3f3f46;">
          It replaces the weekly "hasn't read in N days" email for these families, which is paused for them either way, since they never started reading. Nothing sends until you approve.
        </p>
        ${button("approve")}${button("cancel")}
        <h2 ${h2}>First email</h2>
        <p style="margin:0;font-size:13px;color:#71717a;">Subject: ${escapeHtml(one.subject)}</p>
      </td></tr>
      <tr><td style="padding-top:14px;">${strip(one.html)}</td></tr>
      <tr><td style="padding-top:14px;"><div style="background:#ffffff;border:1px solid #e6e6d6;border-radius:18px;padding:16px 24px;">
        <h2 style="margin:0 0 6px;font-size:15px;color:#1e1b4b;">Second and last email, ${ASSESS_NUDGE_GAP_DAYS} days later</h2>
        <p style="margin:0;font-size:13px;color:#71717a;">Subject: ${escapeHtml(two.subject)}</p>
      </div></td></tr>
      <tr><td style="padding-top:14px;">${strip(two.html)}</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  return { subject: "Approve? · Reading assessment reminder from Jennifer", html };
}

export async function sendAssessNudgePreview(dueNow: number): Promise<{ ok: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: "RESEND_API_KEY not set" };
  const { subject, html } = buildAssessNudgePreview(dueNow);
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
