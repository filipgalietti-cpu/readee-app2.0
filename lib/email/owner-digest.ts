/**
 * Daily owner digest. Summarizes the last 24h of AI content production
 * + QC verdicts and emails it to whoever's listed in OWNER_DIGEST_TO.
 *
 * Triggered by /api/cron/owner-digest. Pattern lifted from
 * lib/email/invite.ts — same Resend client, same FROM, same plain-
 * HTML email template.
 */

import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/admin";

const FROM = "Readee QC Bot <hello@readee.app>";

export type OwnerDigestResult =
  | { ok: true; emailedTo: string; summary: any }
  | { ok: false; error: string };

export async function sendOwnerDigest(): Promise<OwnerDigestResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not configured" };
  const to = process.env.OWNER_DIGEST_TO ?? process.env.OWNER_EMAIL;
  if (!to) return { ok: false, error: "OWNER_DIGEST_TO env var not set" };

  const admin = supabaseAdmin();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Counts across all autonomous content producers.
  const [
    { count: discoveryTotal },
    { count: discoveryPass },
    { count: discoveryWarn },
    { count: discoveryFail },
    { count: dailyTotal },
    { count: dailyFail },
    { count: leveledTotal },
    { count: leveledFail },
    { count: enrichedTotal },
    { count: heals24h },
    { count: openFails },
  ] = await Promise.all([
    admin.from("discovery_articles").select("id", { count: "exact", head: true }).gte("created_at", since),
    admin.from("discovery_articles").select("id", { count: "exact", head: true }).gte("created_at", since).eq("qc_overall", "pass"),
    admin.from("discovery_articles").select("id", { count: "exact", head: true }).gte("created_at", since).eq("qc_overall", "warn"),
    admin.from("discovery_articles").select("id", { count: "exact", head: true }).gte("created_at", since).eq("qc_overall", "fail"),
    admin.from("daily_questions").select("date", { count: "exact", head: true }).gte("created_at", since),
    admin.from("daily_questions").select("date", { count: "exact", head: true }).gte("created_at", since).eq("qc_overall", "fail"),
    admin.from("differentiated_passages").select("id", { count: "exact", head: true }).gte("created_at", since),
    admin.from("differentiated_passages").select("id", { count: "exact", head: true }).gte("created_at", since).eq("qc_overall", "fail"),
    admin.from("lessons_db").select("standard_id", { count: "exact", head: true }).gte("updated_at", since).eq("source", "ai_enrich"),
    admin
      .from("content_qc_log")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since)
      .in("change_type", [
        "regen_image",
        "regen_audio",
        "regen_question",
        "enrich_step_audio",
        "post_write_audit_failed",
      ]),
    admin.from("content_audit_findings").select("id", { count: "exact", head: true }).eq("severity", "fail").eq("status", "open"),
  ]);

  // Recent sample — top 5 newest pieces with title + link.
  const { data: recentRows } = await admin
    .from("discovery_articles")
    .select("category, slug, title, qc_overall")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5);

  const recent = (recentRows ?? []) as Array<{
    category: string;
    slug: string;
    title: string;
    qc_overall: string;
  }>;

  // Hole detector — last 7 days of qc=fail rows across every
  // autonomous producer, bucketed by which judge class failed. A
  // failure showing up here means the auto-heal pipeline didn't
  // recover it. Counts tell Filip which loop class to ask Claude
  // to close next.
  const holeSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [
    { data: discoveryFails },
    { data: dailyFails },
    { data: leveledFails },
  ] = await Promise.all([
    admin
      .from("discovery_articles")
      .select("qc_report, category")
      .eq("qc_overall", "fail")
      .gte("created_at", holeSince)
      .limit(200),
    admin
      .from("daily_questions")
      .select("qc_report")
      .eq("qc_overall", "fail")
      .gte("created_at", holeSince)
      .limit(60),
    admin
      .from("differentiated_passages")
      .select("qc_report")
      .eq("qc_overall", "fail")
      .gte("created_at", holeSince)
      .limit(60),
  ]);
  const holes = bucketHoles([
    ...(((discoveryFails ?? []) as any[]).map((r) => ({
      source: "discovery",
      checks: Array.isArray(r.qc_report?.checks) ? r.qc_report.checks : [],
    }))),
    ...(((dailyFails ?? []) as any[]).map((r) => ({
      source: "daily",
      checks: Array.isArray(r.qc_report?.checks) ? r.qc_report.checks : [],
    }))),
    ...(((leveledFails ?? []) as any[]).map((r) => ({
      source: "leveled",
      checks: Array.isArray(r.qc_report?.checks) ? r.qc_report.checks : [],
    }))),
  ]);

  const summary = {
    discovery: {
      total: discoveryTotal ?? 0,
      pass: discoveryPass ?? 0,
      warn: discoveryWarn ?? 0,
      fail: discoveryFail ?? 0,
    },
    daily: { total: dailyTotal ?? 0, fail: dailyFail ?? 0 },
    leveled: { total: leveledTotal ?? 0, fail: leveledFail ?? 0 },
    enriched: enrichedTotal ?? 0,
    autoHealsFired: heals24h ?? 0,
    openFailsCatalog: openFails ?? 0,
    recent,
    holes,
  };

  const today = new Date().toISOString().slice(0, 10);
  const subject = `Readee daily — ${summary.discovery.total + summary.daily.total + summary.leveled.total} new pieces (${today})`;
  const text = renderText(summary, today);
  const html = renderHtml(summary, today);

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: FROM,
      to,
      subject,
      text,
      html,
    });
    return { ok: true, emailedTo: to, summary };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "send failed" };
  }
}

