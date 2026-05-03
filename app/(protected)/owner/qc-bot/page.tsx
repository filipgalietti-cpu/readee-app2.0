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
} from "lucide-react";

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
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
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

  // ── Bot health: last cron run + recent errors + cost ──────────
  const oneDayAgo = new Date(Date.now() - 86_400_000).toISOString();
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
