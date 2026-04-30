import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import {
  ShieldOff,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
} from "lucide-react";

export const dynamic = "force-dynamic";

const TARGET_KIND_LABEL: Record<string, string> = {
  question: "Question",
  lesson: "Lesson",
  lesson_slide: "Lesson slide",
};

const SEVERITY_TONE: Record<string, string> = {
  fail: "bg-red-100 text-red-800",
  warn: "bg-amber-100 text-amber-800",
  pass: "bg-emerald-100 text-emerald-800",
};

const STATUS_FILTERS = [
  { id: "open", label: "Open" },
  { id: "fixed", label: "Fixed" },
  { id: "wont_fix", label: "Won't fix" },
  { id: "all", label: "All" },
] as const;

export default async function ContentAuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    kind?: string;
    severity?: string;
    grade?: string;
  }>;
}) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("admin_memberships")
    .select("id")
    .eq("profile_id", profile.id);
  if (!memberships || memberships.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
          <ShieldOff className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-900">
          Admin only
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          The content-audit dashboard is restricted to platform admins.
        </p>
      </div>
    );
  }

  const params = await searchParams;
  const status = params.status ?? "open";
  const kind = params.kind ?? null;
  const severity = params.severity ?? null;
  const grade = params.grade ?? null;

  let q = supabase
    .from("content_audit_findings")
    .select(
      "id, target_kind, target_id, grade, finding_type, severity, message, suggestion, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (status !== "all") q = q.eq("status", status);
  if (kind) q = q.eq("target_kind", kind);
  if (severity) q = q.eq("severity", severity);
  if (grade) q = q.eq("grade", grade);
  const { data: rows } = await q;
  const findings = ((rows ?? []) as any[]) as {
    id: string;
    target_kind: string;
    target_id: string;
    grade: string | null;
    finding_type: string;
    severity: "pass" | "warn" | "fail";
    message: string;
    suggestion: string | null;
    status: string;
    created_at: string;
  }[];

  // Counts
  const { count: failCount } = await supabase
    .from("content_audit_findings")
    .select("id", { count: "exact", head: true })
    .eq("status", "open")
    .eq("severity", "fail");
  const { count: warnCount } = await supabase
    .from("content_audit_findings")
    .select("id", { count: "exact", head: true })
    .eq("status", "open")
    .eq("severity", "warn");
  const { count: passCount } = await supabase
    .from("content_audit_findings")
    .select("id", { count: "exact", head: true })
    .eq("status", "open")
    .eq("severity", "pass");

  // Recent runs
  const { data: runs } = await supabase
    .from("content_audit_runs")
    .select(
      "id, scope, questions_scanned, lessons_scanned, findings_pass, findings_warn, findings_fail, status, started_at, completed_at, error",
    )
    .order("started_at", { ascending: false })
    .limit(5);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Admin home
      </Link>

      <div className="mt-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-rose-600">
          <ScanLine className="h-4 w-4" />
          Content audit
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Findings ({findings.length} shown)
        </h1>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 font-bold text-red-800">
          <XCircle className="h-3.5 w-3.5" />
          {failCount ?? 0} fail
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-bold text-amber-800">
          <AlertTriangle className="h-3.5 w-3.5" />
          {warnCount ?? 0} warn
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-800">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {passCount ?? 0} pass
        </span>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</span>
        {STATUS_FILTERS.map((f) => {
          const url = new URLSearchParams();
          url.set("status", f.id);
          if (kind) url.set("kind", kind);
          if (severity) url.set("severity", severity);
          if (grade) url.set("grade", grade);
          const active = status === f.id;
          return (
            <Link
              key={f.id}
              href={`/admin/content-audit?${url.toString()}`}
              className={`rounded-full border px-2.5 py-0.5 text-xs ${
                active
                  ? "border-rose-500 bg-rose-50 text-rose-700"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-rose-300"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Kind</span>
        {[
          { id: "question", label: "Questions" },
          { id: "lesson", label: "Lessons" },
          { id: "lesson_slide", label: "Lesson slides" },
        ].map((k) => {
          const url = new URLSearchParams();
          url.set("status", status);
          url.set("kind", k.id);
          if (severity) url.set("severity", severity);
          if (grade) url.set("grade", grade);
          const active = kind === k.id;
          return (
            <Link
              key={k.id}
              href={`/admin/content-audit?${url.toString()}`}
              className={`rounded-full border px-2.5 py-0.5 text-xs ${
                active
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-violet-300"
              }`}
            >
              {k.label}
            </Link>
          );
        })}
        {kind && (
          <Link
            href={`/admin/content-audit?status=${status}`}
            className="rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs text-zinc-500"
          >
            Clear
          </Link>
        )}
      </div>

      {/* Recent runs */}
      {runs && runs.length > 0 && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Recent audit runs
          </div>
          <ul className="mt-2 space-y-1 text-xs">
            {runs.map((r: any) => (
              <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-zinc-50 px-2 py-1">
                <span className="font-mono text-zinc-500">{r.scope}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 font-bold ${
                    r.status === "completed"
                      ? "bg-emerald-100 text-emerald-800"
                      : r.status === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {r.status}
                </span>
                <span className="text-zinc-500">
                  Q {r.questions_scanned} · L {r.lessons_scanned}
                </span>
                <span className="text-emerald-700">{r.findings_pass} pass</span>
                <span className="text-amber-700">{r.findings_warn} warn</span>
                <span className="text-red-700">{r.findings_fail} fail</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Findings */}
      <ul className="mt-6 space-y-2">
        {findings.length === 0 ? (
          <li className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
            No findings match these filters.
          </li>
        ) : (
          findings.map((f) => (
            <li
              key={f.id}
              className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                <span className={`rounded-full px-2 py-0.5 ${SEVERITY_TONE[f.severity]}`}>
                  {f.severity}
                </span>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-800">
                  {TARGET_KIND_LABEL[f.target_kind] ?? f.target_kind}
                </span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-mono text-indigo-800">
                  {f.target_id}
                </span>
                {f.grade && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700">
                    {f.grade}
                  </span>
                )}
                <span className="font-mono text-[10px] text-zinc-500">{f.finding_type}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-800 dark:text-slate-200">{f.message}</p>
              {f.suggestion && (
                <div className="mt-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] text-amber-900">
                  <span className="font-bold">Suggestion:</span> {f.suggestion}
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
