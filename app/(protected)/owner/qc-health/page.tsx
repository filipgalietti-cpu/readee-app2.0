import Link from "next/link";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ShieldOff, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Activity, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * QC health dashboard. The gate that has to be green before we ramp
 * daily content volume per Filip's call ("have we proved to create
 * good content before we ramp it up?").
 *
 * Reads from `qc_runs` (one row per content piece per QC cycle):
 *   - passed_first_try → no heal needed, shipped clean
 *   - healed → at least one healer ran, ended clean
 *   - quarantined → exhausted attempts, still failing
 *
 * Surfaces three numbers per content type for the last 30 days:
 *   · First-pass-pass rate (want > 70%)
 *   · Auto-heal success rate among failures (want > 90%)
 *   · Quarantine count (want close to 0)
 *
 * If those numbers are green, we can confidently add new content
 * types. If not, the dashboard tells us which content type to fix
 * first.
 */

type QcRunRow = {
  content_type: string;
  outcome: "passed_first_try" | "healed" | "quarantined";
  attempts_used: number;
  duration_ms: number | null;
  created_at: string;
  initial_findings: any;
  final_findings: any;
  healer_sequence: string[] | null;
};

type Rollup = {
  contentType: string;
  total: number;
  passedFirstTry: number;
  healed: number;
  quarantined: number;
  firstPassPct: number;
  healSuccessPct: number;
  avgAttempts: number;
};

function rollup(rows: QcRunRow[]): Rollup[] {
  const byType = new Map<string, QcRunRow[]>();
  for (const r of rows) {
    const arr = byType.get(r.content_type) ?? [];
    arr.push(r);
    byType.set(r.content_type, arr);
  }
  const out: Rollup[] = [];
  for (const [contentType, list] of byType) {
    const total = list.length;
    const passedFirstTry = list.filter((r) => r.outcome === "passed_first_try").length;
    const healed = list.filter((r) => r.outcome === "healed").length;
    const quarantined = list.filter((r) => r.outcome === "quarantined").length;
    const failed = healed + quarantined; // pieces that didn't pass first try
    const firstPassPct = total > 0 ? Math.round((passedFirstTry / total) * 100) : 0;
    const healSuccessPct = failed > 0 ? Math.round((healed / failed) * 100) : 100;
    const avgAttempts =
      total > 0
        ? Math.round((list.reduce((s, r) => s + (r.attempts_used ?? 1), 0) / total) * 10) / 10
        : 0;
    out.push({
      contentType,
      total,
      passedFirstTry,
      healed,
      quarantined,
      firstPassPct,
      healSuccessPct,
      avgAttempts,
    });
  }
  out.sort((a, b) => b.total - a.total);
  return out;
}

function rateTone(pct: number, threshold: number): string {
  if (pct >= threshold) return "text-emerald-700 bg-emerald-50 ring-emerald-200";
  if (pct >= threshold - 15) return "text-amber-700 bg-amber-50 ring-amber-200";
  return "text-red-700 bg-red-50 ring-red-200";
}

