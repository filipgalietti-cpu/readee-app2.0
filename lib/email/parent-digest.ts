/**
 * Weekly parent digest — assembled per parent from last-7-days activity.
 *
 * Data we pull (kept cheap, one query per source):
 *   - children owned by the parent
 *   - practice_results in the window, grouped by child + standard_id
 *   - lessons_progress in the window, for "lessons finished"
 *
 * From those we compute:
 *   - passages / lessons finished per child
 *   - comprehension % (sum correct / sum attempted)
 *   - weakest standard (lowest accuracy with at least 4 attempts)
 *
 * Then we build a subject + HTML + text and hand off to Resend.
 *
 * Parents with zero activity across all children get SKIPPED — no
 * point emailing "Nothing happened this week." It's a nudge to come
 * back, and nothing to nudge about isn't useful.
 */

import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/admin";

const FROM = "Readee <hello@readee.app>";
const BASE_URL = "https://learn.readee.app";

type ChildSummary = {
  childId: string;
  firstName: string;
  passagesFinished: number;
  questionsAttempted: number;
  questionsCorrect: number;
  comprehensionPct: number | null;
  weakestStandard: {
    standard_id: string;
    accuracy: number;
    attempted: number;
  } | null;
};

function weekStartIso(now = new Date()): string {
  // Monday of the current US-Eastern week, UTC-safe.
  const d = new Date(now);
  const day = d.getUTCDay();
  const diff = (day + 6) % 7; // 0 = Monday
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

async function buildParentSummary(parentId: string): Promise<{
  parentEmail: string | null;
  parentName: string | null;
  children: ChildSummary[];
}> {
  const admin = supabaseAdmin();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: profile }, { data: kids }] = await Promise.all([
    admin
      .from("profiles")
      .select("email, display_name")
      .eq("id", parentId)
      .single(),
    admin
      .from("children")
      .select("id, first_name")
      .eq("parent_id", parentId),
  ]);

  const children = (kids ?? []) as { id: string; first_name: string }[];
  if (children.length === 0) {
    return {
      parentEmail: (profile as any)?.email ?? null,
      parentName:
        (profile as any)?.display_name ??
        (profile as any)?.email?.split("@")[0] ??
        null,
      children: [],
    };
  }

  const childIds = children.map((c) => c.id);
  const [{ data: practiceRows }, { data: lessonRows }] = await Promise.all([
    admin
      .from("practice_results")
      .select("child_id, standard_id, questions_attempted, questions_correct, created_at")
      .in("child_id", childIds)
      .gte("created_at", since),
    admin
      .from("lessons_progress")
      .select("child_id, lesson_id, section, created_at")
      .in("child_id", childIds)
      .eq("section", "learn")
      .gte("created_at", since),
  ]);

  const summaries: ChildSummary[] = children.map((c) => {
    const rows = (practiceRows ?? []).filter((r: any) => r.child_id === c.id);
    const attempted = rows.reduce(
      (s: number, r: any) => s + Number(r.questions_attempted ?? 0),
      0,
    );
    const correct = rows.reduce(
      (s: number, r: any) => s + Number(r.questions_correct ?? 0),
      0,
    );
    const comprehensionPct = attempted > 0 ? Math.round((correct / attempted) * 100) : null;

    // Weakest standard = lowest accuracy with at least 4 attempts.
    const byStd = new Map<string, { attempted: number; correct: number }>();
    for (const r of rows as any[]) {
      const k = r.standard_id as string;
      const agg = byStd.get(k) ?? { attempted: 0, correct: 0 };
      agg.attempted += Number(r.questions_attempted ?? 0);
      agg.correct += Number(r.questions_correct ?? 0);
      byStd.set(k, agg);
    }
    let weakest: ChildSummary["weakestStandard"] = null;
    for (const [std, v] of byStd) {
      if (v.attempted < 4) continue;
      const acc = v.correct / v.attempted;
      if (!weakest || acc < weakest.accuracy) {
        weakest = { standard_id: std, accuracy: acc, attempted: v.attempted };
      }
    }

    const passagesFinished = (lessonRows ?? []).filter(
      (r: any) => r.child_id === c.id,
    ).length;

    return {
      childId: c.id,
      firstName: c.first_name,
      passagesFinished,
      questionsAttempted: attempted,
      questionsCorrect: correct,
      comprehensionPct,
      weakestStandard: weakest,
    };
  });

  return {
    parentEmail: (profile as any)?.email ?? null,
    parentName:
      (profile as any)?.display_name ??
      (profile as any)?.email?.split("@")[0] ??
      null,
    children: summaries,
  };
}

