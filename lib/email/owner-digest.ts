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

  // Content health snapshot — currently-hidden counts per type.
  // Surfaces backlog: 12 hidden discovery articles means the auto-
  // heal loop is falling behind. Combined with the autoheal results
  // below, the operator can see whether things are getting better
  // or worse week over week.
  const [
    { count: hiddenDiscovery },
    { count: hiddenDaily },
    { count: hiddenLeveled },
  ] = await Promise.all([
    admin
      .from("discovery_articles")
      .select("id", { count: "exact", head: true })
      .eq("published_state", "hidden"),
    admin
      .from("daily_questions")
      .select("date", { count: "exact", head: true })
      .eq("published_state", "hidden"),
    admin
      .from("differentiated_passages")
      .select("id", { count: "exact", head: true })
      .eq("published_state", "hidden"),
  ]);

  // Auto-heal loop activity — last 7 days of qc_runs telemetry.
  // Tells us how the runAutoHealLoop is performing per content type.
  const { data: healRows } = await admin
    .from("qc_runs")
    .select("content_type, outcome")
    .gte("created_at", holeSince);
  const healStats: Record<string, { passed: number; healed: number; quarantined: number }> = {};
  for (const r of (healRows ?? []) as Array<{ content_type: string; outcome: string }>) {
    const bucket = (healStats[r.content_type] ||= { passed: 0, healed: 0, quarantined: 0 });
    if (r.outcome === "passed_first_try") bucket.passed++;
    else if (r.outcome === "healed") bucket.healed++;
    else if (r.outcome === "quarantined") bucket.quarantined++;
  }

  // Audit findings summary — the recently-run audit's findings,
  // bucketed by type + severity. This is what kid-content QC is
  // currently flagging across the catalog. Sourced from
  // content_audit_findings; finds the latest audit_run_id from the
  // last 24h and rolls up. Falls back to "all open findings" if no
  // recent run.
  const { data: latestRun } = await admin
    .from("content_audit_runs")
    .select("id, completed_at, scope, findings_pass, findings_warn, findings_fail, questions_scanned, lessons_scanned")
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1);
  const latestRunRow = (latestRun ?? [])[0] as
    | {
        id: string;
        completed_at: string | null;
        scope: string;
        findings_pass: number | null;
        findings_warn: number | null;
        findings_fail: number | null;
        questions_scanned: number | null;
        lessons_scanned: number | null;
      }
    | undefined;

  const { data: openFindings } = await admin
    .from("content_audit_findings")
    .select("finding_type, severity, target_kind, target_id, grade")
    .eq("status", "open")
    .in("severity", ["fail", "warn"]);
  const findingsList = (openFindings ?? []) as Array<{
    finding_type: string;
    severity: "fail" | "warn";
    target_kind: string;
    target_id: string;
    grade: string | null;
  }>;

  // Bucket by finding_type × severity.
  const byType = new Map<string, { fail: number; warn: number }>();
  for (const f of findingsList) {
    const b = byType.get(f.finding_type) ?? { fail: 0, warn: 0 };
    b[f.severity]++;
    byType.set(f.finding_type, b);
  }
  // Sort by total descending; cap at 10 rows for the email.
  const findingTypeRows = Array.from(byType.entries())
    .map(([type, c]) => ({ type, fail: c.fail, warn: c.warn, total: c.fail + c.warn }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Top affected standards — group by target_id prefix (the standard
  // code before any `#slide-N` or `-Q\d+` suffix). Surfaces "this
  // standard has the most issues" so the operator can spot patterns.
  const stdCounts = new Map<string, number>();
  for (const f of findingsList) {
    const std = f.target_id.split(/[#-]/)[0];
    stdCounts.set(std, (stdCounts.get(std) ?? 0) + 1);
  }
  const topStandards = Array.from(stdCounts.entries())
    .map(([std, n]) => ({ std, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 8);

  // Open fails by grade — quick "where is the pain concentrated."
  const gradeFails = new Map<string, number>();
  for (const f of findingsList) {
    if (f.severity !== "fail") continue;
    const g = f.grade ?? "(unknown)";
    gradeFails.set(g, (gradeFails.get(g) ?? 0) + 1);
  }
  const gradeFailRows = Array.from(gradeFails.entries())
    .map(([g, n]) => ({ grade: g, n }))
    .sort((a, b) => b.n - a.n);

  const auditSummary = latestRunRow
    ? {
        runId: latestRunRow.id,
        completedAt: latestRunRow.completed_at,
        scope: latestRunRow.scope,
        scanned:
          (latestRunRow.questions_scanned ?? 0) + (latestRunRow.lessons_scanned ?? 0),
        pass: latestRunRow.findings_pass ?? 0,
        warn: latestRunRow.findings_warn ?? 0,
        fail: latestRunRow.findings_fail ?? 0,
      }
    : null;

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
    hidden: {
      discovery: hiddenDiscovery ?? 0,
      daily: hiddenDaily ?? 0,
      leveled: hiddenLeveled ?? 0,
    },
    healStats,
    recent,
    holes,
    audit: {
      lastRun: auditSummary,
      openFailsTotal: findingsList.filter((f) => f.severity === "fail").length,
      openWarnsTotal: findingsList.filter((f) => f.severity === "warn").length,
      byType: findingTypeRows,
      topStandards,
      failsByGrade: gradeFailRows,
    },
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
  const totalHidden = s.hidden.discovery + s.hidden.daily + s.hidden.leveled;
  if (totalHidden > 0) {
    lines.push(`Currently hidden (auto-demoted on QC fail):`);
    if (s.hidden.discovery > 0) lines.push(`  · Discovery: ${s.hidden.discovery}`);
    if (s.hidden.daily > 0) lines.push(`  · Daily Readee: ${s.hidden.daily}`);
    if (s.hidden.leveled > 0) lines.push(`  · Leveled passages: ${s.hidden.leveled}`);
    lines.push("");
  }
  const healEntries = Object.entries(s.healStats ?? {}) as Array<
    [string, { passed: number; healed: number; quarantined: number }]
  >;
  if (healEntries.length > 0) {
    lines.push("Auto-heal loop (last 7 days):");
    for (const [type, st] of healEntries) {
      lines.push(
        `  ${type}: ${st.passed} clean / ${st.healed} healed / ${st.quarantined} quarantined`,
      );
    }
    lines.push("");
  }
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
  if (s.audit) {
    lines.push("─────────────────────────────────────────────────────");
    lines.push("AUDIT SUMMARY");
    lines.push("─────────────────────────────────────────────────────");
    if (s.audit.lastRun) {
      const when = s.audit.lastRun.completedAt
        ? new Date(s.audit.lastRun.completedAt).toISOString().slice(0, 16).replace("T", " ")
        : "?";
      lines.push(`Last audit: ${when} UTC · ${s.audit.lastRun.scope}`);
      lines.push(
        `  scanned ${s.audit.lastRun.scanned} · pass ${s.audit.lastRun.pass} / warn ${s.audit.lastRun.warn} / fail ${s.audit.lastRun.fail}`,
      );
    }
    lines.push(
      `Open findings catalog-wide: ${s.audit.openFailsTotal} fail · ${s.audit.openWarnsTotal} warn`,
    );
    if (s.audit.byType.length > 0) {
      lines.push("");
      lines.push("Top finding types (open):");
      for (const r of s.audit.byType) {
        const parts: string[] = [];
        if (r.fail > 0) parts.push(`${r.fail} fail`);
        if (r.warn > 0) parts.push(`${r.warn} warn`);
        lines.push(`  ${r.type.padEnd(28)} ${parts.join(" · ")}`);
      }
    }
    if (s.audit.failsByGrade.length > 0) {
      lines.push("");
      lines.push("Open fails by grade:");
      for (const r of s.audit.failsByGrade) {
        lines.push(`  ${r.grade}: ${r.n}`);
      }
    }
    if (s.audit.topStandards.length > 0) {
      lines.push("");
      lines.push("Standards with the most open findings:");
      for (const r of s.audit.topStandards) {
        lines.push(`  ${r.std}: ${r.n}`);
      }
    }
    lines.push("");
    lines.push(
      `  → Drill in at /owner/qc-bot or query content_audit_findings by audit_run_id="${s.audit.lastRun?.runId ?? "n/a"}".`,
    );
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
          (s.hidden?.discovery + s.hidden?.daily + s.hidden?.leveled) > 0
            ? `<tr><td style="border-top:1px solid #e4e4e7;padding-top:16px;padding-bottom:16px;">
            <div style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Currently hidden · pending auto-heal</div>
            <div style="font-size:13px;color:#3f3f46;">Discovery: ${pill(s.hidden.discovery, s.hidden.discovery > 0 ? "warn" : "neutral")} &nbsp; Daily: ${pill(s.hidden.daily, s.hidden.daily > 0 ? "warn" : "neutral")} &nbsp; Leveled: ${pill(s.hidden.leveled, s.hidden.leveled > 0 ? "warn" : "neutral")}</div>
            <div style="font-size:11px;color:#71717a;margin-top:6px;font-style:italic;">These pieces failed QC and were auto-demoted. Heal-existing-content cron retries them nightly.</div>
          </td></tr>`
            : ""
        }
        ${
          Object.keys(s.healStats ?? {}).length > 0
            ? `<tr><td style="border-top:1px solid #e4e4e7;padding-top:16px;padding-bottom:16px;">
            <div style="font-size:11px;font-weight:700;color:#065f46;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Auto-heal loop · last 7 days</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${Object.entries(s.healStats as Record<string, { passed: number; healed: number; quarantined: number }>)
                .map(
                  ([type, st]) =>
                    `<tr><td style="padding:4px 0;font-size:13px;"><span style="display:inline-block;min-width:160px;font-weight:700;color:#3f3f46;font-family:monospace;">${escapeHtml(type)}</span> ${pill(st.passed, "pass")} ${pill(st.healed, "neutral")} ${pill(st.quarantined, "fail")}</td></tr>`,
                )
                .join("\n")}
            </table>
            <div style="font-size:11px;color:#71717a;margin-top:6px;font-style:italic;">Passed clean · healed after retry · quarantined (stuck).</div>
          </td></tr>`
            : ""
        }
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
          s.audit
            ? `<tr><td style="border-top:1px solid #e4e4e7;padding-top:16px;padding-bottom:16px;">
            <div style="font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Audit summary</div>
            ${
              s.audit.lastRun
                ? `<div style="font-size:13px;color:#3f3f46;margin-bottom:6px;"><strong>Last run:</strong> ${escapeHtml(new Date(s.audit.lastRun.completedAt ?? Date.now()).toISOString().slice(0, 16).replace("T", " "))} UTC · scanned ${s.audit.lastRun.scanned} ${pill(s.audit.lastRun.pass, "pass")}${pill(s.audit.lastRun.warn, "warn")}${pill(s.audit.lastRun.fail, "fail")}</div>`
                : ""
            }
            <div style="font-size:13px;color:#3f3f46;font-weight:600;margin-bottom:10px;">Open catalog-wide: ${pill(s.audit.openFailsTotal, s.audit.openFailsTotal > 0 ? "fail" : "neutral")}${pill(s.audit.openWarnsTotal, s.audit.openWarnsTotal > 0 ? "warn" : "neutral")}</div>
            ${
              s.audit.byType.length > 0
                ? `<div style="font-size:11px;font-weight:700;color:#3f3f46;margin-top:12px;margin-bottom:6px;">Top finding types</div>
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${(s.audit.byType as Array<{ type: string; fail: number; warn: number }>)
                    .map(
                      (r) =>
                        `<tr><td style="padding:4px 0;font-size:13px;"><span style="display:inline-block;min-width:200px;font-family:monospace;font-size:12px;color:#3f3f46;">${escapeHtml(r.type)}</span> ${pill(r.fail, r.fail > 0 ? "fail" : "neutral")}${pill(r.warn, r.warn > 0 ? "warn" : "neutral")}</td></tr>`,
                    )
                    .join("\n")}
                </table>`
                : ""
            }
            ${
              s.audit.failsByGrade.length > 0
                ? `<div style="font-size:11px;font-weight:700;color:#3f3f46;margin-top:12px;margin-bottom:6px;">Open fails by grade</div>
                <div style="font-size:13px;color:#3f3f46;">
                  ${(s.audit.failsByGrade as Array<{ grade: string; n: number }>)
                    .map((r) => `<span style="display:inline-block;margin-right:14px;font-family:monospace;">${escapeHtml(r.grade)}: <strong>${r.n}</strong></span>`)
                    .join("")}
                </div>`
                : ""
            }
            ${
              s.audit.topStandards.length > 0
                ? `<div style="font-size:11px;font-weight:700;color:#3f3f46;margin-top:12px;margin-bottom:6px;">Standards with the most issues</div>
                <div style="font-size:13px;color:#3f3f46;font-family:monospace;">
                  ${(s.audit.topStandards as Array<{ std: string; n: number }>)
                    .map((r) => `<span style="display:inline-block;margin-right:14px;">${escapeHtml(r.std)}: <strong>${r.n}</strong></span>`)
                    .join("")}
                </div>`
                : ""
            }
            <div style="font-size:11px;color:#71717a;margin-top:12px;font-style:italic;">Drill in at <a href="https://learn.readee.app/owner/qc-bot" style="color:#6366f1;">/owner/qc-bot</a> or query <code>content_audit_findings</code> by audit_run_id.</div>
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
