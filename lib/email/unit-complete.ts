/**
 * UNIT COMPLETE — the parent's email the moment a unit exam passes.
 *
 * The sequel to the placement report: the score, what the child proved, and
 * the road ahead (units remaining, the dated milestones the placement
 * projected). For a free account it is the ask, landing on proof: the next
 * unit is ready and the trial is the way in. For Readee+ it points at the map.
 * Idempotent per child and unit (lifecycle_email_sends stage).
 */
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PRICING } from "@/lib/billing-copy";
import { BASE_URL, alreadySentStage, escapeHtml, recordSendStage, sendEmail, shell, unsubscribeToken } from "@/lib/email/lifecycle";
import type { JourneyView } from "@/lib/journey-v2/types";

export interface UnitCompleteInput {
  parentName: string | null;
  childName: string;
  childId: string;
  unitName: string;
  unitGrade: string;
  score: number;
  premium: boolean;
  /** The map after the pass. */
  view: JourneyView;
  unsubscribeUrl: string;
}

const GRADE_WORD = ["kindergarten", "1st grade", "2nd grade", "3rd grade", "4th grade"];

export function renderUnitCompleteEmail(i: UnitCompleteInput): { subject: string; preheader: string; html: string; text: string; ctaHref: string } {
  const next = i.view.current;
  const remaining = i.view.units.filter((u) => u.status !== "done").length + i.view.hiddenAhead;
  const bar = GRADE_WORD[i.view.enrolledBand] ?? "the grade";
  const nextLine = next
    ? `${next.unit.grade} ${next.unit.name} is ready.`
    : i.view.unbuiltAhead > 0
      ? `Every unit that is ready is done. Our reading specialists are still building ${i.view.unbuiltAhead} more.`
      : "Every unit on the road is done.";
  const road = next ? `${i.childName}'s road to the ${bar} bar: ${remaining} ${remaining === 1 ? "unit" : "units"}, each one opened by its own exam.` : "";
  const ctaHref = i.premium || !next || next.item.free ? `${BASE_URL}/journey?child=${encodeURIComponent(i.childId)}` : `${BASE_URL}/upgrade?reason=journey&child=${encodeURIComponent(i.childId)}`;
  const ctaLabel = i.premium || !next || next.item.free ? "Open the map" : "Keep going with Readee+";
  const subject = `${i.childName} passed ${i.unitGrade} ${i.unitName}`;
  const preheader = `${i.score}% on the unit exam. ${nextLine}`;

  const milestonesHtml = i.view.milestones.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:12px 0 0;border-collapse:collapse">${i.view.milestones
        .map((m) => `<tr><td style="padding:8px 12px;background:#faf5ff;border-radius:10px;font-size:14px;color:#1e1b3a"><strong>${escapeHtml(m.label)}</strong></td><td style="padding:8px 12px;background:#faf5ff;border-radius:10px;font-size:14px;color:#6b21a8;text-align:right;white-space:nowrap">${escapeHtml(m.month)}</td></tr><tr><td style="height:6px" colspan="2"></td></tr>`)
        .join("")}</table>`
    : "";
  const whyHtml = i.view.why.length ? `<p style="margin:16px 0 0;font-size:14px;color:#52525b">${i.view.why.map(escapeHtml).join(" ")}</p>` : "";
  const trialLine = !i.premium && next && !next.item.free ? `<p style="margin:16px 0 0;font-size:13px;color:#71717a">${PRICING.trialDays} days free, then ${escapeHtml(PRICING.monthly.label)}. Cancel any time.</p>` : "";

  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:16px;line-height:1.5;color:#1e1b3a">${escapeHtml(i.childName)} passed the ${escapeHtml(i.unitGrade)} ${escapeHtml(i.unitName)} exam with <strong>${i.score}%</strong>. Every lesson in that unit is now proven, not just finished.</p>
    <p style="margin:0 0 12px;font-size:16px;line-height:1.5;color:#1e1b3a">${escapeHtml(nextLine)}${road ? " " + escapeHtml(road) : ""}</p>
    ${milestonesHtml}
    ${whyHtml}
    ${trialLine}
  `;
  const html = shell({
    preheader,
    parentName: i.parentName,
    heading: `${i.childName} passed ${i.unitName}`,
    eyebrow: "Unit exam",
    heroStats: [{ value: `${i.score}%`, label: "on the exam" }, { value: String(remaining), label: remaining === 1 ? "unit to the bar" : "units to the bar" }],
    bodyHtml,
    ctaHref,
    ctaLabel,
    unsubscribeUrl: i.unsubscribeUrl,
  });
  const text = [
    `${i.childName} passed the ${i.unitGrade} ${i.unitName} exam with ${i.score}%.`,
    nextLine,
    road,
    ...i.view.milestones.map((m) => `- ${m.label}: ${m.month}`),
    ...i.view.why,
    `${ctaLabel}: ${ctaHref}`,
  ].filter(Boolean).join("\n");
  return { subject, preheader, html, text, ctaHref };
}

/** Send once per child and unit. Best effort: never throws. */
export async function sendUnitCompleteEmail(opts: { childId: string; unitId: string; unitName: string; unitGrade: string; score: number; view: JourneyView }): Promise<{ ok: boolean; reason?: string }> {
  try {
    const admin = supabaseAdmin();
    const { data: child } = await admin.from("children").select("id, first_name, parent_id").eq("id", opts.childId).maybeSingle();
    if (!child?.parent_id) return { ok: false, reason: "no parent" };
    const parentId = String(child.parent_id);
    const { data: parent } = await admin.from("profiles").select("id, email, display_name, plan").eq("id", parentId).maybeSingle();
    if (!parent?.email) return { ok: false, reason: "no email" };
    const stage = `unit_complete:${opts.childId}:${opts.unitId}`;
    if (await alreadySentStage(parentId, stage)) return { ok: true, reason: "already sent" };
    const email = renderUnitCompleteEmail({
      parentName: (parent.display_name as string | null) ?? null,
      childName: (String(child.first_name ?? "").split(" ")[0] || "Your reader"),
      childId: opts.childId,
      unitName: opts.unitName,
      unitGrade: opts.unitGrade,
      score: opts.score,
      premium: parent.plan === "premium",
      view: opts.view,
      unsubscribeUrl: `${BASE_URL}/account/unsubscribe/weekly?t=${unsubscribeToken(parentId)}`,
    });
    const res = await sendEmail({ to: String(parent.email), subject: email.subject, text: email.text, html: email.html });
    await recordSendStage(parentId, stage, res.ok ? "sent" : "failed", res.ok ? undefined : res.error);
    return res.ok ? { ok: true } : { ok: false, reason: res.error };
  } catch (e) {
    return { ok: false, reason: String((e as Error)?.message ?? e) };
  }
}
