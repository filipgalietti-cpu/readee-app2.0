/**
 * Behavioral lifecycle emails. Three stages — kept narrow on purpose:
 *
 *   1. 'welcome'            — 1 day after signup. Friendly "how to start."
 *   2. 'first_lesson_nudge' — 3 days after signup, only if no kid has
 *                             finished a lesson yet. A 60-second nudge.
 *   3. 're_engage'          — kid has not had any practice/lesson
 *                             activity in 7+ days. Sent at most once a
 *                             week (unique (profile_id, stage, send_date)
 *                             with a 7-day cooldown enforced in code).
 *
 * Idempotency: every send writes a row to `lifecycle_email_sends`
 * keyed (profile_id, stage, send_date). The cron checks for existence
 * BEFORE sending. This is the lock — never trust in-memory state.
 *
 * Unsubscribe: parents who set `email_weekly_digest = false` are
 * excluded entirely. We don't have a separate "lifecycle" toggle yet —
 * one switch covers all behavioral email. Filip can split it later if
 * the unsubscribe rate diverges.
 */

import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/admin";

const FROM = "Readee <hello@readee.app>";
const BASE_URL = "https://learn.readee.app";

const DAY_MS = 24 * 60 * 60 * 1000;

type Stage = "welcome" | "first_lesson_nudge" | "re_engage";

type ParentRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  email_weekly_digest: boolean;
};

function unsubscribeToken(parentId: string): string {
  const b64 = Buffer.from(`${parentId}:${new Date().toISOString().slice(0, 10)}`).toString(
    "base64url",
  );
  return b64;
}

