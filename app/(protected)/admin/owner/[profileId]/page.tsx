import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { hasAnyAdminAccess } from "@/lib/auth/admin-gate";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  ShieldOff,
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Baby,
  Crown,
  Mail,
  Calendar,
  CreditCard,
} from "lucide-react";

export const dynamic = "force-dynamic";

const PLAN_TONE: Record<string, string> = {
  free: "bg-zinc-100 text-zinc-700",
  premium: "bg-emerald-100 text-emerald-800",
  teacher_solo: "bg-violet-100 text-violet-800",
  classroom: "bg-blue-100 text-blue-800",
  school: "bg-indigo-100 text-indigo-800",
  district: "bg-rose-100 text-rose-800",
};

function friendly(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function OwnerProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const me = await requireProfile();
  const isAdmin = await hasAnyAdminAccess(me.id);
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

  const supabase = supabaseAdmin();
  const { data: row } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();
  if (!row) notFound();
  const p = row as any;

  // Role-specific data
  let kids: any[] = [];
  let classrooms: any[] = [];
  let assignments: any[] = [];
  let recentPractice: any[] = [];

  if (p.role === "parent") {
    const { data } = await supabase
      .from("children")
      .select("id, first_name, reading_level, created_at, streak_days, carrots")
      .eq("parent_id", profileId)
      .order("created_at", { ascending: false });
    kids = (data ?? []) as any[];
  }

  if (p.role === "educator") {
    const { data: cl } = await supabase
      .from("classrooms")
      .select("id, name, created_at")
      .eq("teacher_id", profileId)
      .order("created_at", { ascending: false });
    classrooms = (cl ?? []) as any[];
    const { data: ass } = await supabase
      .from("assignments")
      .select("id, title, kind, assigned_at, classroom_id")
      .eq("assigned_by", profileId)
      .order("assigned_at", { ascending: false })
      .limit(20);
    assignments = (ass ?? []) as any[];
  }

  if (p.role === "student") {
    // Look up student via children table by some link — students are
    // the kids themselves. Pull their child row.
    const { data: kid } = await supabase
      .from("children")
      .select("id, first_name, reading_level, parent_id")
      .eq("id", profileId)
      .maybeSingle();
    if (kid) {
      const { data: rp } = await supabase
        .from("practice_results")
        .select("standard_id, questions_correct, questions_attempted, updated_at")
        .eq("child_id", (kid as any).id)
        .order("updated_at", { ascending: false })
        .limit(20);
      recentPractice = (rp ?? []) as any[];
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/admin/owner"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All accounts
      </Link>

      <div className="mt-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-600">
        <Crown className="h-4 w-4" />
        Account
      </div>
      <h1 className="mt-1 break-all font-mono text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        {p.email}
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-700">
          {p.role}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${PLAN_TONE[p.plan ?? "free"] ?? "bg-zinc-100 text-zinc-700"}`}
        >
          {p.plan ?? "free"}
        </span>
        {p.display_name && (
          <span className="text-zinc-500">"{p.display_name}"</span>
        )}
        <span className="text-[11px] text-zinc-500">
          Created {friendly(p.created_at)}
        </span>
      </div>

      {/* Profile fields */}
      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Profile
        </div>
        <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
          <Field label="Profile ID" value={<span className="font-mono">{p.id}</span>} />
          <Field
            label="TOS"
            value={
              p.tos_accepted_at ? (
                <span>
                  {p.tos_version ?? "?"} · {friendly(p.tos_accepted_at)}
                </span>
              ) : (
                <span className="text-red-600">not accepted</span>
              )
            }
          />
          <Field label="Onboarded" value={p.onboarding_complete ? "✓" : "—"} />
          <Field label="Home language" value={p.home_language ?? "—"} />
          <Field
            label="Stripe customer"
            value={p.stripe_customer_id ? <span className="font-mono">{p.stripe_customer_id}</span> : "—"}
          />
          <Field
            label="Stripe subscription"
            value={
              p.stripe_subscription_id ? (
                <span className="font-mono">{p.stripe_subscription_id}</span>
              ) : (
                "—"
              )
            }
          />
        </dl>
      </section>

      {/* Role-specific panels */}
      {p.role === "parent" && (
        <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <Briefcase className="h-3 w-3" />
            Children ({kids.length})
          </div>
          {kids.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">No children added.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {kids.map((k) => (
                <li key={k.id} className="rounded-xl bg-zinc-50 p-3 text-sm">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-zinc-800">{k.first_name}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {k.reading_level ?? "no level"}
                    </span>
                    <span className="text-[11px] text-zinc-500">🥕 {k.carrots ?? 0} carrots · 🔥 {k.streak_days ?? 0} streak</span>
                    <Link
                      href={`/admin/owner/${k.id}`}
                      className="ml-auto text-[10px] font-bold text-amber-700 hover:underline"
                    >
                      Open student →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {p.role === "educator" && (
        <>
          <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <GraduationCap className="h-3 w-3" />
              Classrooms ({classrooms.length})
            </div>
            {classrooms.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">No classrooms.</p>
            ) : (
              <ul className="mt-3 space-y-1 text-sm">
                {classrooms.map((c) => (
                  <li key={c.id} className="flex items-baseline justify-between rounded-lg bg-zinc-50 px-3 py-1.5">
                    <span className="font-semibold text-zinc-800">{c.name}</span>
                    <span className="text-[11px] text-zinc-500">{friendly(c.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <Calendar className="h-3 w-3" />
              Recent assignments ({assignments.length})
            </div>
            {assignments.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">No assignments yet.</p>
            ) : (
              <ul className="mt-3 space-y-1 text-sm">
                {assignments.map((a) => (
                  <li key={a.id} className="flex items-baseline justify-between rounded-lg bg-zinc-50 px-3 py-1.5">
                    <span className="truncate text-zinc-800">{a.title}</span>
                    <span className="ml-2 flex-shrink-0 text-[11px] text-zinc-500">
                      {a.kind} · {friendly(a.assigned_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {p.role === "student" && (
        <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <Baby className="h-3 w-3" />
            Recent practice ({recentPractice.length})
          </div>
          {recentPractice.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">No practice yet.</p>
          ) : (
            <ul className="mt-3 space-y-1 text-xs">
              {recentPractice.map((r, i) => {
                const pct = r.questions_attempted
                  ? Math.round((r.questions_correct / r.questions_attempted) * 100)
                  : 0;
                return (
                  <li key={i} className="flex items-baseline justify-between rounded-lg bg-zinc-50 px-3 py-1">
                    <span className="font-mono text-zinc-700">{r.standard_id}</span>
                    <span className="text-zinc-600">
                      {r.questions_correct}/{r.questions_attempted} ({pct}%)
                    </span>
                    <span className="text-[10px] text-zinc-500">{friendly(r.updated_at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-zinc-800">{value}</dd>
    </div>
  );
}