type HoleClass = "image" | "passage" | "questions" | "audio" | "learning_objective" | "other";

function classifyCheck(name: string): HoleClass {
  if (name.startsWith("image.")) return "image";
  if (name.startsWith("audio.")) return "audio";
  if (name === "lesson.learning_objective") return "learning_objective";
  if (/^q\d+\./.test(name)) return "questions";
  if (name.startsWith("passage.")) return "passage";
  return "other";
}

/**
 * Roll up the "which fail class shipped unhealed" stats. For each
 * row, we look at its checks array and credit ONE bucket per row
 * (the dominant fail class) so a row with 3 image fails counts as
 * one image-class hole, not three.
 */
function bucketHoles(
  rows: { source: string; checks: Array<{ name: string; severity: string }> }[],
): Array<{ klass: HoleClass; count: number; sources: Record<string, number> }> {
  const buckets = new Map<HoleClass, { count: number; sources: Record<string, number> }>();
  for (const r of rows) {
    const failing = r.checks.filter((c) => c.severity === "fail");
    if (failing.length === 0) continue;
    // Dominant class = the most-represented fail class on this row.
    const counts: Record<HoleClass, number> = {
      image: 0,
      passage: 0,
      questions: 0,
      audio: 0,
      learning_objective: 0,
      other: 0,
    };
    for (const c of failing) counts[classifyCheck(c.name)]++;
    const dominant = (Object.entries(counts) as [HoleClass, number][])
      .sort((a, b) => b[1] - a[1])[0][0];
    const b = buckets.get(dominant) ?? { count: 0, sources: {} };
    b.count++;
    b.sources[r.source] = (b.sources[r.source] ?? 0) + 1;
    buckets.set(dominant, b);
  }
  return Array.from(buckets.entries())
    .map(([klass, v]) => ({ klass, ...v }))
    .sort((a, b) => b.count - a.count);
}

function renderText(s: any, today: string): string {
  const lines: string[] = [];
  lines.push(`Readee daily digest — ${today}`);
  lines.push("");
  lines.push(
    `Discovery articles: ${s.discovery.total} (pass ${s.discovery.pass} / warn ${s.discovery.warn} / fail ${s.discovery.fail})`,
  );
  lines.push(`Daily Readee: ${s.daily.total}${s.daily.fail > 0 ? ` (${s.daily.fail} fail)` : ""}`);
  lines.push(
    `Leveled passages (factory): ${s.leveled.total}${s.leveled.fail > 0 ? ` (${s.leveled.fail} fail)` : ""}`,
  );
  lines.push(`Lessons re-enriched: ${s.enriched}`);
  lines.push(`Auto-heals fired: ${s.autoHealsFired}`);
  lines.push(`Open fails in catalog (not auto-fixed): ${s.openFailsCatalog}`);
  lines.push("");
  if ((s.holes ?? []).length > 0) {
    lines.push("Unhealed failure patterns (last 7 days):");
    for (const h of s.holes) {
      const sources = Object.entries(h.sources)
        .map(([k, v]) => `${k} ${v}`)
        .join(", ");
      lines.push(`  ${h.klass}: ${h.count} (${sources})`);
    }
    lines.push("  → Ask Claude to close the loop on the top one.");
    lines.push("");
  }
  if (s.recent.length > 0) {
    lines.push("Latest discovery articles:");
    for (const r of s.recent) {
      lines.push(
        `  [${r.qc_overall}] ${r.title} — https://learn.readee.app/discover/${r.category}/${r.slug}`,
      );
    }
  }
  lines.push("");
  lines.push("Owner dashboard: https://learn.readee.app/owner");
  return lines.join("\n");
}