function escapeHtml(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function shell(opts: {
  preheader: string;
  parentName: string | null;
  bodyHtml: string;
  ctaHref: string;
  ctaLabel: string;
  unsubscribeUrl: string;
}): string {
  const greeting = opts.parentName ? `Hi ${opts.parentName},` : "Hi there,";
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
    <div style="display:none;max-height:0;overflow:hidden;color:#f7f7fb;">${escapeHtml(opts.preheader)}</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td>
                <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;color:#4f46e5;text-transform:uppercase;">Readee</div>
                <h1 style="margin:8px 0 0;font-size:24px;font-weight:800;color:#18181b;">${escapeHtml(greeting)}</h1>
                ${opts.bodyHtml}
                <div style="margin-top:24px;text-align:center;">
                  <a href="${opts.ctaHref}" style="display:inline-block;background:#4f46e5;color:#ffffff;padding:12px 24px;border-radius:999px;font-weight:700;font-size:14px;text-decoration:none;">${escapeHtml(opts.ctaLabel)}</a>
                </div>
                <p style="margin:32px 0 0;font-size:12px;color:#a1a1aa;text-align:center;line-height:1.6;">
                  You're getting this because you have a Readee account.<br/>
                  <a href="${opts.unsubscribeUrl}" style="color:#a1a1aa;">Unsubscribe</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderWelcome(parentName: string | null, kidName: string | null, unsubscribeUrl: string) {
  const subject = kidName
    ? `Welcome to Readee — let's start ${kidName}'s first lesson`
    : "Welcome to Readee — your first lesson is ready";
  const lead = kidName
    ? `Glad ${kidName} is here. Readee works best when you do a short lesson together every day — most families spend about 10 minutes.`
    : `Glad you're here. Readee works best when your reader does a short lesson every day — most families spend about 10 minutes.`;
  const text = [
    parentName ? `Hi ${parentName},` : "Hi there,",
    "",
    lead,
    "",
    "Start here:",
    `${BASE_URL}/dashboard`,
    "",
    "Three things worth knowing:",
    "  · Every lesson is read-aloud with karaoke highlighting (great for emerging readers).",
    "  · Practice questions teach to Common Core ELA standards — no test prep filler.",
    "  · You'll get a weekly summary every Monday — what they read, what they're working on.",
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
    "— Readee",
  ].join("\n");
  const bodyHtml = `
    <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#3f3f46;">${escapeHtml(lead)}</p>
    <ul style="margin:16px 0 0;padding-left:18px;font-size:14px;line-height:1.6;color:#3f3f46;">
      <li>Read-aloud lessons with karaoke highlighting — great for emerging readers.</li>
      <li>Practice questions taught to Common Core ELA standards.</li>
      <li>You'll get a weekly summary every Monday.</li>
    </ul>`;
  const html = shell({
    preheader: "Your first Readee lesson is ready.",
    parentName,
    bodyHtml,
    ctaHref: `${BASE_URL}/dashboard`,
    ctaLabel: "Start the first lesson",
    unsubscribeUrl,
  });
  return { subject, text, html };
}

function renderFirstLessonNudge(
  parentName: string | null,
  kidName: string | null,
  unsubscribeUrl: string,
) {
  const subject = kidName
    ? `${kidName} hasn't started yet — try a 10-minute lesson tonight`
    : "Your reader hasn't started yet — try a 10-minute lesson tonight";
  const lead = kidName
    ? `${kidName}'s account is set up, but no lesson finished yet. A single 10-minute Readee session is usually enough to make tomorrow's session easier.`
    : `Your reader's account is set up, but no lesson finished yet. A single 10-minute Readee session is usually enough to make tomorrow's session easier.`;
  const text = [
    parentName ? `Hi ${parentName},` : "Hi there,",
    "",
    lead,
    "",
    "Tonight's quick win:",
    "  1. Open Readee together.",
    "  2. Tap the green lesson card on the dashboard.",
    "  3. Let the bunny read the first slide aloud.",
    "",
    `${BASE_URL}/dashboard`,
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
    "— Readee",
  ].join("\n");
  const bodyHtml = `
    <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#3f3f46;">${escapeHtml(lead)}</p>
    <ol style="margin:16px 0 0;padding-left:18px;font-size:14px;line-height:1.6;color:#3f3f46;">
      <li>Open Readee together.</li>
      <li>Tap the green lesson card on the dashboard.</li>
      <li>Let the bunny read the first slide aloud.</li>
    </ol>`;
  const html = shell({
    preheader: "A 10-minute lesson tonight makes tomorrow easier.",
    parentName,
    bodyHtml,
    ctaHref: `${BASE_URL}/dashboard`,
    ctaLabel: "Start tonight's lesson",
    unsubscribeUrl,
  });
  return { subject, text, html };
}

function renderReEngage(
  parentName: string | null,
  kidName: string | null,
  daysSince: number,
  unsubscribeUrl: string,
) {
  const subject = kidName
    ? `${kidName} hasn't read on Readee in ${daysSince} days`
    : `Your reader hasn't been on Readee in ${daysSince} days`;
  const lead = kidName
    ? `${kidName} hasn't logged a lesson in ${daysSince} days. Reading streaks rebuild fast — one short session tonight is enough.`
    : `Your reader hasn't logged a lesson in ${daysSince} days. Reading streaks rebuild fast — one short session tonight is enough.`;
  const text = [
    parentName ? `Hi ${parentName},` : "Hi there,",
    "",
    lead,
    "",
    "Pick the easiest path back in:",
    `  · A 5-minute story: ${BASE_URL}/stories`,
    `  · A single practice question: ${BASE_URL}/practice-hub`,
    `  · The day's lesson: ${BASE_URL}/today`,
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
    "— Readee",
  ].join("\n");
  const bodyHtml = `
    <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#3f3f46;">${escapeHtml(lead)}</p>
    <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#3f3f46;">Pick the easiest path back in:</p>
    <ul style="margin:8px 0 0;padding-left:18px;font-size:14px;line-height:1.6;color:#3f3f46;">
      <li><a href="${BASE_URL}/stories" style="color:#4f46e5;text-decoration:none;font-weight:600;">A 5-minute story</a></li>
      <li><a href="${BASE_URL}/practice-hub" style="color:#4f46e5;text-decoration:none;font-weight:600;">A single practice question</a></li>
      <li><a href="${BASE_URL}/today" style="color:#4f46e5;text-decoration:none;font-weight:600;">Today's lesson</a></li>
    </ul>`;
  const html = shell({
    preheader: "One short session rebuilds the streak.",
    parentName,
    bodyHtml,
    ctaHref: `${BASE_URL}/today`,
    ctaLabel: "Try a quick session",
    unsubscribeUrl,
  });
  return { subject, text, html };
}

async function alreadySentToday(parentId: string, stage: Stage): Promise<boolean> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("lifecycle_email_sends")
    .select("id")
    .eq("profile_id", parentId)
    .eq("stage", stage)
    .eq("send_date", new Date().toISOString().slice(0, 10))
    .maybeSingle();
  return !!data;
}

async function alreadySentEver(parentId: string, stage: Stage): Promise<boolean> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("lifecycle_email_sends")
    .select("id")
    .eq("profile_id", parentId)
    .eq("stage", stage)
    .limit(1)
    .maybeSingle();
  return !!data;
}

