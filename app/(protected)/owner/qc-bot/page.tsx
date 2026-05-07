import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import {
  ShieldOff,
  Bot,
  ArrowLeft,
  Wand2,
  Check,
  AlertTriangle,
  XCircle,
  Sparkles,
  RefreshCcw,
  Lightbulb,
  ImageIcon,
  Volume2,
  FileText,
  ListChecks,
  Clock,
  Activity,
  TrendingUp,
  Zap,
  Pause,
  CircleAlert,
} from "lucide-react";
import ApplyRescueButton from "./_components/ApplyRescueButton";
import { daysAgoIso, hoursAgoIso } from "@/lib/utils/dates";

export const dynamic = "force-dynamic";

type LogRow = {
  id: string;
  target_kind: string;
  target_id: string;
  change_type: string;
  reason: string | null;
  agent: string;
  created_at: string;
  before: any;
  after: any;
};

type FormatRescueRow = {
  id: string;
  target_id: string;
  reason: string | null;
  before: any;
  after: any;
  created_at: string;
};

const AGENT_LABELS: Record<string, string> = {
  "qc-bot/cleanup": "Cleanup",
  "qc-bot/regen-images": "Image regen",
  "qc-bot/regen-audio": "Audio regen",
  "qc-bot/regen-questions": "Pedagogy regen",
  "qc-bot/verify": "Verify",
  "qc-bot/format-rescue": "Format rescue",
  "qc-bot/cron": "Nightly cron",
  "community/submit": "Community submit",
  "seed-community": "Community seed",
};

const CHANGE_ICONS: Record<string, React.ReactNode> = {
  regen_image: <ImageIcon className="h-3.5 w-3.5" />,
  regen_audio: <Volume2 className="h-3.5 w-3.5" />,
  regen_question: <FileText className="h-3.5 w-3.5" />,
  dismiss_fp: <Check className="h-3.5 w-3.5" />,
  verify_image: <ListChecks className="h-3.5 w-3.5" />,
  verify_audio: <ListChecks className="h-3.5 w-3.5" />,
  format_rescue_recommendation: <Lightbulb className="h-3.5 w-3.5" />,
  submit_for_review: <Sparkles className="h-3.5 w-3.5" />,
  factory_seed: <Sparkles className="h-3.5 w-3.5" />,
};

const CHANGE_TONES: Record<string, string> = {
  regen_image: "bg-violet-100 text-violet-700",
  regen_audio: "bg-violet-100 text-violet-700",
  regen_question: "bg-indigo-100 text-indigo-700",
  dismiss_fp: "bg-zinc-100 text-zinc-600",
  verify_image: "bg-emerald-100 text-emerald-700",
  verify_audio: "bg-emerald-100 text-emerald-700",
  format_rescue_recommendation: "bg-amber-100 text-amber-800",
  submit_for_review: "bg-sky-100 text-sky-700",
  factory_seed: "bg-rose-100 text-rose-700",
};

