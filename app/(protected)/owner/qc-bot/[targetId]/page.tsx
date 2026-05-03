import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import {
  ShieldOff,
  ArrowLeft,
  AlertTriangle,
  Bot,
  XCircle,
  Check,
  Lightbulb,
  Wand2,
  ImageIcon,
  Volume2,
  FileText,
  ListChecks,
  Sparkles,
  ChevronRight,
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

type FindingRow = {
  id: string;
  target_kind: string;
  target_id: string;
  finding_type: string;
  severity: string;
  status: string;
  message: string | null;
  resolver_note: string | null;
  resolved_at: string | null;
  created_at: string;
  target_snapshot: any;
};

const SEVERITY_TONES: Record<string, string> = {
  fail: "bg-red-100 text-red-700 ring-red-200",
  warn: "bg-amber-100 text-amber-800 ring-amber-200",
  pass: "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

const STATUS_TONES: Record<string, string> = {
  open: "bg-red-50 text-red-700 ring-red-200",
  fixed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  wont_fix: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

const CHANGE_ICONS: Record<string, React.ReactNode> = {
  regen_image: <ImageIcon className="h-3.5 w-3.5" />,
  regen_audio: <Volume2 className="h-3.5 w-3.5" />,
  regen_question: <FileText className="h-3.5 w-3.5" />,
  dismiss_fp: <Check className="h-3.5 w-3.5" />,
  verify_image: <ListChecks className="h-3.5 w-3.5" />,
  verify_audio: <ListChecks className="h-3.5 w-3.5" />,
  format_rescue_recommendation: <Lightbulb className="h-3.5 w-3.5" />,
  format_executed: <Wand2 className="h-3.5 w-3.5" />,
};

export default async function QcTargetTimelinePage({
  params,
}: {
  params: Promise<{ targetId: string }>;
}) {
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
      </div>
    );
  }

  const { targetId: rawId } = await params;
  const targetId = decodeURIComponent(rawId);

  const supabase = await createClient();
  const [findingsRes, logRes, qcStatusRes] = await Promise.all([
    supabase
      .from("content_audit_findings")
      .select(
        "id, target_kind, target_id, finding_type, severity, status, message, resolver_note, resolved_at, created_at, target_snapshot",
      )
      .eq("target_id", targetId)
      .order("created_at", { ascending: false }),
    supabase
      .from("content_qc_log")
      .select(
        "id, target_kind, target_id, change_type, reason, agent, created_at, before, after",
      )
      .eq("target_id", targetId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("question_qc_status")
      .select("qc_status, qc_attempt_count, updated_at")
      .eq("target_id", targetId)
      .maybeSingle(),
  ]);

  const findings = (findingsRes.data ?? []) as FindingRow[];
  const log = (logRes.data ?? []) as LogRow[];
  const qcStatus = qcStatusRes.data as
    | { qc_status: string; qc_attempt_count: number; updated_at: string }
    | null;

  // Pull the most recent target_snapshot to render current state.
  const latestSnapshot = findings[0]?.target_snapshot ?? {};
  const targetKind = findings[0]?.target_kind ?? "question";

  const openFails = findings.filter(
    (f) => f.status === "open" && f.severity === "fail",
  ).length;
  const totalAttempts = log.filter((l) =>
    ["regen_image", "regen_audio", "regen_question", "format_executed"].includes(
      l.change_type,
    ),
  ).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/owner/qc-bot"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        QC bot
      </Link>

      <div className="mt-3 flex flex-wrap items-baseline gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600">
            <Bot className="h-4 w-4" />
            Target timeline
          </div>
          <h1 className="mt-1 font-mono text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {targetId}
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            {targetKind} · {findings.length} finding(s) · {totalAttempts}{" "}
            bot action(s) · {log.length} log entries
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {qcStatus && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${
                qcStatus.qc_status === "quarantined"
                  ? "bg-amber-100 text-amber-800 ring-amber-200"
                  : qcStatus.qc_status === "retired"
                  ? "bg-zinc-100 text-zinc-600 ring-zinc-200"
                  : "bg-emerald-100 text-emerald-700 ring-emerald-200"
              }`}
            >
              {qcStatus.qc_status}
            </span>
          )}
          {openFails > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-red-700 ring-1 ring-red-200">
              <XCircle className="h-3 w-3" />
              {openFails} open fail{openFails === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>

      {/* Current state */}
      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
          Current state
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Kind" value={latestSnapshot.kind ?? latestSnapshot.type ?? targetKind} />
          <Field label="Standard" value={latestSnapshot.standard_id ?? "—"} />
          <Field
            label="Audio"
            value={latestSnapshot.audio_url ? "present" : "none"}
            link={latestSnapshot.audio_url}
          />
          <Field
            label="Image"
            value={latestSnapshot.image_url ? "present" : "none"}
            link={latestSnapshot.image_url}
          />
          <Field
            label="Chart data"
            value={latestSnapshot.chart_data ? "yes" : "no"}
          />
          <Field
            label="Bot attempts"
            value={String(qcStatus?.qc_attempt_count ?? 0)}
          />
        </div>
        {latestSnapshot.prompt && (
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer font-semibold text-zinc-700">
              Prompt + choices
            </summary>
            <div className="mt-2 rounded-xl bg-zinc-50 p-3 text-xs">
              <p className="font-semibold text-zinc-900">
                {latestSnapshot.prompt}
              </p>
              {Array.isArray(latestSnapshot.choices) && latestSnapshot.choices.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {latestSnapshot.choices.map((c: string, i: number) => (
                    <li
                      key={`${i}-${c}`}
                      className={
                        c === latestSnapshot.correct
                          ? "rounded bg-emerald-100 px-2 py-1 font-semibold text-emerald-800"
                          : "px-2 py-1 text-zinc-700"
                      }
                    >
                      {String.fromCharCode(65 + i)}. {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>
        )}
      </section>

      {/* Findings */}
      {findings.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
            Findings ({findings.length})
          </h2>
          <ul className="mt-3 space-y-2">
            {findings.map((f) => (
              <li
                key={f.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-extrabold uppercase tracking-wider ring-1 ${
                      SEVERITY_TONES[f.severity] ?? ""
                    }`}
                  >
                    {f.severity}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-extrabold uppercase tracking-wider ring-1 ${
                      STATUS_TONES[f.status] ?? "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {f.status}
                  </span>
                  <code className="rounded bg-zinc-50 px-1.5 py-0.5 text-[11px] font-bold ring-1 ring-zinc-200">
                    {f.finding_type}
                  </code>
                  <span className="text-[10px] text-zinc-400">
                    {timeAgo(f.created_at)}
                  </span>
                </div>
                {f.message && (
                  <p className="mt-2 text-sm text-zinc-800">{f.message}</p>
                )}
                {f.resolver_note && (
                  <p className="mt-1 text-xs italic text-zinc-500">
                    {f.resolver_note}
                  </p>
                )}
                {f.resolved_at && (
                  <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                    Resolved {timeAgo(f.resolved_at)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Activity timeline */}
      {log.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
            Activity timeline ({log.length})
          </h2>
          <ol className="mt-3 space-y-2">
            {log.map((row) => (
              <li
                key={row.id}
                className="flex gap-3 rounded-xl bg-white p-3 ring-1 ring-zinc-100"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                  {CHANGE_ICONS[row.change_type] ?? <Bot className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-extrabold uppercase tracking-wider text-zinc-700">
                      {row.change_type.replace(/_/g, " ")}
                    </span>
                    <span className="font-semibold text-violet-600">
                      {row.agent}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {timeAgo(row.created_at)}
                    </span>
                  </div>
                  {row.reason && (
                    <p className="mt-1 text-sm text-zinc-800">{row.reason}</p>
                  )}
                  {(row.after?.action || row.after?.constraint) && (
                    <p className="mt-1 text-[11px] font-semibold text-amber-700">
                      Action: {row.after?.action}
                      {row.after?.constraint && (
                        <span className="font-normal text-zinc-600">
                          {" "}— {row.after.constraint}
                        </span>
                      )}
                    </p>
                  )}
                  {(row.before || row.after) && (
                    <details className="mt-1 text-[11px] text-zinc-500">
                      <summary className="cursor-pointer hover:text-zinc-700">
                        Diff
                      </summary>
                      <div className="mt-1 grid gap-1 sm:grid-cols-2">
                        <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-zinc-50 p-2 text-[10px]">
                          before: {JSON.stringify(row.before, null, 2)}
                        </pre>
                        <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-zinc-50 p-2 text-[10px]">
                          after: {JSON.stringify(row.after, null, 2)}
                        </pre>
                      </div>
                    </details>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {findings.length === 0 && log.length === 0 && (
        <p className="mt-8 text-sm text-zinc-500">
          No findings or activity for this target.
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: string | null;
}) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </div>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:underline"
        >
          {value}
          <ChevronRight className="h-3 w-3" />
        </a>
      ) : (
        <div className="mt-0.5 text-sm font-semibold text-zinc-900">
          {value}
        </div>
      )}
    </div>
  );
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  return `${w}w ago`;
}