async function lastReEngageSentAt(parentId: string): Promise<Date | null> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("lifecycle_email_sends")
    .select("sent_at")
    .eq("profile_id", parentId)
    .eq("stage", "re_engage")
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? new Date((data as any).sent_at) : null;
}

async function recordSend(
  parentId: string,
  stage: Stage,
  status: "sent" | "failed" | "skipped",
  errorMessage?: string,
) {
  const admin = supabaseAdmin();
  await admin.from("lifecycle_email_sends").insert({
    profile_id: parentId,
    stage,
    status,
    error_message: errorMessage ?? null,
  });
}

async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not configured" };
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
  if ((result as any).error) {
    return {
      ok: false,
      error: String((result as any).error?.message ?? (result as any).error),
    };
  }
  return { ok: true };
}

async function firstKidName(parentId: string): Promise<string | null> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("children")
    .select("first_name, created_at")
    .eq("parent_id", parentId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data as any)?.first_name ?? null;
}

async function anyChildHasFinishedLesson(parentId: string): Promise<boolean> {
  const admin = supabaseAdmin();
  const { data: kids } = await admin.from("children").select("id").eq("parent_id", parentId);
  const ids = ((kids ?? []) as any[]).map((k) => k.id);
  if (ids.length === 0) return false;
  const { data: rows } = await admin
    .from("lessons_progress")
    .select("id")
    .in("child_id", ids)
    .eq("section", "learn")
    .limit(1);
  return ((rows ?? []) as any[]).length > 0;
}

