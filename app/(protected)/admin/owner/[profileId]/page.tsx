import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  ShieldOff,
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Baby,
  Crown,
  Calendar,
  Coins,
  StickyNote,
  History,
  ExternalLink,
  Mail,
} from "lucide-react";
import CsToolbar from "./_components/CsToolbar";

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

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export default async function OwnerProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const me = await requireProfile();
  const isAdmin = await isPlatformAdmin(me.id);
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

  // Pull EVERYTHING in parallel.
  const [
    { data: balanceRows },
    { data: usageRows },
    { data: notesRows },
    { data: actionsRows },
    { data: kidsRows },
    { data: classroomRows },
    { data: assignmentRows },
    { data: practiceRows },
  ] = await Promise.all([
    supabase
      .from("ai_credit_balance")
      .select("id, pool, balance, source, notes, amount_paid_usd_cents, created_at, expires_at")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("ai_usage_log")
      .select("id, kind, model, credits_used, success, created_at, request_summary")
      .eq("teacher_id", profileId)
      .order("created_at", { ascending: false })
      .limit(15),
    supabase
      .from("cs_notes")
      .select("id, body, author_id, created_at")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("cs_actions_log")
      .select("id, action_kind, payload, admin_id, created_at")
      .eq("target_profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(20),
    p.role === "parent"
      ? supabase
          .from("children")
          .select("id, first_name, reading_level, created_at, streak_days, carrots")
          .eq("parent_id", profileId)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    p.role === "educator"
      ? supabase
          .from("classrooms")
          .select("id, name, created_at")
          .eq("teacher_id", profileId)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    p.role === "educator"
      ? supabase
          .from("assignments")
          .select("id, title, kind, assigned_at, classroom_id")
          .eq("assigned_by", profileId)
          .order("assigned_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] }),
    p.role === "student"
      ? supabase
          .from("practice_results")
          .select("standard_id, questions_correct, questions_attempted, updated_at")
          .eq("child_id", profileId)
          .order("updated_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] }),
  ]);

  // Aggregate billing + spend
  const balance = ((balanceRows ?? []) as any[]).reduce(
    (acc, r) => {
      const pool = r.pool as "teacher" | "parent";
      acc[pool] = (acc[pool] ?? 0) + (r.balance ?? 0);
      acc.totalPaidCents += r.amount_paid_usd_cents ?? 0;
      return acc;
    },
    { teacher: 0, parent: 0, totalPaidCents: 0 } as { teacher: number; parent: number; totalPaidCents: number },
  );
  const usage = (usageRows ?? []) as any[];
  const totalCreditsConsumed = usage.reduce((acc, r) => acc + (r.credits_used ?? 0), 0);

  const adminIds = new Set<string>();
  for (const n of (notesRows ?? []) as any[]) if (n.author_id) adminIds.add(n.author_id);
  for (const a of (actionsRows ?? []) as any[]) if (a.admin_id) adminIds.add(a.admin_id);
  let adminEmailById = new Map<string, string>();
  if (adminIds.size > 0) {
    const { data: adminProfiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", Array.from(adminIds));
    for (const ap of (adminProfiles ?? []) as any[]) {
      adminEmailById.set(ap.id, ap.email);
    }
  }

  const accountAge = daysSince(p.created_at);
  const defaultPool: "teacher" | "parent" = p.role === "educator" ? "teacher" : "parent";

  // Build a unified activity timeline
  type Event = {
    when: string;
    icon: any;
    tone: string;
    label: string;
    detail: string;
  };
  const events: Event[] = [];
  for (const a of (actionsRows ?? []) as any[]) {
    const adminEmail = a.admin_id ? adminEmailById.get(a.admin_id) ?? "admin" : "system";
    let label = a.action_kind.replace(/_/g, " ");
    let detail = "";
    if (a.action_kind === "credit_grant" && a.payload) {
      detail = `+${a.payload.amount} ${a.payload.pool} credits — "${a.payload.reason ?? ""}"`;
    } else if (a.action_kind === "plan_change" && a.payload) {
      detail = `${a.payload.from ?? "?"} → ${a.payload.to ?? "?"} — "${a.payload.reason ?? ""}"`;
    } else if (a.action_kind === "note_added" && a.payload) {
      detail = `"${a.payload.preview ?? ""}…"`;
    } else if (a.action_kind === "password_reset") {
      detail = "Reset email sent.";
    }
    events.push({
      when: a.created_at,
      icon: History,
      tone: "bg-violet-100 text-violet-800",
      label: `CS: ${label} (by ${adminEmail})`,
      detail,
    });
  }
  for (const u of usage.slice(0, 10)) {
    events.push({
      when: u.created_at,
      icon: Coins,
      tone: "bg-emerald-100 text-emerald-800",
      label: `AI ${u.kind}${u.model ? ` (${u.model})` : ""}`,
      detail: `${u.credits_used ?? 0} credits · ${u.success ? "✓" : "✗"}${u.request_summary ? ` · ${u.request_summary.slice(0, 80)}` : ""}`,
    });
  }
  events.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/admin/owner"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All accounts
      </Link>

      {/* Hero */}
      <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-600">
          <Crown className="h-4 w-4" />
          Account
        </div>
        <h1 className="mt-1 break-all font-mono text-2xl font-extrabold tracking-tight text-zinc-900">
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
            <Calendar className="mr-1 inline h-3 w-3" />
            Joined {friendly(p.created_at)} ({accountAge} days ago)
          </span>
        </div>

        <CsToolbar
          profileId={profileId}
          email={p.email}
          currentPlan={p.plan ?? "free"}
          defaultPool={defaultPool}
        />
      </div>

      {/* Billing snapshot */}
      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          <Coins className="h-3 w-3" />
          Billing & credits
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Stat
            label="Teacher credits"
            value={balance.teacher.toLocaleString()}
            tone="bg-violet-50 text-violet-900"
          />
          <Stat
            label="Parent credits"
            value={balance.parent.toLocaleString()}
            tone="bg-emerald-50 text-emerald-900"
          />
          <Stat
            label="Total spent"
            value={`$${(balance.totalPaidCents / 100).toFixed(2)}`}
            tone="bg-amber-50 text-amber-900"
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3 text-xs">
          <KV label="Stripe customer">
            {p.stripe_customer_id ? (
              <a
                href={`https://dashboard.stripe.com/customers/${p.stripe_customer_id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-indigo-600 hover:underline"
              >
                {p.stripe_customer_id}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-zinc-500">—</span>
            )}
          </KV>
          <KV label="Stripe subscription">
            {p.stripe_subscription_id ? (
              <a
                href={`https://dashboard.stripe.com/subscriptions/${p.stripe_subscription_id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-indigo-600 hover:underline"
              >
                {p.stripe_subscription_id}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-zinc-500">—</span>
            )}
          </KV>
          <KV label="Lifetime credits used">
            <span className="font-mono">{totalCreditsConsumed.toLocaleString()}</span>
          </KV>
        </div>

        {balanceRows && balanceRows.length > 0 && (
          <div className="mt-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Credit grants ({balanceRows.length})
            </div>
            <ul className="mt-1 space-y-1 text-xs">
              {(balanceRows as any[]).map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-baseline gap-2 rounded-lg bg-zinc-50 px-2 py-1"
                >
                  <span className="font-mono font-bold">+{r.balance}</span>
                  <span className="text-zinc-500">{r.pool}</span>
                  <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-zinc-700">
                    {r.source}
                  </span>
                  {r.amount_paid_usd_cents != null && r.amount_paid_usd_cents > 0 && (
                    <span className="text-emerald-700">
                      ${(r.amount_paid_usd_cents / 100).toFixed(2)}
                    </span>
                  )}
                  <span className="ml-auto text-[10px] text-zinc-500">
                    {friendly(r.created_at)}
                  </span>
                  {r.notes && (
                    <span className="basis-full text-[11px] italic text-zinc-600">{r.notes}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* CS Notes */}
      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          <StickyNote className="h-3 w-3" />
          Internal notes ({(notesRows ?? []).length})
        </div>
        {(notesRows ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            No notes yet. Use "Add note" above to pin context.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-xs">
            {((notesRows ?? []) as any[]).map((n) => (
              <li key={n.id} className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-[10px]">
                  <span className="font-mono text-amber-900">
                    {n.author_id ? adminEmailById.get(n.author_id) ?? "admin" : "system"}
                  </span>
                  <span className="text-amber-700">{friendly(n.created_at)}</span>
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-amber-950">{n.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Activity timeline */}
      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          <History className="h-3 w-3" />
          Activity timeline
        </div>
        {events.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No activity yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-xs">
            {events.slice(0, 25).map((e, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${e.tone}`}
                >
                  <e.icon className="h-3 w-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-zinc-800">{e.label}</div>
                  {e.detail && <div className="text-zinc-600">{e.detail}</div>}
                </div>
                <span className="ml-2 flex-shrink-0 text-[10px] text-zinc-500">
                  {friendly(e.when)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Profile fields */}
      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Profile
        </div>
        <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
          <KV label="Profile ID">
            <span className="font-mono">{p.id}</span>
          </KV>
          <KV label="TOS">
            {p.tos_accepted_at ? (
              <span>
                {p.tos_version ?? "?"} · {friendly(p.tos_accepted_at)}
              </span>
            ) : (
              <span className="text-red-600">not accepted</span>
            )}
          </KV>
          <KV label="Onboarded">{p.onboarding_complete ? "✓" : "—"}</KV>
          <KV label="Home language">{p.home_language ?? "—"}</KV>
        </dl>
      </section>

      {/* Role-specific panels */}
      {p.role === "parent" && (
        <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <Briefcase className="h-3 w-3" />
            Children ({(kidsRows ?? []).length})
          </div>
          {(kidsRows ?? []).length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">No children added.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {((kidsRows ?? []) as any[]).map((k) => (
                <li key={k.id} className="rounded-xl bg-zinc-50 p-3 text-sm">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-zinc-800">{k.first_name}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {k.reading_level ?? "no level"}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      🥕 {k.carrots ?? 0} · 🔥 {k.streak_days ?? 0}
                    </span>
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
              Classrooms ({(classroomRows ?? []).length})
            </div>
            {(classroomRows ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">No classrooms.</p>
            ) : (
              <ul className="mt-3 space-y-1 text-sm">
                {((classroomRows ?? []) as any[]).map((c) => (
                  <li
                    key={c.id}
                    className="flex items-baseline justify-between rounded-lg bg-zinc-50 px-3 py-1.5"
                  >
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
              Recent assignments ({(assignmentRows ?? []).length})
            </div>
            {(assignmentRows ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">No assignments yet.</p>
            ) : (
              <ul className="mt-3 space-y-1 text-sm">
                {((assignmentRows ?? []) as any[]).map((a) => (
                  <li
                    key={a.id}
                    className="flex items-baseline justify-between rounded-lg bg-zinc-50 px-3 py-1.5"
                  >
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
            Recent practice ({(practiceRows ?? []).length})
          </div>
          {(practiceRows ?? []).length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">No practice yet.</p>
          ) : (
            <ul className="mt-3 space-y-1 text-xs">
              {((practiceRows ?? []) as any[]).map((r, i) => {
                const pct = r.questions_attempted
                  ? Math.round((r.questions_correct / r.questions_attempted) * 100)
                  : 0;
                return (
                  <li
                    key={i}
                    className="flex items-baseline justify-between rounded-lg bg-zinc-50 px-3 py-1"
                  >
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

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-xl px-4 py-3 ${tone}`}>
      <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">
        {label}
      </div>
      <div className="mt-0.5 text-2xl font-extrabold tracking-tight">{value}</div>
    </div>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}
