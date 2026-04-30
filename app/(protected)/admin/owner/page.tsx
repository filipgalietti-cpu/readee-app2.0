import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { hasAnyAdminAccess } from "@/lib/auth/admin-gate";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  ShieldOff,
  Users,
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Baby,
  Crown,
  Search as SearchIcon,
} from "lucide-react";

export const dynamic = "force-dynamic";

const ROLE_FILTERS = [
  { id: "all", label: "All", icon: Users },
  { id: "parent", label: "Parents", icon: Briefcase },
  { id: "educator", label: "Teachers", icon: GraduationCap },
  { id: "student", label: "Students", icon: Baby },
] as const;

const PLAN_TONE: Record<string, string> = {
  free: "bg-zinc-100 text-zinc-700",
  premium: "bg-emerald-100 text-emerald-800",
  teacher_solo: "bg-violet-100 text-violet-800",
  classroom: "bg-blue-100 text-blue-800",
  school: "bg-indigo-100 text-indigo-800",
  district: "bg-rose-100 text-rose-800",
};

function friendlyDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
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
  const profile = await requireProfile();
  const isAdmin = await hasAnyAdminAccess(profile.id);
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
          The owner dashboard is restricted to platform admins.
        </p>
      </div>
    );
  }

  const params = await searchParams;
  const role = params.role && ROLE_FILTERS.some((r) => r.id === params.role) ? params.role : "all";
  const plan = params.plan ?? null;
  const search = (params.q ?? "").trim();

  // Use admin client to bypass RLS so the owner can see everything.
  const supabase = supabaseAdmin();

  // Aggregate counts
  const [
    { count: totalCount },
    { count: parentCount },
    { count: educatorCount },
    { count: studentCount },
    { count: premiumCount },
    { count: schoolCount },
    { count: solo7d },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "parent"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "educator"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("plan", "premium"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).in("plan", ["school", "classroom", "district"]),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 86_400_000).toISOString()),
  ]);

  // Listing — filter by query params
  let q = supabase
    .from("profiles")
    .select("id, email, role, plan, display_name, created_at, onboarding_complete")
    .order("created_at", { ascending: false })
    .limit(200);
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
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Admin home
      </Link>

      <div className="mt-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-600">
          <Crown className="h-4 w-4" />
          Owner
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          All accounts
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Customer-service back-office. See every parent, teacher, and
          student account; click into one for the full picture.
        </p>
      </div>

      {/* Counters */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Counter label="Total accounts" value={totalCount ?? 0} tone="bg-violet-100 text-violet-800" />
        <Counter label="Parents" value={parentCount ?? 0} tone="bg-blue-100 text-blue-800" />
        <Counter label="Teachers" value={educatorCount ?? 0} tone="bg-indigo-100 text-indigo-800" />
        <Counter label="Students" value={studentCount ?? 0} tone="bg-emerald-100 text-emerald-800" />
        <Counter label="Readee+ users" value={premiumCount ?? 0} tone="bg-emerald-100 text-emerald-800" />
        <Counter label="School / district" value={schoolCount ?? 0} tone="bg-rose-100 text-rose-800" />
        <Counter label="New this week" value={solo7d ?? 0} tone="bg-amber-100 text-amber-800" />
      </div>

      {/* Filters */}
      <form
        action="/admin/owner"
        method="get"
        className="mt-6 flex flex-wrap items-center gap-2"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Role
        </span>
        {ROLE_FILTERS.map((r) => (
          <Link
            key={r.id}
            href={`/admin/owner?role=${r.id}${plan ? `&plan=${plan}` : ""}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition ${
              role === r.id
                ? "border-amber-500 bg-amber-50 text-amber-800"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-amber-300"
            }`}
          >
            <r.icon className="h-3.5 w-3.5" />
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

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
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
                      href={`/admin/owner/${p.id}`}
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

      {profiles.length === 200 && (
        <p className="mt-3 text-center text-[11px] text-zinc-500">
          Showing first 200. Use search to narrow down.
        </p>
      )}
    </div>
  );
}

function Counter({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold tracking-tight text-zinc-900">
          {value.toLocaleString()}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${tone}`}>
          live
        </span>
      </div>
    </div>
  );
}
