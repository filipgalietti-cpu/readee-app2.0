import Link from "next/link";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  ShieldOff,
  Crown,
  Search as SearchIcon,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  School,
  DollarSign,
  Users,
  GraduationCap,
  Briefcase,
  Baby,
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

// Rough monthly value per plan-tier seat. Used for an approximate
// MRR readout. Edit when you finalize pricing.
const APPROX_MONTHLY_USD: Record<string, number> = {
  free: 0,
  premium: 9.99,
  teacher_solo: 19,
  classroom: 49,
  school: 99,
  district: 499,
};

function friendlyDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function OwnerAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    role?: string;
    plan?: string;
    q?: string;
  }>;
}) {
  const me = await requireProfile();
  const ok = await isPlatformAdmin(me.id);
  if (!ok) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
          <ShieldOff className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-900">
          Owner only
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          This is the Readee biz-owner back-office. School and district
          admins should use their tenant dashboard at{" "}
          <Link href="/admin" className="font-semibold text-indigo-600 underline">
            /admin
          </Link>
          .
        </p>
      </div>
    );
  }

  const params = await searchParams;
  const role = params.role ?? "all";
  const plan = params.plan ?? null;
  const search = (params.q ?? "").trim();

  const supabase = supabaseAdmin();

  // ── Hero stats ──────────────────────────────────────────────
  const sevenDaysAgoIso = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const fourteenDaysAgoIso = new Date(Date.now() - 14 * 86_400_000).toISOString();
  const thirtyDaysAgoIso = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const [
    { count: totalCount },
    { count: parentCount },
    { count: educatorCount },
    { count: studentCount },
    { count: signupsThisWeek },
    { count: activePremiumish },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "parent"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "educator"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgoIso),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .in("plan", ["premium", "teacher_solo", "classroom", "school", "district"]),
  ]);

  // Plan-mix breakdown for MRR estimation + the donut card.
  const { data: planRows } = await supabase
    .from("profiles")
    .select("plan");
  const planCounts: Record<string, number> = {
    free: 0,
    premium: 0,
    teacher_solo: 0,
    classroom: 0,
    school: 0,
    district: 0,
  };
  for (const r of (planRows ?? []) as { plan: string | null }[]) {
    const k = r.plan ?? "free";
    if (k in planCounts) planCounts[k]++;
  }
  const mrrEstimate = Object.entries(planCounts).reduce(
    (acc, [k, count]) => acc + (APPROX_MONTHLY_USD[k] ?? 0) * count,
    0,
  );

  // Last-30-day Stripe-paid amount from ai_credit_balance (top-ups).
  const { data: paidRows } = await supabase
    .from("ai_credit_balance")
    .select("amount_paid_usd_cents, source, created_at")
    .gte("created_at", thirtyDaysAgoIso);
  const cashPaid30d = ((paidRows ?? []) as any[]).reduce(
    (acc, r) =>
      acc + (r.source === "purchase" && r.amount_paid_usd_cents ? r.amount_paid_usd_cents : 0),
    0,
  );

  // ── Top schools / districts ─────────────────────────────────
  const { data: schoolRows } = await supabase
    .from("schools")
    .select("id, name, city, state, district_id, created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  // Seat count per school (distinct teachers via classrooms)
  const schools = ((schoolRows ?? []) as any[]).map((s: any) => ({
    ...s,
    teacherCount: 0,
    classroomCount: 0,
  }));
  if (schools.length > 0) {
    const ids = schools.map((s) => s.id);
    const { data: cls } = await supabase
      .from("classrooms")
      .select("id, teacher_id, school_id")
      .in("school_id", ids);
    const map = new Map<string, { teachers: Set<string>; classrooms: number }>();
    for (const c of (cls ?? []) as any[]) {
      const ent = map.get(c.school_id) ?? { teachers: new Set<string>(), classrooms: 0 };
      ent.teachers.add(c.teacher_id);
      ent.classrooms += 1;
      map.set(c.school_id, ent);
    }
    for (const s of schools) {
      const e = map.get(s.id);
      s.teacherCount = e?.teachers.size ?? 0;
      s.classroomCount = e?.classrooms ?? 0;
    }
  }

  const { data: districtRows } = await supabase
    .from("districts")
    .select("id, name, state, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // ── At-risk: paying accounts dormant 14+ days ───────────────
  // Heuristic: paying tier + no activity (via profiles.updated_at proxy)
  // for 14+ days. updated_at is bumped on practice/AI activity in our app.
  const { data: atRiskRows } = await supabase
    .from("profiles")
    .select("id, email, role, plan, updated_at, created_at")
    .in("plan", ["premium", "teacher_solo", "classroom", "school", "district"])
    .lt("updated_at", fourteenDaysAgoIso)
    .order("updated_at", { ascending: true })
    .limit(8);

  // ── Expansion-ready: high-activity FREE teachers ────────────
  // Heuristic: educators on free tier whose ai_usage_log shows ≥3
  // calls in the last 30 days. Two-step pull.
  const { data: usageRows } = await supabase
    .from("ai_usage_log")
    .select("teacher_id")
    .gte("created_at", thirtyDaysAgoIso)
    .limit(2000);
  const usageByTeacher = new Map<string, number>();
  for (const u of (usageRows ?? []) as any[]) {
    usageByTeacher.set(u.teacher_id, (usageByTeacher.get(u.teacher_id) ?? 0) + 1);
  }
  const heavyFreeTeacherIds = Array.from(usageByTeacher.entries())
    .filter(([, n]) => n >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([id]) => id);
  let expansionReady: { id: string; email: string; usage: number }[] = [];
  if (heavyFreeTeacherIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, email, role, plan")
      .in("id", heavyFreeTeacherIds)
      .eq("role", "educator")
      .eq("plan", "free");
    expansionReady = ((profs ?? []) as any[])
      .map((p) => ({ id: p.id, email: p.email, usage: usageByTeacher.get(p.id) ?? 0 }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 6);
  }

  // ── Recent signups feed ─────────────────────────────────────
  const { data: recentSignups } = await supabase
    .from("profiles")
    .select("id, email, role, plan, created_at")
    .order("created_at", { ascending: false })
    .limit(15);

  // ── Filtered listing ────────────────────────────────────────
  let q = supabase
    .from("profiles")
    .select("id, email, role, plan, display_name, created_at, onboarding_complete")
    .order("created_at", { ascending: false })
    .limit(100);
  if (role !== "all") q = q.eq("role", role);
  if (plan) q = q.eq("plan", plan);
  if (search) q = q.ilike("email", `%${search}%`);
  const { data: rows } = await q;
  const profiles = ((rows ?? []) as any[]) as {
    id: string;
    email: string;
    role: string;
    plan: string | null;
    display_name: string | null;
    created_at: string;
    onboarding_complete: boolean | null;
  }[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mt-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-600">
          <Crown className="h-4 w-4" />
          Owner · Readee Inc back-office
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Business overview
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          The four numbers that tell you if Readee is winning today, plus the
          accounts that need attention this week.
        </p>
      </div>

      {/* Hero — the four numbers */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Hero
          icon={DollarSign}
          tone="from-emerald-500 to-emerald-700"
          label="Approx. MRR"
          value={`$${(mrrEstimate || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          sub={`+ $${(cashPaid30d / 100).toFixed(0)} top-ups (30d)`}
        />
        <Hero
          icon={TrendingUp}
          tone="from-violet-500 to-violet-700"
          label="Signups (7d)"
          value={(signupsThisWeek ?? 0).toLocaleString()}
          sub={`${(totalCount ?? 0).toLocaleString()} total accounts`}
        />
        <Hero
          icon={GraduationCap}
          tone="from-indigo-500 to-indigo-700"
          label="Paying teachers"
          value={(planCounts.teacher_solo + planCounts.classroom + planCounts.school + planCounts.district).toLocaleString()}
          sub={`${(educatorCount ?? 0).toLocaleString()} total · ${planCounts.school + planCounts.district} on school/district`}
        />
        <Hero
          icon={Briefcase}
          tone="from-amber-500 to-amber-700"
          label="Paying parents"
          value={planCounts.premium.toLocaleString()}
          sub={`${(parentCount ?? 0).toLocaleString()} total · ${(activePremiumish ?? 0)} paid overall`}
        />
      </div>

      {/* Plan mix donut as a stripe */}
      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Plan mix
          </span>
          <span className="text-[10px] text-zinc-400">{(totalCount ?? 0).toLocaleString()} accounts</span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-zinc-100">
          {([
            ["free", "bg-zinc-300"],
            ["premium", "bg-emerald-400"],
            ["teacher_solo", "bg-violet-500"],
            ["classroom", "bg-blue-500"],
            ["school", "bg-indigo-500"],
            ["district", "bg-rose-500"],
          ] as [string, string][]).map(([k, color]) => {
            const pct = totalCount && totalCount > 0 ? (planCounts[k] / totalCount) * 100 : 0;
            return <div key={k} style={{ width: `${pct}%` }} className={color} title={`${k}: ${planCounts[k]} (${pct.toFixed(1)}%)`} />;
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
          {Object.entries(planCounts).map(([k, n]) => (
            <span key={k} className={`rounded-full px-2 py-0.5 font-bold uppercase tracking-wider ${PLAN_TONE[k]}`}>
              {k} {n}
            </span>
          ))}
        </div>
      </div>

      {/* Two-up: at-risk + expansion */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel
          icon={AlertTriangle}
          tone="bg-amber-50 border-amber-200 text-amber-800"
          title="At risk · paying & dormant 14+ days"
          subtitle="The leading churn signal in edtech. Reach out before they cancel."
        >
          {(atRiskRows ?? []).length === 0 ? (
            <p className="text-sm text-zinc-500">No at-risk accounts. 🎉</p>
          ) : (
            <ul className="space-y-1">
              {((atRiskRows ?? []) as any[]).map((r) => {
                const days = Math.floor((Date.now() - new Date(r.updated_at).getTime()) / 86_400_000);
                return (
                  <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1 text-xs">
                    <Link href={`/owner/${r.id}`} className="truncate font-mono text-amber-900 hover:underline">
                      {r.email}
                    </Link>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PLAN_TONE[r.plan ?? "free"]}`}>
                      {r.plan}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-700">{days}d quiet</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel
          icon={Sparkles}
          tone="bg-violet-50 border-violet-200 text-violet-800"
          title="Expansion-ready · free teachers, high activity"
          subtitle="≥3 AI calls in 30d on the free tier. Reach out about Teacher Solo or a school pilot."
        >
          {expansionReady.length === 0 ? (
            <p className="text-sm text-zinc-500">No high-activity free teachers right now.</p>
          ) : (
            <ul className="space-y-1">
              {expansionReady.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1 text-xs">
                  <Link href={`/owner/${t.id}`} className="truncate font-mono text-violet-900 hover:underline">
                    {t.email}
                  </Link>
                  <span className="text-[10px] font-bold text-violet-700">{t.usage} AI calls / 30d</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Schools + districts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel
          icon={School}
          tone="bg-indigo-50 border-indigo-200 text-indigo-800"
          title={`Schools (${schools.length})`}
          subtitle="Adoption depth = teacher count. Track for renewals + expansion."
        >
          {schools.length === 0 ? (
            <p className="text-sm text-zinc-500">No schools yet.</p>
          ) : (
            <ul className="space-y-1">
              {schools.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1 text-xs">
                  <Link href={`/admin/school/${s.id}`} className="truncate font-semibold text-indigo-900 hover:underline">
                    {s.name}
                  </Link>
                  <span className="text-[10px] text-indigo-600">
                    {s.teacherCount} teachers · {s.classroomCount} rooms
                  </span>
                  <span className="text-[10px] text-zinc-500">{[s.city, s.state].filter(Boolean).join(", ")}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          icon={School}
          tone="bg-rose-50 border-rose-200 text-rose-800"
          title={`Districts (${(districtRows ?? []).length})`}
          subtitle="Highest-LTV B2B segment. Each district is a multi-school sale."
        >
          {(districtRows ?? []).length === 0 ? (
            <p className="text-sm text-zinc-500">No districts yet.</p>
          ) : (
            <ul className="space-y-1">
              {((districtRows ?? []) as any[]).map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1 text-xs">
                  <Link href={`/admin/district/${d.id}`} className="truncate font-semibold text-rose-900 hover:underline">
                    {d.name}
                  </Link>
                  <span className="text-[10px] text-rose-600">{d.state ?? "—"}</span>
                  <span className="text-[10px] text-zinc-500">{friendlyDate(d.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Recent signups */}
      <Panel
        icon={Users}
        tone="bg-emerald-50 border-emerald-200 text-emerald-800"
        title="Recent signups (last 15)"
        subtitle="The funnel pulse. Watch for spikes from a press hit or a new district pilot."
      >
        <ul className="grid gap-1 text-xs sm:grid-cols-2">
          {((recentSignups ?? []) as any[]).map((r) => (
            <li key={r.id} className="flex items-center gap-2 rounded-lg bg-white px-2 py-1">
              <RoleIcon role={r.role} />
              <Link href={`/owner/${r.id}`} className="truncate font-mono text-emerald-900 hover:underline">
                {r.email}
              </Link>
              <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${PLAN_TONE[r.plan ?? "free"]}`}>
                {r.plan ?? "free"}
              </span>
              <span className="text-[9px] text-zinc-500">{friendlyDate(r.created_at)}</span>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Search + filtered table */}
      <div className="mt-8 flex items-center gap-2 border-t border-zinc-200 pt-6">
        <h2 className="text-base font-bold text-zinc-900">Account search</h2>
      </div>
      <form
        action="/owner"
        method="get"
        className="mt-3 flex flex-wrap items-center gap-2"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Role
        </span>
        {[
          { id: "all", label: "All" },
          { id: "parent", label: "Parents" },
          { id: "educator", label: "Teachers" },
          { id: "student", label: "Students" },
        ].map((r) => (
          <Link
            key={r.id}
            href={`/owner?role=${r.id}${plan ? `&plan=${plan}` : ""}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition ${
              role === r.id
                ? "border-amber-500 bg-amber-50 text-amber-800"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-amber-300"
            }`}
          >
            {r.label}
          </Link>
        ))}

        <span className="ml-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Plan
        </span>
        <select
          name="plan"
          defaultValue={plan ?? ""}
          className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700"
        >
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="premium">Readee+</option>
          <option value="teacher_solo">Teacher Solo</option>
          <option value="classroom">Classroom</option>
          <option value="school">School</option>
          <option value="district">District</option>
        </select>
        {role !== "all" && <input type="hidden" name="role" value={role} />}

        <div className="ml-auto flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1">
          <SearchIcon className="h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Search email…"
            className="w-44 bg-transparent text-xs focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-white hover:bg-amber-700"
        >
          Apply
        </button>
      </form>

      <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <tr>
              <th className="px-4 py-2">Email</th>
              <th className="px-3 py-2">Display name</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Plan</th>
              <th className="px-3 py-2">Onboarded</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-zinc-500">
                  No accounts match these filters.
                </td>
              </tr>
            ) : (
              profiles.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-2 font-mono text-xs text-zinc-700">{p.email}</td>
                  <td className="px-3 py-2 text-zinc-700">{p.display_name ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-700">
                      {p.role}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${PLAN_TONE[p.plan ?? "free"] ?? "bg-zinc-100 text-zinc-700"}`}
                    >
                      {p.plan ?? "free"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-zinc-700">
                    {p.onboarding_complete ? "✓" : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-zinc-500">
                    {friendlyDate(p.created_at)}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <Link
                      href={`/owner/${p.id}`}
                      className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 hover:bg-amber-200"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Hero({
  icon: Icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: any;
  tone: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br p-5 text-white shadow-md ${tone}`}>
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-80">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 text-3xl font-extrabold tracking-tight">{value}</div>
      <div className="mt-1 text-[11px] opacity-80">{sub}</div>
    </div>
  );
}

function Panel({
  icon: Icon,
  tone,
  title,
  subtitle,
  children,
}: {
  icon: any;
  tone: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border p-4 ${tone}`}>
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <p className="mt-1 text-[11px] opacity-80">{subtitle}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function RoleIcon({ role }: { role: string }) {
  if (role === "parent") return <Briefcase className="h-3 w-3 text-blue-700" />;
  if (role === "educator") return <GraduationCap className="h-3 w-3 text-indigo-700" />;
  if (role === "student") return <Baby className="h-3 w-3 text-emerald-700" />;
  return <Users className="h-3 w-3 text-zinc-500" />;
}