export default async function QcHealthPage() {
  const profile = await requireProfile();
  if (!(await isPlatformAdmin(profile.id))) {
    return (
      <div className="mx-auto max-w-md py-24 px-4 text-center space-y-4">
        <ShieldOff className="mx-auto h-10 w-10 text-zinc-400" />
        <h1 className="text-xl font-bold text-zinc-900">Owner access required</h1>
      </div>
    );
  }

  const admin = supabaseAdmin();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: rowsRaw } = await admin
    .from("qc_runs")
    .select(
      "content_type, outcome, attempts_used, duration_ms, created_at, initial_findings, final_findings, healer_sequence",
    )
    .gte("created_at", since)
    .order("created_at", { ascending: false });
  const rows = (rowsRaw ?? []) as QcRunRow[];
  const rollups = rollup(rows);

  const totalProduced = rows.length;
  const totalFirstPass = rows.filter((r) => r.outcome === "passed_first_try").length;
  const totalHealed = rows.filter((r) => r.outcome === "healed").length;
  const totalQuarantined = rows.filter((r) => r.outcome === "quarantined").length;
  const overallFirstPass =
    totalProduced > 0 ? Math.round((totalFirstPass / totalProduced) * 100) : 0;
  const overallHealSuccess =
    totalProduced - totalFirstPass > 0
      ? Math.round((totalHealed / (totalProduced - totalFirstPass)) * 100)
      : 100;

  const recentQuarantines = rows
    .filter((r) => r.outcome === "quarantined")
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-5xl py-8 px-4 space-y-6">
      <Link
        href="/owner"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to owner
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900">QC Health</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Last 30 days. The gate before any content-volume ramp.
        </p>
      </div>

      {/* Top-line rates */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Pieces produced
          </div>
          <div className="mt-1 text-3xl font-extrabold text-zinc-900">
            {totalProduced.toLocaleString()}
          </div>
        </div>
        <div className={`rounded-2xl border p-4 ring-1 ${rateTone(overallFirstPass, 70)}`}>
          <div className="text-xs font-bold uppercase tracking-widest opacity-70">
            First-pass pass
          </div>
          <div className="mt-1 text-3xl font-extrabold">{overallFirstPass}%</div>
          <div className="mt-0.5 text-[11px] opacity-70">target ≥ 70%</div>
        </div>
        <div className={`rounded-2xl border p-4 ring-1 ${rateTone(overallHealSuccess, 90)}`}>
          <div className="text-xs font-bold uppercase tracking-widest opacity-70">
            Auto-heal success
          </div>
          <div className="mt-1 text-3xl font-extrabold">{overallHealSuccess}%</div>
          <div className="mt-0.5 text-[11px] opacity-70">target ≥ 90%</div>
        </div>
        <div
          className={`rounded-2xl border p-4 ring-1 ${
            totalQuarantined === 0
              ? "text-emerald-700 bg-emerald-50 ring-emerald-200"
              : "text-red-700 bg-red-50 ring-red-200"
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-widest opacity-70">
            Quarantined
          </div>
          <div className="mt-1 text-3xl font-extrabold">{totalQuarantined}</div>
          <div className="mt-0.5 text-[11px] opacity-70">target = 0</div>
        </div>
      </div>

      {/* Per content type */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-zinc-400" />
          <h2 className="text-sm font-bold text-zinc-900">By content type</h2>
        </div>
        {rollups.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No QC runs logged in the last 30 days yet. The qc_runs table
            populates as content cycles flow through the auto-heal loop.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500">
                  <th className="pb-2 pr-2 font-semibold">Type</th>
                  <th className="pb-2 px-2 font-semibold text-right">Total</th>
                  <th className="pb-2 px-2 font-semibold text-right">First-pass</th>
                  <th className="pb-2 px-2 font-semibold text-right">Healed</th>
                  <th className="pb-2 px-2 font-semibold text-right">Quarantined</th>
                  <th className="pb-2 px-2 font-semibold text-right">Heal success</th>
                  <th className="pb-2 pl-2 font-semibold text-right">Avg attempts</th>
                </tr>
              </thead>
              <tbody>
                {rollups.map((r) => (
                  <tr key={r.contentType} className="border-b border-zinc-50 last:border-0">
                    <td className="py-2 pr-2 font-mono text-xs text-zinc-700">
                      {r.contentType}
                    </td>
                    <td className="py-2 px-2 text-right font-semibold">{r.total}</td>
                    <td className="py-2 px-2 text-right">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-bold ring-1 ${rateTone(
                          r.firstPassPct,
                          70,
                        )}`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {r.firstPassPct}%
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right">{r.healed}</td>
                    <td className="py-2 px-2 text-right">
                      {r.quarantined > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-bold text-red-700 ring-1 ring-red-200">
                          <XCircle className="h-3 w-3" />
                          {r.quarantined}
                        </span>
                      ) : (
                        <span className="text-zinc-400">0</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-bold ring-1 ${rateTone(
                          r.healSuccessPct,
                          90,
                        )}`}
                      >
                        <Zap className="h-3 w-3" />
                        {r.healSuccessPct}%
                      </span>
                    </td>
                    <td className="py-2 pl-2 text-right text-zinc-600">
                      {r.avgAttempts.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent quarantines */}
      {recentQuarantines.length > 0 && (
        <section className="rounded-2xl border border-red-200 bg-red-50/50 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-bold text-red-900">
              Recent quarantines ({recentQuarantines.length})
            </h2>
          </div>
          <p className="text-xs text-red-700">
            Pieces where the auto-heal loop exhausted attempts. Each one
            needs a human review or a heal-fn improvement.
          </p>
          <ul className="space-y-2">
            {recentQuarantines.map((q, i) => (
              <li
                key={i}
                className="rounded-xl bg-white p-3 text-xs ring-1 ring-red-100"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-zinc-900">
                    {q.content_type}
                  </span>
                  <span className="text-zinc-400">
                    {new Date(q.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 text-zinc-600">
                  Healers tried: {(q.healer_sequence ?? []).join(" → ") || "(none)"}
                </div>
                {Array.isArray(q.final_findings) && q.final_findings.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5">
                    {q.final_findings
                      .filter((f: any) => f.severity === "fail")
                      .slice(0, 4)
                      .map((f: any, j: number) => (
                        <li key={j} className="text-red-700">
                          <span className="font-mono text-[10px]">{f.name}</span>{" "}
                          — {(f.message ?? "").slice(0, 120)}
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-zinc-400 text-center">
        Data refreshes on every page load. Heal-attempt rows write
        directly from `runAutoHealLoop` in `lib/qc/auto-heal.ts`.
      </p>
    </div>
  );
}
