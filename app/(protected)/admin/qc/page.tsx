import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  ShieldOff,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

type Severity = "pass" | "warn" | "fail";

type ReportRow = {
  id: string;
  quiz_id: string;
  teacher_id: string;
  overall: Severity;
  checks: { name: string; severity: Severity; message: string }[];
  credits_used: number;
  ran_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

function friendlyDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function QcDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const profile = await requireProfile();
  const supabase = await createClient();

  // Admin gate — same shape as /admin home: must have an admin_memberships row.
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
          The QC queue is restricted to platform admins.
        </p>
      </div>
    );
  }

  const { filter } = await searchParams;
  const showReviewed = filter === "all" || filter === "reviewed";

  // Fetch the queue. Default = unreviewed warn/fail. ?filter=all = everything,
  // ?filter=reviewed = only items already signed off.
  let q = supabase
    .from("quiz_qc_reports")
    .select(
      "id, quiz_id, teacher_id, overall, checks, credits_used, ran_at, reviewed_at, reviewed_by",
    )
    .order("ran_at", { ascending: false })
    .limit(100);
  if (filter === "reviewed") {
    q = q.not("reviewed_at", "is", null);
  } else if (filter !== "all") {
    q = q.in("overall", ["warn", "fail"]).is("reviewed_at", null);
  }
  const { data: reports } = await q;
  const rows = (reports ?? []) as ReportRow[];

  // Pull quiz titles for display
  const quizIds = Array.from(new Set(rows.map((r) => r.quiz_id)));
  const { data: quizzes } =
    quizIds.length === 0
      ? { data: [] as any[] }
      : await supabase
          .from("custom_quizzes")
          .select("id, title, grade_level")
          .in("id", quizIds);
  const quizById = new Map(
    (quizzes ?? []).map((q: any) => [
      q.id as string,
      { title: q.title as string, gradeLevel: q.grade_level as string | null },
    ]),
  );

  // Stats
  const failCount = rows.filter((r) => r.overall === "fail").length;
  const warnCount = rows.filter((r) => r.overall === "warn").length;
  const passCount = rows.filter((r) => r.overall === "pass").length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <header>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          AI quality control
        </div>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
          Review queue
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
          Every Build with AI run is auto-checked. Anything flagged warn or
          fail lands here for a human pass. Marking a report reviewed
          unblocks community publication.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          tone="red"
          icon={XCircle}
          label="Fail"
          value={failCount}
          hint="Blocking issues"
        />
        <StatCard
          tone="amber"
          icon={AlertTriangle}
          label="Warn"
          value={warnCount}
          hint="Needs eyeballs"
        />
        <StatCard
          tone="emerald"
          icon={CheckCircle2}
          label="Pass"
          value={passCount}
          hint="Auto-eligible"
        />
      </section>

      <div className="flex items-center gap-2 text-xs">
        <FilterChip href="/admin/qc" current={!showReviewed} label="Queue" />
        <FilterChip
          href="/admin/qc?filter=reviewed"
          current={filter === "reviewed"}
          label="Reviewed"
        />
        <FilterChip
          href="/admin/qc?filter=all"
          current={filter === "all"}
          label="Everything"
        />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-base font-bold text-zinc-900">
            Queue is clear
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            No reports flagged for review.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => {
            const quiz = quizById.get(r.quiz_id);
            const failing = r.checks.filter((c) => c.severity === "fail");
            const warning = r.checks.filter((c) => c.severity === "warn");
            return (
              <li key={r.id}>
                <Link
                  href={`/admin/qc/${r.id}`}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={r.overall} />
                      <span className="truncate text-sm font-bold text-zinc-900">
                        {quiz?.title ?? "(unknown quiz)"}
                      </span>
                      {quiz?.gradeLevel && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                          {quiz.gradeLevel}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-[11px] text-zinc-500">
                      Ran {friendlyDate(r.ran_at)} · {r.checks.length} checks ·{" "}
                      {failing.length} fail · {warning.length} warn
                    </div>
                    {failing.slice(0, 2).map((c) => (
                      <div
                        key={c.name}
                        className="mt-1 truncate text-xs text-red-700"
                      >
                        ✗ {c.message}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col items-end gap-1 text-[10px] text-zinc-400">
                    {r.reviewed_at ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Reviewed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-bold text-amber-700">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const map = {
    pass: { cls: "bg-emerald-100 text-emerald-700", label: "PASS" },
    warn: { cls: "bg-amber-100 text-amber-700", label: "WARN" },
    fail: { cls: "bg-red-100 text-red-700", label: "FAIL" },
  } as const;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${map[severity].cls}`}
    >
      {map[severity].label}
    </span>
  );
}

function StatCard({
  tone,
  icon: Icon,
  label,
  value,
  hint,
}: {
  tone: "red" | "amber" | "emerald";
  icon: typeof XCircle;
  label: string;
  value: number;
  hint: string;
}) {
  const colorMap = {
    red: { ring: "border-red-200 bg-red-50", icon: "text-red-600", num: "text-red-700" },
    amber: {
      ring: "border-amber-200 bg-amber-50",
      icon: "text-amber-600",
      num: "text-amber-700",
    },
    emerald: {
      ring: "border-emerald-200 bg-emerald-50",
      icon: "text-emerald-600",
      num: "text-emerald-700",
    },
  } as const;
  const c = colorMap[tone];
  return (
    <div className={`rounded-2xl border ${c.ring} p-4`}>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
        <Icon className={`h-3.5 w-3.5 ${c.icon}`} />
        {label}
      </div>
      <div className={`mt-2 text-2xl font-extrabold ${c.num}`}>{value}</div>
      <div className="mt-1 text-[11px] text-zinc-500">{hint}</div>
    </div>
  );
}

function FilterChip({
  href,
  current,
  label,
}: {
  href: string;
  current: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 font-semibold transition ${
        current
          ? "bg-indigo-600 text-white"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
      }`}
    >
      {label}
    </Link>
  );
}