export default async function QcBotDashboardPage() {
  const profile = await requireProfile();
  const isAdmin = await isPlatformAdmin(profile.id);
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
          <ShieldOff className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-900">
          Owner only
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          The QC bot dashboard is restricted to platform admins.
        </p>
      </div>
    );
  }

  const supabase = await createClient();

  // ── Hero counts ────────────────────────────────────────────────
  const sevenDaysAgo = daysAgoIso(7);
  const [
    openFails,
    openWarns,
    fixedAllTime,
    fixedLast7d,
    rescueQueue,
    quarantinedQuestions,
    totalLogged,
  ] = await Promise.all([
    supabase
      .from("content_audit_findings")
      .select("id", { count: "exact", head: true })
      .eq("severity", "fail")
      .eq("status", "open"),
    supabase
      .from("content_audit_findings")
      .select("id", { count: "exact", head: true })
      .eq("severity", "warn")
      .eq("status", "open"),
    supabase
      .from("content_audit_findings")
      .select("id", { count: "exact", head: true })
      .eq("status", "fixed"),
    supabase
      .from("content_qc_log")
      .select("id", { count: "exact", head: true })
      .in("change_type", [
        "regen_image",
        "regen_audio",
        "regen_question",
        "dismiss_fp",
      ])
      .gte("created_at", sevenDaysAgo),
    supabase
      .from("content_qc_log")
      .select("id, target_id, reason, before, after, created_at")
      .eq("change_type", "format_rescue_recommendation")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("question_qc_status")
      .select("target_id", { count: "exact", head: true })
      .eq("qc_status", "quarantined"),
    supabase
      .from("content_qc_log")
      .select("id", { count: "exact", head: true }),
  ]);

  const rescueRows = (rescueQueue.data ?? []) as FormatRescueRow[];

  // ── Activity feed ─────────────────────────────────────────────
  const { data: logRows } = await supabase
    .from("content_qc_log")
    .select(
      "id, target_kind, target_id, change_type, reason, agent, created_at, before, after",
    )
    .order("created_at", { ascending: false })
    .limit(50);
  const log = (logRows ?? []) as LogRow[];

  // ── Activity by agent (last 7d) ────────────────────────────────
  const { data: agentCountsData } = await supabase
    .from("content_qc_log")
    .select("agent, change_type")
    .gte("created_at", sevenDaysAgo);
  const agentCounts = new Map<string, number>();
  for (const r of (agentCountsData ?? []) as { agent: string }[]) {
    agentCounts.set(r.agent, (agentCounts.get(r.agent) ?? 0) + 1);
  }
  const agentSorted = Array.from(agentCounts.entries()).sort(
    (a, b) => b[1] - a[1],
  );

  // ── Pipeline stage counts ────────────────────────────────────
  // The bot's "production line" — items flowing through stages.
  // The math: open fails are the inbox, fixed are the outbox, the
  // intermediate stages are tagged via content_qc_log change_type.
  const oneDayAgo = hoursAgoIso(24);
  const sevenDaysAgoIso = sevenDaysAgo;
  const [
    rescueRecsAll,
    rescueExecuted,
    regenLast7d,
    verifyLast7d,
    stuckHighAttempt,
    stuckAgedQuarantine,
  ] = await Promise.all([
    supabase
      .from("content_qc_log")
      .select("finding_id, target_id, after, created_at")
      .eq("change_type", "format_rescue_recommendation")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("content_qc_log")
      .select("finding_id")
      .eq("change_type", "format_executed"),
    supabase
      .from("content_qc_log")
      .select("change_type")
      .in("change_type", ["regen_image", "regen_audio", "regen_question"])
      .gte("created_at", sevenDaysAgoIso),
    supabase
      .from("content_qc_log")
      .select("change_type, after")
      .in("change_type", ["verify_image", "verify_audio"])
      .gte("created_at", sevenDaysAgoIso),
    supabase
      .from("question_qc_status")
      .select("target_id, qc_attempt_count, updated_at")
      .gte("qc_attempt_count", 3)
      .order("qc_attempt_count", { ascending: false })
      .limit(10),
    supabase
      .from("question_qc_status")
      .select("target_id, updated_at")
      .eq("qc_status", "quarantined")
      .lt("updated_at", daysAgoIso(7))
      .order("updated_at", { ascending: true })
      .limit(10),
  ]);
  const allRecs = (rescueRecsAll.data ?? []) as any[];
  const executedFindings = new Set(
    ((rescueExecuted.data ?? []) as any[])
      .map((r: any) => r.finding_id)
      .filter(Boolean),
  );
  const pendingRescue = allRecs.filter(
    (r: any) => !r.finding_id || !executedFindings.has(r.finding_id),
  );
  const NEEDS_LOCAL_ACTIONS = new Set([
    "drop_audio",
    "drop_image",
    "convert_to_text_only",
    "convert_to_missing_word",
    "convert_to_sentence_build",
    "convert_to_category_sort",
    "convert_to_tap_to_pair",
    "convert_to_space_insertion",
    "render_chart_via_css",
    "drop_question_entirely",
  ]);
  const pendingRescueLocal = pendingRescue.filter((r: any) =>
    NEEDS_LOCAL_ACTIONS.has(r?.after?.action ?? ""),
  ).length;
  const pendingRescueServerless = pendingRescue.length - pendingRescueLocal;
  const verifyPasses = ((verifyLast7d.data ?? []) as any[]).filter(
    (r: any) => r?.after?.verdict === "pass",
  ).length;
  const verifyReopens = ((verifyLast7d.data ?? []) as any[]).filter(
    (r: any) => r?.after?.verdict === "fail",
  ).length;
  const regenCount7d = (regenLast7d.data ?? []).length;
  const stuckTargets = (stuckHighAttempt.data ?? []) as Array<{
    target_id: string;
    qc_attempt_count: number;
    updated_at: string;
  }>;
  const agedQuarantine = (stuckAgedQuarantine.data ?? []) as Array<{
    target_id: string;
    updated_at: string;
  }>;

  // ── Open findings, grouped by type, with handler classification ─
  // The single most-asked question on this page: "what's open and
  // who fixes it?" This section answers it directly. Cron-handled
  // means the nightly run will auto-fix; weekly-script means the
  // ops cycle (`npm run qc:*`) is needed; human means a person has
  // to make a content judgment.
  const { data: openByTypeRaw } = await supabase
    .from("content_audit_findings")
    .select("finding_type, severity, target_kind")
    .eq("status", "open")
    .neq("severity", "pass");
  const openByType = new Map<
    string,
    { fail: number; warn: number; total: number; sample_target_kind: string }
  >();
  for (const r of (openByTypeRaw ?? []) as any[]) {
    const cur = openByType.get(r.finding_type) ?? {
      fail: 0,
      warn: 0,
      total: 0,
      sample_target_kind: r.target_kind,
    };
    if (r.severity === "fail") cur.fail++;
    else if (r.severity === "warn") cur.warn++;
    cur.total++;
    openByType.set(r.finding_type, cur);
  }

  // Last cron-fixed timestamp per finding type (so we can show
  // "fixed 2h ago" next to each row).
  const { data: lastFixedRaw } = await supabase
    .from("content_audit_findings")
    .select("finding_type, resolved_at")
    .eq("status", "fixed")
    .order("resolved_at", { ascending: false })
    .limit(500);
  const lastFixedByType = new Map<string, string>();
  for (const r of (lastFixedRaw ?? []) as any[]) {
    if (!lastFixedByType.has(r.finding_type) && r.resolved_at) {
      lastFixedByType.set(r.finding_type, r.resolved_at);
    }
  }

  type Handler = {
    label: string;
    tone: "auto" | "script" | "human";
    note: string;
  };
  const HANDLER_BY_TYPE: Record<string, Handler> = {
    "q.image_quality": {
      label: "Cron auto",
      tone: "auto",
      note: "Imagen regen + storage swap",
    },
    "q.audio_quality": {
      label: "Cron auto",
      tone: "auto",
      note: "Vertex TTS regen + storage swap",
    },
    "step.audio_quality": {
      label: "Cron auto",
      tone: "auto",
      note: "Lesson-slide audio regen (just wired)",
    },
    "q.no_self_leak": {
      label: "Cron dismisses",
      tone: "auto",
      note: "Known judge FP (root-word identification)",
    },
    "q.unique_choices": {
      label: "Cron dismisses (some)",
      tone: "auto",
      note: "FP on L.x.2 / RF.x.1a; otherwise hand review",
    },
    "q.should_be_asked": {
      label: "Weekly script",
      tone: "script",
      note: "npm run qc:regen-questions (edits JSON)",
    },
    "q.better_format": {
      label: "Weekly script",
      tone: "script",
      note: "npm run qc:format-rescue + qc:format-execute",
    },
    "slide.judge": {
      label: "Human review",
      tone: "human",
      note: "Lesson pedagogy edit — Jen / Filip review",
    },
    "lesson.thin_animation": {
      label: "Weekly script",
      tone: "script",
      note: "Below-K richness — npm run qc:enrich-lessons (proposes timing primitives)",
    },
    "slide.few_steps": {
      label: "Weekly script",
      tone: "script",
      note: "K bar is ≥2 steps/slide — same enrichment script splits long ttsScripts",
    },
    "slide.empty": {
      label: "Human review",
      tone: "human",
      note: "Lesson slide content needs author input",
    },
    "step.long_letter_text": {
      label: "Human review",
      tone: "human",
      note: "Lesson copy length judgment",
    },
  };
  const FALLBACK_HANDLER: Handler = {
    label: "Hand review",
    tone: "human",
    note: "Not yet automated — flag for Filip",
  };

  type OpenRow = {
    finding_type: string;
    fail: number;
    warn: number;
    total: number;
    handler: Handler;
    lastFixed: string | null;
  };
  const openRows: OpenRow[] = Array.from(openByType.entries())
    .map(([finding_type, counts]) => ({
      finding_type,
      fail: counts.fail,
      warn: counts.warn,
      total: counts.total,
      handler: HANDLER_BY_TYPE[finding_type] ?? FALLBACK_HANDLER,
      lastFixed: lastFixedByType.get(finding_type) ?? null,
    }))
    .sort((a, b) => b.fail - a.fail || b.total - a.total);

  // Cron's next-run forecast — sum the open counts for finding types
  // the cron handles. Not every type's full open set will be cleared
  // (the cron limits to ~30/run) but this gives the upper bound.
  const cronTypes = new Set([
    "q.image_quality",
    "q.audio_quality",
    "step.audio_quality",
  ]);
  const cronFpTypes = new Set(["q.no_self_leak", "q.unique_choices"]);
  const cronWillRegen = openRows
    .filter((r) => cronTypes.has(r.finding_type))
    .reduce((acc, r) => acc + r.fail, 0);
  const cronWillDismiss = openRows
    .filter((r) => cronFpTypes.has(r.finding_type))
    .reduce((acc, r) => acc + r.fail + r.warn, 0);

  // ── Cron schedule + last run status ──────────────────────────
  // vercel.json crons we know about, paired with their last runs
  // from the audit/factory tables.
  const crons = [
    { path: "/api/cron/qc-bot", cron: "0 6 * * *", label: "QC bot" },
    {
      path: "/api/cron/factory-calibrated-mcq",
      cron: "0 7 * * *",
      label: "Factory MCQ",
    },
    {
      path: "/api/cron/factory-leveled-passage",
      cron: "0 8 * * *",
      label: "Factory passages",
    },
    { path: "/api/cron/daily-question", cron: "0 9 * * *", label: "Daily question" },
    {
      path: "/api/cron/parent-digest",
      cron: "0 13 * * 1",
      label: "Parent digest (Mon)",
    },
  ];
  const factoryLast = await supabase
    .from("factory_runs")
    .select("asset_kind, status, completed_at, error")
    .order("completed_at", { ascending: false })
    .limit(20);
  const factoryByKind = new Map<string, any>();
  for (const r of (factoryLast.data ?? []) as any[]) {
    if (!factoryByKind.has(r.asset_kind)) factoryByKind.set(r.asset_kind, r);
  }

  // ── Provider quota awareness ─────────────────────────────────
  // Free Gemini tier caps generate_requests per day per model. Show
  // approximate usage so we know when to expect 429s.
  const usageByModel = await supabase
    .from("ai_usage_log")
    .select("model, success")
    .gte("created_at", oneDayAgo);
  const modelCounts = new Map<string, { ok: number; fail: number }>();
  for (const r of (usageByModel.data ?? []) as any[]) {
    const m = (r.model ?? "unknown") as string;
    const cur = modelCounts.get(m) ?? { ok: 0, fail: 0 };
    if (r.success) cur.ok++;
    else cur.fail++;
    modelCounts.set(m, cur);
  }
  const QUOTA_HINTS: Record<string, { dailyLimit: number; tier: string }> = {
    "gemini-2.5-flash-preview-tts": { dailyLimit: 100, tier: "free" },
    "gemini-2.5-flash-tts": { dailyLimit: 100, tier: "free" },
    "gemini-2.5-flash-image": { dailyLimit: 500, tier: "free" },
    "gemini-2.5-flash": { dailyLimit: 1500, tier: "free" },
  };
  const quotaRows = Array.from(modelCounts.entries())
    .map(([model, counts]) => {
      const hint = QUOTA_HINTS[model];
      const used = counts.ok + counts.fail;
      const limit = hint?.dailyLimit ?? null;
      const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : null;
      return { model, used, ok: counts.ok, fail: counts.fail, limit, pct };
    })
    .sort((a, b) => b.used - a.used);

  // ── Bot health: last cron run + recent errors + cost ──────────
  const [latestActivityRes, recentErrorsRes, dailyCostRes] = await Promise.all([
    supabase
      .from("content_qc_log")
      .select("created_at, agent")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("ai_usage_log")
      .select("kind, error, created_at")
      .eq("success", false)
      .gte("created_at", oneDayAgo)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("ai_usage_log")
      .select("credits_used")
      .eq("success", true)
      .gte("created_at", oneDayAgo),
  ]);
  const latestActivity = latestActivityRes.data as
    | { created_at: string; agent: string }
    | null;
  const recentErrors = (recentErrorsRes.data ?? []) as Array<{
    kind: string;
    error: string;
    created_at: string;
  }>;
  const dailyCredits = ((dailyCostRes.data ?? []) as Array<{ credits_used: number }>).reduce(
    (acc, r) => acc + (r.credits_used ?? 0),
    0,
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/owner"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Owner home
      </Link>

      <div className="mt-3 flex flex-wrap items-baseline gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600">
            <Bot className="h-4 w-4" />
            Quality control
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            QC bot
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            What the bot's been doing across the catalog. Auto-runs nightly
            at 06:00 UTC; manual triggers via{" "}
            <code className="rounded bg-zinc-100 px-1 text-[11px]">npm run qc:*</code>.
          </p>
        </div>
      </div>

      {/* Bot health */}
      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-600">
          <Bot className="h-3.5 w-3.5" />
          Bot health
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Last activity
            </div>
            <div className="mt-1 text-sm font-bold text-zinc-900">
              {latestActivity ? timeAgo(latestActivity.created_at) : "—"}
            </div>
            <div className="text-[11px] text-zinc-500">
              {latestActivity
                ? AGENT_LABELS[latestActivity.agent] ?? latestActivity.agent
                : "no activity yet"}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Credits spent (24h)
            </div>
            <div className="mt-1 text-sm font-bold text-zinc-900">
              {dailyCredits.toLocaleString()}
            </div>
            <div className="text-[11px] text-zinc-500">
              ≈ ${(dailyCredits * 0.005).toFixed(2)} at $0.005/credit
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Errors (24h)
            </div>
            <div
              className={`mt-1 text-sm font-bold ${
                recentErrors.length > 0 ? "text-red-700" : "text-emerald-700"
              }`}
            >
              {recentErrors.length}
            </div>
            <div className="text-[11px] text-zinc-500">
              {recentErrors.length === 0
                ? "all clean"
                : recentErrors[0].kind +
                  ": " +
                  String(recentErrors[0].error ?? "")
                    .replace(/[\n\r]+/g, " ")
                    .slice(0, 60)}
            </div>
          </div>
        </div>
      </section>

      {/* What's open + who handles each finding type */}
      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-600">
            <ListChecks className="h-3.5 w-3.5" />
            Open by finding type · who fixes it
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <span className="rounded-full bg-violet-50 px-2 py-0.5 font-bold text-violet-700">
              Tonight @ 06:00 UTC
            </span>
            <span>
              {cronWillRegen} regen · {cronWillDismiss} dismissals
            </span>
          </div>
        </div>
        {openRows.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            No open findings. The catalog is currently clean.
          </p>
        ) : (
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <tr>
                <th className="pb-2">Finding type</th>
                <th className="pb-2 text-right">Open</th>
                <th className="pb-2 text-right">Fail / Warn</th>
                <th className="pb-2">Handler</th>
                <th className="pb-2 text-right">Last fixed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {openRows.map((row) => {
                const tone =
                  row.handler.tone === "auto"
                    ? "bg-emerald-100 text-emerald-700"
                    : row.handler.tone === "script"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-700";
                return (
                  <tr key={row.finding_type} className="align-top">
                    <td className="py-2 pr-3">
                      <div className="font-mono text-xs font-bold text-zinc-900">
                        {row.finding_type}
                      </div>
                      <div className="mt-0.5 text-[11px] text-zinc-500">
                        {row.handler.note}
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-right font-mono text-sm font-bold text-zinc-900">
                      {row.total}
                    </td>
                    <td className="py-2 pr-3 text-right text-xs text-zinc-600">
                      <span className="font-bold text-rose-700">{row.fail}</span>
                      <span className="px-1 text-zinc-300">·</span>
                      <span className="text-amber-700">{row.warn}</span>
                    </td>
                    <td className="py-2 pr-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone}`}
                      >
                        {row.handler.label}
                      </span>
                    </td>
                    <td className="py-2 text-right text-[11px] text-zinc-500">
                      {row.lastFixed ? timeAgo(row.lastFixed) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-zinc-500">
          <span>
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Cron auto = fixed nightly without ops
          </span>
          <span>
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-500" />
            Weekly script = needs <code className="rounded bg-zinc-100 px-1">npm run qc:*</code>
          </span>
          <span>
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-rose-500" />
            Human review = pedagogy / authoring decision
          </span>
        </div>
      </section>

      {/* Pipeline funnel — what's flowing through the bot */}
      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-600">
            <TrendingUp className="h-3.5 w-3.5" />
            Pipeline
          </div>
          <span className="text-[10px] text-zinc-400">
            audit → regen → verify → rescue → execute → resolved
          </span>
        </div>
        <ol className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <PipelineStage
            label="Open findings"
            value={(openFails.count ?? 0) + (openWarns.count ?? 0)}
            sub={`${openFails.count ?? 0} fail · ${openWarns.count ?? 0} warn`}
            tone="red"
            href="/owner/content-audit?severity=fail"
          />
          <PipelineStage
            label="Quarantined"
            value={quarantinedQuestions.count ?? 0}
            sub="held back from delivery"
            tone="amber"
          />
          <PipelineStage
            label="Regen (7d)"
            value={regenCount7d}
            sub="auto-fix attempted"
            tone="violet"
          />
          <PipelineStage
            label="Verify (7d)"
            value={verifyPasses + verifyReopens}
            sub={`${verifyPasses} ok · ${verifyReopens} reopened`}
            tone="emerald"
          />
          <PipelineStage
            label="Rescue queue"
            value={pendingRescue.length}
            sub={`${pendingRescueServerless} auto · ${pendingRescueLocal} local`}
            tone="amber"
          />
          <PipelineStage
            label="Resolved"
            value={fixedAllTime.count ?? 0}
            sub="all-time"
            tone="emerald"
          />
        </ol>
      </section>

      {/* Crons */}
      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-600">
          <Clock className="h-3.5 w-3.5" />
          Cron schedule
        </div>
        <ul className="mt-3 space-y-1.5">
          {crons.map((c) => {
            const next = nextCronFire(c.cron);
            const lastRun =
              c.path === "/api/cron/factory-leveled-passage"
                ? factoryByKind.get("leveled_passage")
                : c.path === "/api/cron/factory-calibrated-mcq"
                ? factoryByKind.get("calibrated_mcq")
                : null;
            return (
              <li
                key={c.path}
                className="flex flex-wrap items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs"
              >
                <span className="font-bold text-zinc-900">{c.label}</span>
                <code className="rounded bg-white px-1.5 py-0.5 text-[10px] text-zinc-500 ring-1 ring-zinc-200">
                  {c.cron}
                </code>
                <span className="ml-auto text-[11px] text-zinc-500">
                  next:{" "}
                  <span className="font-semibold text-zinc-800">
                    {next ?? "—"}
                  </span>
                </span>
                {lastRun && (
                  <span className="text-[11px] text-zinc-500">
                    last:{" "}
                    <span
                      className={`font-semibold ${
                        lastRun.error ? "text-red-700" : "text-emerald-700"
                      }`}
                    >
                      {lastRun.error
                        ? "errored"
                        : lastRun.status === "completed"
                        ? "ok"
                        : lastRun.status}
                    </span>{" "}
                    ({timeAgo(lastRun.completed_at ?? new Date().toISOString())})
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Provider quotas */}
      {quotaRows.length > 0 && (
        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-600">
            <Zap className="h-3.5 w-3.5" />
            Provider quotas (today)
          </div>
          <ul className="mt-3 space-y-1.5">
            {quotaRows.map((q) => {
              const danger = q.pct !== null && q.pct >= 80;
              const warn = q.pct !== null && q.pct >= 50 && q.pct < 80;
              return (
                <li key={q.model} className="text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="font-mono font-bold text-zinc-900">
                      {q.model}
                    </code>
                    <span className="text-zinc-500">
                      {q.used} call{q.used === 1 ? "" : "s"}
                    </span>
                    {q.fail > 0 && (
                      <span className="text-red-600">
                        ({q.fail} fail{q.fail === 1 ? "" : "s"})
                      </span>
                    )}
                    {q.limit && (
                      <span
                        className={`ml-auto font-semibold ${
                          danger
                            ? "text-red-700"
                            : warn
                            ? "text-amber-700"
                            : "text-emerald-700"
                        }`}
                      >
                        {q.pct}% of {q.limit.toLocaleString()}/day
                      </span>
                    )}
                    {!q.limit && (
                      <span className="ml-auto text-zinc-400">no daily cap</span>
                    )}
                  </div>
                  {q.limit && (
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className={`h-full ${
                          danger
                            ? "bg-red-500"
                            : warn
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${q.pct}%` }}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Stuck items */}
      {(stuckTargets.length > 0 || agedQuarantine.length > 0) && (
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-800">
            <CircleAlert className="h-3.5 w-3.5" />
            Stuck items
          </div>
          {stuckTargets.length > 0 && (
            <div className="mt-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                3+ regen attempts
              </div>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {stuckTargets.map((s) => (
                  <li key={s.target_id}>
                    <Link
                      href={`/owner/qc-bot/${encodeURIComponent(s.target_id)}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold ring-1 ring-amber-200 hover:ring-violet-300"
                    >
                      <code className="font-mono font-bold">{s.target_id}</code>
                      <span className="rounded-full bg-amber-200 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-900">
                        {s.qc_attempt_count}×
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {agedQuarantine.length > 0 && (
            <div className="mt-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Quarantined &gt;7d (no resolution)
              </div>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {agedQuarantine.map((a) => (
                  <li key={a.target_id}>
                    <Link
                      href={`/owner/qc-bot/${encodeURIComponent(a.target_id)}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold ring-1 ring-amber-200 hover:ring-violet-300"
                    >
                      <code className="font-mono font-bold">{a.target_id}</code>
                      <span className="text-[10px] text-zinc-500">
                        {timeAgo(a.updated_at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Hero stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          tone="red"
          icon={<XCircle className="h-4 w-4" />}
          label="Open fails"
          value={openFails.count ?? 0}
          href="/owner/content-audit?severity=fail"
        />
        <Stat
          tone="amber"
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Open warns"
          value={openWarns.count ?? 0}
          href="/owner/content-audit?severity=warn"
        />
        <Stat
          tone="emerald"
          icon={<Check className="h-4 w-4" />}
          label="Fixed (all-time)"
          value={fixedAllTime.count ?? 0}
        />
        <Stat
          tone="violet"
          icon={<Wand2 className="h-4 w-4" />}
          label="Bot actions (7d)"
          value={fixedLast7d.count ?? 0}
        />
        <Stat
          tone="indigo"
          icon={<RefreshCcw className="h-4 w-4" />}
          label="Quarantined"
          value={quarantinedQuestions.count ?? 0}
          subLabel="held back from delivery"
        />
        <Stat
          tone="zinc"
          icon={<ListChecks className="h-4 w-4" />}
          label="Total log entries"
          value={totalLogged.count ?? 0}
        />
        <Stat
          tone="amber"
          icon={<Lightbulb className="h-4 w-4" />}
          label="Format-rescue queue"
          value={rescueRows.length}
          subLabel="awaiting action"
        />
      </div>

      {/* Activity by agent */}
      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
          Activity by agent — last 7 days
        </h2>
        {agentSorted.length === 0 ? null : (
          <div className="mt-3 flex flex-wrap gap-2">
            {agentSorted.map(([agent, count]) => (
              <div
                key={agent}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs"
              >
                <span className="font-bold text-zinc-900">
                  {AGENT_LABELS[agent] ?? agent}
                </span>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                  {count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Format-rescue queue — awaiting humans */}
      {rescueRows.length > 0 && (
        <section className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
              Format-rescue queue
            </h2>
            <p className="text-[11px] text-zinc-400">
              The bot reviewed these and recommends a format change. Apply
              executors arrive in the next session.
            </p>
          </div>
          <ul className="mt-3 space-y-2">
            {rescueRows.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Link
                    href={`/owner/qc-bot/${encodeURIComponent(r.target_id)}`}
                    className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-zinc-900 ring-1 ring-zinc-200 hover:text-violet-700 hover:ring-violet-300"
                  >
                    {r.target_id}
                  </Link>
                  <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-900">
                    {String(r.after?.action ?? "")
                      .replace(/_/g, " ")
                      .toLowerCase()}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {timeAgo(r.created_at)}
                  </span>
                  <span className="ml-auto">
                    <ApplyRescueButton
                      targetId={r.target_id}
                      action={String(r.after?.action ?? "")}
                    />
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-800">{r.reason ?? ""}</p>
                {r.after?.constraint && (
                  <p className="mt-1 rounded-lg bg-white px-2.5 py-1 font-mono text-[11px] text-zinc-700 ring-1 ring-zinc-100">
                    constraint: {r.after.constraint}
                  </p>
                )}
                {r.before && (
                  <details className="mt-2 text-[11px] text-zinc-500">
                    <summary className="cursor-pointer hover:text-zinc-700">
                      Source state
                    </summary>
                    <pre className="mt-1 whitespace-pre-wrap rounded bg-white p-2 text-[10px] ring-1 ring-zinc-100">
                      {JSON.stringify(r.before, null, 2)}
                    </pre>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recent activity feed */}
      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
          Recent activity
        </h2>
        {log.length === 0 ? null : (
          <ul className="mt-3 space-y-1.5">
            {log.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs ring-1 ring-zinc-100"
              >
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                    CHANGE_TONES[row.change_type] ?? "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {CHANGE_ICONS[row.change_type] ?? <Wand2 className="h-3 w-3" />}
                  {row.change_type.replace(/_/g, " ")}
                </span>
                <Link
                  href={`/owner/qc-bot/${encodeURIComponent(row.target_id)}`}
                  className="rounded bg-zinc-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-zinc-900 ring-1 ring-zinc-200 hover:text-violet-700 hover:ring-violet-300"
                >
                  {row.target_id}
                </Link>
                <span className="text-[10px] font-semibold text-violet-600">
                  {AGENT_LABELS[row.agent] ?? row.agent}
                </span>
                <span className="min-w-0 flex-1 truncate text-zinc-600">
                  {row.reason ?? ""}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {timeAgo(row.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Worker quick-reference */}
      <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
          Manual triggers
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Run from a shell on the dev box. Each is idempotent.
        </p>
        <ul className="mt-3 grid gap-1.5 text-xs sm:grid-cols-2">
          <Trigger cmd="npm run qc:bot" desc="Auto-dismiss known false positives" />
          <Trigger cmd="npm run qc:regen-images" desc="Rebuild flagged images" />
          <Trigger cmd="npm run qc:regen-audio" desc="Rebuild flagged audio" />
          <Trigger cmd="npm run qc:regen-questions" desc="AI-rewrite stuck MCQs (edits JSON)" />
          <Trigger cmd="npm run qc:verify" desc="Re-judge recently-fixed assets" />
          <Trigger cmd="npm run qc:format-rescue" desc="Brain: recommend format change for stuck items" />
          <Trigger cmd="npm run qc:audit" desc="Full catalog audit (long-running)" />
        </ul>
      </section>
    </div>
  );
}

function Stat({
  tone,
  icon,
  label,
  value,
  subLabel,
  href,
}: {
  tone: "red" | "amber" | "emerald" | "violet" | "indigo" | "zinc";
  icon: React.ReactNode;
  label: string;
  value: number;
  subLabel?: string;
  href?: string;
}) {
  const tones: Record<string, string> = {
    red: "from-red-50 to-rose-50 border-red-200 text-red-700",
    amber: "from-amber-50 to-orange-50 border-amber-200 text-amber-800",
    emerald: "from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700",
    violet: "from-violet-50 to-indigo-50 border-violet-200 text-violet-700",
    indigo: "from-indigo-50 to-sky-50 border-indigo-200 text-indigo-700",
    zinc: "from-zinc-50 to-zinc-100 border-zinc-200 text-zinc-700",
  };
  const inner = (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-4 transition ${tones[tone]} ${
        href ? "hover:-translate-y-0.5 hover:shadow-md" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900">
        {value.toLocaleString()}
      </div>
      {subLabel && (
        <div className="mt-0.5 text-[11px] text-zinc-500">{subLabel}</div>
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : <div>{inner}</div>;
}

function PipelineStage({
  label,
  value,
  sub,
  tone,
  href,
}: {
  label: string;
  value: number;
  sub: string;
  tone: "red" | "amber" | "violet" | "emerald";
  href?: string;
}) {
  const tones: Record<string, string> = {
    red: "bg-red-50 ring-red-200 text-red-700",
    amber: "bg-amber-50 ring-amber-200 text-amber-800",
    violet: "bg-violet-50 ring-violet-200 text-violet-700",
    emerald: "bg-emerald-50 ring-emerald-200 text-emerald-700",
  };
  const inner = (
    <li
      className={`rounded-xl p-3 ring-1 ${tones[tone]} ${
        href ? "transition hover:-translate-y-0.5 hover:shadow-sm" : ""
      }`}
    >
      <div className="text-[10px] font-bold uppercase tracking-widest">
        {label}
      </div>
      <div className="mt-0.5 text-2xl font-extrabold tracking-tight text-zinc-900">
        {value.toLocaleString()}
      </div>
      <div className="mt-0.5 text-[10px] text-zinc-600">{sub}</div>
    </li>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

/** Compute the next fire time of a Vercel cron expression (5-field
 *  UTC). Supports the tiny subset our crons use: `M H * * *` and
 *  `M H * * D`. Returns "in 4h 32m" or absolute time string. */
function nextCronFire(expr: string): string | null {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [m, h, , , d] = parts;
  const min = Number(m);
  const hr = Number(h);
  if (!Number.isFinite(min) || !Number.isFinite(hr)) return null;
  const now = new Date();
  const target = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hr,
      min,
      0,
    ),
  );
  // Day-of-week constraint (Mon=1 in Vercel cron).
  const dayMatch = (date: Date): boolean => {
    if (d === "*") return true;
    const want = Number(d);
    return Number.isFinite(want) && date.getUTCDay() === want;
  };
  while (target.getTime() <= now.getTime() || !dayMatch(target)) {
    target.setUTCDate(target.getUTCDate() + 1);
  }
  const diffMs = target.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 60) return `in ${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  const remMin = diffMin % 60;
  if (diffHr < 24) return `in ${diffHr}h${remMin > 0 ? ` ${remMin}m` : ""}`;
  const diffDay = Math.floor(diffHr / 24);
  return `in ${diffDay}d`;
}

function Trigger({ cmd, desc }: { cmd: string; desc: string }) {
  return (
    <li className="rounded-lg bg-zinc-50 px-3 py-1.5 ring-1 ring-zinc-100">
      <code className="text-[11px] font-bold text-zinc-900">{cmd}</code>
      <span className="ml-2 text-[11px] text-zinc-500">— {desc}</span>
    </li>
  );
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  return `${w}w`;
}