function hasActivity(children: ChildSummary[]): boolean {
  return children.some((c) => c.questionsAttempted > 0 || c.passagesFinished > 0);
}

function renderDigest(input: {
  parentName: string | null;
  children: ChildSummary[];
  unsubscribeUrl: string;
}): { subject: string; text: string; html: string } {
  const activeKids = input.children.filter(
    (c) => c.questionsAttempted > 0 || c.passagesFinished > 0,
  );
  const leadKid = activeKids[0];
  const subject =
    activeKids.length === 1
      ? `${leadKid.firstName}'s Readee week — ${leadKid.questionsAttempted} questions, ${
          leadKid.comprehensionPct ?? "—"
        }% correct`
      : `Your family's Readee week — ${activeKids
          .map((c) => c.firstName)
          .join(", ")}`;

  const greeting = input.parentName ? `Hi ${input.parentName},` : "Hi there,";

  const text = [
    greeting,
    "",
    "Here's what your family read on Readee this week:",
    "",
    ...input.children.map((c) => {
      const lines: string[] = [`— ${c.firstName}:`];
      if (c.passagesFinished > 0) lines.push(`  · ${c.passagesFinished} passage(s) finished`);
      if (c.questionsAttempted > 0)
        lines.push(
          `  · ${c.questionsCorrect} / ${c.questionsAttempted} comprehension correct (${c.comprehensionPct}%)`,
        );
      if (c.weakestStandard)
        lines.push(
          `  · Working on: ${c.weakestStandard.standard_id} (${Math.round(c.weakestStandard.accuracy * 100)}% so far)`,
        );
      if (c.passagesFinished === 0 && c.questionsAttempted === 0)
        lines.push("  · No Readee time this week — try a passage together tonight!");
      return lines.join("\n");
    }),
    "",
    `Keep the streak going: ${BASE_URL}/dashboard`,
    "",
    `To stop these weekly emails: ${input.unsubscribeUrl}`,
    "— Readee",
  ].join("\n");

  const childBlocks = input.children
    .map((c) => {
      const weakestLine = c.weakestStandard
        ? `<div style="margin-top:4px;font-size:13px;color:#6b7280;">Working on <a href="${BASE_URL}/standards/${slug(c.weakestStandard.standard_id)}" style="color:#4f46e5;text-decoration:none;font-weight:600;">${escapeHtml(c.weakestStandard.standard_id)}</a> — ${Math.round(c.weakestStandard.accuracy * 100)}% correct so far</div>`
        : "";
      const metric =
        c.questionsAttempted > 0
          ? `<div style="font-size:26px;font-weight:800;color:#4f46e5;">${c.comprehensionPct}%</div><div style="font-size:12px;color:#71717a;">comprehension</div>`
          : `<div style="font-size:13px;color:#71717a;margin-top:8px;">No Readee time this week. A quick 10-minute passage tonight would bring the streak back.</div>`;
      return `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border:1px solid #e4e4e7;border-radius:12px;background:#ffffff;">
          <tr>
            <td style="padding:16px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                <div>
                  <div style="font-size:15px;font-weight:700;color:#18181b;">${escapeHtml(c.firstName)}</div>
                  <div style="margin-top:4px;font-size:13px;color:#6b7280;">
                    ${c.passagesFinished} passage${c.passagesFinished === 1 ? "" : "s"} &middot;
                    ${c.questionsAttempted} question${c.questionsAttempted === 1 ? "" : "s"}
                  </div>
                  ${weakestLine}
                </div>
                <div style="text-align:right;">${metric}</div>
              </div>
            </td>
          </tr>
        </table>`;
    })
    .join("");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td>
                <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;color:#4f46e5;text-transform:uppercase;">Your Readee week</div>
                <h1 style="margin:8px 0 0;font-size:24px;font-weight:800;color:#18181b;">${escapeHtml(greeting)}</h1>
                <p style="margin:12px 0 0;font-size:15px;line-height:1.5;color:#3f3f46;">
                  Here's what your family read on Readee this week.
                </p>
                ${childBlocks}
                <div style="margin-top:24px;text-align:center;">
                  <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#4f46e5;color:#ffffff;padding:12px 24px;border-radius:999px;font-weight:700;font-size:14px;text-decoration:none;">Keep the streak going</a>
                </div>
                <p style="margin:32px 0 0;font-size:12px;color:#a1a1aa;text-align:center;line-height:1.6;">
                  You're getting this because you have a child on Readee.<br/>
                  <a href="${input.unsubscribeUrl}" style="color:#a1a1aa;">Unsubscribe from weekly updates</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}

