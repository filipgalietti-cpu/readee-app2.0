import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { hasAnyAdminAccess } from "@/lib/auth/admin-gate";
import {
  ShieldOff,
  Factory,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";
import QueueRow from "./_components/QueueRow";

export const dynamic = "force-dynamic";

type QueueItem = {
  id: string;
  asset_kind: string;
  asset_ref: { table?: string; id?: string };
  source: string;
  prompt_version: string | null;
  standard_id: string | null;
  status: "ready" | "needs_review" | "rejected";
  qc_overall: "pass" | "warn" | "fail" | null;
  qc_report: any;
  title: string | null;
  thumbnail_url: string | null;
  reviewed_at: string | null;
  reviewer_verdict: "approve" | "reject" | "needs_edit" | null;
  reviewer_note: string | null;
  created_at: string;
};

type RecentRun = {
  id: string;
  run_date: string;
  asset_kind: string;
  generated_count: number;
  pass_count: number;
  warn_count: number;
  fail_count: number;
  credits_used: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  error: string | null;
};

const STATUS_FILTERS = [
  { id: "needs_review", label: "Needs review", tone: "amber" },
  { id: "ready", label: "Auto-approved", tone: "emerald" },
  { id: "rejected", label: "Rejected", tone: "red" },
  { id: "all", label: "All", tone: "zinc" },
] as const;

const ASSET_KIND_LABEL: Record<string, string> = {
  leveled_passage: "Leveled passage",
  calibrated_mcq: "Calibrated MCQ",
  decodable_book: "Decodable book",
  themed_story: "Themed story",
  vocab_card: "Vocab card",
  multi_voice_audio: "Multi-voice audio",
};

export default async function BatchQcPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; kind?: string }>;
}) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const isAdmin = await hasAnyAdminAccess(profile.id);
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
          <ShieldOff className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-900">
          Admin only
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          The factory review queue is restricted to platform admins.
        </p>
      </div>
    );
  }

  const { status: statusParam, kind: kindParam } = await searchParams;
  const status =
    statusParam &&
    STATUS_FILTERS.some((s) => s.id === statusParam)
      ? statusParam
      : "needs_review";
  const kind = kindParam && ASSET_KIND_LABEL[kindParam] ? kindParam : null;

  let q = supabase
    .from("content_review_queue")
    .select(
      "id, asset_kind, asset_ref, source, prompt_version, standard_id, status, qc_overall, qc_report, title, thumbnail_url, reviewed_at, reviewer_verdict, reviewer_note, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (status !== "all") q = q.eq("status", status);
  if (kind) q = q.eq("asset_kind", kind);
  const { data: queueRows } = await q;
  const items = ((queueRows ?? []) as any[]) as QueueItem[];

  // Today's run summary across all asset kinds.
  const today = new Date().toISOString().slice(0, 10);
  const { data: todayRuns } = await supabase
    .from("factory_runs")
    .select(
      "id, run_date, asset_kind, generated_count, pass_count, warn_count, fail_count, credits_used, status, started_at, completed_at, error",
    )
    .eq("run_date", today)
    .order("asset_kind");
  const runs = ((todayRuns ?? []) as any[]) as RecentRun[];

  // Aggregate counters across all queue items (regardless of filter)
  // for the header pills.
  const { count: needsCount } = await supabase
    .from("content_review_queue")
    .select("id", { count: "exact", head: true })
    .eq("status", "needs_review");
  const { count: readyCount } = await supabase
    .from("content_review_queue")
    .select("id", { count: "exact", head: true })
    .eq("status", "ready");
  const { count: rejectedCount } = await supabase
    .from("content_review_queue")
    .select("id", { count: "exact", head: true })
    .eq("status", "rejected");

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
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
            <Factory className="h-4 w-4" />
            Content factory
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Batch QC queue
          </h1>
        </div>
      </div>

      {/* Today's runs */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
          <Clock className="h-3 w-3" />
          Today&apos;s factory runs
        </div>
        {runs.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No runs today yet.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {runs.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-2 rounded-lg bg-zinc-50 px-2 py-1.5 text-xs dark:bg-slate-950"
              >
                <span className="font-bold text-zinc-700 dark:text-slate-200">
                  {ASSET_KIND_LABEL[r.asset_kind] ?? r.asset_kind}
                </span>
                <StatusPill status={r.status} />
                <span className="text-zinc-500 dark:text-slate-400">
                  {r.generated_count}/{(r.pass_count + r.warn_count + r.fail_count) || 0} generated
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  {r.pass_count}
                </span>
                <span className="inline-flex items-center gap-1 text-amber-600">
                  <AlertTriangle className="h-3 w-3" />
                  {r.warn_count}
                </span>
                <span className="inline-flex items-center gap-1 text-red-600">
                  <XCircle className="h-3 w-3" />
                  {r.fail_count}
                </span>
                <span className="ml-auto font-mono text-[10px] text-zinc-400">
                  {r.credits_used} credits
                </span>
                {r.error && (
                  <span className="basis-full rounded-md bg-red-50 px-2 py-0.5 text-[10px] text-red-700">
                    {r.error}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Status filter pills */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = f.id === status;
          const count =
            f.id === "needs_review"
              ? needsCount ?? 0
              : f.id === "ready"
              ? readyCount ?? 0
              : f.id === "rejected"
              ? rejectedCount ?? 0
              : (needsCount ?? 0) + (readyCount ?? 0) + (rejectedCount ?? 0);
          return (
            <Link
              key={f.id}
              href={`/owner/batch-qc?status=${f.id}${kind ? `&kind=${kind}` : ""}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                active
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300"
              }`}
            >
              {f.label}
              <span
                className={`rounded-full px-1.5 ${
                  active ? "bg-white/20" : "bg-zinc-100 text-zinc-700"
                }`}
              >
                {count.toLocaleString()}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Asset-kind filter */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Kind
        </span>
        <Link
          href={`/owner/batch-qc?status=${status}`}
          className={`rounded-full border px-2.5 py-0.5 ${
            !kind
              ? "border-violet-400 bg-violet-50 text-violet-700"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-violet-300"
          }`}
        >
          All
        </Link>
        {Object.entries(ASSET_KIND_LABEL).map(([k, label]) => (
          <Link
            key={k}
            href={`/owner/batch-qc?status=${status}&kind=${k}`}
            className={`rounded-full border px-2.5 py-0.5 ${
              kind === k
                ? "border-violet-400 bg-violet-50 text-violet-700"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-violet-300"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Queue */}
      <ul className="mt-6 space-y-2">
        {items.length === 0 ? (
          <li className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
            Nothing in this queue.
          </li>
        ) : (
          items.map((it) => (
            <QueueRow
              key={it.id}
              item={it}
              assetKindLabel={ASSET_KIND_LABEL[it.asset_kind] ?? it.asset_kind}
            />
          ))
        )}
      </ul>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "completed"
      ? "bg-emerald-100 text-emerald-800"
      : status === "running"
      ? "bg-blue-100 text-blue-800"
      : status === "failed"
      ? "bg-red-100 text-red-800"
      : "bg-zinc-100 text-zinc-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${tone}`}>
      {status}
    </span>
  );
}
