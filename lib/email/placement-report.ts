/**
 * PLACEMENT REPORT EMAIL — sent to the parent the moment a placement is
 * complete: the same numbers the reveal shows (level, words a minute, the
 * three skills), the Custom Reading Journey, milestones, three home tips and
 * Jennifer's review line, framed by where the child landed. One send per
 * placement (idempotent via lifecycle_email_sends). Parent email only (COPPA).
 */
import { supabaseAdmin } from "@/lib/supabase/admin";
import { buildRevealCopy, type RevealCopy } from "@/app/(protected)/placement/_components/reveal/copy";
import type { PlacementResult } from "@/lib/placement/types";
import { BASE_URL, alreadySentStage, escapeHtml, recordSendStage, sendEmail, shell, unsubscribeToken } from "@/lib/email/lifecycle";

export type ReportEmailFraming = "below" | "at" | "above";

export function framingFor(result: PlacementResult): ReportEmailFraming {
  const d = result.decision.relative.delta;
  return d >= 1 ? "below" : d <= -1 ? "above" : "at";
}

/** "two grade levels below" -> "Two grade levels below." */
const sentence = (t: string) => { const x = t.trim(); return x ? x[0].toUpperCase() + x.slice(1) + (/[.!?]$/.test(x) ? "" : ".") : ""; };
const P = (t: string) => `<p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#3f3f46;">${t}</p>`;
const H = (t: string) => `<p style="margin:24px 0 8px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#4338ca;">${escapeHtml(t)}</p>`;

function statCell(value: string, label: string): string {
  return `<td width="33%" align="center" style="padding:12px 6px;background:#f5f3ff;border-radius:14px;">
    <div style="font-size:22px;font-weight:800;color:#4338ca;line-height:1.1;">${escapeHtml(value)}</div>
    <div style="margin-top:4px;font-size:12px;color:#6d28d9;">${escapeHtml(label)}</div>
  </td>`;
}

function skillRow(label: string, value: string, fillPct: number, meaning: string): string {
  const pct = Math.max(4, Math.min(100, Math.round(fillPct)));
  return `<tr><td style="padding:10px 0;border-top:1px solid #f1f0f5;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
      <td style="font-size:14px;font-weight:700;color:#1e1b4b;">${escapeHtml(label)}</td>
      <td align="right" style="font-size:14px;font-weight:700;color:#1e1b4b;">${escapeHtml(value)}</td>
    </tr></table>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:6px;"><tr>
      <td style="background:#ede9fe;border-radius:999px;height:8px;line-height:8px;font-size:0;">
        <div style="width:${pct}%;height:8px;border-radius:999px;background:#7c3aed;"></div>
      </td>
    </tr></table>
    <div style="margin-top:6px;font-size:13px;line-height:1.5;color:#52525b;">${escapeHtml(meaning)}</div>
  </td></tr>`;
}

