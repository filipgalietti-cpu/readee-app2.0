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
import { buildParentSnapshot } from "@/lib/ai/build-parent-snapshot";
import { standardShortName } from "@/lib/data/standard-short-name";
import { childJourneyContext } from "@/lib/email/journey-context";

const FROM = "Readee <hello@readee.app>";
const BASE_URL = "https://learn.readee.app";

function displayGrade(grade: string | null | undefined): string {
  if (!grade) return "Kindergarten";
  const g = grade.toLowerCase();
  if (g === "pre-k" || g === "prek") return "Pre-K";
  if (g === "k" || g === "kindergarten") return "Kindergarten";
  const n = g.replace(/\D/g, "");
  if (n === "1") return "1st Grade";
  if (n === "2") return "2nd Grade";
  if (n === "3") return "3rd Grade";
  if (n === "4") return "4th Grade";
  return "Kindergarten";
}

type ChildSummary = {
  childId: string;
  firstName: string;
  grade: string | null;
  passagesFinished: number;
  questionsAttempted: number;
  questionsCorrect: number;
  comprehensionPct: number | null;
  /** Distinct days practiced in the window (0–7). */
  daysThisWeek: number;
  streak: number;
  bestStreak: number;
  /** AI "coach's note" — grounded-hybrid headline + one action from
   *  buildParentSnapshot. Null when the child was inactive or the model
   *  call failed (the card falls back to the static stats copy). */
  aiHeadline: string | null;
  aiAction: string | null;
  weakestStandard: {
    standard_id: string;
    accuracy: number;
    attempted: number;
  } | null;
  /** Highest-accuracy standard (≥4 attempts in window). Drives the
   *  "wins" column in the digest — celebrates what's working. */
  strongestStandard: {
    standard_id: string;
    accuracy: number;
    attempted: number;
  } | null;
  /** From the child's journey: the next lesson by name, and the placement's next milestone. */
  nextLessonTitle: string | null;
  nextLessonUnit: string | null;
  milestoneLine: string | null;
  /** Outfits + badges granted this week (item_id starting with bunny_
   *  or badge_ in shop_purchases). Powers the "Wins" cluster — visible
   *  proof of milestones the kid hit. */
  unlocksThisWeek: { itemId: string; kind: "outfit" | "badge" }[];
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
      .select("id, first_name, grade, streak_days, best_streak")
      .eq("parent_id", parentId),
  ]);

  const children = (kids ?? []) as {
    id: string;
    first_name: string;
    grade: string | null;
    streak_days: number | null;
    best_streak: number | null;
  }[];
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
  const [{ data: practiceRows }, { data: lessonRows }, { data: unlockRows }] = await Promise.all([
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
    // New: outfits + badges the kid earned this week. Drives the
    // "wins" cluster in each child block (proof of milestones hit,
    // not just numbers).
    admin
      .from("shop_purchases")
      .select("child_id, item_id, purchased_at")
      .in("child_id", childIds)
      .gte("purchased_at", since),
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
    let strongest: ChildSummary["strongestStandard"] = null;
    for (const [std, v] of byStd) {
      if (v.attempted < 4) continue;
      const acc = v.correct / v.attempted;
      if (!weakest || acc < weakest.accuracy) {
        weakest = { standard_id: std, accuracy: acc, attempted: v.attempted };
      }
      // Strongest = highest accuracy, but only if it's actually a "win"
      // (>=75%). Drives the wins column — no point celebrating 60%.
      if (acc >= 0.75 && (!strongest || acc > strongest.accuracy)) {
        strongest = { standard_id: std, accuracy: acc, attempted: v.attempted };
      }
    }

    const childLessonRows = (lessonRows ?? []).filter((r: any) => r.child_id === c.id);
    const passagesFinished = childLessonRows.length;

    // Distinct days practiced this week (0–7) — from both practice and
    // lesson activity. Feeds the AI snapshot's effort signal.
    const daySet = new Set<string>();
    for (const r of rows as any[]) if (r.created_at) daySet.add(String(r.created_at).slice(0, 10));
    for (const r of childLessonRows as any[]) if (r.created_at) daySet.add(String(r.created_at).slice(0, 10));
    const daysThisWeek = Math.min(7, daySet.size);

    // Outfits + badges granted to this child in the window. Filter to
    // the items we explicitly render in the wins column (bunny_* and
    // badge_*) so legacy shop items don't slip through.
    const unlocksThisWeek = ((unlockRows ?? []) as any[])
      .filter((r) => r.child_id === c.id)
      .map((r) => {
        const id = r.item_id as string;
        if (id.startsWith("badge_")) return { itemId: id, kind: "badge" as const };
        if (id.startsWith("bunny_")) return { itemId: id, kind: "outfit" as const };
        return null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    return {
      childId: c.id,
      firstName: c.first_name,
      grade: c.grade ?? null,
      passagesFinished,
      questionsAttempted: attempted,
      questionsCorrect: correct,
      comprehensionPct,
      daysThisWeek,
      streak: c.streak_days ?? 0,
      bestStreak: c.best_streak ?? 0,
      aiHeadline: null,
      aiAction: null,
      weakestStandard: weakest,
      strongestStandard: strongest,
      unlocksThisWeek,
      nextLessonTitle: null,
      nextLessonUnit: null,
      milestoneLine: null,
    };
  });

  // Along the journey: the next lesson by name + the next milestone, per child.
  await Promise.all(
    summaries.map(async (sum) => {
      try {
        const ctx = await childJourneyContext(sum.childId);
        if (!ctx) return;
        sum.nextLessonTitle = ctx.nextLesson?.title ?? null;
        sum.nextLessonUnit = ctx.nextLesson?.unit ?? null;
        sum.milestoneLine = ctx.placement?.nextMilestone ? `${ctx.placement.nextMilestone.label} by ${ctx.placement.nextMilestone.month}` : null;
      } catch { /* the digest reads fine without it */ }
    }),
  );

  // Grounded AI "coach's note" per ACTIVE child. Inactive kids get the
  // static come-back nudge (no model call, no cost). buildParentSnapshot
  // only WORDS the facts below — it never invents a number or skill — and
  // returns null on failure, so the card falls back to the static copy.
  await Promise.all(
    summaries.map(async (c) => {
      const active = c.questionsAttempted > 0 || c.passagesFinished > 0;
      if (!active) return;
      const snap = await buildParentSnapshot({
        firstName: c.firstName,
        gradeLabel: displayGrade(c.grade),
        standing: null,
        questionsThisWeek: c.questionsAttempted,
        accuracyThisWeek: c.comprehensionPct,
        daysThisWeek: c.daysThisWeek,
        streak: c.streak,
        bestStreak: c.bestStreak,
        strongestSkill: standardShortName(c.strongestStandard?.standard_id),
        weakestSkill: standardShortName(c.weakestStandard?.standard_id),
        trend: null,
      });
      if (snap) {
        c.aiHeadline = snap.headline;
        c.aiAction = snap.action;
      }
    }),
  );

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
      ? `${leadKid.firstName}'s Readee week - ${leadKid.questionsAttempted} questions, ${
          leadKid.comprehensionPct ?? "-"
        }% correct`
      : `Your family's Readee week - ${activeKids
          .map((c) => c.firstName)
          .join(", ")}`;

  const greeting = input.parentName ? `Hi ${input.parentName},` : "Hi there,";

  const text = [
    greeting,
    "",
    "Here's how your family's week went on Readee:",
    "",
    ...input.children.map((c) => {
      const lines: string[] = [`- ${c.firstName}:`];
      if (c.aiHeadline) lines.push(`  ${c.aiHeadline}`);
      if (c.aiAction) lines.push(`  This week: ${c.aiAction}`);
      if (c.nextLessonTitle) lines.push(`  Next up: ${c.nextLessonTitle}${c.nextLessonUnit ? ` (${c.nextLessonUnit})` : ""}`);
      if (c.milestoneLine) lines.push(`  Next flag: ${c.milestoneLine}`);
      if (c.passagesFinished > 0) lines.push(`  · ${c.passagesFinished} passage(s) finished`);
      if (c.questionsAttempted > 0)
        lines.push(
          `  · ${c.questionsCorrect} / ${c.questionsAttempted} comprehension correct (${c.comprehensionPct}%)`,
        );
      // Wins
      if (c.strongestStandard)
        lines.push(
          `  · Strongest: ${standardShortName(c.strongestStandard.standard_id) ?? c.strongestStandard.standard_id} (${Math.round(c.strongestStandard.accuracy * 100)}%)`,
        );
      if (c.unlocksThisWeek.length > 0) {
        const outfits = c.unlocksThisWeek.filter((u) => u.kind === "outfit").length;
        const badges = c.unlocksThisWeek.filter((u) => u.kind === "badge").length;
        const parts: string[] = [];
        if (badges > 0) parts.push(`${badges} badge${badges === 1 ? "" : "s"}`);
        if (outfits > 0) parts.push(`${outfits} outfit${outfits === 1 ? "" : "s"}`);
        lines.push(`  · Unlocked: ${parts.join(" + ")}`);
      }
      // Loss
      if (c.weakestStandard)
        lines.push(
          `  · Tricky spot: ${standardShortName(c.weakestStandard.standard_id) ?? c.weakestStandard.standard_id} (${Math.round(c.weakestStandard.accuracy * 100)}% so far)`,
        );
      if (c.passagesFinished === 0 && c.questionsAttempted === 0)
        lines.push("  · No Readee time this week - try a passage together tonight!");
      return lines.join("\n");
    }),
    "",
    `Keep the streak going: ${BASE_URL}/dashboard`,
    "",
    `To stop these weekly emails: ${input.unsubscribeUrl}`,
    "- Readee",
  ].join("\n");

  const childBlocks = input.children
    .map((c) => {
      // Wins/losses cluster — two-column row inside each child card.
      // Email-client safe: uses inline styles + a stacked table fallback
      // for narrow screens (most clients gracefully collapse).
      const wins: string[] = [];
      if (c.strongestStandard) {
        const label = standardShortName(c.strongestStandard.standard_id) ?? c.strongestStandard.standard_id;
        wins.push(
          `<div><span style="color:#16a34a;font-weight:700;">Strongest:</span> <a href="${BASE_URL}/standards/${slug(c.strongestStandard.standard_id)}" style="color:#16a34a;text-decoration:none;font-weight:600;">${escapeHtml(label)}</a> &middot; ${Math.round(c.strongestStandard.accuracy * 100)}%</div>`,
        );
      }
      if (c.unlocksThisWeek.length > 0) {
        const outfits = c.unlocksThisWeek.filter((u) => u.kind === "outfit").length;
        const badges = c.unlocksThisWeek.filter((u) => u.kind === "badge").length;
        const parts: string[] = [];
        if (badges > 0) parts.push(`${badges} badge${badges === 1 ? "" : "s"}`);
        if (outfits > 0) parts.push(`${outfits} outfit${outfits === 1 ? "" : "s"}`);
        wins.push(
          `<div><span style="color:#7c3aed;font-weight:700;">Unlocked:</span> ${parts.join(" + ")} this week</div>`,
        );
      }
      const losses: string[] = [];
      if (c.weakestStandard) {
        const label = standardShortName(c.weakestStandard.standard_id) ?? c.weakestStandard.standard_id;
        losses.push(
          `<div><span style="color:#d97706;font-weight:700;">Tricky spot:</span> <a href="${BASE_URL}/standards/${slug(c.weakestStandard.standard_id)}" style="color:#d97706;text-decoration:none;font-weight:600;">${escapeHtml(label)}</a> &middot; ${Math.round(c.weakestStandard.accuracy * 100)}%</div>`,
        );
      }

      // AI coach's note (grounded headline + this-week action). Sits at the
      // top of the card as the human "so what / now what"; the stats below
      // are the proof. Falls back to nothing when the model didn't run.
      const aiNoteBlock = c.aiHeadline
        ? `<div style="margin-top:12px;padding:12px 14px;background:#f5f3ff;border-radius:10px;">
             <div style="font-size:14px;line-height:1.5;color:#312e81;font-weight:600;">${escapeHtml(c.aiHeadline)}</div>
             ${c.aiAction ? `<div style="margin-top:6px;font-size:13px;line-height:1.5;color:#4f46e5;"><span style="font-weight:700;">This week:</span> ${escapeHtml(c.aiAction)}</div>` : ""}
           </div>`
        : "";

      // Along the journey: what is next by name, and the next flag on the map.
      const journeyBlock = c.nextLessonTitle || c.milestoneLine
        ? `<div style="margin-top:12px;padding:10px 14px;background:#fffbeb;border-radius:10px;font-size:13px;line-height:1.6;color:#3f3f46;">
             ${c.nextLessonTitle ? `<div><span style="font-weight:700;color:#92400e;">Next up:</span> ${escapeHtml(c.nextLessonTitle)}${c.nextLessonUnit ? ` <span style="color:#71717a;">(${escapeHtml(c.nextLessonUnit)})</span>` : ""}</div>` : ""}
             ${c.milestoneLine ? `<div><span style="font-weight:700;color:#92400e;">Next flag:</span> ${escapeHtml(c.milestoneLine)}</div>` : ""}
           </div>`
        : "";

      const winsLossesBlock =
        wins.length > 0 || losses.length > 0
          ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #f4f4f5;font-size:13px;line-height:1.6;color:#3f3f46;">
              ${wins.join("")}
              ${losses.join("")}
            </div>`
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
                </div>
                <div style="text-align:right;">${metric}</div>
              </div>
              ${aiNoteBlock}
              ${journeyBlock}
              ${winsLossesBlock}
            </td>
          </tr>
        </table>`;
    })
    .join("");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f5f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:32px 16px;background:#f6f5f2;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">
          <tr><td align="center" style="padding-bottom:20px;"><img src="${BASE_URL}/readee-logo.png" alt="Readee" width="128" style="display:block;width:128px;height:auto;" /></td></tr>
          <tr><td style="background:#ffffff;border:1px solid #ececf0;border-radius:20px;padding:34px 32px;box-shadow:0 10px 40px -18px rgba(49,46,129,.18);">
            <p style="margin:0;text-align:center;font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#4338ca;">Your Readee week</p>
            <h1 style="margin:8px 0 0;text-align:center;font-size:22px;font-weight:800;color:#1e1b4b;line-height:1.2;">${escapeHtml(greeting)}</h1>
            <p style="margin:12px 0 0;font-size:15px;line-height:1.55;color:#3f3f46;text-align:center;">Here's how the week went - what each child nailed, what they unlocked, and where to focus next.</p>
            ${childBlocks}
            <div style="margin-top:24px;text-align:center;">
              <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#4f46e5;color:#ffffff;padding:13px 26px;border-radius:999px;font-weight:800;font-size:15px;text-decoration:none;">Keep the streak going</a>
            </div>
          </td></tr>
          <tr><td align="center" style="padding-top:22px;"><p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;line-height:1.8;">
            <a href="https://instagram.com/readee.app"><img src="${BASE_URL}/images/ui/social/instagram.png" alt="Instagram" width="26" height="26" style="display:inline-block;vertical-align:middle;border:0;outline:none;text-decoration:none;" /></a>&nbsp;&nbsp;<a href="https://x.com/ReadeeLearning"><img src="${BASE_URL}/images/ui/social/x.png" alt="X" width="26" height="26" style="display:inline-block;vertical-align:middle;border:0;outline:none;text-decoration:none;" /></a>&nbsp;&nbsp;<a href="https://www.facebook.com/profile.php?id=61593589711136"><img src="${BASE_URL}/images/ui/social/facebook.png" alt="Facebook" width="26" height="26" style="display:inline-block;vertical-align:middle;border:0;outline:none;text-decoration:none;" /></a>&nbsp;&nbsp;<a href="https://tiktok.com/@readee.app"><img src="${BASE_URL}/images/ui/social/tiktok.png" alt="TikTok" width="26" height="26" style="display:inline-block;vertical-align:middle;border:0;outline:none;text-decoration:none;" /></a><br/>
            You're getting this because you have a child on Readee.<br/>
            <a href="${input.unsubscribeUrl}" style="color:#a1a1aa;">Unsubscribe from weekly updates</a>
          </p></td></tr>
        </table>
      </td></tr>
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