function slug(id: string): string {
  return id.toLowerCase().replace(/\./g, "-");
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

/** Signed (HMAC) unsubscribe token — cheap, stateless. */
function unsubscribeToken(parentId: string): string {
  // Reuse simple deterministic scheme; if you want to rotate on compromise
  // add a UNSUBSCRIBE_SECRET env var and switch to crypto.createHmac.
  const b64 = Buffer.from(`${parentId}:${new Date().toISOString().slice(0, 10)}`).toString(
    "base64url",
  );
  return b64;
}

export async function sendWeeklyDigestToParent(parentId: string): Promise<
  { ok: true; sent: true } | { ok: true; sent: false; reason: string } | { ok: false; error: string }
> {
  const admin = supabaseAdmin();

  // Confirm the parent has digest enabled.
  const { data: profile } = await admin
    .from("profiles")
    .select("email, email_weekly_digest")
    .eq("id", parentId)
    .single();
  if (!profile) return { ok: false, error: "Profile not found" };
  if (!(profile as any).email_weekly_digest) {
    return { ok: true, sent: false, reason: "unsubscribed" };
  }
  if (!(profile as any).email) {
    return { ok: true, sent: false, reason: "no_email" };
  }

  // Idempotency: skip if we already sent this week.
  const weekStart = weekStartIso();
  const { data: existing } = await admin
    .from("parent_digest_sends")
    .select("id")
    .eq("parent_id", parentId)
    .eq("week_start", weekStart)
    .maybeSingle();
  if (existing) return { ok: true, sent: false, reason: "already_sent" };

  const summary = await buildParentSummary(parentId);
  if (summary.children.length === 0) {
    return { ok: true, sent: false, reason: "no_children" };
  }
  if (!hasActivity(summary.children)) {
    return { ok: true, sent: false, reason: "no_activity" };
  }

  const unsubscribeUrl = `${BASE_URL}/account/unsubscribe/weekly?t=${unsubscribeToken(parentId)}&u=${parentId}`;
  const email = renderDigest({
    parentName: summary.parentName,
    children: summary.children,
    unsubscribeUrl,
  });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from: FROM,
    to: (profile as any).email,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
  if ((result as any).error) {
    await admin.from("parent_digest_sends").insert({
      parent_id: parentId,
      week_start: weekStart,
      children_count: summary.children.length,
      error: String((result as any).error?.message ?? (result as any).error),
    });
    return { ok: false, error: String((result as any).error?.message ?? "send failed") };
  }
  await admin.from("parent_digest_sends").insert({
    parent_id: parentId,
    week_start: weekStart,
    children_count: summary.children.length,
  });
  return { ok: true, sent: true };
}

/** Run the digest for every eligible parent — called by cron endpoint. */
export async function sendWeeklyDigestBatch(): Promise<{
  processed: number;
  sent: number;
  skipped: number;
  errors: number;
}> {
  const admin = supabaseAdmin();
  const { data: parents } = await admin
    .from("profiles")
    .select("id")
    .eq("email_weekly_digest", true);
  let sent = 0;
  let skipped = 0;
  let errors = 0;
  for (const p of (parents ?? []) as any[]) {
    try {
      const res = await sendWeeklyDigestToParent(p.id);
      if (res.ok && "sent" in res && res.sent) sent++;
      else if (res.ok) skipped++;
      else errors++;
    } catch {
      errors++;
    }
  }
  return { processed: (parents ?? []).length, sent, skipped, errors };
}
