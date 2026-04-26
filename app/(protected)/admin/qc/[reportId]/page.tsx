import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Eye,
} from "lucide-react";
import ReviewActions from "./_components/ReviewActions";

export const dynamic = "force-dynamic";

type Severity = "pass" | "warn" | "fail";

export default async function QcReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("admin_memberships")
    .select("id")
    .eq("profile_id", profile.id);
  if (!memberships || memberships.length === 0) notFound();

  const { data: report } = await supabase
    .from("quiz_qc_reports")
    .select(
      "id, quiz_id, teacher_id, overall, checks, credits_used, ran_at, reviewed_at, reviewer_note",
    )
    .eq("id", reportId)
    .maybeSingle();
  if (!report) notFound();
  const r = report as any;

  const { data: quiz } = await supabase
    .from("custom_quizzes")
    .select("id, title, description, grade_level")
    .eq("id", r.quiz_id)
    .maybeSingle();

  const { data: teacher } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("id", r.teacher_id)
    .maybeSingle();

  const checks = (r.checks ?? []) as {
    name: string;
    severity: Severity;
    message: string;
  }[];

  // Group checks by content type for easier scanning
  const passageChecks = checks.filter((c) => c.name.startsWith("passage."));
  const questionChecks = checks.filter((c) => /^q\d+\./.test(c.name));
  const imageChecks = checks.filter((c) => c.name.startsWith("image."));

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <Link
          href="/admin/qc"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to queue
        </Link>
        <div className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          QC report
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {(quiz as any)?.title ?? "(unknown quiz)"}
          </h1>
          <OverallBadge severity={r.overall} />
          {(quiz as any)?.grade_level && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600">
              {(quiz as any).grade_level}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Built by{" "}
          {(teacher as any)?.display_name ??
            (teacher as any)?.email ??
            "(unknown)"}{" "}
          · {new Date(r.ran_at).toLocaleString()} · {r.credits_used} QC credits
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/classroom/authoring/quiz/${r.quiz_id}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:border-indigo-300 hover:bg-indigo-50"
        >
          <Eye className="h-3.5 w-3.5" />
          Open quiz
        </Link>
        <ReviewActions
          reportId={r.id}
          alreadyReviewed={!!r.reviewed_at}
          existingNote={r.reviewer_note ?? null}
        />
      </div>

      {r.reviewer_note && (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Reviewer note
          </div>
          {r.reviewer_note}
        </div>
      )}

      <CheckSection title="Passage" checks={passageChecks} />
      <CheckSection title="Questions" checks={questionChecks} />
      <CheckSection title="Image" checks={imageChecks} />
    </div>
  );
}

function CheckSection({
  title,
  checks,
}: {
  title: string;
  checks: { name: string; severity: Severity; message: string }[];
}) {
  if (checks.length === 0) return null;
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {checks.map((c) => (
          <li
            key={c.name}
            className={`flex items-start gap-2 rounded-xl border p-3 ${
              c.severity === "fail"
                ? "border-red-200 bg-red-50/60"
                : c.severity === "warn"
                  ? "border-amber-200 bg-amber-50/60"
                  : "border-zinc-200 bg-white"
            }`}
          >
            <SeverityIcon severity={c.severity} />
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                {c.name}
              </div>
              <div className="mt-0.5 text-sm text-zinc-900">{c.message}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SeverityIcon({ severity }: { severity: Severity }) {
  if (severity === "pass")
    return <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />;
  if (severity === "warn")
    return <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />;
  return <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />;
}

function OverallBadge({ severity }: { severity: Severity }) {
  const map = {
    pass: "bg-emerald-100 text-emerald-700",
    warn: "bg-amber-100 text-amber-700",
    fail: "bg-red-100 text-red-700",
  } as const;
  const labels = { pass: "PASS", warn: "WARN", fail: "FAIL" } as const;
  return (
    <span
      className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${map[severity]}`}
    >
      {labels[severity]}
    </span>
  );
}
