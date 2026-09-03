/**
 * The customer email cadence beyond the daily lifecycle stages: the trial
 * arc (started -> 3 days left) driven by Stripe events, the win-back after a
 * cancellation, and the "quiet for 3 days" nudge that names the next lesson.
 * Every send is idempotent through lifecycle_email_sends. Parent email only.
 */
import { supabaseAdmin } from "@/lib/supabase/admin";
import { BASE_URL, alreadySentStage, escapeHtml, recordSendStage, sendEmail, shell, unsubscribeToken } from "@/lib/email/lifecycle";
import { firstChildContext, type ChildJourneyContext } from "@/lib/email/journey-context";

const P = (t: string) => `<p style="margin:12px 0 0;font-size:16px;line-height:1.6;color:#3f3f46;">${t}</p>`;
const SMALL = (t: string) => `<p style="margin:10px 0 0;font-size:12px;line-height:1.5;color:#71717a;">${t}</p>`;
/** "Reads like a 3rd grader" -> "reading like a 3rd grader"; "Reaches the 4th-grade bar" -> "reaching the 4th-grade bar". */
const milestonePhrase = (label: string) => {
  if (label.startsWith("Reads like ")) return `reading like ${label.slice("Reads like ".length)}`;
  if (label.startsWith("Reaches ")) return `reaching ${label.slice("Reaches ".length)}`;
  if (label.startsWith("Reads ")) return `reading ${label.slice("Reads ".length)}`;
  return `on track for ${label.charAt(0).toLowerCase()}${label.slice(1)}`;
};
const longDate = (sec: number | null) => (sec ? new Date(sec * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : null);

type Parent = { id: string; email: string | null; display_name: string | null };

async function parentById(parentId: string): Promise<Parent | null> {
  const admin = supabaseAdmin();
  const { data } = await admin.from("profiles").select("id, email, display_name").eq("id", parentId).maybeSingle();
  return (data as Parent | null) ?? null;
}
async function parentByCustomer(customerId: string): Promise<Parent | null> {
  const admin = supabaseAdmin();
  const { data } = await admin.from("profiles").select("id, email, display_name").eq("stripe_customer_id", customerId).maybeSingle();
  return (data as Parent | null) ?? null;
}
const unsub = (parentId: string) => `${BASE_URL}/account/unsubscribe/weekly?t=${unsubscribeToken(parentId)}`;

/** Lessons finished and distinct days practiced since a date, across the parent's children. */
async function progressSince(parentId: string, sinceIso: string): Promise<{ lessons: number; days: number }> {
  const admin = supabaseAdmin();
  const { data: kids } = await admin.from("children").select("id").eq("parent_id", parentId);
  const ids = ((kids ?? []) as { id: string }[]).map((k) => k.id);
  if (!ids.length) return { lessons: 0, days: 0 };
  const { data: rows } = await admin.from("lessons_progress").select("created_at, section").in("child_id", ids).gte("created_at", sinceIso);
  const list = (rows ?? []) as { created_at: string; section: string }[];
  const lessons = list.filter((r) => r.section === "learn").length;
  const days = new Set(list.map((r) => r.created_at.slice(0, 10))).size;
  return { lessons, days };
}

// ---------------------------------------------------------------------------
// 1. Trial started (subscription.created, status trialing): the first week.
// ---------------------------------------------------------------------------
export function renderTrialStarted(parentName: string | null, ctx: ChildJourneyContext | null, trialEndSec: number | null, unsubscribeUrl: string) {
  const name = ctx?.firstName ?? "your reader";
  const end = longDate(trialEndSec);
  const heading = `Readee+ is on. Here is ${name}'s first week.`;
  const first = ctx?.nextLesson ? `${name}'s first lesson is ready: ${ctx.nextLesson.title} (${ctx.nextLesson.unit}).` : `${name}'s first lesson is ready on the dashboard.`;
  const dose = "Ten minutes a day, five days a week, is the whole routine. Hand over the device, Luna does the rest, and you get the numbers every Monday.";
  const milestone = ctx?.placement?.nextMilestone ? `First flag on the map: ${name} ${milestonePhrase(ctx.placement.nextMilestone.label)} by ${ctx.placement.nextMilestone.month}.` : "";
  const trial = end ? `Your 14-day trial is free until ${end}. We email you three days before, and you can cancel in one tap from Settings.` : "Your 14-day trial is free. We email you three days before it ends, and you can cancel in one tap from Settings.";
  const text = [parentName ? `Hi ${parentName},` : "Hi there,", "", heading, "", first, dose, milestone, "", trial, "", `Open the dashboard: ${BASE_URL}/dashboard`, "", `Unsubscribe: ${unsubscribeUrl}`, "- Readee"].filter((l) => l !== "" || true).join("\n");
  const bodyHtml = `${P(escapeHtml(first))}${P(escapeHtml(dose))}${milestone ? P(escapeHtml(milestone)) : ""}${SMALL(escapeHtml(trial))}`;
  const html = shell({ preheader: first, parentName, bodyHtml, ctaHref: `${BASE_URL}/dashboard`, ctaLabel: `Start ${name}'s first lesson`, unsubscribeUrl, heading, eyebrow: "Welcome to Readee+", banner: "banner-trial-started" });
  return { subject: `Readee+ is on: ${name}'s first week`, html, text };
}

export async function sendTrialStartedEmail(customerId: string, subscriptionId: string, trialEndSec: number | null): Promise<void> {
  const parent = await parentByCustomer(customerId);
  if (!parent?.email) return;
  const stage = `trial_started:${subscriptionId}`;
  if (await alreadySentStage(parent.id, stage)) return;
  const ctx = await firstChildContext(parent.id);
  const e = renderTrialStarted(parent.display_name, ctx, trialEndSec, unsub(parent.id));
  const res = await sendEmail({ to: parent.email, subject: e.subject, text: e.text, html: e.html });
  await recordSendStage(parent.id, stage, res.ok ? "sent" : "failed", res.ok ? undefined : res.error);
}

// ---------------------------------------------------------------------------
// 2. Trial ending (customer.subscription.trial_will_end, 3 days before):
//    what the child did, what continues, the date and the amount, the exit.
// ---------------------------------------------------------------------------
export function renderTrialEnding(parentName: string | null, ctx: ChildJourneyContext | null, progress: { lessons: number; days: number }, trialEndSec: number | null, priceLine: string, unsubscribeUrl: string) {
  const name = ctx?.firstName ?? "your reader";
  const end = longDate(trialEndSec);
  const heading = `${name}'s trial ends in 3 days`;
  const did = progress.lessons > 0
    ? `${name} finished ${progress.lessons} lesson${progress.lessons === 1 ? "" : "s"} on ${progress.days} day${progress.days === 1 ? "" : "s"} so far${ctx?.streak ? `, and is on a ${ctx.streak}-day streak` : ""}.`
    : `${name} has not started a lesson yet. Ten minutes tonight is enough to see how Luna works.`;
  const next = ctx?.nextLesson ? `Next up: ${ctx.nextLesson.title}.` : "";
  const flag = ctx?.placement?.nextMilestone ? `The plan has ${name} ${milestonePhrase(ctx.placement.nextMilestone.label)} by ${ctx.placement.nextMilestone.month}.` : "";
  const money = end ? `Nothing to do to keep going: ${priceLine} starts on ${end}. To stop, cancel in one tap from Settings before then and ${name} keeps the free first unit.` : `Nothing to do to keep going: ${priceLine} starts when the trial ends. To stop, cancel in one tap from Settings and ${name} keeps the free first unit.`;
  const text = [parentName ? `Hi ${parentName},` : "Hi there,", "", heading, "", did, next, flag, "", money, "", `Settings: ${BASE_URL}/settings`, "", `Unsubscribe: ${unsubscribeUrl}`, "- Readee"].join("\n");
  const bodyHtml = `${P(escapeHtml(did))}${next ? P(escapeHtml(next)) : ""}${flag ? P(escapeHtml(flag)) : ""}${SMALL(escapeHtml(money))}`;
  const heroStats = progress.lessons > 0 ? [{ value: String(progress.lessons), label: progress.lessons === 1 ? "lesson finished" : "lessons finished" }, { value: String(progress.days), label: progress.days === 1 ? "day of reading" : "days of reading" }, ...(ctx?.streak ? [{ value: String(ctx.streak), label: "day streak" }] : [])] : [];
  const html = shell({ preheader: did, parentName, bodyHtml, ctaHref: `${BASE_URL}/dashboard`, ctaLabel: `Keep ${name} going`, unsubscribeUrl, heading, eyebrow: "Your trial", banner: "banner-trial-ending", heroStats, secondary: { href: `${BASE_URL}/settings`, label: "Manage the subscription" } });
  return { subject: `${name}'s Readee+ trial ends in 3 days`, html, text };
}

export async function sendTrialEndingEmail(customerId: string, subscriptionId: string, trialEndSec: number | null, trialStartSec: number | null, priceLine: string): Promise<void> {
  const parent = await parentByCustomer(customerId);
  if (!parent?.email) return;
  const stage = `trial_ending:${subscriptionId}`;
  if (await alreadySentStage(parent.id, stage)) return;
  const ctx = await firstChildContext(parent.id);
  const since = new Date((trialStartSec ? trialStartSec * 1000 : Date.now() - 11 * 86400000)).toISOString();
  const progress = await progressSince(parent.id, since);
  const e = renderTrialEnding(parent.display_name, ctx, progress, trialEndSec, priceLine, unsub(parent.id));
  const res = await sendEmail({ to: parent.email, subject: e.subject, text: e.text, html: e.html });
  await recordSendStage(parent.id, stage, res.ok ? "sent" : "failed", res.ok ? undefined : res.error);
}

// ---------------------------------------------------------------------------
// 3. Win-back (subscription.deleted): where the child was, and the way back.
// ---------------------------------------------------------------------------
export function renderWinBack(parentName: string | null, ctx: ChildJourneyContext | null, unsubscribeUrl: string) {
  const name = ctx?.firstName ?? "your reader";
  const heading = `We saved ${name}'s Reading Journey`;
  const where = ctx?.placement ? `${name} was placed at ${ctx.placement.levelLabel} (${ctx.placement.readingLevelName})${ctx.placement.topNeed ? `, working on ${ctx.placement.topNeed}` : ""}.` : `${name}'s progress is saved exactly where it was.`;
  const next = ctx?.nextLesson ? `The next lesson is still waiting: ${ctx.nextLesson.title}.` : "";
  const free = `The free first unit stays open, and everything on the journey comes back the moment you restart. No new placement needed.`;
  const text = [parentName ? `Hi ${parentName},` : "Hi there,", "", heading, "", where, next, free, "", `Restart Readee+: ${BASE_URL}/upgrade?reason=winback`, "", `Unsubscribe: ${unsubscribeUrl}`, "- Readee"].join("\n");
  const bodyHtml = `${P(escapeHtml(where))}${next ? P(escapeHtml(next)) : ""}${P(escapeHtml(free))}`;
  const html = shell({ preheader: where, parentName, bodyHtml, ctaHref: `${BASE_URL}/upgrade?reason=winback`, ctaLabel: `Restart ${name}'s journey`, unsubscribeUrl, heading, eyebrow: "Whenever you are ready", hero: "winback" });
  return { subject: `We saved ${name}'s Reading Journey`, html, text };
}

export async function sendWinBackEmail(customerId: string, subscriptionId: string): Promise<void> {
  const parent = await parentByCustomer(customerId);
  if (!parent?.email) return;
  const stage = `winback:${subscriptionId}`;
  if (await alreadySentStage(parent.id, stage)) return;
  const ctx = await firstChildContext(parent.id);
  const e = renderWinBack(parent.display_name, ctx, unsub(parent.id));
  const res = await sendEmail({ to: parent.email, subject: e.subject, text: e.text, html: e.html });
  await recordSendStage(parent.id, stage, res.ok ? "sent" : "failed", res.ok ? undefined : res.error);
}

// ---------------------------------------------------------------------------
// 4. Quiet for 3 days: the next lesson by name, and why it matters.
// ---------------------------------------------------------------------------
export function renderQuietNudge(parentName: string | null, ctx: ChildJourneyContext | null, daysQuiet: number, unsubscribeUrl: string) {
  const name = ctx?.firstName ?? "your reader";
  const heading = ctx?.nextLesson ? `${name}'s next lesson is waiting: ${ctx.nextLesson.title}` : `${name}'s next lesson is waiting`;
  const why = ctx?.placement?.topNeed ? `It works on ${ctx.placement.topNeed}, the skill the placement flagged first.` : "Ten minutes keeps the routine alive.";
  const gap = `It has been ${daysQuiet} days since ${name}'s last Readee time.`;
  const streak = daysQuiet <= 1 && ctx?.streak ? `The ${ctx.streak}-day streak is still safe if today counts.` : "One lesson tonight restarts the streak.";
  const text = [parentName ? `Hi ${parentName},` : "Hi there,", "", heading, "", gap, why, streak, "", `Open Readee: ${BASE_URL}/dashboard`, "", `Unsubscribe: ${unsubscribeUrl}`, "- Readee"].join("\n");
  const bodyHtml = `${P(escapeHtml(gap))}${P(escapeHtml(why))}${P(escapeHtml(streak))}`;
  const html = shell({ preheader: why, parentName, bodyHtml, ctaHref: `${BASE_URL}/dashboard`, ctaLabel: `Open ${name}'s lesson`, unsubscribeUrl, heading, eyebrow: "Ten minutes today", banner: "banner-quiet" });
  return { subject: ctx?.nextLesson ? `${name}'s next lesson: ${ctx.nextLesson.title}` : `${name}'s next lesson is waiting`, html, text };
}

export async function sendQuietNudge(parent: Parent, daysQuiet: number): Promise<{ ok: boolean; error?: string }> {
  if (!parent.email) return { ok: false, error: "no email" };
  const ctx = await firstChildContext(parent.id);
  const e = renderQuietNudge(parent.display_name, ctx, daysQuiet, unsub(parent.id));
  const res = await sendEmail({ to: parent.email, subject: e.subject, text: e.text, html: e.html });
  await recordSendStage(parent.id, "quiet_3d", res.ok ? "sent" : "failed", res.ok ? undefined : res.error);
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}

export { parentById };