async function lastActivityAt(parentId: string): Promise<Date | null> {
  const admin = supabaseAdmin();
  const { data: kids } = await admin.from("children").select("id").eq("parent_id", parentId);
  const ids = ((kids ?? []) as any[]).map((k) => k.id);
  if (ids.length === 0) return null;
  const [{ data: lessonRow }, { data: practiceRow }] = await Promise.all([
    admin
      .from("lessons_progress")
      .select("created_at")
      .in("child_id", ids)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("practice_results")
      .select("created_at")
      .in("child_id", ids)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const candidates: Date[] = [];
  if (lessonRow) candidates.push(new Date((lessonRow as any).created_at));
  if (practiceRow) candidates.push(new Date((practiceRow as any).created_at));
  if (candidates.length === 0) return null;
  return new Date(Math.max(...candidates.map((d) => d.getTime())));
}

type StageResult =
  | { ok: true; sent: true; stage: Stage }
  | { ok: true; sent: false; reason: string }
  | { ok: false; error: string; stage: Stage };

/**
 * Decide which (if any) lifecycle stage to send to this parent right
 * now, then send it. Sends at most one stage per call — re-engage
 * never fights with the welcome funnel for the same inbox slot.
 */
export async function evaluateAndSendLifecycle(parent: ParentRow): Promise<StageResult> {
  if (!parent.email) return { ok: true, sent: false, reason: "no_email" };
  if (!parent.email_weekly_digest) {
    return { ok: true, sent: false, reason: "unsubscribed" };
  }

  const now = Date.now();
  const ageDays = (now - new Date(parent.created_at).getTime()) / DAY_MS;
  const unsubscribeUrl = `${BASE_URL}/account/unsubscribe/weekly?t=${unsubscribeToken(
    parent.id,
  )}&u=${parent.id}`;
  const displayName =
    parent.display_name ?? parent.email?.split("@")[0]?.split(/[^a-zA-Z]/)[0] ?? null;

  // Stage 1: welcome — between day 1 and day 3 after signup, sent once ever.
  if (ageDays >= 1 && ageDays < 3) {
    if (await alreadySentEver(parent.id, "welcome")) {
      // fall through — maybe another stage applies
    } else {
      const kidName = await firstKidName(parent.id);
      const email = renderWelcome(displayName, kidName, unsubscribeUrl);
      const res = await sendEmail({
        to: parent.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });
      if (!res.ok) {
        await recordSend(parent.id, "welcome", "failed", res.error);
        return { ok: false, error: res.error, stage: "welcome" };
      }
      await recordSend(parent.id, "welcome", "sent");
      return { ok: true, sent: true, stage: "welcome" };
    }
  }

  // Stage 2: first-lesson nudge — day 3 to 5 after signup, only if no
  // kid has finished a lesson yet, sent once ever.
  if (ageDays >= 3 && ageDays < 5) {
    if (!(await alreadySentEver(parent.id, "first_lesson_nudge"))) {
      const finished = await anyChildHasFinishedLesson(parent.id);
      if (!finished) {
        const kidName = await firstKidName(parent.id);
        const email = renderFirstLessonNudge(displayName, kidName, unsubscribeUrl);
        const res = await sendEmail({
          to: parent.email,
          subject: email.subject,
          text: email.text,
          html: email.html,
        });
        if (!res.ok) {
          await recordSend(parent.id, "first_lesson_nudge", "failed", res.error);
          return { ok: false, error: res.error, stage: "first_lesson_nudge" };
        }
        await recordSend(parent.id, "first_lesson_nudge", "sent");
        return { ok: true, sent: true, stage: "first_lesson_nudge" };
      }
    }
  }

  // Stage 3: re-engage — kid hasn't been active for 7+ days. Sent at
  // most once every 7 days, and not in the first 7 days of signup
  // (welcome/first-lesson cover that period).
  if (ageDays >= 7) {
    const last = await lastActivityAt(parent.id);
    const daysSince = last ? Math.floor((now - last.getTime()) / DAY_MS) : Math.floor(ageDays);
    if (daysSince >= 7) {
      const lastSent = await lastReEngageSentAt(parent.id);
      const daysSinceLastSend = lastSent ? (now - lastSent.getTime()) / DAY_MS : Infinity;
      if (daysSinceLastSend >= 7 && !(await alreadySentToday(parent.id, "re_engage"))) {
        const kidName = await firstKidName(parent.id);
        const email = renderReEngage(displayName, kidName, daysSince, unsubscribeUrl);
        const res = await sendEmail({
          to: parent.email,
          subject: email.subject,
          text: email.text,
          html: email.html,
        });
        if (!res.ok) {
          await recordSend(parent.id, "re_engage", "failed", res.error);
          return { ok: false, error: res.error, stage: "re_engage" };
        }
        await recordSend(parent.id, "re_engage", "sent");
        return { ok: true, sent: true, stage: "re_engage" };
      }
    }
  }

  return { ok: true, sent: false, reason: "no_stage_applies" };
}

/**
 * Sweep every eligible parent and send at most one lifecycle email
 * each. Skips unsubscribed and emailless rows up front.
 */
export async function sendLifecycleBatch(): Promise<{
  processed: number;
  sent: number;
  skipped: number;
  errors: number;
  byStage: Record<Stage, number>;
}> {
  const admin = supabaseAdmin();
  const { data: parents } = await admin
    .from("profiles")
    .select("id, email, display_name, created_at, email_weekly_digest")
    .eq("email_weekly_digest", true)
    .not("email", "is", null);

  const byStage: Record<Stage, number> = {
    welcome: 0,
    first_lesson_nudge: 0,
    re_engage: 0,
  };
  let sent = 0;
  let skipped = 0;
  let errors = 0;
  for (const p of (parents ?? []) as ParentRow[]) {
    try {
      const res = await evaluateAndSendLifecycle(p);
      if (res.ok && "sent" in res && res.sent) {
        sent++;
        if ("stage" in res) byStage[res.stage]++;
      } else if (res.ok) {
        skipped++;
      } else {
        errors++;
      }
    } catch {
      errors++;
    }
  }
  return {
    processed: (parents ?? []).length,
    sent,
    skipped,
    errors,
    byStage,
  };
}