export function renderPlacementReportEmail(result: PlacementResult, opts: { parentName: string | null; premium: boolean; unsubscribeUrl: string }): { subject: string; preheader: string; html: string; text: string; ctaHref: string } {
  const copy: RevealCopy = buildRevealCopy(result);
  const name = copy.childName;
  const framing = framingFor(result);
  const reportHref = `${BASE_URL}/placement/report?child=${result.childId}`;
  const ctaHref = opts.premium ? `${BASE_URL}/dashboard` : reportHref;
  const ctaLabel = opts.premium ? `Start ${name}'s first lesson` : `Start ${name}'s Reading Journey`;
  const heading =
    opts.premium ? `${name}'s reading placement is in` :
    framing === "below" ? `${name}'s Reading Journey is ready` :
    framing === "above" ? `${name} is reading ahead of grade` : `${name} is reading right on track`;
  const subject =
    framing === "below" ? `${name}'s reading placement: the plan to catch up` :
    framing === "above" ? `${name}'s reading placement: ahead of grade` : `${name}'s reading placement results`;
  const preheader = copy.headline;

  const steps = copy.path.steps.filter((s) => s.kind !== "skipped");
  const lead = [copy.headline, copy.momentLine ?? ""].filter(Boolean).join(" ");
  const stats: [string, string][] = [
    [copy.placement.band, "reading level"],
    ...(copy.number ? [[String(copy.number.wcpm), "words a minute"] as [string, string]] : []),
    [copy.enrolledLabel, "grade in school"],
  ];

  const bodyHtml = `
    ${P(escapeHtml(lead))}
    ${H("Where " + name + " is")}
    <table width="100%" cellpadding="0" cellspacing="6" role="presentation"><tr>${stats.map(([v, l]) => statCell(v, l)).join("")}</tr></table>
    ${P(escapeHtml(sentence(copy.placement.categoryText) + " " + copy.placement.support))}
    ${copy.number ? `<p style="margin:6px 0 0;font-size:12px;color:#71717a;">${escapeHtml(copy.number.benchmarkLabel)}</p>` : ""}
    ${H("Three skills, one at a time")}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${copy.skills.map((s) => skillRow(s.label, s.value, s.fillPct, s.meaning)).join("")}</table>
    ${H(name + "'s Custom Reading Journey")}
    <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.6;color:#3f3f46;">
      ${steps.map((s) => `<li style="margin:4px 0;"><strong style="color:#1e1b4b;">${escapeHtml(s.title)}</strong> <span style="color:#71717a;">${escapeHtml(s.reason)}</span></li>`).join("")}
    </ol>
    <p style="margin:10px 0 0;font-size:13px;color:#52525b;">${escapeHtml(copy.path.countLine)}</p>
    ${copy.path.milestones.length ? `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:10px;">${copy.path.milestones.map((m) => `<tr><td style="padding:8px 12px;margin:0;background:#fffbeb;border-radius:12px;font-size:14px;color:#1e1b4b;"><strong>${escapeHtml(m.label)}</strong> <span style="color:#92400e;">· ${escapeHtml(m.month)}</span></td></tr><tr><td style="height:6px;font-size:0;">&nbsp;</td></tr>`).join("")}</table>` : ""}
    <p style="margin:8px 0 0;font-size:13px;line-height:1.5;color:#52525b;">${escapeHtml(copy.path.craftedLine)}</p>
    ${H(copy.plan.tipsHeading)}
    <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.6;color:#3f3f46;">
      ${copy.plan.tips.map((t) => `<li style="margin:4px 0;">${escapeHtml(t.text)}</li>`).join("")}
    </ol>
    <p style="margin:22px 0 0;font-size:12px;line-height:1.5;color:#71717a;">Content created and reviewed by <strong style="color:#3f3f46;">${escapeHtml(copy.ask.reviewer.name)}</strong>, ${escapeHtml(copy.ask.reviewer.role)}.</p>
    ${opts.premium ? "" : `<p style="margin:10px 0 0;font-size:12px;line-height:1.5;color:#71717a;">${escapeHtml(copy.ask.line)} ${escapeHtml(copy.ask.finePrint)}</p>`}
    <p style="margin:10px 0 0;font-size:12px;color:#71717a;"><a href="${reportHref}" style="color:#4338ca;">See the full report</a></p>`;

  const text = [
    opts.parentName ? `Hi ${opts.parentName},` : "Hi there,",
    "",
    heading,
    lead,
    "",
    `Where ${name} is: ${stats.map(([v, l]) => `${v} (${l})`).join(" · ")}`,
    `${sentence(copy.placement.categoryText)} ${copy.placement.support}`,
    "",
    "Three skills:",
    ...copy.skills.map((s) => `  - ${s.label}: ${s.value}. ${s.meaning}`),
    "",
    `${name}'s Custom Reading Journey:`,
    ...steps.map((s, i) => `  ${i + 1}. ${s.title} (${s.reason})`),
    `  ${copy.path.countLine}`,
    ...copy.path.milestones.map((m) => `  * ${m.label} - ${m.month}`),
    `  ${copy.path.craftedLine}`,
    "",
    `${copy.plan.tipsHeading}:`,
    ...copy.plan.tips.map((t, i) => `  ${i + 1}. ${t.text}`),
    "",
    `Content created and reviewed by ${copy.ask.reviewer.name}, ${copy.ask.reviewer.role}.`,
    opts.premium ? "" : `${copy.ask.line} ${copy.ask.finePrint}`,
    "",
    `${ctaLabel}: ${ctaHref}`,
    `See the full report: ${reportHref}`,
    "",
    `Unsubscribe: ${opts.unsubscribeUrl}`,
    "- Readee",
  ].filter((l) => l !== null).join("\n");

  const html = shell({ preheader, parentName: opts.parentName, bodyHtml, ctaHref, ctaLabel, unsubscribeUrl: opts.unsubscribeUrl, heading, eyebrow: "Reading placement", bunny: "bunny-trophy.png" });
  return { subject, preheader, html, text, ctaHref };
}

/** Load the placement, build the result, render and send once. Safe to call fire-and-forget. */
export async function sendPlacementReportEmail(placementId: string): Promise<{ ok: boolean; reason?: string }> {
  const admin = supabaseAdmin();
  const { data: row } = await admin
    .from("placements")
    .select("id, child_id, enrolled, decision, moments, plan, narration, passage_recording_path, duration_seconds, created_at")
    .eq("id", placementId)
    .maybeSingle();
  if (!row) return { ok: false, reason: "no placement" };
  const r = row as Record<string, unknown>;
  const { data: child } = await admin.from("children").select("id, first_name, parent_id").eq("id", String(r.child_id)).maybeSingle();
  if (!child?.parent_id) return { ok: false, reason: "no parent" };
  const parentId = String(child.parent_id);
  const { data: parent } = await admin.from("profiles").select("id, email, display_name, plan").eq("id", parentId).maybeSingle();
  if (!parent?.email) return { ok: false, reason: "no email" };
  const stage = `placement_report:${placementId}`;
  if (await alreadySentStage(parentId, stage)) return { ok: true, reason: "already sent" };

  const result: PlacementResult = {
    id: String(r.id),
    childId: String(r.child_id),
    childName: ((String(child.first_name ?? "")).split(" ")[0] || "Reader"),
    enrolled: Number(r.enrolled) as PlacementResult["enrolled"],
    decision: r.decision as PlacementResult["decision"],
    moments: (r.moments ?? []) as PlacementResult["moments"],
    plan: r.plan as PlacementResult["plan"],
    narration: (r.narration ?? []) as PlacementResult["narration"],
    passageRecordingPath: (r.passage_recording_path as string | null) ?? null,
    durationSeconds: Number(r.duration_seconds ?? 0),
    createdAt: String(r.created_at),
  };
  const email = renderPlacementReportEmail(result, {
    parentName: (parent.display_name as string | null) ?? null,
    premium: parent.plan === "premium",
    unsubscribeUrl: `${BASE_URL}/account/unsubscribe/weekly?t=${unsubscribeToken(parentId)}`,
  });
  const res = await sendEmail({ to: String(parent.email), subject: email.subject, text: email.text, html: email.html });
  await recordSendStage(parentId, stage, res.ok ? "sent" : "failed", res.ok ? undefined : res.error);
  return res.ok ? { ok: true } : { ok: false, reason: res.error };
}