function renderHtml(s: any, today: string): string {
  const pill = (n: number, tone: "pass" | "warn" | "fail" | "neutral") => {
    if (n === 0) return "";
    const colors = {
      pass: "background:#d1fae5;color:#065f46;",
      warn: "background:#fef3c7;color:#92400e;",
      fail: "background:#fee2e2;color:#991b1b;",
      neutral: "background:#e0e7ff;color:#3730a3;",
    } as const;
    return `<span style="${colors[tone]}border-radius:9999px;padding:2px 8px;font-size:11px;font-weight:700;margin-left:6px;">${n} ${tone}</span>`;
  };

  const recentRows = s.recent
    .map(
      (r: any) =>
        `<tr><td style="padding:6px 0;font-size:13px;"><a href="https://learn.readee.app/discover/${r.category}/${r.slug}" style="color:#4f46e5;text-decoration:none;font-weight:600;">${escapeHtml(r.title)}</a> <span style="font-size:11px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(r.category)} · ${escapeHtml(r.qc_overall)}</span></td></tr>`,
    )
    .join("\n");

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f7f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e4e4e7;">
        <tr><td style="font-size:14px;font-weight:700;color:#6366f1;letter-spacing:0.08em;text-transform:uppercase;padding-bottom:8px;">Readee QC Bot</td></tr>
        <tr><td style="font-size:22px;font-weight:800;line-height:1.3;padding-bottom:4px;">Daily production digest</td></tr>
        <tr><td style="font-size:13px;color:#71717a;padding-bottom:24px;">${today}</td></tr>

        <tr><td style="padding-bottom:16px;">
          <div style="font-size:13px;color:#3f3f46;font-weight:600;">Discovery library: ${s.discovery.total} new${pill(s.discovery.pass, "pass")}${pill(s.discovery.warn, "warn")}${pill(s.discovery.fail, "fail")}</div>
          <div style="font-size:13px;color:#3f3f46;font-weight:600;margin-top:6px;">Daily Readee: ${s.daily.total} new${pill(s.daily.fail, "fail")}</div>
          <div style="font-size:13px;color:#3f3f46;font-weight:600;margin-top:6px;">Leveled passages: ${s.leveled.total} new${pill(s.leveled.fail, "fail")}</div>
          <div style="font-size:13px;color:#3f3f46;font-weight:600;margin-top:6px;">Lessons re-enriched: ${s.enriched}</div>
          <div style="font-size:13px;color:#3f3f46;font-weight:600;margin-top:6px;">Auto-heals fired: ${s.autoHealsFired}</div>
          <div style="font-size:13px;color:#3f3f46;font-weight:600;margin-top:6px;">Open fails (not auto-fixed): ${pill(s.openFailsCatalog, s.openFailsCatalog > 0 ? "fail" : "neutral")}</div>
        </td></tr>

        ${
          (s.holes ?? []).length > 0
            ? `<tr><td style="border-top:1px solid #e4e4e7;padding-top:16px;padding-bottom:16px;">
            <div style="font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Unhealed failure patterns · last 7 days</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${s.holes
                .map((h: any) => {
                  const srcs = Object.entries(h.sources)
                    .map(([k, v]) => `${k} ${v}`)
                    .join(" · ");
                  return `<tr><td style="padding:5px 0;font-size:13px;"><span style="display:inline-block;min-width:140px;font-weight:700;color:#991b1b;">${escapeHtml(h.klass)}</span> <span style="font-family:monospace;font-size:13px;color:#3f3f46;">${h.count} fails</span> <span style="font-size:11px;color:#a1a1aa;margin-left:8px;">${escapeHtml(srcs)}</span></td></tr>`;
                })
                .join("\n")}
            </table>
            <div style="font-size:11px;color:#71717a;margin-top:10px;font-style:italic;">↑ Top class is where the auto-heal pipeline isn&rsquo;t recovering. Ask Claude to close that loop next.</div>
          </td></tr>`
            : ""
        }
        ${
          s.recent.length > 0
            ? `<tr><td style="border-top:1px solid #e4e4e7;padding-top:16px;padding-bottom:16px;">
            <div style="font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Latest discovery articles</div>
            <table width="100%" cellpadding="0" cellspacing="0">${recentRows}</table>
          </td></tr>`
            : ""
        }

        <tr><td align="center" style="padding-top:8px;padding-bottom:8px;">
          <a href="https://learn.readee.app/owner" style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;font-weight:700;padding:10px 22px;border-radius:999px;font-size:13px;">Open /owner dashboard</a>
        </td></tr>
        <tr><td style="font-size:11px;color:#a1a1aa;line-height:1.6;border-top:1px solid #e4e4e7;padding-top:16px;">
          Daily owner digest — sent automatically every 24h. Configure recipient via OWNER_DIGEST_TO env var.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
